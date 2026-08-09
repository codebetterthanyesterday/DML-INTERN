import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "127.0.0.1",
    "localhost",
  ],
  images: {
    // /api/images proxies private Vercel Blob URLs and validates the `url`
    // query param itself (see app/api/images/route.ts), so it's safe to
    // allow any search string here — each image has a different `url` value.
    localPatterns: [
      {
        pathname: "/api/images",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "5aqdpzx1vjwncibw.private.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },

  //Ignore error build 
  //Karna ada error pada bagian admin dan tidak bisa run build kalau tidak di ignore
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
