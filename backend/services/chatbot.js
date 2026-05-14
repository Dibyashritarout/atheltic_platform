/**
 * AthletesBridge — AI Chatbot Engine
 * 
 * Rule-based + keyword-matching chatbot providing contextual support
 * for platform features, registration, opportunities, performance, injuries, etc.
 */

// ── Intent Definitions ────────────────────────────────────────────────────────
const INTENTS = [
  {
    name: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'howdy', 'good morning', 'good evening', 'sup', 'hola', 'namaste'],
    responses: [
      "Hello! 👋 Welcome to AthletesBridge! I'm your AI assistant. How can I help you today?",
      "Hey there! 🏃 I'm here to help you navigate AthletesBridge. What would you like to know?",
      "Namaste! 🙏 Welcome to the platform. Ask me anything about athletes, opportunities, or how things work!",
    ],
    followUps: ['How do I register?', 'Show me opportunities', 'How does AI analysis work?'],
  },
  {
    name: 'register',
    keywords: ['register', 'sign up', 'create account', 'join', 'signup', 'new account', 'make account'],
    responses: [
      "To register on AthletesBridge:\n\n1️⃣ Click **'Get Started'** in the top-right corner\n2️⃣ Enter your name, email, and password\n3️⃣ Select your role: **Athlete**, **Organization**, or **Admin**\n4️⃣ Click Register — you're in! 🎉\n\nAfter registering, you can create your athlete profile with sports, location, and bio.",
    ],
    followUps: ['How do I create a profile?', 'What roles are available?', 'Is it free?'],
  },
  {
    name: 'profile',
    keywords: ['profile', 'create profile', 'add athlete', 'my profile', 'athlete profile', 'edit profile'],
    responses: [
      "To create your athlete profile:\n\n1️⃣ Log in and go to **Dashboard**\n2️⃣ Click **'Add Athlete'**\n3️⃣ Fill in your details: name, email, age, state, city\n4️⃣ Select your sports (you can pick multiple!)\n5️⃣ Check **'Rural Athlete'** if applicable — this gives you priority in matching!\n6️⃣ Add a bio and profile image\n\nOnce created, you'll appear in the athletes directory! 🌟",
    ],
    followUps: ['How do I log performance?', 'What is rural priority?', 'Can I upload a photo?'],
  },
  {
    name: 'opportunities',
    keywords: ['opportunity', 'opportunities', 'scholarship', 'scholarships', 'program', 'apply', 'application', 'funding'],
    responses: [
      "**Opportunities** on AthletesBridge include scholarships, training programs, and sports events! 🎯\n\n📋 **Browse:** Go to the Opportunities page to see all active listings\n🔍 **Filter:** Search by sport or keyword\n📝 **Apply:** Click on any opportunity and hit 'Apply Now' — your application goes to the admin for review\n✅ **Status:** Track your application status from your Dashboard\n\nAdmins post and manage all opportunities on the platform.",
    ],
    followUps: ['How do I apply?', 'Who can post opportunities?', 'How does matching work?'],
  },
  {
    name: 'apply',
    keywords: ['apply', 'submit application', 'how to apply', 'application process', 'apply now'],
    responses: [
      "To apply for an opportunity:\n\n1️⃣ Browse the **Opportunities** page\n2️⃣ Click on an opportunity to view details\n3️⃣ Click **'Apply Now'** button\n4️⃣ Write a motivation message (optional but recommended!)\n5️⃣ Select your athlete profile\n6️⃣ Submit! ✅\n\nYour application will be reviewed by an admin. You can check the status in your **Dashboard** under 'My Applications'.\n\n📌 Status can be: **Pending** → **Approved** or **Rejected**",
    ],
    followUps: ['Where do I see my applications?', 'How long does review take?', 'Can I apply again?'],
  },
  {
    name: 'performance',
    keywords: ['performance', 'track', 'log', 'record', 'stats', 'jump', 'sprint', 'speed', 'time', 'training'],
    responses: [
      "**Performance Tracking** lets you record and analyze your athletic data! 📊\n\n🏋️ **What you can log:**\n• Vertical Jump Height (cm)\n• Standing Long Jump (m)\n• Running Distance & Time\n• Running Speed (km/h)\n• Video evidence\n\n📈 **AI Analysis:** After logging at least 2-3 entries, our AI engine will:\n• Score your performance (0-100)\n• Predict future trends\n• Classify your potential level\n• Give training recommendations\n\nGo to any athlete profile → '**Add Performance**' to start logging!",
    ],
    followUps: ['How does AI scoring work?', 'What is the leaderboard?', 'Can I upload videos?'],
  },
  {
    name: 'ai_analysis',
    keywords: ['ai', 'analysis', 'score', 'prediction', 'potential', 'rating', 'ai score', 'machine learning', 'algorithm'],
    responses: [
      "Our **AI Performance Engine** uses statistical analysis and sport-science benchmarks! 🤖\n\n🧠 **How it works:**\n• Compares your stats against national-level benchmarks\n• Uses linear regression to predict improvement trends\n• Scores each metric from 0-100\n\n🏅 **Potential Levels:**\n• 🎯 Beginner → 🌱 Emerging → 🔥 Promising → ⭐ Elite → 🏅 Olympic-Track\n\n📋 **You also get:**\n• Personalized training recommendations\n• Injury risk assessment\n• Nutrition & recovery tips\n\nLog at least 3 performance entries for the most accurate predictions!",
    ],
    followUps: ['How do I improve my score?', 'What are benchmarks?', 'Show me the leaderboard'],
  },
  {
    name: 'injury',
    keywords: ['injury', 'injuries', 'hurt', 'pain', 'recovery', 'rehab', 'prevention', 'strain', 'sprain', 'fracture', 'injured'],
    responses: [
      "**Injury Prevention & Tracking** keeps you safe and recovering faster! 🏥\n\n📝 **Log Injuries:**\n• Record type (sprain, strain, fracture, etc.)\n• Body part affected\n• Severity level (minor/moderate/severe)\n• Treatment notes\n\n🤖 **AI Risk Assessment:**\n• Analyzes your training load vs injury history\n• Predicts injury risk level\n• Suggests prevention exercises\n• Recommends recovery timelines\n\n💪 **Prevention Tips:**\n• Always warm up 10-15 min before training\n• Gradually increase intensity (10% rule)\n• Rest days are crucial — aim for 1-2/week\n• Stay hydrated and maintain nutrition\n\nGo to any athlete profile → **'Injury Tracker'** to get started!",
    ],
    followUps: ['How do I log an injury?', 'What is the risk assessment?', 'Prevention tips for runners'],
  },
  {
    name: 'leaderboard',
    keywords: ['leaderboard', 'ranking', 'rankings', 'top', 'best', 'leader', 'competition', 'compare'],
    responses: [
      "The **Leaderboard** showcases top-performing athletes! 🏆\n\n📊 Rankings are based on:\n• Best jump height\n• Best jump length\n• Best running speed\n• Training consistency\n\nAthletes are ranked by their peak performances aggregated across all logged sessions.\n\n🌟 Getting on the leaderboard increases your visibility to scouts and organizations!",
    ],
    followUps: ['How do I get on the leaderboard?', 'How often is it updated?', 'What metrics matter most?'],
  },
  {
    name: 'matching',
    keywords: ['match', 'matching', 'compatibility', 'recommendation', 'suggest', 'find', 'discover'],
    responses: [
      "**AI Talent Matching** connects athletes with the right opportunities! 🎯\n\n🧮 **Match Score (0-100) is based on:**\n• **Sport Match (40pts):** Does your sport align?\n• **Rural Priority (15pts):** Rural athletes get a boost\n• **Performance Level (30pts):** Based on your AI score\n• **Age Eligibility (15pts):** Prime development window (14-25)\n\nOrganizations can click 'Run Match Algorithm' on any opportunity to find compatible athletes.\n\n💡 **Tip:** Keep your profile updated and log performances regularly for better matches!",
    ],
    followUps: ['How do I improve my match score?', 'What is rural priority?', 'How do I apply?'],
  },
  {
    name: 'rural',
    keywords: ['rural', 'village', 'remote', 'underserved', 'priority', 'rural athlete'],
    responses: [
      "**Rural Athletes** get special priority on AthletesBridge! 🌾\n\n✅ **Benefits of being marked as Rural:**\n• +15 points boost in opportunity matching\n• Featured in the platform's spotlight\n• Priority visibility to scouts and organizations\n• Access to rural-specific scholarships\n\nWhen creating your athlete profile, check the **'Rural Athlete'** checkbox. This helps us connect underserved talent with the opportunities they deserve! 💚",
    ],
    followUps: ['How do I update my profile?', 'What opportunities are available?', 'Tell me about the platform'],
  },
  {
    name: 'help',
    keywords: ['help', 'support', 'contact', 'issue', 'problem', 'bug', 'stuck', 'can\'t', 'unable', 'not working', 'error'],
    responses: [
      "I'm here to help! 🛠️ Here's what I can assist with:\n\n• 👤 **Account & Profile** — Registration, login, profile setup\n• 🎯 **Opportunities** — Finding, applying, tracking applications\n• 📊 **Performance** — Logging data, understanding AI analysis\n• 🏥 **Injuries** — Tracking, prevention, risk assessment\n• 🏆 **Leaderboard** — Rankings, improving your position\n• 🤖 **AI Features** — Matching, scoring, predictions\n\nWhat specific area do you need help with?",
    ],
    followUps: ['How do I register?', 'Tell me about opportunities', 'How does AI work?'],
  },
  {
    name: 'about',
    keywords: ['about', 'what is', 'platform', 'athletesbridge', 'purpose', 'mission', 'who made'],
    responses: [
      "**AthletesBridge** is an AI-powered platform connecting rural athletes with sports opportunities! 🏃\n\n🎯 **Mission:** Bridge the gap between talented athletes in underserved areas and the opportunities they deserve.\n\n🔧 **Key Features:**\n• AI-powered performance analysis & scoring\n• Smart scholarship/opportunity matching\n• Injury prevention & tracking\n• Real-time leaderboard\n• Video evidence upload\n• Intelligent chatbot support (that's me! 🤖)\n\n💚 Registration is free, always. Your talent deserves to be discovered!",
    ],
    followUps: ['How do I get started?', 'What sports are supported?', 'Is it really free?'],
  },
  {
    name: 'thanks',
    keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'helpful', 'great', 'awesome', 'cool'],
    responses: [
      "You're welcome! 😊 Happy to help. Feel free to ask me anything else about AthletesBridge!",
      "Glad I could help! 🌟 Don't hesitate to reach out if you need anything else.",
      "Anytime! 💚 Keep pushing your limits on the platform. You've got this! 🏃",
    ],
    followUps: ['Tell me more about AI analysis', 'How do I apply to opportunities?', 'Injury prevention tips'],
  },
  {
    name: 'farewell',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'quit', 'exit', 'close'],
    responses: [
      "Goodbye! 👋 Keep training hard and stay healthy. See you on the leaderboard! 🏆",
      "See you later! 🏃 Remember — every training session counts. Keep logging those performances!",
      "Take care! 💚 Feel free to come back anytime you need help.",
    ],
    followUps: [],
  },
];

