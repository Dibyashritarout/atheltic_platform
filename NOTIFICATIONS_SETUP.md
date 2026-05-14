# Real-Time Notifications System - Installation Guide

## ✅ What's Been Added:

### 1. **Backend Components**
- ✅ Notification Model (`backend/models/Notification.js`)
- ✅ Notification Routes (`backend/routes/notifications.js`)
- ✅ Notification Service (`backend/services/notificationService.js`)

### 2. **Frontend Components**
- ✅ NotificationCenter Component (`frontend/src/components/NotificationCenter.js`)
- ✅ Notification UI Styles (`frontend/src/components/NotificationCenter.css`)
- ✅ Navbar Integration (Updated Navbar.js)

## 📦 Installation Steps:

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install socket.io
```

**Frontend:**
```bash
cd frontend
npm install socket.io-client
```

### Step 2: Update Backend Server (server.js)

Add Socket.io setup after creating Express app:

```javascript
const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');

// Create HTTP server
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Initialize notification service
const { setIO } = require('./services/notificationService');
setIO(io);

// Socket.io connection
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected for notifications`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Add notifications routes
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

// Listen on server instead of app
server.listen(5001, () => console.log('Server running on port 5001'));
```

### Step 3: Update AuthContext (frontend)

Add Socket.io connection to frontend:

```javascript
import io from 'socket.io-client';

// In useEffect after login:
if (token) {
  const socket = io('http://localhost:5001');
  socket.emit('join', res.data.user.id);
  
  socket.on('notification', (notification) => {
    console.log('New notification:', notification);
  });
}
```

### Step 4: Trigger Notifications

Notifications are triggered automatically when:

1. **Performance Added** → When athlete logs new performance
2. **Achievement Unlocked** → When athlete reaches milestone
3. **Opportunity Matched** → When new high-match opportunity found
4. **Verification Step** → When profile verification step completed
5. **Injury Risk** → When high injury risk detected

## 🎯 Usage:

### For Athletes:
- Click **Bell Icon** (🔔) in navbar to see notifications
- Unread count shows as badge
- Click notification to mark as read
- Click "Mark all as read" button

### For Backend Integration:
Use notification service to send notifications:

```javascript
const { notifyPerformanceAdded } = require('./services/notificationService');

// In your route handler
await notifyPerformanceAdded(athlete, performance);
```

## 📱 Features:

✅ Real-time notifications via Socket.io
✅ Notification history persistence
✅ Read/Unread status tracking
✅ Notification center with badge
✅ Type-based color coding
✅ Responsive design
✅ Auto-refresh every 5 seconds

## 🚀 Next Steps:

1. Install Socket.io packages
2. Update server.js with Socket.io setup
3. Update AuthContext with Socket.io client
4. Update performance/achievement routes to call notification service
5. Test by adding a new performance entry

---

**Status:** ✅ Ready to integrate!
