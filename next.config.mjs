/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://rehably.runasp.net/:path*',
      },
    ];
  },
};

export default nextConfig;
