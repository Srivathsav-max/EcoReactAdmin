/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cloud.appwrite.io',
      'localhost',
      'lvh.me',
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/^https?:\/\//, '') || '',
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