module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'UMD',
      externals: {
        react: 'React',
        rxjs: 'Rxjs'
      }
    }
  },
  webpack: {
    extra: {
      module: {
        rules: [{
          test: /\.less$/,
          use: [{
            loader: "style-loader" 
          }, {
            loader: "css-loader?modules" 
          }, {
            loader: "less-loader"
          }]
        }]
      },
    }
  }
}
