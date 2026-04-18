/** @type {import('next').NextConfig} */
const nextConfig = {
  // No proxy rewrite in production — frontend calls backend directly via NEXT_PUBLIC_API_URL
  // In development, set NEXT_PUBLIC_API_URL=http://localhost:5272 in .env.local
};

export default nextConfig;
