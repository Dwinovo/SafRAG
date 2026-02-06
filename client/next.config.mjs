/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    const envBackend = process.env.NEXT_PUBLIC_API_BASE
    if (!envBackend) {
      throw new Error("NEXT_PUBLIC_API_BASE 环境变量未配置，请在 .env.local 中设置。")
    }
    const backend = envBackend.replace(/\/$/, "")
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`
      }
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache in dev to avoid filesystem rename ENOENT warnings
      config.cache = {
        type: "memory"
      }
    }
    return config
  }
}

export default nextConfig
