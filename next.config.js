const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withMDX = require('@next/mdx')()

module.exports = withMDX(
  withBundleAnalyzer({
    reactStrictMode: true,
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    experimental: {
      mdxRs: true,
    },
    eslint: {
      dirs: [
        'components',
        'constant',
        'layouts',
        'libs',
        'pages',
        'scripts',
        'utils',
      ],
    },
    images: {
      domains: ['i.scdn.co'],
    },
    typescript: { tsconfigPath: './tsconfig.json' },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|mp4)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next',
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
      })

      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
)
