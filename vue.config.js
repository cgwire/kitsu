module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.js'
      }
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: process.env.KITSU_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/socket.io': {
        target: process.env.KITSU_EVENT_TARGET || 'http://127.0.0.1:5001',
        ws: true
      }
    }
  }
}
