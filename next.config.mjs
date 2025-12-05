/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'https', hostname: '*.supabase.co' }, // Permite imagens do Supabase
        ],
    },
};
export default nextConfig;