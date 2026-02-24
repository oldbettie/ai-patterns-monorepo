const withNextIntl = require('next-intl/plugin')('./lib/i18n/config.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.ctfassets.net'],
  },
  output: 'standalone',
  // Allow dev-box (tailscale hostname) to hit the dev server in development
  allowedDevOrigins: ['dev-box', '*.dev-box', 'localhost'],
  transpilePackages: ['@better-stack-monorepo/database']
}

module.exports = withNextIntl(nextConfig)
