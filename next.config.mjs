/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "vgy.me",
      },
      {
        protocol: "https",
        hostname: "i.vgy.me",
      },
    ],
  },
};

export default nextConfig;
