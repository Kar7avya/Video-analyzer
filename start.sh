#!/bin/bash

# Voice Cloning Studio Startup Script

echo "🎤 Starting Voice Cloning Studio..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your ElevenLabs API key"
    echo "🔗 Get your API key from: https://elevenlabs.io/app/settings/api-keys"
    echo ""
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Install Node.js dependencies if needed
echo "📦 Installing Node.js dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Check ports
echo "🔍 Checking ports..."
if ! check_port 8000; then
    echo "❌ Backend port 8000 is in use. Please stop the service or change the port."
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Frontend port 3000 is in use. Please stop the service or change the port."
    exit 1
fi

echo "🚀 Starting servers..."

# Start backend server in background
echo "🔧 Starting FastAPI backend on http://localhost:8000"
source venv/bin/activate
python FastApi.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting React frontend on http://localhost:3000"
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Voice Cloning Studio is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "👋 Goodbye!"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait