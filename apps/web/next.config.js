/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 es un addon nativo — no bundlear, cargar como external
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },

  // PWA: headers para offline y cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
