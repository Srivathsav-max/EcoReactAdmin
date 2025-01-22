/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cloud.appwrite.io',
      'localhost',
      'lvh.me',
      'vercel.app',
      process.env.NEXT_PUBLIC_DOMAIN || '',
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/^https?:\/\//, '') || '',
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*).yourdomain.com',
          },
        ],
        destination: '/store/:subdomain',
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@prisma/client',
    '@tanstack/react-table'
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false
};

module.exports = nextConfig;