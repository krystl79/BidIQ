module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
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
          'stream-browserify': false,
          'util/': false,
          'url/': false,
          'assert/': false,
          'buffer/': false,
          'process/': false,
          'querystring/': false,
          'net/': false,
          'tls/': false,
          'dns/': false,
          'child_process/': false,
          'dgram/': false,
          'cluster/': false,
          'readline/': false,
          'repl/': false,
          'string_decoder/': false,
          'punycode/': false,
          'constants/': false,
          'vm/': false,
          'domain/': false,
          'module/': false,
          'inspector/': false,
          'crypto-browserify/': false,
          'stream-browserify/': false
        },
        extensionAlias: {
          '.js': ['.js', '.jsx', '.ts', '.tsx']
        }
      }
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