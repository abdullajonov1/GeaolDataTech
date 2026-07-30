import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    const pages = [
      'about',
      'services',
      'projects',
      'technologies',
      'careers',
      'contact',
      'privacy-policy',
      'terms',
    ]
    return [
      { source: '/', destination: '/uz', permanent: false },
      ...pages.map((page) => ({
        source: `/${page}`,
        destination: `/uz/${page}`,
        permanent: false,
      })),
      ...pages.map((page) => ({
        source: `/${page}/:path*`,
        destination: `/uz/${page}/:path*`,
        permanent: false,
      })),
    ]
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }]
  }
}
export default nextConfig
