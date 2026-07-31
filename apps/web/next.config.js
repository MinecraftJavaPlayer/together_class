/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dahamkke/domain', '@dahamkke/shared'],
};

module.exports = nextConfig;
