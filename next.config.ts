import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'torecacamp-pokemon.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
