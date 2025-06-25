#!/bin/bash

# 🚀 Development Script for Shopify App + React Extensions

echo "🚀 Starting Shopify App with React Extensions Development..."
echo "📁 Project: testing-react-extension"
echo "⚛️  React Development: react-extensions/"
echo "🛍️  Shopify Extension: extensions/testing-react-tailwind/"
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $REACT_PID $SHOPIFY_PID 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C
trap cleanup INT

echo "📦 Starting React build watcher..."
cd react-extensions
npm run dev &
REACT_PID=$!

echo "🛍️  Starting Shopify app..."
cd ..
npm run dev &
SHOPIFY_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "📱 Shopify App: Check terminal output for URL"
echo "⚛️  React Changes: Auto-rebuild to extension assets"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait 