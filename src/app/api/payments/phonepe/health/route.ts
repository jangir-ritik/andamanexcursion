import { NextRequest, NextResponse } from "next/server";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";

export async function GET(req: NextRequest) {
  const healthChecks = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    checks: [] as Array<{name: string; status: string; details?: string}>,
  };

  try {
    // Check 1: API Connectivity
    healthChecks.checks.push({
      name: 'phonepe_api_connectivity',
      status: 'pending',
    });

    // Check 2: Database connection (if applicable)
    healthChecks.checks.push({
      name: 'database_connection',
      status: 'pending',
    });

    // Check 3: Environment variables
    const envVars = [
      'PHONEPE_MERCHANT_ID',
      'PHONEPE_SALT_KEY',
      'PHONEPE_API_URL',
      'NEXT_PUBLIC_BASE_URL',
    ];

    const missingVars = envVars.filter(v => !process.env[v]);
    
    healthChecks.checks.push({
      name: 'environment_variables',
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      details: missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}` : undefined,
    });

    // Check 4: OAuth token (if using v2)
    try {
      const { phonePeOAuthService } = await import('@/services/payments/phonePeOAuthService');
      const hasToken = phonePeOAuthService.hasValidToken();
      
      healthChecks.checks.push({
        name: 'oauth_token',
        status: hasToken ? 'healthy' : 'unhealthy',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      healthChecks.checks.push({
        name: 'oauth_token',
        status: 'error',
        details: errorMessage,
      });
    }

    // Determine overall status
    const unhealthyChecks = healthChecks.checks.filter(c => c.status !== 'healthy');
    healthChecks.status = unhealthyChecks.length === 0 ? 'healthy' : 'unhealthy';

    return NextResponse.json(healthChecks, {
      status: unhealthyChecks.length === 0 ? 200 : 503,
    });

  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message,
      checks: healthChecks.checks,
    }, { status: 500 });
  }
}