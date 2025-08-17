# Quick Production Fixes - Package Enquiry System

## 🚨 Critical Issues to Fix Before Production

Based on the analysis, here are the **5 most critical improvements** you can implement today to make your Package Enquiry System production-ready:

## 1. **Error Tracking Setup** (30 minutes)

### Install Sentry

```bash
npm install @sentry/nextjs
```

### Configure Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Add to enquiry utils

```typescript
// src/utils/enquiry.utils.ts
import * as Sentry from "@sentry/nextjs";

export function decodePackageDataFromURL(
  encodedData: string
): ValidatedEnquiryData {
  try {
    // ... existing logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "package-enquiry", step: "url-decoding" },
      extra: { encodedData: encodedData?.substring(0, 100) }, // First 100 chars only
    });
    return { isValid: false, source: "none" };
  }
}
```

## 2. **Rate Limiting** (20 minutes)

### Install rate limiting

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Create middleware

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/contact-form-options")) {
    const identifier = request.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/contact-form-options/:path*",
};
```

## 3. **Enhanced Logging** (15 minutes)

### Create logger service

```typescript
// src/services/logger.service.ts
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }

  static error(message: string, error?: any, context?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      context,
    });
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }
}
```

### Update contact page

```typescript
// src/app/(frontend)/contact/page.tsx
import { Logger } from "@/services/logger.service";

useEffect(
  () => {
    if (
      !isLoading &&
      !formInitialized &&
      contactFormOptions &&
      !contactFormOptions.isLoading
    ) {
      if (hasPackageData && formDefaults) {
        Logger.info("Enquiry form pre-filling started", {
          packageId: enquiryData.packageId,
          packageTitle: enquiryData.packageTitle,
          fieldsToPreFill: Object.keys(formDefaults.booking),
        });

        clearSavedData();

        // Set form values
        setTimeout(() => {
          form.setValue("booking.package", formDefaults.booking.package);
          form.setValue("booking.duration", formDefaults.booking.duration);
          // ... other fields

          Logger.info("Enquiry form pre-filling completed", {
            packageId: enquiryData.packageId,
            success: true,
          });
        }, 100);
      }
      setFormInitialized(true);
    }
  },
  [
    /* dependencies */
  ]
);
```

## 4. **Input Validation** (25 minutes)

### Enhanced validation schema

```typescript
// src/utils/validation.ts
import { z } from "zod";

export const PackageEnquirySchema = z
  .object({
    packageId: z.string().min(1).max(100),
    packageTitle: z.string().min(1).max(200),
    packageSlug: z.string().regex(/^[a-z0-9-]+$/),
    price: z.number().min(0).max(1000000),
    categoryId: z.string().min(1).max(100),
    periodId: z.string().min(1).max(100),
  })
  .strict();

export const URLParamsSchema = z.object({
  pkg: z.string().max(8192), // Reasonable limit for base64
  ref: z.string().optional(),
});
```

### Update decoding function

```typescript
// src/utils/enquiry.utils.ts
import { PackageEnquirySchema } from "./validation";

export function decodePackageDataFromURL(
  encodedData: string
): ValidatedEnquiryData {
  try {
    if (!encodedData || encodedData.length > 8192) {
      Logger.warn("Invalid encoded data", { length: encodedData?.length });
      return { isValid: false, source: "none" };
    }

    const jsonString = decodeURIComponent(atob(encodedData));
    const rawData = JSON.parse(jsonString);

    // Validate with schema
    const data = PackageEnquirySchema.parse(rawData);

    Logger.info("Package data decoded successfully", {
      packageId: data.packageId,
      packageTitle: data.packageTitle,
    });

    return { ...data, isValid: true, source: "url" };
  } catch (error) {
    Logger.error("Failed to decode package data", error, {
      encodedData: encodedData?.substring(0, 50),
    });
    return { isValid: false, source: "none" };
  }
}
```

## 5. **API Error Handling** (20 minutes)

### Enhanced contact form options API

```typescript
// src/app/api/contact-form-options/route.ts
import { Logger } from "@/services/logger.service";

export async function GET() {
  const startTime = Date.now();

  try {
    Logger.info("Contact form options API called");

    const options = await contactFormOptionsService.getAllOptions();

    const responseTime = Date.now() - startTime;
    Logger.info("Contact form options API success", {
      responseTime,
      packagesCount: options.packages.length,
      periodsCount: options.periods.length,
    });

    return NextResponse.json(options, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    Logger.error("Contact form options API failed", error, { responseTime });

    // Return fallback data instead of error
    return NextResponse.json(
      {
        packages: [],
        periods: [
          { id: "1", title: "3 Days / 2 Nights", value: "3days", order: 1 },
          { id: "2", title: "4 Days / 3 Nights", value: "4days", order: 2 },
        ],
        categories: [],
        isLoading: false,
        error: "Failed to load options",
      },
      {
        status: 200, // Return 200 with fallback data
        headers: {
          "Cache-Control": "no-cache", // Don't cache error responses
        },
      }
    );
  }
}
```

## Environment Variables to Add

```env
# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Rate Limiting (optional - use Redis if you have it)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Testing Your Fixes

### 1. Test Error Tracking

```javascript
// In browser console, test error capture
throw new Error("Test error for Sentry");
```

### 2. Test Rate Limiting

```bash
# Make 31 rapid requests to test rate limiting
for i in {1..31}; do curl http://localhost:3000/api/contact-form-options; done
```

### 3. Test Validation

```javascript
// Test with invalid data in browser
const invalidData = "invalid-base64-data";
localStorage.setItem("test-pkg", invalidData);
// Navigate to /contact?pkg=invalid-base64-data
```

## Quick Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database: "healthy", // Add actual DB check
      redis: "healthy", // Add actual Redis check
    },
  };

  return NextResponse.json(health);
}
```

## 📊 **Impact After These Fixes**

✅ **Error Tracking**: You'll know immediately when something breaks  
✅ **Rate Limiting**: Protected from API abuse  
✅ **Enhanced Logging**: Better debugging and monitoring  
✅ **Input Validation**: Protected from malformed data  
✅ **Graceful Degradation**: System works even when APIs fail

## ⏱️ **Total Time Investment: ~2 hours**

These 5 fixes will take your Package Enquiry System from **development-ready** to **production-ready** in just 2 hours of focused work.

## Next Steps (Optional)

After implementing these critical fixes:

1. **Add basic unit tests** for enquiry utils (1-2 hours)
2. **Set up monitoring dashboard** (Sentry/DataDog) (30 minutes)
3. **Add performance monitoring** with Web Vitals (1 hour)
4. **Implement analytics tracking** for conversion funnel (2 hours)

Your system will then be not just production-ready, but production-optimized! 🚀
