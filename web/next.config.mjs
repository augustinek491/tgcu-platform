/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app is nested under the TGCU repo (planning artifacts live one level up);
  // pin the tracing root so Next doesn't infer a parent lockfile.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Serve pre-encoded AVIF/WebP straight from the Firebase CDN edge instead of the
    // on-demand /_next/image optimizer, which runs on the europe-west1 SSR function and
    // cost ~3.7s TTFB per uncached size variant (slow first loads, worst from East Africa).
    // Source assets are already right-sized AVIF/WebP, so per-request optimization added
    // latency without meaningful byte savings. Static import still yields blurDataURL + dims.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
  // Security headers; CSP with per-request nonce is assembled in middleware.ts (see design/02 §8).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
