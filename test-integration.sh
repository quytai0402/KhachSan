#!/bin/bash

echo "🏨 Testing Hotel Booking System Integration"
echo "==========================================="

# Test 1: Backend API
echo "🔧 Testing Backend API..."
ROOM_API_RESPONSE=$(curl -s "http://localhost:5000/api/rooms/682a31a6dd20bc68af5a9628")
if echo "$ROOM_API_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Backend API: Working"
    ROOM_NUMBER=$(echo "$ROOM_API_RESPONSE" | grep -o '"roomNumber":"[^"]*"' | cut -d'"' -f4)
    echo "   Room Number: $ROOM_NUMBER"
else
    echo "❌ Backend API: Failed"
    echo "   Response: $ROOM_API_RESPONSE"
fi

# Test 2: Frontend Server
echo "🌐 Testing Frontend Server..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend Server: Working (HTTP $FRONTEND_RESPONSE)"
else
    echo "❌ Frontend Server: Failed (HTTP $FRONTEND_RESPONSE)"
fi

# Test 3: Booking Page
echo "📝 Testing Booking Page..."
BOOKING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/booking/682a31a6dd20bc68af5a9628")
if [ "$BOOKING_RESPONSE" = "200" ]; then
    echo "✅ Booking Page: Accessible (HTTP $BOOKING_RESPONSE)"
else
    echo "❌ Booking Page: Failed (HTTP $BOOKING_RESPONSE)"
fi

# Test 4: API Connectivity Test
echo "🔗 Testing API Connectivity..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/rooms")
if [ "$API_TEST" = "200" ]; then
    echo "✅ API Connectivity: Working (HTTP $API_TEST)"
else
    echo "❌ API Connectivity: Failed (HTTP $API_TEST)"
fi

echo ""
echo "🎯 Test Summary:"
echo "==============="
echo "If all tests show ✅, the booking system should be working correctly."
echo "You can now test the booking flow at: http://localhost:3000/booking/682a31a6dd20bc68af5a9628"
