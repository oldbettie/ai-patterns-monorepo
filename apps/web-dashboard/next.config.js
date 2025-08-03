const withNextIntl = require('next-intl/plugin')('./lib/i18n/config.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.ctfassets.net'],
  },
  output: 'standalone',
}

module.exports = withNextIntl(nextConfig)
