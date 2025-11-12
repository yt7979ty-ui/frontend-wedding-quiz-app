import React, { useState, useCallback, useEffect } from 'react';
import AdminView from './components/AdminView';
import ParticipantView from './components/ParticipantView';
import HistoryView from './components/HistoryView';
import ParticipantListView from './components/ParticipantListView';
import { QuizMode, Quiz, AppState, Player, QuizHistoryItem } from './types';
import { ChampagneIcon } from './components/icons';
import { socket } from './socket';

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
  const checkIsAdmin = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'admin';
  };

  const [isAdmin, setIsAdmin] = useState(checkIsAdmin);
  
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [quizSettings, setQuizSettings] = useState<Quiz>(initialAppState.currentQuiz);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showParticipantList, setShowParticipantList] = useState(false);

  // --- サーバーとの通信ロジック ---
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

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ... (header は変更なし) ... */}
        <header className="mb-8 pb-6 text-center border-b-2 border-amber-200">
          <div className="flex justify-center items-center gap-4 mb-4">
            <ChampagneIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 tracking-wider">
              村木夫妻 Wedding Party Event
            </h1>
            <ChampagneIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />
          </div>
          
          {isAdmin && (
            <div className="flex justify-center items-center space-x-2 bg-white rounded-full p-1 shadow-md max-w-xs mx-auto">
              <button
                onClick={() => {
                  setShowHistory(false);
                  setShowParticipantList(false);
                }}
                className={`w-full px-4 py-2 text-sm font-bold rounded-full transition-colors duration-300 bg-amber-500 text-white shadow-inner`}
              >
                管理者パネル
              </button>
            </div>
          )}
        </header>

        <main>
          {isAdmin ? (
            <>
              {showHistory ? (
                <HistoryView 
                  history={appState.history}
                  onBack={() => setShowHistory(false)}
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
              // ★★★ ここを修正しました ★★★
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