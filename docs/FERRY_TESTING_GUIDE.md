# Ferry Booking System - Complete Testing Guide

## 🎯 System Overview Assessment

**Your current implementation is impressive!** Here's what's working well:

### ✅ Excellent Existing Features:

- **Multi-operator API aggregation** (Sealink, Makruzz, Green Ocean)
- **Parallel search with proper timeout handling**
- **Smart caching with 5-minute expiration**
- **Unified data transformation**
- **React Query integration**
- **Smart time filtering with user preferences**
- **Booking session management**
- **Health monitoring for all APIs**

### ⚠️ Areas Needing Updates:

1. **Environment variables setup**
2. **Green Ocean hash generation refinement**
3. **Seat selection UI completion**
4. **Booking confirmation flow**

---

## 🧪 Complete Test Flow Guide

### Phase 1: Basic System Testing

#### Test 1: Environment Setup Verification

```bash
# 1. Check health endpoint
curl http://localhost:3000/api/ferry/health

# Expected responses:
# ✅ All operators online:
{
  "operators": {
    "sealink": { "status": "online" },
    "makruzz": { "status": "online" },
    "greenocean": { "status": "online" }
  },
  "overallStatus": "all_online"
}

# ⚠️ Missing credentials:
{
  "operators": {
    "sealink": { "status": "offline", "message": "Credentials not configured" }
  }
}
```

#### Test 2: Basic Ferry Search

```bash
# Test search API directly
curl -X POST http://localhost:3000/api/ferry/search \
  -H "Content-Type: application/json" \
  -d '{
    "from": "port-blair",
    "to": "havelock",
    "date": "2024-12-25",
    "adults": 2,
    "children": 0,
    "infants": 0
  }'

# Expected response structure:
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "sealink-12345-2024-12-25",
        "operator": "sealink",
        "ferryName": "Sealink",
        "route": {
          "from": { "name": "Port Blair", "code": "PB" },
          "to": { "name": "Havelock", "code": "HL" }
        },
        "schedule": {
          "departureTime": "08:00",
          "arrivalTime": "09:30",
          "duration": "1h 30m"
        },
        "classes": [
          {
            "name": "Luxury",
            "price": 1200,
            "availableSeats": 45
          }
        ]
      }
    ],
    "meta": {
      "totalResults": 3,
      "operatorErrors": []
    }
  }
}
```

### Phase 2: UI Flow Testing

#### Test 3: Ferry Search Form

**Location**: Visit `http://localhost:3000/ferry`

**Steps**:

