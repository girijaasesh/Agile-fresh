// Inline error logger - runs before React to catch all errors
(function() {
  if (typeof window === 'undefined') return;

  // Buffer errors that happen before the app loads
  window.__ERRORS__ = [];

  window.addEventListener('error', function(event) {
    window.__ERRORS__.push({
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString()
    });
    console.error('Early error caught:', event.message);
  });

  window.addEventListener('unhandledrejection', function(event) {
    window.__ERRORS__.push({
      type: 'unhandledrejection',
      reason: event.reason?.message || String(event.reason),
      timestamp: new Date().toISOString()
    });
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Log if the page is still blank after 5 seconds
  setTimeout(function() {
    if (document.body.children.length === 0) {
      console.warn('Page appears to be blank after 5 seconds');
      window.__ERRORS__.push({
        type: 'warning',
        message: 'Page appears to be blank - possible render failure',
        timestamp: new Date().toISOString()
      });
    }
  }, 5000);
})();
