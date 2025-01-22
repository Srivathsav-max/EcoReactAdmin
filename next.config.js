/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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
      allowedOrigins: ['localhost:3000']
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-forwarded-host',
            value: '*'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig;