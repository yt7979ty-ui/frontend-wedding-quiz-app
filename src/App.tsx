import React, { useState, useCallback, useEffect } from 'react';
import AdminView from './components/AdminView';
import ParticipantView from './components/ParticipantView';
import HistoryView from './components/HistoryView';
import ParticipantListView from './components/ParticipantListView';
import { QuizMode, Quiz, AppState, Player, QuizHistoryItem } from './types';
import { ChampagneIcon } from './components/icons';
import { socket } from './socket';

// ... (initialAppState, Appコンポーネント定義 は変更なし) ...
const initialAppState: AppState = {
  quizMode: 'idle',
  currentQuiz: {
    question: '',
    options: Array(5).fill(''),
    correctAnswerIndex: null,
    timeLimit: 30,
  },
  submissions: [],
  timer: 0,
  participants: [],
  winners: [],
  history: [],
};

const App: React.FC = () => {
  // ... (checkIsAdmin, useStateフック は変更なし) ...
  const checkIsAdmin = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'admin';
  };

  const [isAdmin, setIsAdmin] = useState(checkIsAdmin);
  
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [quizSettings, setQuizSettings] = useState<Quiz>(initialAppState.currentQuiz);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showParticipantList, setShowParticipantList] = useState(false);

  // ... (useEffectフック は変更なし) ...
  useEffect(() => {
    socket.on('connect', () => {
      console.log('サーバーに接続しました！ ID:', socket.id);
      const savedUser = localStorage.getItem('weddingQuizUser');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser) as Player;
          socket.emit('participant:join', user);
        } catch (e) {
          console.error('localStorage の読み込みに失敗', e);
        }
      }
    });
    socket.on('stateUpdate', (newState: AppState) => {
      setAppState(newState);
    });
    socket.on('disconnect', () => {
      console.log('サーバーから切断されました。');
    });
    return () => {
      socket.off('connect');
      socket.off('stateUpdate');
      socket.off('disconnect');
    };
  }, []);

  // --- サーバーへイベントを送信する関数 ---
  // ... (startQuiz, resetQuiz, forceEndQuiz, showResults, resetWinner, resetAllWinners は変更なし) ...
  const startQuiz = useCallback((quiz: Quiz) => {
    socket.emit('admin:startQuiz', quiz);
  }, []);

  const resetQuiz = useCallback(() => {
    socket.emit('admin:resetQuiz');
  }, []);
  
  const forceEndQuiz = useCallback(() => {
    socket.emit('admin:forceEndQuiz');
  }, []);

  const showResults = useCallback(() => {
    socket.emit('admin:showResults');
  }, []);
  
  const resetWinner = useCallback((playerId: number) => {
    socket.emit('admin:resetWinner', playerId);
  }, []);

  const resetAllWinners = useCallback(() => {
    socket.emit('admin:resetAllWinners');
  }, []);

  // ★★★ (機能追加) 履歴を削除する関数 ★★★
  const clearHistory = useCallback(() => {
    if (window.confirm('本当にすべてのクイズ履歴を削除しますか？\n（この操作は元に戻せません）')) {
      socket.emit('admin:clearHistory');
    }
  }, []);

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ... (header は変更なし) ... */}

        <main>
          {isAdmin ? (
            <>
              {showHistory ? (
                // ★★★ (修正) HistoryView に onClearHistory を渡す ★★★
                <HistoryView 
                  history={appState.history}
                  onBack={() => setShowHistory(false)}
                  onClearHistory={clearHistory}
                />
              ) : showParticipantList ? (
                <ParticipantListView
                  participants={appState.participants}
                  submissions={appState.submissions}
                  winners={appState.winners}
                  quizMode={appState.quizMode}
                  onBack={() => setShowParticipantList(false)}
                  onResetWinner={resetWinner}
                  onResetAllWinners={resetAllWinners}
                />
              ) : (
                <AdminView
                  quizMode={appState.quizMode}
                  submissions={appState.submissions}
                  participants={appState.participants}
                  onStartQuiz={startQuiz}
                  onResetQuiz={resetQuiz}
                  onForceEndQuiz={forceEndQuiz}
                  onShowResults={showResults}
                  onShowHistory={() => setShowHistory(true)}
                  onShowParticipantList={() => setShowParticipantList(true)}
                  currentQuiz={appState.currentQuiz}
                  timer={appState.timer}
                  quizSettings={quizSettings}
                  onQuizSettingsChange={setQuizSettings}
                  winners={appState.winners}
                />
              )}
            </>
          ) : (
            // 参加者画面
            <ParticipantView
              quizMode={appState.quizMode}
              submissions={appState.submissions}
              winners={appState.winners}
              currentQuiz={appState.currentQuiz}
              timer={appState.timer}
              participants={appState.participants}
              history={appState.history}
            />
          )}
        </main>
        
        {/* ... (footer は変更なし) ... */}
        
      </div>
    </div>
  );
};

export default App;