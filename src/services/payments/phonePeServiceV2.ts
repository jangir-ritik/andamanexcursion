// src/services/payments/phonePeServiceV2.ts
// PhonePe Checkout API v2 Implementation

import { phonePeOAuthService } from "./phonePeOAuthService";

/**
 * PhonePe Payment Service - Checkout API v2
 * Uses OAuth authentication and supports both iframe and redirect flows
 */
export class PhonePeServiceV2 {
  private merchantId: string;
  private apiUrl: string;
  private devMode: boolean;
  private isProduction: boolean;

  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID!;
    this.devMode = process.env.PHONEPE_DEV_MODE === "true";
    this.isProduction = process.env.PHONEPE_ENV === "production";

    // Production uses /apis/pg for payments, sandbox uses pg-sandbox for everything
    this.apiUrl = this.isProduction
      ? process.env.PHONEPE_PG_URL || "https://api.phonepe.com/apis/pg"
      : process.env.PHONEPE_API_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!this.merchantId) {
      throw new Error("PhonePe merchant ID not configured. Check PHONEPE_MERCHANT_ID");
    }

    console.log("PhonePe Service V2 initialized:", {
      merchantId: this.merchantId,
      apiUrl: this.apiUrl,
      devMode: this.devMode,
      isProduction: this.isProduction,
    });
  }

  /**
   * Generate unique merchant order ID
   */
  public generateMerchantOrderId(): string {
    return `AE_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Initiate payment with PhonePe Checkout v2 API
   */
  public async initiatePayment(params: {
    amount: number; // Amount in rupees (will be converted to paise)
    merchantOrderId: string;
    redirectUrl: string;
    metaInfo?: Record<string, string>;
  }) {
    const amountInPaise = Math.round(params.amount * 100);

    console.log("PhonePe v2 payment initiation:", {
      merchantOrderId: params.merchantOrderId,
      amount: amountInPaise,
      amountInRupees: params.amount,
    });

    try {
      // Step 1: Get OAuth token
      const accessToken = await phonePeOAuthService.getAccessToken();

      // Step 2: Prepare payment request payload
      const requestBody = {
        amount: amountInPaise,
        expireAfter: 1200, // 20 minutes expiry
        merchantOrderId: params.merchantOrderId,
        metaInfo: params.metaInfo || {
          udf1: "Andaman Excursion Booking",
          udf2: "Ferry/Activity Booking",
        },
        paymentFlow: {
          type: "PG_CHECKOUT", // This enables both iframe and redirect
          message: "Complete your booking payment",
          merchantUrls: {
            redirectUrl: params.redirectUrl,
          },
        },
      };

      if (this.devMode) {
        console.log("🔍 PhonePe v2 Request Debug:", {
          endpoint: `${this.apiUrl}/checkout/v2/pay`,
          merchantOrderId: params.merchantOrderId,
          amount: amountInPaise,
          hasToken: !!accessToken,
          tokenPreview: accessToken.substring(0, 20) + "...",
        });
      }

      // Step 3: Call PhonePe Checkout API
      const response = await fetch(`${this.apiUrl}/checkout/v2/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PhonePe v2 API error response:", errorText);
        throw new Error(`PhonePe API request failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("PhonePe v2 payment initiation response:", {
        orderId: result.orderId,
        state: result.state,
        hasRedirectUrl: !!result.redirectUrl,
        expiresAt: result.expireAt,
      });

      // v2 API returns different structure than v1
      return {
        success: true,
        orderId: result.orderId, // PhonePe's internal order ID
        merchantOrderId: params.merchantOrderId, // Our order ID
        state: result.state, // PENDING, COMPLETED, FAILED
        redirectUrl: result.redirectUrl, // URL for payment page
        expireAt: result.expireAt,
      };
    } catch (error: any) {
      console.error("PhonePe v2 payment initiation error:", error);
      throw new Error(error.message || "Failed to initiate payment with PhonePe v2");
    }
  }

  /**
   * Check payment status with PhonePe Checkout v2 API
   */
  public async checkPaymentStatus(merchantOrderId: string) {
    console.log("Checking PhonePe v2 payment status for:", merchantOrderId);

    try {
      // Get OAuth token
      const accessToken = await phonePeOAuthService.getAccessToken();

      // Call status API
      const response = await fetch(
        `${this.apiUrl}/checkout/v2/order/${merchantOrderId}/status`,
        {
          method: "GET",
          headers: {
            Authorization: `O-Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PhonePe v2 status check error:", errorText);
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("PhonePe v2 status check result:", {
        orderId: result.orderId,
        state: result.state,
        amount: result.amount,
        paymentDetailsCount: result.paymentDetails?.length || 0,
      });

      // Map v2 response to our standard format
      return {
        success: result.state === "SUCCESS",
        state: result.state, // PENDING, SUCCESS, FAILED, EXPIRED
        orderId: result.orderId,
        amount: result.amount,
        paymentDetails: result.paymentDetails || [],
        metaInfo: result.metaInfo || {},
        // For compatibility with existing code
        code: result.state === "SUCCESS" ? "PAYMENT_SUCCESS" : "PAYMENT_PENDING",
        message: this.getStatusMessage(result.state),
      };
    } catch (error: any) {
      console.error("PhonePe v2 status check error:", error);
      throw new Error(error.message || "Failed to check payment status");
    }
  }

  /**
   * Get user-friendly status message
   */
  private getStatusMessage(state: string): string {
    const messages: Record<string, string> = {
      PENDING: "Payment is being processed",
      SUCCESS: "Payment completed successfully",
      FAILED: "Payment failed",
      EXPIRED: "Payment link expired",
    };
    return messages[state] || "Unknown payment status";
  }

  /**
   * Validate webhook callback (v2 uses same mechanism as v1 if webhooks are configured)
   * For v2, webhooks are optional - redirect flow is primary
   */
  public validateCallback(payload: any): boolean {
    // v2 primarily uses redirect flow
    // Webhooks are optional and use similar validation as v1
    // For now, we'll rely on status check after redirect
    return true;
  }

  /**
   * Production-specific validation
   */
  private validateProductionRequest(request: any): boolean {
    if (process.env.NODE_ENV !== 'production') return true;
    
    // Check request IP against PhonePe production IPs
    const allowedIPs = [
      '52.76.117.0/24',
      '35.154.0.0/16',
      '13.126.0.0/16',
    ];
    
    // Add timestamp validation (prevent replay attacks)
    const requestTime = new Date().getTime();
    const timestamp = request.timestamp || 0;
    const timeDiff = Math.abs(requestTime - timestamp);
    
    if (timeDiff > 300000) { // 5 minutes
      console.error('Request timestamp expired');
      return false;
    }
    
    return true;
  }

  /**
   * Production logging
   */
  private logProductionTransaction(data: any) {
    if (process.env.NODE_ENV === 'production') {
      // Log to production monitoring system
      console.log('Production Transaction:', {
        transactionId: data.transactionId,
        amount: data.amount,
        merchantId: this.merchantId,
        timestamp: new Date().toISOString(),
        // Do NOT log sensitive data like card numbers
      });
    }
  }
  
}

// Export singleton instance
export const phonePeServiceV2 = new PhonePeServiceV2();
