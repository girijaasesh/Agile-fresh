export async function GET() {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthConfigured: !!process.env.NEXTAUTH_SECRET,
        databaseConfigured: !!process.env.DATABASE_URL,
        googleAuthConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
        stripeConfigured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      },
      warnings: [],
    };

    // Check for missing critical env vars
    if (!process.env.NEXTAUTH_SECRET) {
      healthStatus.warnings.push('NEXTAUTH_SECRET not configured');
    }
    if (!process.env.DATABASE_URL) {
      healthStatus.warnings.push('DATABASE_URL not configured');
    }
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      healthStatus.warnings.push('Google OAuth not fully configured');
    }

    if (healthStatus.warnings.length > 0) {
      healthStatus.status = 'warning';
    }

    return Response.json(healthStatus);
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
