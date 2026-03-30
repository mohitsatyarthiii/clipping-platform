/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  productionBrowserSourceMaps: false,
  compress: true,

  experimental: {
    optimizeCss: true,
    esmExternals: true,
    optimizePackageImports: ['lucide-react', 'zustand', 'axios'],
  },

  // THIS IS THE KEY FIX - Turbopack configuration
  turbopack: {
    resolveAlias: {
      // Make server imports resolve to an empty module on client
      '@/lib/server': false,
      '@/lib/server/workers': false,
      '@/lib/server/services': false,
      '@/lib/server/models': false,
    },
    rules: {
      // Prevent server files from being processed on client
      'lib/server/**/*.js': {
        condition: { not: 'browser' },
        type: 'asset',
      },
      'lib/server/**/*.ts': {
        condition: { not: 'browser' },
        type: 'asset',
      },
    },
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
      {
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async rewrites() {
    return { beforeFiles: [], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;