const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('webpack-dev', {
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000, // Use our port
    historyApiFallback: true,
    hot: true,
    inline: true,
    publicPath: '/',
    disableHostCheck: true, // Local development with custom domain
  },
});
