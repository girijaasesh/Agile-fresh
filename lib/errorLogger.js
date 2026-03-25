// Client-side error logging utility
export const logError = (error, context = '') => {
  const errorData = {
    message: error?.message || String(error),
    stack: error?.stack || '',
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR LOG]', errorData);
  }

  // Send to server for logging (optional)
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silent fail - don't throw errors during error logging
      });
    } catch (e) {
      // Silently ignore fetch errors
    }
  }

  return errorData;
};

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logError(event.error, 'window.onerror');
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'unhandledrejection');
  });
}
