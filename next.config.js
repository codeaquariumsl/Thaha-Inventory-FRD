/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://13.205.16.183:5001/api'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
