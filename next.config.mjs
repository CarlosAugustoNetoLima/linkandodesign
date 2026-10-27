/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /yanns abre o mirror estático (public/yanns/index.html).
      // As demais páginas (.html) e assets são servidos direto de public/yanns/.
      { source: "/yanns", destination: "/yanns/index.html" },
    ];
  },
};

export default nextConfig;
