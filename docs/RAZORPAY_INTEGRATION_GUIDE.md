# 🔗 Complete Razorpay Integration Guide

This guide covers the complete implementation of Razorpay payment gateway with your booking system.

## 📋 Overview

The integration includes:

- ✅ **Activity Inventory Management** - Prevents overbooking
- ✅ **Cart Session Persistence** - Abandoned cart recovery
- ✅ **Razorpay Payment Gateway** - Secure payment processing
- ✅ **Webhook Handling** - Real-time payment updates
- ✅ **Booking Creation** - Automatic booking creation after payment
- ✅ **Form Reset** - Clean state management after booking

---

## 🚀 Step-by-Step Implementation

### **Step 1: Environment Setup**

Create/update your `.env.local`:

```env
# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# MongoDB (if not already configured)
MONGODB_URI=mongodb://localhost:27017/andaman-excursion

# Payload CMS Secret
PAYLOAD_SECRET=your-payload-secret
```

### **Step 2: Install Dependencies**

```bash
npm install razorpay crypto
```

### **Step 3: File Structure Created**

```
src/
├── app/api/payments/
│   ├── create-order/route.ts     ✅ Creates Razorpay orders
│   ├── verify/route.ts           ✅ Verifies payments & creates bookings
│   └── webhook/route.ts          ✅ Handles Razorpay webhooks
├── app/(payload)/collections/
│   ├── ActivityInventory.ts      ✅ Inventory management
│   ├── Bookings.ts              ✅ Booking records
│   ├── Payments.ts              ✅ Payment transactions
│   └── BookingSessions.ts       ✅ Cart persistence
├── hooks/
│   └── useRazorpay.ts           ✅ Payment hook
└── components/checkout/
    └── PaymentButton.tsx        ✅ Payment component
```

---

## 🔧 Integration Steps

### **Step 4: Update Your Review Step Component**

```tsx
// In your ReviewStep component
import { PaymentButton } from "@/components/checkout/PaymentButton";

export const ReviewStep: React.FC = () => {
  // ... your existing code

  return (
    <div className={styles.reviewStep}>
      {/* Your existing review content */}

      {/* Replace your existing submit button with: */}
      <PaymentButton disabled={!isFormValid} className={styles.paymentButton} />
    </div>
  );
};
```

### **Step 5: Setup Activity Inventory (Required for Production)**

1. **Create inventory records** for your activities:

```javascript
// Example: Create inventory for "Scuba Diving" on Dec 25, 2024
{
  activity: "674a1b2c3d4e5f6789012345", // Activity ID
  date: "2024-12-25",
  timeSlot: "674b1c2d3e4f5g6789012346", // Time slot ID (optional)
  totalCapacity: 20,
  bookedCapacity: 0,
  status: "available",
  isActive: true
}
```

2. **Check availability** before payment:

```typescript
// Add this to your booking validation
const checkInventoryAvailability = async (activities: ActivityBooking[]) => {
  for (const activity of activities) {
    const response = await fetch(`/api/inventory/check`, {
      method: "POST",
      body: JSON.stringify({
        activityId: activity.activity.id,
        date: activity.searchParams.date,
        timeSlot: activity.searchParams.time,
        requiredCapacity:
          activity.searchParams.adults + activity.searchParams.children,
      }),
    });

    const { available } = await response.json();
    if (!available) {
      throw new Error(
        `${activity.activity.title} is no longer available for the selected date/time`
      );
    }
  }
};
```

### **Step 6: Test the Integration**

#### **Test Mode Setup:**

1. Use Razorpay test credentials
2. Test card: `4111 1111 1111 1111`
3. Any CVV and future expiry date
4. Test UPI: `success@razorpay`

#### **Testing Checklist:**

- [ ] ✅ Order creation works
- [ ] ✅ Payment gateway opens
- [ ] ✅ Successful payment creates booking
- [ ] ✅ Failed payment shows error
- [ ] ✅ Cancelled payment shows message
- [ ] ✅ Webhook updates payment status
- [ ] ✅ Confirmation page shows correct data
- [ ] ✅ Form resets after booking
- [ ] ✅ Multiple activities display correctly

---

## 🔧 Advanced Features

### **Inventory Integration**

