import type { NextConfig } from 'next'

const isGitHubPages = process.env.NEXT_PUBLIC_BASE_PATH === '/learncc'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  ...(isGitHubPages && {
    basePath: '/learncc',
    assetPrefix: '/learncc/',
  }),
}

export default nextConfig
