#!/bin/bash

echo "🧪 Testing Hotel Management System API Endpoints..."
echo "======================================================"

BASE_URL="http://localhost:5000/api"

# Function to test API response format
test_api_format() {
  local endpoint=$1
  local name=$2
  
  echo "📍 Testing $name endpoint ($endpoint)"
  response=$(curl -s "$BASE_URL$endpoint")
  http_code=$?
  
  if [ $http_code -eq 0 ]; then
    # Check if response has the expected format with success and data fields
    if echo "$response" | grep -q '"success":true' && echo "$response" | grep -q '"data":'; then
      echo "  ✅ Status: OK"
      echo "  ✅ Format: Consistent { success: true, data: ... }"
    else
      echo "  ✅ Status: OK"
      echo "  ❌ Format: Inconsistent"
      echo "  ℹ️  Response: ${response:0:100}..."
    fi
  else
    echo "  ❌ Failed with error code: $http_code"
  fi
  
  echo ""
}

# Test public endpoints
echo "📋 Testing Public Endpoints:"

test_api_format "/rooms" "Rooms"
test_api_format "/rooms/types" "Room Types"
test_api_format "/services" "Services" 
test_api_format "/services/features" "Features"
test_api_format "/promotions" "Promotions"

# Test protected endpoints (should return 401)
echo ""
echo "🔒 Testing Protected Endpoints (should return 401):"
echo -n "  ✓ Users: "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/users"
echo ""

echo -n "  ✓ Tasks: "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/tasks"
echo ""

echo -n "  ✓ Admin Dashboard: "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/dashboard"
echo ""

# Test auth endpoints
echo ""
echo "🔐 Testing Auth Endpoints:"
echo -n "  ✓ Login (with wrong credentials): "
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrongpass"}' "$BASE_URL/auth/login")
if echo "$RESPONSE" | grep -q "Invalid credentials"; then
    echo "✅ Correct error message"
else
    echo "❌ Unexpected response"
fi

echo ""
echo "🎉 API Endpoints Test Complete!"
echo "======================================================"
