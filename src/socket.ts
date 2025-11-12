import { io } from 'socket.io-client';

// バックエンドサーバーのURL
// ★★★ サーバーをRender.comにデプロイしたため、URLを固定しました ★★★
const SERVER_URL = 'https://backend-wedding-quiz-app.onrender.com';

export const socket = io(SERVER_URL, {
  transports: ['websocket'], // 通信方式をWebSocketに指定
});