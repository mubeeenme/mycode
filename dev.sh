#!/bin/bash

# Development script for Mobile Store

set -e

echo "🚀 Starting development servers..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start frontend in background
echo "🌐 Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 3

# Start worker in background
echo "☁️  Starting Cloudflare Worker..."
cd worker
npm run dev &
WORKER_PID=$!

# Go back to root directory
cd ..

echo "✅ Development servers started!"
echo "🌐 Frontend: http://localhost:3000"
echo "☁️  Worker API: http://localhost:8787"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for all background jobs
wait