```typescript
// Add to your API routes
export async function POST(request: NextRequest) {
  // ... existing code

  // Check and reserve inventory before payment
  const inventoryCheck = await reserveInventory(bookingData.activities);
  if (!inventoryCheck.success) {
    return NextResponse.json({ error: inventoryCheck.error }, { status: 400 });
  }

  // ... continue with payment
}
```

### **Cart Session Persistence**

```typescript
// Update your cart when items are added
const updateCartSession = async (cartItems: any[]) => {
  await fetch("/api/cart/update", {
    method: "POST",
    body: JSON.stringify({
      sessionId: getSessionId(), // Generate or retrieve session ID
      cartItems,
      userEmail: getCurrentUserEmail(),
    }),
  });
};
```

### **Abandoned Cart Recovery**

```typescript
// Set up automated email/WhatsApp for abandoned carts
const scheduleAbandonedCartRecovery = async (sessionId: string) => {
  // After 1 hour of inactivity
  setTimeout(async () => {
    await sendAbandonedCartEmail(sessionId);
  }, 60 * 60 * 1000);

  // After 24 hours
  setTimeout(async () => {
    await sendAbandonedCartWhatsApp(sessionId);
  }, 24 * 60 * 60 * 1000);
};
```

---

## 🔐 Security Considerations

### **Environment Variables**

- Never expose `RAZORPAY_KEY_SECRET` in frontend code
- Use `NEXT_PUBLIC_RAZORPAY_KEY_ID` only for client-side
- Rotate webhook secrets regularly

### **Payment Verification**

- Always verify payments server-side
- Never trust client-side payment status
- Use webhooks for final payment confirmation

### **Data Validation**

- Validate all payment amounts
- Check inventory availability before payment
- Sanitize all user inputs

---

## 🧪 Testing Scenarios

### **Happy Path:**

1. User selects activities
2. Fills member details
3. Reviews booking
4. Clicks "Pay" button
5. Razorpay opens with correct amount
6. User completes payment
7. Booking is created automatically
8. Confirmation page shows with all activities
9. Form data is cleared

### **Error Scenarios:**

1. **Payment failure** - User sees error, can retry
2. **Network issues** - Proper error handling and retry
3. **Inventory shortage** - Prevents payment initiation
4. **Invalid form data** - Validates before payment
5. **Webhook failures** - Manual reconciliation tools

---

## 🚀 Go Live Checklist

### **Pre-Production:**

- [ ] Switch to live Razorpay keys
- [ ] Set up webhook URL in Razorpay dashboard
- [ ] Test with real bank accounts (small amounts)
- [ ] Set up monitoring and alerts
- [ ] Configure backup payment methods

### **Production Setup:**

```env
# Production Environment Variables
RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

### **Webhook Configuration:**

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.created`
4. Add webhook secret to environment variables

---

## 📞 Support & Troubleshooting

### **Common Issues:**

**"Order creation failed"**

- Check Razorpay credentials
- Verify API endpoint is accessible
- Check amount format (should be in paise)

**"Payment verification failed"**

- Verify webhook secret
- Check signature calculation
- Ensure payload format matches

**"Booking not created"**

- Check Payload CMS connection
- Verify collection relationships
- Check console logs for errors

### **Debug Commands:**

```bash
# Check Razorpay SDK version
npm list razorpay

# Test webhook locally (using ngrok)
ngrok http 3000
# Then update webhook URL in Razorpay dashboard

# Monitor payment logs
tail -f logs/payment-*.log
```

### **Monitoring:**

- Set up error tracking (Sentry, LogRocket)
- Monitor payment success rates
- Track conversion funnels
- Set up alerts for failed payments

---

## 📊 Analytics & Reporting

### **Payment Metrics:**

- Payment success rate
- Average payment amount
- Payment method preferences
- Geographic payment distribution

### **Booking Metrics:**

- Conversion rate from cart to booking
- Abandoned cart recovery rate
- Popular activities and time slots
- Revenue per booking

### **Customer Insights:**

- Payment completion time
- Drop-off points in checkout
- Repeat customer behavior
- Seasonal booking patterns

---

This completes your Razorpay integration! 🎉

Your system now supports:

- ✅ Secure payment processing
- ✅ Automatic booking creation
- ✅ Inventory management
- ✅ Cart persistence
- ✅ Multiple activity support
- ✅ Clean form reset
- ✅ Comprehensive error handling
