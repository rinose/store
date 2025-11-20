/** @type {import('next').NextConfig} */
const nextConfig = {
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
