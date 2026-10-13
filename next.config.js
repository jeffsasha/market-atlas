/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.MARKETATLAS_DIST_DIR || '.next',
  images: { remotePatterns: [{ protocol: 'https', hostname: 'avatars.githubusercontent.com' }] },
};
module.exports = nextConfig;
