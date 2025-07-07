/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds to prevent linting errors from failing the build
    ignoreDuringBuilds: true,
  },
  redirects: async () => {
    return [
      {
        source: "/destinations",
        destination: "/destinations/jolly-buoy",
        permanent: true,
      },
      {
        source: "/specials",
        destination: "/specials/engagement",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
