// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/chat',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig