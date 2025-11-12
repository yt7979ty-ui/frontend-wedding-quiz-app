import React from 'react';
import { QuizHistoryItem } from '../types';
import { RefreshIcon, CheckCircleIcon, XCircleIcon, HistoryIcon } from './icons';

interface HistoryViewProps {
  history: QuizHistoryItem[];
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack }) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* ... (ヘッダー部分は変更なし) ... */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-center text-amber-700 whitespace-nowrap">
          <HistoryIcon className="w-6 h-6 mr-2 inline" />
          全問題の回答履歴
        </h2>
        <button
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300"
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
          管理者パネルに戻る
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center pt-10">まだクイズの履歴がありません。</p>
      ) : (
        <div className="space-y-6">
          {/* 履歴を逆順（最新の問題が上）に表示 */}
          {[...history].reverse().map((item, index) => {
            
            // ★★★ 1. (修正) ここでロジックを追加 ★★★
            // まず、各問題(item)ごとに「正解者」と「不正解者」に分け、それぞれを早押し順にソートします
            const correctSubmissions = item.submissions
              .filter(s => s.answerIndex === item.quiz.correctAnswerIndex)
              .sort((a, b) => a.timestamp - b.timestamp);
              
            const incorrectSubmissions = item.submissions
              .filter(s => s.answerIndex !== item.quiz.correctAnswerIndex)
              .sort((a, b) => a.timestamp - b.timestamp);
            
            // 正解者を先に、不正解者を後にして、リストを結合します
            const sortedEntries = [...correctSubmissions, ...incorrectSubmissions];
            // ★★★ 修正ここまで ★★★

            return (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-200">
                <h3 className="text-xl font-bold text-amber-800 mb-4">
                  第{history.length - index}問: {item.quiz.question}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  正解: <span className="font-bold">{item.quiz.options[item.quiz.correctAnswerIndex!]}</span>
                </p>

                <div className="bg-amber-50 rounded-lg p-4 h-60 overflow-y-auto">
                  {/* ★ 2. (修正) sortedEntries を使用 */}
                  {sortedEntries.length > 0 ? (
                    <ol className="space-y-2">
                      {/* ★ 3. (修正) 新しい結合済みリスト(sortedEntries)をループ */}
                      {sortedEntries.map((entry, rankIndex) => { // 'index' を 'rankIndex' に変更
                        const isCorrect = entry.answerIndex === item.quiz.correctAnswerIndex;
                        
                        // ★ 4. (修正) 正解者のみ順位を計算 (不正解者は '-')
                        const rank = isCorrect ? (rankIndex + 1) : '-';

                        return (
                          <li key={entry.playerId} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                            {/* ★ 5. (修正) 順位を表示する欄を追加 */}
                            <span className={`font-bold text-lg w-8 text-center ${isCorrect ? 'text-amber-500' : 'text-gray-400'}`}>
                              {rank}
                            </span>
                            
                            <span className="text-gray-800 flex-1">{entry.playerName}</span>
                            <span className="text-sm text-gray-600 mr-2">
                              ({item.quiz.options[entry.answerIndex!]})
                            </span>
                            {isCorrect ? (
                              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <XCircleIcon className="w-6 h-6 text-rose-500" />
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="text-gray-500 text-center pt-10">この問題の回答者はいませんでした。</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;