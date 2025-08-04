# Ferry Status Monitoring System

## Overview

This system provides real-time monitoring of ferry operator API connectivity with visual status indicators. It helps you immediately know if any ferry operators are experiencing issues.

## Features

- ✅ **Real-time Health Checks**: Monitors all 3 ferry operators every 60 seconds
- ✅ **Visual Status Indicators**: Green/red dots for instant status recognition
- ✅ **Multiple Display Variants**: Dots-only, compact, and detailed views
- ✅ **Graceful Degradation**: Handles missing credentials (like Green Ocean)
- ✅ **Error Details**: Shows specific error messages for debugging
- ✅ **Responsive Design**: Works on mobile and desktop

## Status Colors

| Color    | Status    | Meaning                                   |
| -------- | --------- | ----------------------------------------- |
| 🟢 Green | `online`  | API is responding correctly               |
| 🟡 Amber | `offline` | API not configured or credentials missing |
| 🔴 Red   | `error`   | API error or connection failure           |

## Components

### 1. **FerryStatusIndicator Component**

**Location**: `src/components/atoms/FerryStatusIndicator/`

**Props**:

```typescript
interface FerryStatusIndicatorProps {
  variant?: "compact" | "detailed" | "dots-only";
  showLabels?: boolean;
  className?: string;
}
```

### 2. **API Health Endpoint**

**URL**: `/api/ferry/health`  
**Method**: `GET`  
**Cache**: 30 seconds

**Response Format**:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "success",
  "operators": {
    "sealink": {
      "status": "online"
    },
    "makruzz": {
      "status": "online"
    },
    "greenocean": {
      "status": "offline",
      "message": "Credentials not configured"
    }
  },
  "summary": {
    "total": 3,
    "online": 2,
    "offline": 1,
    "error": 0
  }
}
```

## Usage Examples

### Footer Integration (Recommended)

Add this to your footer component for constant visibility:

```tsx
// src/components/organisms/Footer/Footer.tsx
import { FerryStatusIndicator } from "@/components/atoms";

export function Footer() {
  return (
    <footer className="footer">
      {/* Your existing footer content */}

      {/* Ferry Status - Dots only for minimal footprint */}
      <div className="ferry-status">
        <span>Ferry APIs:</span>
        <FerryStatusIndicator variant="dots-only" showLabels={false} />
      </div>
    </footer>
  );
}
```

### Admin Dashboard (Detailed View)

For debugging and monitoring:

```tsx
// src/components/admin/FerryHealthDashboard.tsx
import { FerryStatusIndicator } from "@/components/atoms";

export function FerryHealthDashboard() {
  return (
    <div className="admin-dashboard">
      <h2>Ferry Operator Health</h2>

      {/* Detailed view with all information */}
      <FerryStatusIndicator variant="detailed" showLabels={true} />
    </div>
  );
}
```

### Compact Header/Navigation

For navigation or header areas:

```tsx
// src/components/organisms/Header/Header.tsx
import { FerryStatusIndicator } from "@/components/atoms";

export function Header() {
  return (
    <header className="header">
      {/* Your navigation */}

      {/* Compact status with labels */}
      <FerryStatusIndicator
        variant="compact"
        showLabels={true}
        className="ml-auto"
      />
    </header>
  );
}
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
# Sealink (you have these)
SEALINK_USERNAME=your_sealink_username
SEALINK_TOKEN=your_sealink_token
SEALINK_API_URL=https://api.gonautika.com:8012/

# Makruzz (you have these)
MAKRUZZ_USERNAME=your_makruzz_username
MAKRUZZ_PASSWORD=your_makruzz_password
MAKRUZZ_API_URL=https://staging.makruzz.com/booking_api/

# Green Ocean (you don't have these yet - will show as offline)
GREEN_OCEAN_PUBLIC_KEY=your_public_key_when_available
GREEN_OCEAN_PRIVATE_KEY=your_private_key_when_available
GREEN_OCEAN_API_URL=https://tickets.greenoceanseaways.com/api/v1/

# Rate limiting
FERRY_API_RATE_LIMIT=100
```

## What You'll See

### Current State (with your credentials):

- **Sealink**: 🟢 Green (online)
- **Makruzz**: 🟢 Green (online)
- **Green Ocean**: 🟡 Amber (credentials not configured)

### Once Green Ocean credentials are added:

- **Sealink**: 🟢 Green (online)
- **Makruzz**: 🟢 Green (online)
- **Green Ocean**: 🟢 Green (online)

### If an API goes down:

- **Sealink**: 🔴 Red (connection failed)
- **Makruzz**: 🟢 Green (online)
- **Green Ocean**: 🟢 Green (online)

## Key Benefits

### 1. **Immediate Issue Detection**

- See API problems instantly without checking logs
- Know which specific operator is having issues
- Differentiate between config issues and API failures

### 2. **Better Customer Support**

- Quickly diagnose why ferry searches might be failing
- Provide accurate information about service availability
- Proactively communicate issues to users

### 3. **Development & Debugging**

- Easy visual confirmation during development
- No need to check multiple log files
- Clear error messages for troubleshooting

### 4. **Production Monitoring**

- Continuous health monitoring
- Visual alerts for operations team
- Historical status tracking capability

## Customization Options

### Custom Styling

```css
/* Override default colors */
.ferry-status .statusDot {
  font-size: 1rem; /* Larger dots */
}

/* Custom container styling */
.ferry-status-footer {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 0.25rem;
}
```

### Conditional Display

```tsx
// Only show in development/staging
{
  process.env.NODE_ENV !== "production" && (
    <FerryStatusIndicator variant="compact" />
  );
}

// Only show for admin users
{
  user?.role === "admin" && <FerryStatusIndicator variant="detailed" />;
}
```

## Troubleshooting

### Common Issues

1. **All APIs showing offline**

   - Check environment variables
   - Verify API URLs are accessible
   - Check network connectivity

2. **Green Ocean always offline**

   - Normal until you get credentials from client
   - Will automatically go online once credentials are added

3. **Frequent status changes**
   - May indicate network instability
   - Consider increasing health check interval
   - Check API rate limits

### Debug Steps

1. **Check Browser Console**: Look for fetch errors
2. **Test Health Endpoint**: Visit `/api/ferry/health` directly
3. **Verify Environment**: Ensure all required env vars are set
4. **Check Logs**: Server logs will show detailed error messages

## Integration with Existing Error Handling

The status indicator complements your existing ferry search error handling:

```tsx
// In FerrySearchForm
const { error } = useFerryStore();

return (
  <div>
    {/* Search form */}

    {/* Show both form errors AND API status */}
    {error && <div className="error">{error}</div>}

    <FerryStatusIndicator variant="compact" className="mt-2" />
  </div>
);
```

This gives users immediate context about whether errors are temporary API issues or search-specific problems.

## Performance Considerations

- **Health checks cached for 30 seconds** - prevents API spam
- **Component updates every 60 seconds** - balance between freshness and performance
- **Minimal network impact** - uses existing ferry APIs efficiently
- **Graceful failures** - continues working even if health checks fail

## Next Steps

1. **Add to Footer**: Implement dots-only variant in your main footer
2. **Test with Current Credentials**: Verify Sealink and Makruzz show green
3. **Green Ocean Integration**: Add credentials when available from client
4. **Monitor & Iterate**: Adjust based on real-world usage patterns
