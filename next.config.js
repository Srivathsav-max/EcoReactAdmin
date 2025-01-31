/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'cloud.appwrite.io',
      'localhost',
      'lvh.me',
      'vercel.app',
      'example.com',
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/^https?:\/\//, '') || '',
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    appDir: true, // Ensures App Router compatibility
    packagerOptions: {
      externalPackages: ["@prisma/client", "prisma"] // Exclude Prisma from being bundled incorrectly
    }
  },
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@prisma/client',
    '@tanstack/react-table'
  ],
  productionBrowserSourceMaps: false,
  poweredByHeader: false
};

module.exports = nextConfig;