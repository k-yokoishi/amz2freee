import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/amz2freee' : '',
  assetPrefix: isProd ? '/amz2freee/' : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
