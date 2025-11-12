import React, { useState, useMemo, useEffect } from 'react';
import { QuizMode, QuizSubmission, Player, Quiz, QuizHistoryItem } from '../types';
import { TrophyIcon, UserCircleIcon, ClockIcon } from './icons';
import { socket } from '../socket';
import { PRE_REGISTERED_MALES, PRE_REGISTERED_FEMALES, PRE_REGISTERED_LIST } from '../constants'; 

interface ParticipantViewProps {
  quizMode: QuizMode;
  submissions: QuizSubmission[];
  winners: number[];
  currentQuiz: Quiz;
  timer: number;
  participants: Player[]; 
  history: QuizHistoryItem[]; 
}

const ParticipantView: React.FC<ParticipantViewProps> = ({
  quizMode,
  submissions,
  winners,
  currentQuiz,
  timer,
  participants, 
  history, 
}) => {
  
  // ( ... ログイン/State/ハンドラ関連のロジックは変更なし ... )

  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    try {
      const savedUser = localStorage.getItem('weddingQuizUser');
      if (savedUser) {
        const user = JSON.parse(savedUser) as Player;
        if (PRE_REGISTERED_LIST && PRE_REGISTERED_LIST.includes(user.name)) {
          return user;
        }
        localStorage.removeItem('weddingQuizUser');
      }
    } catch (e) {
      localStorage.removeItem('weddingQuizUser');
    }
    return null;
  });
  
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [selectedName, setSelectedName] = useState('');

  const nameList = useMemo(() => {
    if (selectedGender === 'male') {
      return PRE_REGISTERED_MALES || [];
    }
    if (selectedGender === 'female') {
      return PRE_REGISTERED_FEMALES || [];
    }
    return []; 
  }, [selectedGender]);


  const isJoined = useMemo(() => {
    if (!currentUser) return false;
    return participants.some(p => p.id === currentUser.id);
  }, [participants, currentUser]);

  
  useEffect(() => {
    const tryJoin = () => {
      if (currentUser && socket.connected) {
        socket.emit('participant:join', currentUser);
      } else if (currentUser) {
        // (接続待機)
      }
    };
    if (socket.connected) {
      tryJoin();
    }
    
    socket.on('connect', tryJoin);

    const handleForceLogout = () => {
      alert('管理者の操作により、名前の選択画面に戻ります。');
      localStorage.removeItem('weddingQuizUser');
      setCurrentUser(null);
      window.location.reload(); 
    };
    socket.on('server:forceLogout', handleForceLogout);

    return () => {
      socket.off('connect', tryJoin);
      socket.off('server:forceLogout', handleForceLogout); 
    };
  }, [currentUser]); 


  const handleGenderChange = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setSelectedName(''); 
  };

  
  const handleJoin = () => {
    if (!selectedGender) {
       alert('まず性別を選択してください。');
       return;
    }
    if (selectedName.trim() === "") {
      alert('リストからお名前を選択してください。');
      return;
    }
    
    const user = { id: Date.now(), name: selectedName.trim() };
    try {
      localStorage.setItem('weddingQuizUser', JSON.stringify(user));
      setCurrentUser(user);
    } catch (e) {
      console.error('LocalStorageへの保存に失敗しました:', e);
      alert('参加処理に失敗しました。もう一度お試しください。');
    }
  };
  
  const handleAnswer = (answerIndex: number) => {
    if (currentUser && !hasAnswered && !iAmAWinner && isJoined) {
      socket.emit('participant:submitAnswer', { answerIndex });
    } else if (!isJoined) {
      if(currentUser) socket.emit('participant:join', currentUser);
    }
  };
  
  const handleLogout = () => {
    if (window.confirm('名前の選択画面に戻りますか？\n（現在の参加情報がリセットされます）')) {
      localStorage.removeItem('weddingQuizUser');
      setCurrentUser(null);
      socket.disconnect();
      socket.connect();
    }
  };

  
  const hasAnswered = useMemo(() => {
    if (!currentUser) return false;
    return submissions.some(s => s.playerId === currentUser.id);
  }, [submissions, currentUser]);

  const iAmAWinner = useMemo(() => {
    return currentUser ? winners.includes(currentUser.id) : false;
  }, [winners, currentUser]);
  
  const mySubmission = useMemo(() => {
    if (!currentUser) return null;
    return submissions.find(s => s.playerId === currentUser.id) || null;
  }, [submissions, currentUser]);

  const myRank = useMemo(() => {
    if (!mySubmission || currentQuiz.correctAnswerIndex === null || mySubmission.answerIndex !== currentQuiz.correctAnswerIndex) return null;
    const correctSubmissions = submissions
      .filter(s => s.answerIndex === currentQuiz.correctAnswerIndex)
      .sort((a, b) => a.timestamp - b.timestamp);
    const rank = correctSubmissions.findIndex(s => s.playerId === currentUser?.id);
    return rank !== -1 ? rank + 1 : null;
  }, [submissions, currentUser, currentQuiz, mySubmission]);
  

  // --- ログイン画面 ---
  if (!currentUser) {
    // ( ... ログイン画面の JSX は変更なし ... )
    return (
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-amber-200">
        <TrophyIcon className="w-14 h-14 mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-amber-800 mb-2">クイズに参加しよう！</h2>
        
        <p className="text-gray-600 mb-4">1. まず性別を選択してください。</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleGenderChange('male')}
            className={`font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ${
              selectedGender === 'male' 
              ? 'bg-blue-600 text-white ring-2 ring-blue-700 ring-offset-2' 
              : 'bg-blue-400 text-white hover:bg-blue-500'
            }`}
          >
            男性
          </button>
          <button
            onClick={() => handleGenderChange('female')}
            className={`font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ${
              selectedGender === 'female' 
              ? 'bg-pink-600 text-white ring-2 ring-pink-700 ring-offset-2' 
              : 'bg-pink-400 text-white hover:bg-pink-500'
            }`}
          >
            女性
          </button>
        </div>

        <p className="text-gray-600 mb-2">2. 次に名前を選択してください。</p>
        <p className="text-sm text-rose-500 mb-6">*一度選択した名前は取り消せません</p>
        
        <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              disabled={!selectedGender} 
              className={`flex-grow w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                !selectedGender ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
              }`}
            >
              <option value="">
                {selectedGender ? '-- 名前を選択してください --' : '-- まず性別を選択 --'}
              </option>
              {nameList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            
            <button
                onClick={handleJoin}
                disabled={!selectedGender || !selectedName}
                className={`font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 active:scale-95 whitespace-nowrap ${
                  !selectedGender || !selectedName
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600'
                }`}
            >
                参加する
            </button>
        </div>
      </div>
    );
  }

  // ★★★ (修正) ロジックの順番を変更 ★★★
  // (A) 正解者の場合 (最優先)
  // ---------------------------------
  if (iAmAWinner) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">ようこそ！</p>
          <p className="text-3xl font-bold text-rose-600">{currentUser.name} さん</p>
          {/* 1問も始まっていない時だけ「名前を選び直す」を表示 */}
          {quizMode === 'idle' && history.length === 0 && (
            <button
              onClick={handleLogout}
              className="mt-2 text-sm text-gray-500 underline hover:text-rose-600"
            >
              (名前を選び直す)
            </button>
          )}
        </div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 min-h-[350px] flex flex-col justify-center items-center border border-amber-200 text-center">
          <TrophyIcon className="w-16 h-16 text-amber-500 mb-4" />
          <h2 className="text-3xl font-bold text-emerald-600 mb-2">おめでとうございます！</h2>
          <p className="text-xl text-gray-700">あなたは見事クイズに正解しました！</p>
          <p className="text-lg text-gray-600 mt-4">次の問題からは、他の参加者を応援してあげてくださいね。</p>
        </div>
      </div>
    );
  }

  // (B) まだ正解していない人の場合
  // ---------------------------------

  // (B-1) 待機中 または 結果発表
  if (quizMode === 'show_results' || quizMode === 'idle') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">ようこそ！</p>
          <p className="text-3xl font-bold text-rose-600">{currentUser.name} さん</p>
          {/* 1問も始まっていない時だけ「名前を選び直す」を表示 */}
          {quizMode === 'idle' && history.length === 0 && (
            <button
              onClick={handleLogout}
              className="mt-2 text-sm text-gray-500 underline hover:text-rose-600"
            >
              (名前を選び直す)
            </button>
          )}
        </div>
        
        {/* ( ... 待機中/結果発表 の JSX ... ) */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 min-h-[350px] flex flex-col justify-center items-center border border-amber-200">
          
          {quizMode === 'idle' ? (
            <p className="text-2xl text-gray-500 animate-pulse">司会者の合図をお待ちください...</p>
          ) : (
            <div className="text-center">
              {hasAnswered ? (
                  <div>
                    {/* ( 'iAmAWinner' は false なので、ここは必ず「残念」になる ) */}
                    {mySubmission?.answerIndex === currentQuiz.correctAnswerIndex ? (
                      <p className="text-4xl font-bold text-emerald-500">正解！</p>
                    ) : (
                      <p className="text-4xl font-bold text-rose-500">残念！</p>
                    )}
                    {myRank && <p className="text-2xl text-amber-600 mt-4">あなたは {myRank} 位でした！</p>}
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-500">時間切れです！</p>
                )}
              <p className="text-xl text-gray-600 mt-6">次の問題をお待ちください。</p>
            </div>
          )}
        </div>

        {/* ( ... ランキング の JSX ... ) */}
        {(quizMode === 'show_results' && submissions.length > 0) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-200">
            <h3 className="flex items-center text-xl font-bold mb-4 text-amber-800">
              <TrophyIcon className="w-6 h-6 mr-2" />
              正解者 早押しランキング
            </h3>
            {submissions.filter(s => s.answerIndex === currentQuiz.correctAnswerIndex).length > 0 ? (
              <ol className="space-y-2">
                {submissions
                  .filter(s => s.answerIndex === currentQuiz.correctAnswerIndex)
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((entry, index) => (
                  <li key={entry.playerId} className={`flex items-center p-3 rounded-lg shadow-sm transition-all duration-300 ${entry.playerId === currentUser?.id ? 'bg-amber-200' : 'bg-white'}`}>
                    <span className={`font-bold text-xl w-10 text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-800 flex-1 text-lg">{entry.playerName}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 text-center py-4">正解者はいませんでした...</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // (B-2) クイズ中 または 回答締切
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <p className="text-lg text-gray-600">ようこそ！</p>
        <p className="text-3xl font-bold text-rose-600">{currentUser.name} さん</p>
        {/* (クイズ中は「名前を選び直す」ボタンは表示しない) */}
      </div>
      
      {/* ( ... クイズ中/回答済み の JSX ... ) */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 min-h-[350px] flex flex-col justify-center items-center border border-amber-200">
        {quizMode === 'fastest_finger' && (
          <div className="absolute top-4 right-4 flex items-center bg-rose-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
            <ClockIcon className="w-6 h-6 mr-2" />
            <span>{timer}</span>
          </div>
        )}

        {!isJoined ? (
            <p className="text-2xl text-gray-500 animate-pulse">サーバーに接続中...</p>
        ) : 
        
        // ( 'iAmAWinner' は false なので、ここは正解者以外のみが通る )
        !hasAnswered && quizMode === 'fastest_finger' ? (
          <div className="w-full flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Q. {currentQuiz.question}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              {currentQuiz.options.map((option, index) => (
                 <button 
                  key={index} 
                  onClick={() => handleAnswer(index)} 
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 px-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl active:scale-95 text-lg"
                >
                   {option}
                 </button>
              ))}
            </div>
          </div>
        ) : (

        // (回答済み、または回答締切)
        <div className="text-center">
          {hasAnswered ? (
            <div>
              <p className="text-xl text-gray-700">あなたが選んだ回答:</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">
                {mySubmission ? currentQuiz.options[mySubmission.answerIndex!] : '...'}
              </p>
            </div>
          ) : (
             <p className="text-3xl font-bold text-gray-500">回答できませんでした！</p>
          )}
          
          {quizMode === 'fastest_finger' ? (
             <p className="text-2xl text-gray-500 mt-6 animate-pulse">他の人の回答を待っています...</p>
          ) : (
             <p className="text-2xl text-blue-600 mt-6 animate-pulse">結果発表をお待ちください...</p>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantView;