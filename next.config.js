/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/nextjs-app',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig