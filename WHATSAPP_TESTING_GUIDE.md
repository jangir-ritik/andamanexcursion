# WhatsApp Messaging Testing Guide

## Issues Identified

Your WhatsApp messaging wasn't working because:

1. **Development Mode Behavior**: Your `.env` has `NODE_ENV=development`, which means:
   - Template SIDs are **ignored** (only used in production)
   - Simple text messages are sent instead
   - Sandbox mode is used instead of production WhatsApp number

2. **Twilio Sandbox Requirements**: In development/testing with Twilio sandbox, recipients must **opt-in first** before receiving messages.

3. **Phone Number Format**: Numbers must be in international format: `+91XXXXXXXXXX`

---

## Setup Steps

### Step 1: Join Twilio WhatsApp Sandbox (REQUIRED for Testing)

Before you can receive any WhatsApp messages in development mode, you must join the Twilio sandbox:

1. **Find Your Sandbox Number**:
   - Go to: [Twilio Console → Messaging → Try it out → Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - You'll see a number like: `+14155238886`
   - You'll also see a unique code like: `join <your-keyword>`

2. **Join the Sandbox**:
   - On your phone, open WhatsApp
   - Send a message to the sandbox number: `join <your-keyword>`
   - Example: `join steel-donkey` (your keyword will be different)
   - Wait for confirmation message: "You are all set!"

3. **Verify**:
   - You should receive a welcome message
   - Your number is now authorized to receive sandbox messages

### Step 2: Verify Environment Variables

Check your `.env` file has these values:

```env
# Twilio Credentials
TWILIO_ACCOUNT_SID=AC463b77b71b3899df8e4224e16f817c04  ✅ (You have this)
TWILIO_AUTH_TOKEN=c175377db4ce370b74309a1727608073   ✅ (You have this)

# WhatsApp Numbers
TWILIO_WHATSAPP_SANDBOX=whatsapp:+14155238886          ✅ (You have this)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14067191940           ✅ (You have this)

# Template SIDs (only used in production)
TWILIO_BOOKING_CONFIRMATION_SID=HX3a96db396e8ce0dee85b1c9cb6f7ec18  ✅
TWILIO_STATUS_UPDATE_SID=HX9e2ef803ef033cc9e572cd096e77a486         ✅
TWILIO_REMINDER_SID=HX34db11f9481cc4192e939b9593ddabfc              ✅
TWILIO_PAYMENT_FAILED_SID=HXe3ab754a258d9342213a8f0a732fb37d        ✅
TWILIO_ENQUIRY_CONFIRMATION_SID=HXdef2c5a728890825bd40f13e00da910a  ✅

# Environment
NODE_ENV=development  ✅ (Correct for testing)
```

**Everything looks configured correctly!** ✅

---

## Testing

### Option 1: Test via API Endpoint (Recommended)

I've created a dedicated test endpoint for you.

**Start your dev server** (if not already running):
```bash
npm run dev
```

**Test WhatsApp messaging**:

1. **Check Status** (GET request):
```bash
curl http://localhost:3000/api/test/whatsapp
```

This will show you:
- Whether WhatsApp is enabled
- Your configuration status
- Sandbox setup instructions

2. **Send Test Message** (POST request):
```bash
curl -X POST http://localhost:3000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"+919876543210\"}"
```

Replace `+919876543210` with your actual phone number that joined the sandbox.

**Or use Postman/Insomnia**:
- Method: `POST`
- URL: `http://localhost:3000/api/test/whatsapp`
- Body (JSON):
```json
{
  "phone": "+918107664041"
}
```

### Option 2: Test from Browser Console

1. Open your application in browser
2. Open Developer Console (F12)
3. Run:
```javascript
fetch('/api/test/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '+918107664041' })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## What to Expect

### ✅ Success Response:
```json
{
  "success": true,
  "message": "WhatsApp test message sent successfully!",
  "messageSid": "SM...",
  "details": {
    "provider": "twilio-whatsapp",
    "environment": "development"
  }
}
```

You should receive this message on WhatsApp:
```
Test Successful! 🧪

WhatsApp notification system is working!
📅 Test Date: 3 Jan, 2026
🕐 Test Time: 10:30 AM
✅ Status: Active

This confirms your WhatsApp integration is properly configured.

Andaman Excursion Tech Team
```

### ❌ Common Errors:

#### Error: "Phone number not in sandbox"
**Solution**: You must join the sandbox first (see Step 1 above)

#### Error: "Invalid phone number format"
**Solution**: Use international format: `+91XXXXXXXXXX` (not just `9876543210`)

#### Error: "WhatsApp service is not enabled"
**Solution**: Check your `.env` file has all Twilio credentials

#### Error: "Trial account limitation"
**Solution**: With Twilio trial account:
- You can only send to verified numbers
- Add numbers in Twilio Console → Phone Numbers → Verified Caller IDs

---

## Debugging

### Check Server Logs

When you send a test message, watch your terminal where `npm run dev` is running. You'll see detailed logs:

```
✅ WhatsApp is enabled: { environment: 'development', fromNumber: 'whatsapp:+14155238886' }
🔔 WhatsApp send() called with payload: { type: 'test', recipient: '+91XXXX***210' }
📤 Sending WhatsApp message: { to: 'whatsapp:+919876543210', from: 'whatsapp:+14155238886' }
✅ WhatsApp message sent successfully: { sid: 'SM...', recipient: '+91XXXX***210' }
```

If you see errors, they'll show exactly what failed:
```
❌ WhatsApp service not enabled. Configuration check: { ... }
❌ Invalid phone number format: 9876543210
```

### Verify in Twilio Console

1. Go to: [Twilio Console → Monitor → Logs → Messaging](https://console.twilio.com/us1/monitor/logs/messaging)
2. You'll see all sent messages, their status, and any errors
3. Look for:
   - ✅ `delivered` - Success!
   - ⏳ `sent` - In transit
   - ❌ `failed` - Check error code

---

## Next Steps

### For Production (Using Templates):

When you're ready to use your template SIDs in production:

1. **Verify Templates are Approved**:
   - Go to: [Twilio Console → Messaging → Content API → Content](https://console.twilio.com/us1/develop/sms/content-editor)
   - Check all your templates are **approved** (not pending/rejected)

2. **Get WhatsApp Business Number**:
   - Sandbox won't work in production
   - Go to: [Twilio Console → Messaging → WhatsApp → Senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)
   - Request a WhatsApp Business number

3. **Update .env for Production**:
```env
NODE_ENV=production
TWILIO_WHATSAPP_NUMBER=whatsapp:+14067191940  # Your business number
```

### Test Booking Flow:

Once basic WhatsApp is working, test the full booking confirmation:

1. Create a test booking through your website
2. Complete payment
3. Check if you receive booking confirmation via WhatsApp

---

## Quick Checklist

Before testing, ensure:
- [ ] Twilio account credentials in `.env`
- [ ] You joined the WhatsApp sandbox
- [ ] Phone number is in `+91XXXXXXXXXX` format
- [ ] Dev server is running (`npm run dev`)
- [ ] You're testing with the number that joined sandbox

---

## Need Help?

If issues persist:

1. **Share the logs**: Copy the console output when you test
2. **Check Twilio Console**: See the actual error from Twilio
3. **Verify sandbox join**: Try sending a message to the sandbox number manually
4. **Phone format**: Double-check it's `+91` followed by 10 digits

---

## Summary

**Your configuration is correct!** The main issues were:

1. ✅ **Fixed**: Added detailed logging to see what's happening
2. ✅ **Fixed**: Created test endpoint for easy testing
3. ⚠️ **Action Required**: Join Twilio WhatsApp sandbox with your phone
4. ⚠️ **Action Required**: Test with the endpoint using your phone number

Once you join the sandbox, WhatsApp messages should work perfectly in development mode! 🎉
