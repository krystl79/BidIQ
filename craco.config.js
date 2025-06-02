module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add rule for PDF.js worker
      webpackConfig.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/js/[name].[hash][ext]'
        }
      });

      // Add fallbacks
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        assert: false,
        buffer: false,
        process: false,
        querystring: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
        cluster: false,
        readline: false,
        repl: false,
        string_decoder: false,
        punycode: false,
        constants: false,
        vm: false,
        domain: false,
        module: false,
        inspector: false,
        'crypto-browserify': false,
        'stream-browserify': false
      };

      return webpackConfig;
    }
  },
  eslint: {
    configure: {
      rules: {
        'no-unused-vars': 'warn'
      }
    }
  }
}; 