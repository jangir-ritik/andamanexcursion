# Email Notification System

This system provides comprehensive email notifications for the Andaman Excursion booking platform using [Resend](https://resend.com/).

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install resend @react-email/components
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Required for email service
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@andamanexcursion.com

# Optional for testing
TEST_EMAIL=your-test-email@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Resend API Key

1. Sign up at [Resend.com](https://resend.com/)
2. Go to Settings → API Keys
3. Create a new API key
4. Add it to your environment variables

## 📧 Email Templates

We have three main email templates:

1. **BookingConfirmationTemplate** - Sent after successful booking
2. **BookingStatusUpdateTemplate** - Sent when status changes
3. **PaymentFailedTemplate** - Sent when payment fails

## 🔧 Usage

```typescript
import { NotificationService } from "@/services/notifications/notificationService";

// Send confirmation by booking ID
await NotificationService.sendBookingConfirmation("booking-id");

// Send status update
await NotificationService.sendBookingStatusUpdate(
  "booking-id",
  "pending",
  "confirmed",
  "Your payment has been processed!"
);
```

## 🧪 Testing

Test endpoint: `/api/notifications/test`

```bash
# Test booking confirmation
curl -X POST /api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"type": "booking-confirmation", "testEmail": "test@example.com"}'
```

## 🔗 Integration Points

- **Payment Verification**: Automatic confirmation emails
- **Payment Webhooks**: Status updates and failure notifications
- **Manual Updates**: Use NotificationService directly

For detailed documentation, see the full README in this directory.
