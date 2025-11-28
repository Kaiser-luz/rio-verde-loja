/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ignora o ESLint (estilo de código)
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignora o TypeScript (tipagem rigorosa) no build
    typescript: {
        ignoreBuildErrors: true,
    },
    // Permite imagens externas
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
        ],
    },
};

export default nextConfig;