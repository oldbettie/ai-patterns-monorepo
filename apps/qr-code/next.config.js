const withNextIntl = require('next-intl/plugin')('./lib/i18n/config.ts')
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow dev-box (tailscale hostname) to hit the dev server in development
  allowedDevOrigins: ['dev-box', '*.dev-box'],
}

module.exports = withPWA(withNextIntl(nextConfig))
