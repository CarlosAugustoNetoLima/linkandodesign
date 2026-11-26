const nextConfig = {
  async rewrites() {
    return [
      { source: "/yanns", destination: "/yanns/index.html" },
    ];
  },
};

export default nextConfig;
