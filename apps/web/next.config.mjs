import withPWA from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV !== "production";

const config = withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/~offline"
  }
})({
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
});

export default config;
