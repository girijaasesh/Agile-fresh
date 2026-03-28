/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.squarecdn.com https://*.squareupsandbox.com https://*.squareup.com",
              "style-src 'self' 'unsafe-inline' https://*.squarecdn.com https://fonts.googleapis.com",
              "font-src 'self' https://*.squarecdn.com https://cash-f.squarecdn.com https://fonts.gstatic.com https://*.cloudfront.net",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.squarecdn.com https://*.squareupsandbox.com https://*.squareup.com https://api.resend.com https://*.neon.tech",
              "frame-src 'self' https://*.squarecdn.com https://*.squareupsandbox.com https://*.squareup.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
