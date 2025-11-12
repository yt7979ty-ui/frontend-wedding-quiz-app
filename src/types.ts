// 参加者の情報を表す型
export interface Player {
  id: number;
  name: string;
}

// 5択クイズの情報を表す型
export interface Quiz {
  question: string;
  options: string[];
  correctAnswerIndex: number | null;
  timeLimit: number; // 制限時間を追加
}

// 早押しやクイズの回答情報を表す型
export interface QuizSubmission {
  playerId: number;
  playerName: string;
  timestamp: number;
  answerIndex?: number; // どの選択肢を選んだか (0-4)
}

// ★★★ 修正 ★★★
// アプリが使用する 'reveal_answer' と 'show_results' を追加します。
export type QuizMode = 'idle' | 'fastest_finger' | 'reveal_answer' | 'show_results';

// ★★★ 追加 ★★★
// 履歴用の型 (App.tsx / HistoryView.tsx が必要とします)
export interface QuizHistoryItem {
  quiz: Quiz;
  submissions: QuizSubmission[];
}

// ★★★ 追加 ★★★
// サーバーから送られてくる全体の状態 (App.tsx が必要とします)
export interface AppState {
  quizMode: QuizMode;
  currentQuiz: Quiz;
  submissions: QuizSubmission[];
  timer: number;
  participants: Player[];
  winners: number[];
  history: QuizHistoryItem[];
}

// (注: ViewMode は App.tsx で使われなくなったため、削除しても構いません)
export type ViewMode = 'admin' | 'participant';