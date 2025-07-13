#!/bin/bash

echo "Starting Organic Code Studio Unified..."
echo "=================================="

# Start backend
echo "Starting backend on port 3005..."
node server/index.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend dev server
echo "Starting frontend on port 5173..."
npx vite --port 5173 --open &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3005"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped'" EXIT

# Keep script running
while true; do
    sleep 1
done