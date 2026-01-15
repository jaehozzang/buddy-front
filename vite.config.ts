import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 👇 여기에 ngrok 주소를 넣습니다! (끝에 슬래시 / 는 뺐습니다)
        target: 'https://noncurtailing-unwary-clint.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})