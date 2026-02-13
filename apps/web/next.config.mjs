import nextPWA from "@ducanh2912/next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/~offline"
  }
});

const nextConfig = {
  reactStrictMode: true
};

export default withPWA(nextConfig);
