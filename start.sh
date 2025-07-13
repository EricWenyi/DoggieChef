#!/bin/bash

echo "🌶️ Starting DoggieChef Recipe Collection Website..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "🚀 Starting servers..."
echo ""

# Start backend in background
echo "🔧 Starting backend server on http://localhost:5001"
cd ../backend
python3 app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server on http://localhost:3000"
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ DoggieChef is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Wait for both processes
wait 