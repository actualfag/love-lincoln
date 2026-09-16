import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/link',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
