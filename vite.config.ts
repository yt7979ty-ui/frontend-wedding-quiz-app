import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // サーバーを 5173 ポートで起動する設定
    port: 5173,
    // '192.168.100.23' を指定することで、同じネットワーク上の他のデバイス
    // (スマートフォンなど) からPCのIPアドレスでアクセスできるようになります。
    host: '0.0.0.0',
    // サーバー起動時に自動でブラウザを開く
    open: true,
  }
})