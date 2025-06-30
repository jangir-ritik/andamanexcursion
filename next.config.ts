/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds to prevent linting errors from failing the build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
