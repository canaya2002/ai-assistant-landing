import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

export default nextConfig
