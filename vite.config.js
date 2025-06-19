import { defineConfig } from "vite"
import uni from "@dcloudio/vite-plugin-uni";
import path from 'path'

// Vite配置
export default defineConfig({
  plugins: [
    uni()
  ],
  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false
  },
  server: {
    proxy: {
      '/api': {
        rewrite: path => path.replace(/^\/api/, ''),
        logLevel: 'debug',
        target: 'http://localhost:8888',
        changeOrigin: true
      },
      
    }
  }
})