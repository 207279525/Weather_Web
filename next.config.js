/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 临时忽略类型错误
  }
}

module.exports = nextConfig
