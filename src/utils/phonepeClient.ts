// ⚠️ DEPRECATED: This file uses incorrect PhonePe SDK implementation
// Use /src/services/payments/phonePeService.ts instead
//
// This file incorrectly uses pg-sdk-node which doesn't match PhonePe's actual API.
// PhonePe uses REST API with X-VERIFY header authentication, not a Node SDK.
//
// Correct implementation: /src/services/payments/phonePeService.ts
// - Uses direct fetch() calls to PhonePe REST API
// - Implements proper X-VERIFY header with SHA256 HMAC
// - Follows official PhonePe Standard Checkout API documentation
//
// DO NOT USE THIS FILE

throw new Error(
  "phonePeClient.ts is deprecated. Use /src/services/payments/phonePeService.ts instead"
);
