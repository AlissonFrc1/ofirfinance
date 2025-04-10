/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignora arquivos HTML do node-pre-gyp
    config.module.rules.push({
      test: /\.html$/,
      loader: 'ignore-loader'
    });

    // Configura o bcrypt para usar módulos apenas no servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
        nock: false,
        net: false,
        tls: false,
        dns: false
      };
    }

    return config;
  }
};

module.exports = nextConfig;
