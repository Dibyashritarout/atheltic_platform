import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const STARTER_SUGGESTIONS = [
  'How do I register?',
  'Show me opportunities',
  'How does AI analysis work?',
  'Injury prevention tips',
  'How do I apply?',
  'What is the leaderboard?',
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hello! 👋 I'm the AthletesBridge AI Assistant. How can I help you today?",
      suggestions: STARTER_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (isOpen) setHasNewMessage(false);
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { from: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('/api/chatbot/message', { message: text.trim() });
      
      // Simulate typing delay for natural feel
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: res.data.reply,
            suggestions: res.data.suggestions || [],
          },
        ]);
        setIsTyping(false);
        if (!isOpen) setHasNewMessage(true);
      }, 600 + Math.random() * 800);
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
            suggestions: STARTER_SUGGESTIONS,
          },
        ]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''} ${hasNewMessage ? 'has-new' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat assistant"
        id="chatbot-toggle-btn"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {hasNewMessage && <span className="chatbot-notification-dot" />}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`} id="chatbot-window">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">
              <span>🤖</span>
              <div className="chatbot-online-dot" />
            </div>
            <div>
              <h3>AI Assistant</h3>
              <span className="chatbot-status">Online • AthletesBridge</span>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-msg ${msg.from}`}>
              {msg.from === 'bot' && (
                <div className="chatbot-msg-avatar">🤖</div>
              )}
              <div className="chatbot-msg-content">
                <div className="chatbot-msg-bubble">
                  {msg.text.split('\n').map((line, li) => (
                    <span key={li}>
                      {line.replace(/\*\*(.*?)\*\*/g, '⟪$1⟫').split('⟪').map((part, pi) => {
                        if (part.includes('⟫')) {
                          const [bold, rest] = part.split('⟫');
                          return <span key={pi}><strong>{bold}</strong>{rest}</span>;
                        }
                        return part;
                      })}
                      {li < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="chatbot-suggestions">
                    {msg.suggestions.map((s, si) => (
                      <button
                        key={si}
                        className="chatbot-suggestion-btn"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="chatbot-msg bot">
              <div className="chatbot-msg-avatar">🤖</div>
              <div className="chatbot-msg-content">
                <div className="chatbot-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="chatbot-input"
            id="chatbot-input"
          />
          <button
            type="submit"
            className="chatbot-send"
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
