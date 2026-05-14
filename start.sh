#!/bin/bash

echo "🏃 AthletesBridge — Starting up..."
echo ""

# Install backend deps
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "Starting both servers..."
echo "  Backend  → http://localhost:5001"
echo "  Frontend → http://localhost:3000"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
cd frontend
npm start

# On exit, kill backend too
kill $BACKEND_PID 2>/dev/null
