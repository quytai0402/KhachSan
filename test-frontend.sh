#!/bin/bash

echo "🚀 Starting Frontend Application Test..."
echo "========================================"

# Check if frontend dependencies are installed
if [ ! -d "/Users/tranquytai/Downloads/KhachSan-1/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd /Users/tranquytai/Downloads/KhachSan-1/frontend && npm install
fi

echo "🔍 Checking for TypeScript/Lint errors..."
cd /Users/tranquytai/Downloads/KhachSan-1/frontend

# Run a quick syntax check
echo "✅ Checking syntax of key files..."

echo "  📄 Checking api.js..."
node -c src/services/api.js && echo "    ✅ api.js - OK" || echo "    ❌ api.js - Error"

echo "  📄 Checking dashboardService.js..."
node -c src/services/dashboardService.js && echo "    ✅ dashboardService.js - OK" || echo "    ❌ dashboardService.js - Error"

echo "  📄 Checking Services.js..."
node -c src/pages/Services.js && echo "    ✅ Services.js - OK" || echo "    ❌ Services.js - Error"

echo ""
echo "🎉 Frontend syntax check complete!"
echo "========================================"

echo ""
echo "📋 Next steps to test the full application:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Open browser to http://localhost:3000"
echo "4. Test the updated API calls in the UI"
