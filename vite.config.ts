import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 第三个参数传 ''：读取所有变量而不只是 VITE_ 开头的，这里只用到 VITE_DEV_API_TARGET
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://127.0.0.1:8080'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // 开发时把 /api 转给本地后端，让浏览器始终认为前后端同源：
        // 后台登录态是 SameSite=Strict 的 Cookie，后端还会校验 Origin 与 Host 一致，
        // 跨域直连会被这两道防线挡住。changeOrigin 保持默认(false)，Host 头原样透传，二者才能匹配。
        '/api': { target: apiTarget },
      },
    },
    build: {
      // 后台页面和 Markdown 渲染器都是按需加载的独立分块，antd 主包本身较大，适当放宽告警线
      chunkSizeWarningLimit: 1000,
    },
  }
})
