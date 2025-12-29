/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  // Explicitly disable turbo to avoid WASM binding issues
  ///experimental: {
  //  turbo: false,
  //},

  // Webpack configuration
  //webpack: (config, { isServer }) => {
    // Handle Firebase on server side
  //  if (isServer) {
   //   config.externals = [...(config.externals || []), 'firebase/app'];
   // }
    
   // return config;
  //},
};

export default nextConfig;