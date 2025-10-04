/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['../../services/admin'],
  webpack: (config, { isServer }) => {
    // Permettre l'importation de fichiers TypeScript en dehors du répertoire de l'application
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    
    return config;
  },
};

module.exports = nextConfig;