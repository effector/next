/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's.yimg.com',
        port: '',
      }
    ]
  },
}

module.exports = nextConfig
