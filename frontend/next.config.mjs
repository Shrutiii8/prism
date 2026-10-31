/** @type {import('next').NextConfig} */
const rawBackend = process.env.BACKEND_URL || process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
const backendHost = rawBackend.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendHost}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
