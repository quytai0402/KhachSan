#!/bin/bash

# 🧪 HOTEL MANAGEMENT SYSTEM - API TESTING SCRIPT
# Kiểm tra tất cả 59 API endpoints để đảm bảo hệ thống hoạt động hoàn hảo

echo "🚀 Starting Hotel Management API Testing..."
echo "=================================================="

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api}"
TEST_EMAIL="${TEST_EMAIL:-admin@hotel.com}"
TEST_PASSWORD="${TEST_PASSWORD:-password123}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected_status=${5:-200}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $method $endpoint... "
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "%{http_code}" -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data")
        else
            response=$(curl -s -w "%{http_code}" -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "%{http_code}" -X $method "$API_BASE_URL$endpoint" \
                -H "$headers")
        else
            response=$(curl -s -w "%{http_code}" -X $method "$API_BASE_URL$endpoint")
        fi
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to get JWT token
get_jwt_token() {
    echo "🔐 Getting JWT token for testing..."
    
    login_response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
    
    # Extract token using basic text processing
    JWT_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$JWT_TOKEN" ]; then
        echo -e "${GREEN}✅ JWT Token obtained successfully${NC}"
        AUTH_HEADER="Authorization: Bearer $JWT_TOKEN"
    else
        echo -e "${YELLOW}⚠️  Warning: Could not get JWT token. Some tests may fail.${NC}"
        AUTH_HEADER=""
    fi
}

echo "🌐 API Base URL: $API_BASE_URL"
echo "📧 Test Email: $TEST_EMAIL"
echo "=================================================="

# Get JWT token for authenticated requests
get_jwt_token

echo ""
echo "🧪 Starting API Tests..."
echo "=================================================="

# 1. AUTH ENDPOINTS (4 routes)
echo -e "\n${BLUE}📝 Testing AUTH endpoints...${NC}"
test_api "POST" "/auth/register" '{"name":"Test User","email":"test@test.com","password":"password123","phone":"1234567890"}'
test_api "POST" "/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
test_api "GET" "/auth/me" "" "$AUTH_HEADER"
test_api "POST" "/auth/logout" "" "$AUTH_HEADER"

# 2. ROOMS ENDPOINTS (6 routes)
echo -e "\n${BLUE}🏨 Testing ROOMS endpoints...${NC}"
test_api "GET" "/rooms"
test_api "GET" "/rooms/available?checkIn=2025-06-01&checkOut=2025-06-05"
test_api "GET" "/rooms/types"
test_api "POST" "/rooms" '{"roomNumber":"101","roomType":"Standard","status":"available","price":100}' "$AUTH_HEADER"
test_api "GET" "/rooms/101"
test_api "PUT" "/rooms/101" '{"status":"maintenance"}' "$AUTH_HEADER"

# 3. BOOKINGS ENDPOINTS (8 routes)
echo -e "\n${BLUE}📅 Testing BOOKINGS endpoints...${NC}"
test_api "GET" "/bookings" "" "$AUTH_HEADER"
test_api "POST" "/bookings" '{"roomId":"room_id","checkInDate":"2025-06-01","checkOutDate":"2025-06-05","guestInfo":{"name":"Test Guest","email":"guest@test.com","phone":"1234567890"}}' "$AUTH_HEADER"
test_api "GET" "/bookings/my" "" "$AUTH_HEADER"
test_api "POST" "/bookings/guest" '{"roomId":"room_id","checkInDate":"2025-06-01","checkOutDate":"2025-06-05","guestInfo":{"name":"Guest","email":"guest@test.com","phone":"1234567890"}}'
test_api "PUT" "/bookings/booking_id/status" '{"status":"confirmed"}' "$AUTH_HEADER"
test_api "PUT" "/bookings/booking_id/payment" '{"paymentStatus":"paid"}' "$AUTH_HEADER"
test_api "GET" "/bookings/phone/1234567890" "" "$AUTH_HEADER"
test_api "DELETE" "/bookings/booking_id" "" "$AUTH_HEADER"

# 4. USERS ENDPOINTS (6 routes)
echo -e "\n${BLUE}👥 Testing USERS endpoints...${NC}"
test_api "GET" "/users" "" "$AUTH_HEADER"
test_api "GET" "/users/user_id" "" "$AUTH_HEADER"
test_api "PUT" "/users/user_id" '{"name":"Updated Name"}' "$AUTH_HEADER"
test_api "DELETE" "/users/user_id" "" "$AUTH_HEADER"
test_api "PUT" "/users/user_id/toggle-status" "" "$AUTH_HEADER"
test_api "PUT" "/users/profile" '{"name":"New Profile Name"}' "$AUTH_HEADER"

