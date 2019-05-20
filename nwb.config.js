module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'umd',
      externals: {
        react: 'React'
      }
    }
  }
}
