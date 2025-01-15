// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'cloud.appwrite.io',
      'localhost',
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/^https?:\/\//, '') || '',
    ]
  }
}

module.exports = nextConfig;