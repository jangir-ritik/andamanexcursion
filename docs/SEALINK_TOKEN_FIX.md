# Sealink Token Handling Fix

## Issue Identified

The Sealink API token contains `+` characters that were causing:

1. **Line breaks** in environment variables
2. **URL encoding issues** during API calls
3. **Token validation failures**

## Solution Applied

### 1. **Token Cleaning**

```typescript
// Before (broken)
token: this.TOKEN;

// After (fixed)
const cleanToken = this.TOKEN.replace(/\s+/g, ""); // Remove whitespace/newlines
token: cleanToken;
```

### 2. **Environment Variable Setup**

In your `.env.local`, ensure the token is on a single line:

```env
# ✅ CORRECT - Single line, no breaks
SEALINK_USERNAME=excursion
SEALINK_TOKEN=U2FsdGVkX19DpqycMA+j5m2HBDkk0f/Tcy96UW+6gTyYhw7Y2LCavxW3nczGgDcoAbieWlIk49YwdKUnc5wIMw==
SEALINK_AGENCY=ANDAMAN EXCURSION PVT LTD

# ❌ WRONG - Token broken across lines
SEALINK_TOKEN=U2FsdGVkX19DpqycMA+j5m2HBDkk0f/Tcy96UW+6gTyYhw7Y2LCa
vxW3nczGgDcoAbieWlIk49YwdKUnc5wIMw==
```

### 3. **Verification Steps**

1. **Check token in Postman**: ✅ Working

   ```json
   {
     "userName": "excursion",
     "token": "U2FsdGVkX19DpqycMA+j5m2HBDkk0f/Tcy96UW+6gTyYhw7Y2LCavxW3nczGgDcoAbieWlIk49YwdKUnc5wIMw=="
   }
   ```

2. **Wallet Balance**: ✅ 100,000 available

   ```json
   {
     "walletBalance": 100000
   }
   ```

3. **Test search endpoint**: `/api/ferry/search`
4. **Test booking endpoint**: `/api/ferry/book`

### 4. **Changes Made**

#### `sealinkService.ts`

- Added token cleaning in `searchTrips()`
- Added token cleaning in `bookSeats()`
- Added better logging for token validation
- Added proper headers for API calls

#### `ferryBookingService.ts`

- Already uses the cleaned token from SealinkService

### 5. **Expected Results**

After the fix:

- ✅ **Search**: Should return trip data
- ✅ **Seat Layout**: Should show available seats
- ✅ **Booking**: Should create PNR successfully
- ✅ **Error**: "Token Validation Failed" should be resolved

### 6. **Testing Commands**

```bash
# Test health check
curl "http://localhost:3000/api/ferry/health"

# Test search
curl -X POST "http://localhost:3000/api/ferry/search" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "port-blair",
    "to": "havelock",
    "date": "2025-08-23",
    "adults": 1
  }'
```

## Makruzz Wallet Balance Issue

For Makruzz testing, you mentioned no wallet balance. Options:

1. **Contact Makruzz** for demo wallet top-up
2. **Test in staging** with different credentials
3. **Mock testing** for now, real testing later
4. **Use test cards** if they support payment integration

The Makruzz implementation is complete and should work once you have wallet balance.

## Next Steps

1. ✅ **Sealink**: Test with fixed token
2. 🔄 **Makruzz**: Get wallet balance or test credentials
3. ✅ **Green Ocean**: Already working
4. 🚀 **Production**: Deploy with all 3 operators

## Debug Commands

If issues persist:

```typescript
// Add to sealinkService.ts for debugging
console.log("🔍 Token Debug:", {
  original: this.TOKEN?.substring(0, 10) + "...",
  cleaned: cleanToken?.substring(0, 10) + "...",
  length: cleanToken?.length,
  hasPlus: cleanToken?.includes("+"),
  hasWhitespace: /\s/.test(this.TOKEN || ""),
});
```
