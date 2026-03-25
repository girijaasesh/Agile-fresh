export async function POST(request) {
  try {
    const errorData = await request.json();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Client Error Log]', errorData);
    }

    // You can store this in a database or send to a monitoring service
    // For now, just log it
    console.log('[ERROR CAPTURED]', {
      message: errorData.message,
      context: errorData.context,
      timestamp: errorData.timestamp,
      url: errorData.url,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
