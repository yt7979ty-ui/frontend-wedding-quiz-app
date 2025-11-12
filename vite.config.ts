import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // ★★★ この 'base' の行を追加しました ★★★
  base: '/frontend-wedding-quiz-app/',
  
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
  }
})