# 5. SERVICES ENDPOINTS (8 routes)
echo -e "\n${BLUE}🛎️ Testing SERVICES endpoints...${NC}"
test_api "GET" "/services"
test_api "GET" "/services/service_id"
test_api "POST" "/services" '{"name":"Test Service","description":"Test Description","price":50}' "$AUTH_HEADER"
test_api "PUT" "/services/service_id" '{"name":"Updated Service"}' "$AUTH_HEADER"
test_api "DELETE" "/services/service_id" "" "$AUTH_HEADER"
test_api "POST" "/services/service_id/request" '{"roomNumber":"101","notes":"Test request"}' "$AUTH_HEADER"
test_api "GET" "/services/requests" "" "$AUTH_HEADER"
test_api "PUT" "/services/requests/request_id/status" '{"status":"completed"}' "$AUTH_HEADER"

# 6. ADMIN ENDPOINTS (4 routes)
echo -e "\n${BLUE}👨‍💼 Testing ADMIN endpoints...${NC}"
test_api "GET" "/admin/dashboard" "" "$AUTH_HEADER"
test_api "GET" "/admin/reports" "" "$AUTH_HEADER"
test_api "GET" "/admin/activities" "" "$AUTH_HEADER"
test_api "GET" "/admin/analytics" "" "$AUTH_HEADER"

# 7. STAFF ENDPOINTS (11 routes)
echo -e "\n${BLUE}👩‍💼 Testing STAFF endpoints...${NC}"
test_api "GET" "/staff" "" "$AUTH_HEADER"
test_api "POST" "/staff" '{"name":"Test Staff","email":"staff@test.com","password":"password123","role":"staff","phone":"1234567890"}' "$AUTH_HEADER"
test_api "GET" "/staff/staff_id" "" "$AUTH_HEADER"
test_api "PUT" "/staff/staff_id" '{"name":"Updated Staff"}' "$AUTH_HEADER"
test_api "DELETE" "/staff/staff_id" "" "$AUTH_HEADER"
test_api "GET" "/staff/dashboard" "" "$AUTH_HEADER"
test_api "GET" "/staff/schedule" "" "$AUTH_HEADER"
test_api "PUT" "/staff/schedule" '{"schedule":[]}' "$AUTH_HEADER"
test_api "GET" "/staff/performance" "" "$AUTH_HEADER"
test_api "POST" "/staff/checkin" '{"roomNumber":"101"}' "$AUTH_HEADER"
test_api "POST" "/staff/checkout" '{"roomNumber":"101"}' "$AUTH_HEADER"

# 8. TASKS ENDPOINTS (6 routes)
echo -e "\n${BLUE}📋 Testing TASKS endpoints...${NC}"
test_api "GET" "/tasks" "" "$AUTH_HEADER"
test_api "POST" "/tasks" '{"title":"Test Task","description":"Test Description","assignedTo":"staff_id","priority":"medium","type":"cleaning"}' "$AUTH_HEADER"
test_api "GET" "/tasks/task_id" "" "$AUTH_HEADER"
test_api "PUT" "/tasks/task_id" '{"status":"completed"}' "$AUTH_HEADER"
test_api "DELETE" "/tasks/task_id" "" "$AUTH_HEADER"
test_api "GET" "/tasks/my" "" "$AUTH_HEADER"

# 9. PROMOTIONS ENDPOINTS (6 routes)
echo -e "\n${BLUE}🎯 Testing PROMOTIONS endpoints...${NC}"
test_api "GET" "/promotions"
test_api "GET" "/promotions/active"
test_api "GET" "/promotions/promotion_id"
test_api "POST" "/promotions" '{"title":"Test Promotion","description":"Test Description","discountType":"percentage","discountValue":10,"validFrom":"2025-06-01","validTo":"2025-06-30"}' "$AUTH_HEADER"
test_api "PUT" "/promotions/promotion_id" '{"title":"Updated Promotion"}' "$AUTH_HEADER"
test_api "DELETE" "/promotions/promotion_id" "" "$AUTH_HEADER"

# Test Summary
echo ""
echo "=================================================="
echo "🎯 API TESTING COMPLETED!"
echo "=================================================="
echo -e "📊 Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "✅ Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "❌ Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED! Your API is working perfectly!${NC}"
    exit 0
else
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "\n📈 Success Rate: ${YELLOW}$SUCCESS_RATE%${NC}"
    
    if [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "✨ ${YELLOW}Good job! Most endpoints are working correctly.${NC}"
    else
        echo -e "⚠️  ${RED}Several endpoints need attention. Please check your setup.${NC}"
    fi
    
    exit 1
fi
