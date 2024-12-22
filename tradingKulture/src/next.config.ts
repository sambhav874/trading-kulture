/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config : any, { isServer : any }) => {
    if (!isServer ) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

