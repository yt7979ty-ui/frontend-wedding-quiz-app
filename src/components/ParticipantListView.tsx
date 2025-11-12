import React, { useMemo, useCallback, useState } from 'react'; 
import { Player, QuizMode, QuizSubmission } from '../types';
// ★ UserGroupIcon を ClipboardDocumentListIcon に変更
import { RefreshIcon, CheckCircleIcon, XCircleIcon, TrophyIcon, ClockIcon, ArrowUturnLeftIcon, ArrowLeftOnRectangleIcon, ClipboardDocumentListIcon } from './icons';
import { PRE_REGISTERED_LIST } from '../constants';
import { socket } from '../socket'; 

interface ParticipantListViewProps {
  participants: Player[];
  submissions: QuizSubmission[]; 
  winners: number[];
  quizMode: QuizMode;
  onBack: () => void;
  onResetWinner: (playerId: number) => void;
  onResetAllWinners: () => void;
}

const ParticipantListView: React.FC<ParticipantListViewProps> = ({ 
  participants, 
  submissions,
  winners,
  quizMode,
  onBack,
  onResetWinner,
  onResetAllWinners,
}) => {
  
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());

  const connectedPlayers = useMemo(() => {
    return new Map(participants.map(p => [p.name, p]));
  }, [participants]);

  const submittedPlayerIds = useMemo(() => {
    return new Set(submissions.map(s => s.playerId));
  }, [submissions]);

  const totalRegistered = PRE_REGISTERED_LIST.length;
  const totalConnected = connectedPlayers.size;

  const handleResetAll = useCallback(() => {
    if (window.confirm('本当に全員の回答権を復帰させますか？\n（正解者リストが空になります）')) {
      onResetAllWinners();
      setSelectedPlayerIds(new Set()); 
    }
  }, [onResetAllWinners]); 
  
  const handleResetSelected = useCallback(() => {
    if (selectedPlayerIds.size === 0) {
      alert('（回答権を）復帰させる参加者が選択されていません。');
      return;
    }
    
    if (window.confirm(`選択された ${selectedPlayerIds.size} 名の回答権を復帰させますか？`)) {
      selectedPlayerIds.forEach(id => {
        onResetWinner(id); 
      });
      setSelectedPlayerIds(new Set()); 
    }
  }, [selectedPlayerIds, onResetWinner]); 

  const handleForceLogoutSelected = useCallback(() => {
    if (selectedPlayerIds.size === 0) {
      alert('（名前を選び直させる）強制ログアウトさせる参加者が選択されていません。');
      return;
    }

    if (window.confirm(`選択された ${selectedPlayerIds.size} 名を名前選択画面に戻しますか？\n（アプリから強制的に切断されます）`)) {
      selectedPlayerIds.forEach(id => {
        socket.emit('admin:forceLogoutParticipant', id); 
      });
      setSelectedPlayerIds(new Set());
    }
  }, [selectedPlayerIds]);


  const handleToggleSelection = (playerId: number) => {
    setSelectedPlayerIds(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-center text-amber-700 whitespace-nowrap">
          {/* ★ UserGroupIcon を ClipboardDocumentListIcon に変更 */}
          <ClipboardDocumentListIcon className="w-6 h-6 mr-2 inline" />
          参加者リスト ({totalConnected} / {totalRegistered} 名)
        </h2>
        <button
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300"
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
          管理者パネルに戻る
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleResetSelected}
          disabled={selectedPlayerIds.size === 0}
          className={`flex-inline items-center justify-center font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 text-sm ${
            selectedPlayerIds.size === 0 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <ArrowUturnLeftIcon className="w-5 h-5 mr-2 inline" />
          選択を復帰 ({selectedPlayerIds.size})
        </button>
        
        <button
          onClick={handleForceLogoutSelected}
          disabled={selectedPlayerIds.size === 0}
          className={`flex-inline items-center justify-center font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 text-sm ${
            selectedPlayerIds.size === 0 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 inline" />
          強制ログアウト ({selectedPlayerIds.size})
        </button>

        <button
          onClick={handleResetAll}
          className="flex-inline items-center justify-center bg-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-rose-600 transition-all duration-300 text-sm"
        >
          <RefreshIcon className="w-5 h-5 mr-2 inline" />
          全員の回答権を復帰
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-200 space-y-4">
        <div className="bg-amber-50 rounded-lg p-4 h-96 overflow-y-auto">
          {PRE_REGISTERED_LIST.length > 0 ? (
            <ul className="space-y-2">
              
              {PRE_REGISTERED_LIST.map((name) => {
                const player = connectedPlayers.get(name);
                const isConnected = !!player;
                
                let statusIcon = (
                  <span className="flex items-center text-xs font-bold text-gray-400">
                    <XCircleIcon className="w-5 h-5 mr-1" /> 未接続
                  </span>
                );
                
                let checkbox = null; 

                if (isConnected && player) {
                  const isWinner = winners.includes(player.id);
                  const hasAnswered = submittedPlayerIds.has(player.id);
                  
                  checkbox = (
                    <input 
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3 focus:ring-blue-500"
                      checked={selectedPlayerIds.has(player.id)}
                      onChange={() => handleToggleSelection(player.id)}
                    />
                  );

                  if (isWinner) {
                    statusIcon = (
                      <span className="flex items-center text-xs font-bold text-amber-500">
                        <TrophyIcon className="w-5 h-5 mr-1" /> 正解済み
                      </span>
                    );
                  } else if (quizMode === 'fastest_finger' && hasAnswered) {
                     statusIcon = (
                      <span className="flex items-center text-xs font-bold text-emerald-500">
                        <CheckCircleIcon className="w-5 h-5 mr-1" /> 回答済み
                      </span>
                    );
                  } else if (quizMode === 'fastest_finger') {
                     statusIcon = (
                      <span className="flex items-center text-xs font-bold text-gray-400 animate-pulse">
                        <ClockIcon className="w-5 h-5 mr-1" /> 回答待ち
                      </span>
                    );
                  } else {
                     statusIcon = (
                      <span className="flex items-center text-xs font-bold text-blue-500">
                        <CheckCircleIcon className="w-5 h-5 mr-1" /> 接続中
                      </span>
                    );
                  }
                }
                
                return (
                  <li key={name} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                    {checkbox || <div className="w-5 h-5 mr-3"></div>} 
                    
                    <span className={`flex-1 ${isConnected ? 'text-gray-800' : 'text-gray-400'}`}>
                      {name}
                    </span>
                    {statusIcon}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center pt-10">事前登録リストがありません。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantListView;