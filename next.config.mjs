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

  // CORRECTED Turbopack configuration
  turbopack: {
    resolveAlias: {
      // Use string aliases to redirect server imports
      '@/lib/server': './empty-module.js',
      '@/lib/server/workers': './empty-module.js',
      '@/lib/server/services': './empty-module.js',
      '@/lib/server/models': './empty-module.js',
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