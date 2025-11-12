import React, { useMemo, useState, useEffect } from 'react';
import { QuizMode, QuizSubmission, Quiz, Player } from '../types';
import { PlayIcon, RefreshIcon, CheckCircleIcon, XCircleIcon, TrophyIcon, ClockIcon, UserGroupIcon, HistoryIcon, EyeIcon } from './icons';

interface AdminViewProps {
  quizMode: QuizMode;
  submissions: QuizSubmission[];
  participants: Player[];
  onStartQuiz: (quiz: Quiz) => void;
  onResetQuiz: () => void;
  onForceEndQuiz: () => void;
  onShowResults: () => void;
  onShowHistory: () => void;
  onShowParticipantList: () => void;
  currentQuiz: Quiz;
  timer: number;
  quizSettings: Quiz;
  onQuizSettingsChange: (settings: Quiz) => void;
  winners: number[]; 
}

const AdminView: React.FC<AdminViewProps> = ({
  quizMode,
  submissions,
  participants,
  onStartQuiz,
  onResetQuiz,
  onForceEndQuiz,
  onShowResults,
  onShowHistory,
  onShowParticipantList,
  currentQuiz,
  timer,
  quizSettings,
  onQuizSettingsChange,
  winners,
}) => {

  const [history, setHistory] = useState<QuizSubmission[]>([]);

  useEffect(() => {
    if (submissions.length === 0) {
      setHistory([]);
    } else {
      setHistory(submissions);
    }
  }, [submissions]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...quizSettings.options];
    newOptions[index] = value;
    onQuizSettingsChange({ ...quizSettings, options: newOptions });
  };

  const handleStartQuiz = () => {
    if (!quizSettings.question || quizSettings.options.some(opt => opt === '') || quizSettings.correctAnswerIndex === null || quizSettings.timeLimit <= 0) {
      alert('すべての項目（問題、選択肢、正解、制限時間）を正しく入力してください。');
      return;
    }
    onStartQuiz(quizSettings);
  };
  
  const rankedSubmissions = useMemo(() => {
    if (!currentQuiz || currentQuiz.correctAnswerIndex === null) return history;
    
    const correct = history
      .filter(s => s.answerIndex === currentQuiz.correctAnswerIndex)
      .sort((a, b) => a.timestamp - b.timestamp);
      
    const incorrect = history
      .filter(s => s.answerIndex !== currentQuiz.correctAnswerIndex)
      .sort((a, b) => a.timestamp - b.timestamp);
      
    return [...correct, ...incorrect];
  }, [history, currentQuiz]);

  const answeredPlayerIds = useMemo(() => {
    return new Set(submissions.map(s => s.playerId));
  }, [submissions]);


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-amber-700">管理者用パネル</h2>

      {/* ★★★ ここを修正しました ★★★ */}
      {/* スマホ(デフォルト)では縦積み(flex-col)、smサイズ以上で横並び(sm:flex-row)に変更 */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onShowHistory}
          // w-full (スマホで全幅) / sm:w-auto (PCで自動幅) を追加
          className="w-full sm:w-auto flex-inline items-center justify-center bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300"
        >
          <HistoryIcon className="w-5 h-5 mr-2 inline" />
          全問の履歴
        </button>
        <button
          onClick={onShowParticipantList}
          // w-full (スマホで全幅) / sm:w-auto (PCで自動幅) を追加
          className="w-full sm:w-auto flex-inline items-center justify-center bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-600 transition-all duration-300"
        >
          <UserGroupIcon className="w-5 h-5 mr-2 inline" />
          参加者リスト ({participants.length}名)
        </button>
      </div>
      
      {/* 早押しクイズ管理 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-200 space-y-4">
        <h3 className="flex items-center text-xl font-bold text-amber-800">
          <TrophyIcon className="w-6 h-6 mr-2" />
          5択早押しクイズ
        </h3>
        
        {/* ... (問題入力フォーム・クイズ実行中表示 は変更なし) ... */}
        {quizMode === 'idle' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">問題文</label>
              <input type="text" value={quizSettings.question} onChange={e => onQuizSettingsChange({ ...quizSettings, question: e.target.value })} placeholder="例：新郎と新婦が初めて出会った場所は？" className="w-full p-2 border border-amber-300 rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">選択肢と正解</label>
              {quizSettings.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2 mb-2">
                  <input type="radio" name="correctAnswer" checked={quizSettings.correctAnswerIndex === i} onChange={() => onQuizSettingsChange({ ...quizSettings, correctAnswerIndex: i })} className="form-radio h-5 w-5 text-amber-600 focus:ring-amber-500"/>
                  <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`選択肢 ${i + 1}`} className="w-full p-2 border border-amber-300 rounded-md"/>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">制限時間（秒）</label>
              <input type="number" value={quizSettings.timeLimit} onChange={e => onQuizSettingsChange({ ...quizSettings, timeLimit: parseInt(e.target.value, 10) })} min="1" placeholder="例: 30" className="w-full p-2 border border-amber-300 rounded-md"/>
            </div>
          </div>
        ) : (
           <div className="bg-amber-50 p-4 rounded-lg text-center">
              <p className="font-bold text-amber-800 text-lg">Q. {currentQuiz.question}</p>
              {quizMode === 'fastest_finger' && (
                <div className="mt-4 flex items-center justify-center text-2xl font-bold text-rose-600">
                  <ClockIcon className="w-7 h-7 mr-2" />
                  <span>残り時間: {timer}秒</span>
                </div>
              )}
              {quizMode === 'reveal_answer' && (
                <p className="mt-4 text-xl font-bold text-blue-600 animate-pulse">
                  回答締切！結果発表をお待ち下さい...
                </p>
              )}
              {quizMode === 'show_results' && (
                <p className="mt-4 text-xl font-bold text-emerald-600">
                  結果発表！
                </p>
              )}
           </div>
        )}

        {/* ... (クイズ操作ボタン群 は変更なし) ... */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
          {quizMode === 'idle' && (
            <button
              onClick={handleStartQuiz}
              className="flex-1 flex items-center justify-center bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-emerald-600 transition-all duration-300"
            >
              <PlayIcon className="w-5 h-5 mr-2"/>
              クイズスタート
            </button>
          )}
          {quizMode === 'fastest_finger' && (
            <button
              onClick={onForceEndQuiz}
              className="flex-1 flex items-center justify-center bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition-all duration-300"
            >
              <ClockIcon className="w-5 h-5 mr-2" />
              回答締切
            </button>
          )}
          {quizMode === 'reveal_answer' && (
            <button
              onClick={onShowResults}
              className="flex-1 flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 animate-pulse"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              結果発表
            </button>
          )}
          {quizMode === 'show_results' && (
            <button
              onClick={onResetQuiz}
              className="flex-1 flex items-center justify-center bg-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-rose-600 transition-all duration-300"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              リセット (次へ)
            </button>
          )}
        </div>
        
        {/* ... (リアルタイム回答状況 は変更なし) ... */}
        {quizMode === 'fastest_finger' && (
          <div className="bg-amber-50 rounded-lg p-4 h-40 overflow-y-auto">
            <h4 className="font-bold text-amber-700 mb-2">
              リアルタイム回答状況 ({answeredPlayerIds.size} / {participants.length})
            </h4>
            <ul className="space-y-2">
              {participants.map((player) => {
                const hasAnswered = answeredPlayerIds.has(player.id);
                const isWinner = winners.includes(player.id);
                
                return (
                  <li key={player.id} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                    <span className={`text-gray-800 flex-1 ${isWinner ? 'text-gray-400' : ''}`}>{player.name}</span>
                    
                    {isWinner ? (
                       <span className="flex items-center text-xs font-bold text-amber-600">
                         <TrophyIcon className="w-5 h-5 mr-1" /> 正解済み
                       </span>
                    ) : hasAnswered ? (
                      <span className="flex items-center text-xs font-bold text-emerald-500">
                        <CheckCircleIcon className="w-5 h-5 mr-1" /> 回答済み
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-gray-400 animate-pulse">
                        <ClockIcon className="w-5 h-5 mr-1" /> 回答待ち
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* ... (回答結果のランキング は変更なし) ... */}
        {quizMode !== 'fastest_finger' && (
          <div className="bg-amber-50 rounded-lg p-4 h-80 overflow-y-auto">
            <h4 className="font-bold text-amber-700 mb-2">
              {quizMode === 'idle' ? '前回の結果' : '今回の結果'}
            </h4>
            {rankedSubmissions.length > 0 ? (
              <ol className="space-y-2">
                {rankedSubmissions.map((entry, index) => {
                  const isCorrect = entry.answerIndex === currentQuiz.correctAnswerIndex;
                  const rank = isCorrect ? (rankedSubmissions.filter(s => s.answerIndex === currentQuiz.correctAnswerIndex).findIndex(s => s.playerId === entry.playerId) + 1) : '-';
                  const isWinner = winners.includes(entry.playerId);

                  return (
                    <li key={entry.playerId} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                      <span className={`font-bold text-lg w-8 text-center ${isCorrect ? 'text-amber-500' : 'text-gray-400'}`}>
                        {rank}
                      </span>
                      <span className={`text-gray-800 flex-1 ${isWinner ? 'text-gray-400' : ''}`}>{entry.playerName}</span>
                      
                      {isCorrect ? <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> : <XCircleIcon className="w-6 h-6 text-rose-500" />}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-gray-500 text-center pt-10">
                {quizMode === 'idle' ? 'まだクイズが開始されていません。' : 'まだ誰も回答していません。'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;