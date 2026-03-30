/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode in development
  reactStrictMode: true,

  // Image optimization
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Optimized build output
  productionBrowserSourceMaps: false,

  // Compression and caching
  compress: true,

  // Power up Next.js
  experimental: {
    optimizeCss: true,
    esmExternals: true,
    optimizePackageImports: [
      'lucide-react',
      'zustand',
      'axios',
    ],
  },

  // Webpack configuration to ignore server-only modules on client
  webpack: (config, { isServer, webpack }) => {
    // Only apply to client-side builds
    if (!isServer) {
      // Mock server-only modules on client
      config.resolve.alias = {
        ...config.resolve.alias,
        'mongodb': false,
        'mongoose': false,
        'mongodb-client-encryption': false,
        'bson-ext': false,
        'kerberos': false,
        '@mongodb-js/zstd': false,
        'aws4': false,
        'snappy': false,
        'mongodb-client-encryption': false,
        'snappy': false,
        'kerberos': false,
        '@mongodb-js/saslprep': false,
      };

      // Add fallback for Node.js core modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        zlib: false,
        child_process: false,
        'mongodb-client-encryption': false,
      };

      // Ignore server-only files from being bundled
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/lib\/workers\/.*$/,
          contextRegExp: /.*/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/lib\/services\/.*Service\.js$/,
          contextRegExp: /.*/,
        })
      );
    }

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Rewrites for API
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;