1. **BookingForm Tab Selection**: Ensure "Ferry" tab is visible and active
2. **Location Selection**:
   - From: "Port Blair"
   - To: "Havelock"
   - Verify destinations filter correctly (can't select same location)
3. **Date Selection**: Choose tomorrow's date
4. **Passenger Count**: Set 2 adults, 0 children, 0 infants
5. **Search Button**: Click "Search Ferries"

**Expected Behavior**:

- Form validates correctly
- Navigate to `/ferry/results?from=port-blair&to=havelock&date=2024-12-25&adults=2`
- Loading spinner appears
- Search results load within 15 seconds

#### Test 4: Ferry Results Page

**Location**: `http://localhost:3000/ferry/results` (after search)

**Expected UI Elements**:

1. **Modify Search Section**: Embedded booking form at top
2. **Search Summary**: Shows route, date, passenger count, ferry count
3. **Time Filters**: Filter buttons (Morning, Afternoon, Evening)
4. **Ferry Cards**: Each card shows:
   - Ferry name and operator
   - Departure/arrival times
   - Available classes with prices
   - Seat availability
   - "Choose Seats" buttons

**Test Scenarios**:

```javascript
// A. Time Filtering
- Click "Morning (06:00-12:00)" filter
- Verify only morning ferries show
- Clear filter, all ferries return

// B. Smart Time Preferences
- Search with preferredTime=09:00 in URL
- Verify "Perfect match" section appears
- Verify "Other times" section shows remaining

// C. Ferry Selection
- Click "Choose Seats" on any Green Ocean ferry
- Should navigate to /ferry/booking/{ferryId}?class={classId}
```

#### Test 5: Seat Selection (Green Ocean Only)

**Location**: `/ferry/booking/{greenOceanFerryId}?class=1`

**Expected Flow**:

1. **Seat Layout API Call**:

   ```bash
   curl -X POST http://localhost:3000/api/ferry/seat-layout \
     -H "Content-Type: application/json" \
     -d '{
       "routeId": 1,
       "ferryId": 2,
       "classId": 1,
       "travelDate": "24-12-2024",
       "operator": "greenocean"
     }'
   ```

2. **Seat Map Display**: Visual seat grid with:

   - Available seats (green)
   - Booked seats (red)
   - Selected seats (blue)

3. **Seat Selection**: Click 2 seats for 2 adults

4. **Temporary Blocking**: Green Ocean API temporarily reserves seats

### Phase 3: Booking Flow Testing

#### Test 6: Booking Session Creation

```bash
# Test booking session API
curl -X POST http://localhost:3000/api/ferry/booking/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "ferryId": "greenocean-ferry-2-route-1",
    "classId": "1",
    "selectedSeats": ["E1", "E2"],
    "searchParams": {
      "from": "port-blair",
      "to": "havelock",
      "date": "2024-12-25",
      "adults": 2,
      "children": 0,
      "infants": 0
    }
  }'

# Expected response:
{
  "success": true,
  "sessionId": "ferry_1703456789_abc123def",
  "expiresAt": "2024-12-25T10:30:00Z",
  "totalAmount": 2400
}
```

#### Test 7: Checkout Integration

**Expected Integration Points**:

1. **Navigate to Checkout**: `/checkout` with ferry session
2. **Passenger Details Form**:
   - Contact information
   - Passenger details for each adult
   - ID document information
3. **Payment Integration**: Razorpay with ferry booking data
4. **Confirmation**: PNR display and ticket download

### Phase 4: Error Handling Testing

#### Test 8: API Failures

```bash
# Test with invalid credentials
GREEN_OCEAN_PUBLIC_KEY=invalid_key npm run dev

# Expected behavior:
- Health check shows "offline"
- Search continues with other operators
- User sees "Green Ocean temporarily unavailable"
```

#### Test 9: Network Timeouts

```javascript
// Simulate slow API response
// Expected: 15-second timeout, graceful fallback
// Other operators still work
```

#### Test 10: Invalid Search Parameters

```bash
# Test past date
curl -X POST http://localhost:3000/api/ferry/search \
  -d '{"from": "port-blair", "to": "havelock", "date": "2024-01-01"}'

# Expected: 400 error "Cannot search for dates in the past"

# Test same from/to locations
curl -X POST http://localhost:3000/api/ferry/search \
  -d '{"from": "port-blair", "to": "port-blair"}'

# Expected: Form validation prevents submission
```

---

## 🔧 Quick Setup for Testing

### 1. Environment Variables

```bash
# Create .env.local file:
cat > .env.local << 'EOF'
# Ferry API Credentials (get from operators)
SEALINK_USERNAME=your_username
SEALINK_TOKEN=your_token
SEALINK_AGENCY=your_agency

MAKRUZZ_USERNAME=your_username
MAKRUZZ_PASSWORD=your_password

GREEN_OCEAN_PUBLIC_KEY=your_public_key
GREEN_OCEAN_PRIVATE_KEY=your_private_key

# API URLs
SEALINK_API_URL=https://api.gonautika.com:8012/
MAKRUZZ_API_URL=https://staging.makruzz.com/booking_api/
GREEN_OCEAN_API_URL=https://tickets.greenoceanseaways.com/api/v1/
EOF
```

### 2. Test with Mock Data (if credentials unavailable)

```bash
# Set test mode in environment
FERRY_MOCK_MODE=true npm run dev

# This should return sample data for all operators
```

### 3. Development Testing Commands

```bash
# Start development server
npm run dev

# Test health in separate terminal
curl http://localhost:3000/api/ferry/health | jq

# Test search
curl -X POST http://localhost:3000/api/ferry/search \
  -H "Content-Type: application/json" \
  -d '{
    "from": "port-blair",
    "to": "havelock",
    "date": "2024-12-30",
    "adults": 2
  }' | jq
```

---

## 🎭 Operator-Specific Test Cases

### Sealink Adventures Testing

```javascript
// Test Scenarios:
1. Port Blair → Havelock (most common route)
2. Havelock → Neil Island
3. Neil Island → Port Blair

// Expected Seat Classes:
- Luxury (pClass): ₹1,200 base fare
- Royal (bClass): ₹1,500 base fare

// Manual Seat Selection: Required
// Vessels: Sealink (ID: 1), Nautika (ID: 2)
```

### Makruzz Testing

```javascript
// Test Scenarios:
1. Port Blair → Havelock
2. Return journey booking

// Expected Classes:
- Premium: ₹1,725 (with 18% GST)
- Deluxe: Higher tier

// Auto Seat Assignment: Default behavior
// Commission: 20% for agents
```

### Green Ocean Seaways Testing

```javascript
// Test Scenarios:
1. Port Blair → Havelock (most schedules)
2. Early morning ferries (06:30 AM)
3. Seat selection workflow

// Expected Classes:
- Economy: ₹1,150 + ₹50 port fee
- Premium: ₹1,500 + fees
- Royal: ₹1,700 + fees

// Manual Seat Selection: Visual seat map
// PDF Tickets: Base64 encoded in response
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "All ferry operators offline"

**Cause**: Environment variables not configured  
**Solution**: Check `.env.local` file, verify credentials

### Issue 2: Green Ocean "Authentication failed"

**Cause**: Hash generation mismatch  
**Solution**: Verify public/private keys, check hash sequence

### Issue 3: "No ferries found"

**Cause**: Unsupported route or date  
**Solution**: Check `LocationMappingService` for supported routes

### Issue 4: Seat selection not working

**Cause**: Missing seat layout API response  
**Solution**: Check Green Ocean credentials, verify route/ferry IDs

### Issue 5: Booking fails at payment

**Cause**: Session expiry or invalid booking data  
**Solution**: Check session timeout, verify booking session structure

---

## 📊 Performance Benchmarks

### Expected Response Times:

- **Ferry Search**: < 5 seconds (parallel API calls)
- **Seat Layout**: < 2 seconds (Green Ocean only)
- **Booking Session**: < 1 second (local creation)
- **Health Check**: < 3 seconds (all operators)

### Cache Performance:

- **Search Results**: 5-minute cache duration
- **Seat Layouts**: 2-minute cache (seats change frequently)
- **Location Mapping**: Permanent cache

---

## 🎯 Production Readiness Checklist

- [ ] All environment variables configured
- [ ] API credentials from all 3 operators obtained
- [ ] Health monitoring setup with alerts
- [ ] Error tracking (Sentry) configured
- [ ] Rate limiting implemented (100 req/min)
- [ ] Payment gateway integration tested
- [ ] SMS/Email confirmation system ready
- [ ] Customer support integration
- [ ] Analytics tracking (search → booking conversion)
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed

Your ferry booking system architecture is excellent! The main focus should be on getting the API credentials and completing the seat selection UI for Green Ocean ferries.
