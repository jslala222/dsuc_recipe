/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // Cloudflare R2 Public URL
            {
                protocol: 'https',
                hostname: 'pub-7c8896c368b146c29f6e124dcfb2b7f5.r2.dev',
            },
            // Supabase Storage
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
    },
};

export default nextConfig;
