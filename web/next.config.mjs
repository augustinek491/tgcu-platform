/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app is nested under the TGCU repo (planning artifacts live one level up);
  // pin the tracing root so Next doesn't infer a parent lockfile.
  outputFileTracingRoot: import.meta.dirname,
  images: {
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
