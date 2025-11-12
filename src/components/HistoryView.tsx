import React from 'react';
import { QuizHistoryItem } from '../types';
// ★ 1. (修正) TrashIcon をインポート
import { RefreshIcon, CheckCircleIcon, XCircleIcon, HistoryIcon, TrashIcon } from './icons';

interface HistoryViewProps {
  history: QuizHistoryItem[];
  onBack: () => void;
  onClearHistory: () => void; // ★ 2. (修正) onClearHistory を props に追加
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, onClearHistory }) => { // ★ 3. (修正) onClearHistory を受け取る
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-center text-amber-700 whitespace-nowrap">
          <HistoryIcon className="w-6 h-6 mr-2 inline" />
          全問題の回答履歴
        </h2>
        {/* ★ 4. (修正) 戻るボタンをグループ化 */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="w-full sm:w-auto flex items-center justify-center bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300"
          >
            <RefreshIcon className="w-5 h-5 mr-2" />
            管理者パネルに戻る
          </button>
          
          {/* ★ 5. (機能追加) 履歴削除ボタン */}
          <button
            onClick={onClearHistory}
            disabled={history.length === 0} // 履歴が0件なら押せない
            className={`w-full sm:w-auto flex items-center justify-center font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ${
              history.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            履歴をすべて削除
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center pt-10">まだクイズの履歴がありません。</p>
      ) : (
        <div className="space-y-6">
          {[...history].reverse().map((item, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-200">
              <h3 className="text-xl font-bold text-amber-800 mb-4">
                第{history.length - index}問: {item.quiz.question}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                正解: <span className="font-bold">{item.quiz.options[item.quiz.correctAnswerIndex!]}</span>
              </p>

              <div className="bg-amber-50 rounded-lg p-4 h-60 overflow-y-auto">
                {item.submissions.length > 0 ? (
                  <ol className="space-y-2">
                    {/* ... (履歴リストの表示ロジックは変更なし) ... */}
                    {item.submissions.sort((a, b) => a.timestamp - b.timestamp).map((entry) => {
                      const isCorrect = entry.answerIndex === item.quiz.correctAnswerIndex;
                      const rank = correctSubmissions.findIndex(c => c.playerId === entry.playerId) + 1;
                      
                      return (
                        <li key={entry.playerId} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                          <span className={`font-bold text-lg w-8 text-center ${isCorrect ? 'text-amber-500' : 'text-gray-400'}`}>
                            {isCorrect ? rank : '-'}
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
          ))}
        </div>
      )}
    </div>
  );
};

// ★ (注) 内部のロジックで 'correctSubmissions' が定義されていなかったので、
// AdminView からロジックをコピーして修正しました。
const correctSubmissions = (item: QuizHistoryItem) => 
  item.submissions
    .filter(s => s.answerIndex === item.quiz.correctAnswerIndex)
    .sort((a, b) => a.timestamp - b.timestamp);


export default HistoryView;