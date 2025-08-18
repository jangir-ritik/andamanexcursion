import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = withPayload({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
  },
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds to prevent linting errors from failing the build
    ignoreDuringBuilds: true,
  },
  redirects: async () => {
    return [
      {
        source: "/specials",
        destination: "/specials/engagement",
        permanent: true,
      },
    ];
  },
});

export default nextConfig;