// ── Default / Fallback ────────────────────────────────────────────────────────
const FALLBACK_RESPONSES = [
  "I'm not sure I understand that. 🤔 Try asking about:\n• Registration & profile setup\n• Opportunities & applications\n• Performance tracking\n• Injury prevention\n• AI features & matching\n\nOr type **'help'** for a complete guide!",
  "Hmm, I didn't quite catch that. 🧐 Could you rephrase it? I can help with athlete profiles, opportunities, performance tracking, injuries, and more!",
  "I'm still learning! 🤖 Try asking me about specific features like 'How do I apply?' or 'What is AI analysis?' — I know a lot about those!",
];

// ── Starter Suggestions ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  'How do I register?',
  'Show me opportunities',
  'How does AI analysis work?',
  'Injury prevention tips',
  'How do I apply?',
  'What is the leaderboard?',
];

// ── Process Message ──────────────────────────────────────────────────────────
function processMessage(message) {
  const input = message.toLowerCase().trim();
  
  if (!input) {
    return {
      reply: "Please type a message and I'll do my best to help! 😊",
      suggestions: SUGGESTIONS,
    };
  }

  // Find best matching intent
  let bestMatch = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const keyword of intent.keywords) {
      if (input.includes(keyword)) {
        // Give higher score for longer keyword matches (more specific)
        score += keyword.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = intent;
    }
  }

  if (bestMatch && bestScore > 0) {
    const reply = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];
    return {
      reply,
      intent: bestMatch.name,
      confidence: Math.min(1, bestScore / 3),
      suggestions: bestMatch.followUps,
    };
  }

  // Fallback
  return {
    reply: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)],
    intent: 'unknown',
    confidence: 0,
    suggestions: SUGGESTIONS,
  };
}

function getSuggestions() {
  return SUGGESTIONS;
}

module.exports = { processMessage, getSuggestions };
