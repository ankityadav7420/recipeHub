/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*"
      }
    ];
  },
  images: {
    domains: ["res.cloudinary.com"]
  }
};

export default nextConfig;
