import React, { useEffect, useState } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read/all');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationColor = (type) => {
    const colors = {
      achievement: '#FFD700',
      opportunity: '#1D9E75',
      performance: '#3B82F6',
      verification: '#10B981',
      injury: '#F59E0B',
      message: '#8B5CF6'
    };
    return colors[type] || '#6B7280';
  };

  return (
    <div className="notification-center">
      {/* Bell Icon */}
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button 
              className="close-panel"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                  style={{
                    borderLeftColor: getNotificationColor(notif.type)
                  }}
                >
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="read-indicator">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
