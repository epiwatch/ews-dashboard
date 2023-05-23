/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects(){
    return [
      {
        source:"/", 
        destination:"/datasets",
        permanent: false
      },
    ];
  },
};

module.exports = nextConfig;
