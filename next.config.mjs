/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://rehably.runasp.net/api/:path*',
      },
    ];
  },
};

export default nextConfig;
