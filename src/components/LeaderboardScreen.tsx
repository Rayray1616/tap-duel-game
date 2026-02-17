import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export function LeaderboardScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { leaderboard, loading, activeTab, changeTab, refresh } = useLeaderboard(telegramUser?.id?.toString());
  const [animatingRefresh, setAnimatingRefresh] = useState(false);

  const handleRefresh = () => {
    setAnimatingRefresh(true);
    refresh();
    setTimeout(() => setAnimatingRefresh(false), 1000);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 cyberpunk-grid"></div>
        <div className="absolute inset-0 cyberpunk-particles"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="neon-button-back"
          >
            ← BACK
          </button>
          
          <h1 className="text-3xl md:text-4xl font-black text-center flex-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              LEADERBOARD
            </span>
          </h1>
          
          <button
            onClick={handleRefresh}
            className={`neon-button-refresh ${animatingRefresh ? 'animate-spin' : ''}`}
          >
            ↻
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="neon-tab-container">
            {(['daily', 'weekly', 'all_time'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => changeTab(tab)}
                className={`neon-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'daily' && 'DAILY'}
                {tab === 'weekly' && 'WEEKLY'}
                {tab === 'all_time' && 'ALL-TIME'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="relative z-10 flex-1 px-4 pb-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-cyan-400 text-xl font-bold animate-pulse">LOADING LEADERBOARD...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-xl text-cyan-400">No data available</div>
              <div className="text-sm text-cyan-600 mt-2">Start dueling to appear on the leaderboard!</div>
            </div>
          </div>
        ) : (
          <div className="neon-leaderboard-container">
            {/* Table Header */}
            <div className="neon-table-header">
              <div className="neon-header-cell text-center">RANK</div>
              <div className="neon-header-cell">PLAYER</div>
              <div className="neon-header-cell text-center">LVL</div>
              <div className="neon-header-cell text-center">XP</div>
              <div className="neon-header-cell text-center">W/L</div>
            </div>

            {/* Leaderboard Entries */}
            <div className="neon-table-body">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.user_id === telegramUser?.id?.toString();
                const rankColor = entry.rank === 1 ? 'text-yellow-400' : 
                                 entry.rank === 2 ? 'text-gray-300' : 
                                 entry.rank === 3 ? 'text-orange-400' : 'text-cyan-400';
                
                return (
                  <div
                    key={entry.user_id}
                    className={`neon-table-row ${isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className={`neon-cell text-center font-black ${rankColor}`}>
                      #{entry.rank}
                    </div>
                    <div className="neon-cell">
                      <div className="font-bold">{entry.username}</div>
                      <div className="text-xs text-cyan-600">
                        {new Date(entry.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="neon-cell text-center">
                      <div className="font-bold text-purple-400">{entry.level}</div>
                    </div>
                    <div className="neon-cell text-center">
                      <div className="font-bold text-pink-400">{entry.xp}</div>
                    </div>
                    <div className="neon-cell text-center">
                      <div className="text-sm">
                        <span className="text-green-400">{entry.wins}</span>
                        <span className="text-cyan-600 mx-1">/</span>
                        <span className="text-red-400">{entry.losses}</span>
                      </div>
                      <div className="text-xs text-cyan-600">
                        {entry.win_ratio}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cyberpunk-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 10s linear infinite;
        }

        .cyberpunk-particles {
          background-image: 
            radial-gradient(2px 2px at 20% 30%, rgba(0, 255, 255, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(0, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(0, 255, 255, 0.4), transparent);
          background-size: 200px 200px, 150px 150px, 100px 100px;
          animation: particles-float 30s linear infinite;
        }

        .neon-button-back {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          padding: 8px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-button-back:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .neon-button-refresh {
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
          border: 2px solid rgba(255, 0, 255, 0.5);
          width: 40px;
          height: 40px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #ff00ff;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .neon-button-refresh:hover {
          transform: scale(1.1);
          border-color: rgba(255, 0, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(255, 0, 255, 0.5),
            inset 0 0 20px rgba(255, 0, 255, 0.1);
        }

        .neon-tab-container {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 12px;
          padding: 4px;
          display: flex;
          gap: 4px;
        }

        .neon-tab {
          background: transparent;
          border: none;
          padding: 12px 24px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 8px;
        }

        .neon-tab.active {
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%);
          color: #000;
          box-shadow: 
            0 0 20px #00ffff,
            inset 0 0 20px rgba(0, 255, 255, 0.3);
        }

        .neon-tab:hover:not(.active) {
          background: rgba(0, 255, 255, 0.1);
        }

        .neon-leaderboard-container {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .neon-table-header {
          display: grid;
          grid-template-columns: 80px 1fr 80px 80px 100px;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border-bottom: 2px solid rgba(0, 255, 255, 0.5);
        }

        .neon-header-cell {
          padding: 16px 8px;
          font-family: 'Orbitron', monospace;
          font-weight: 900;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #00ffff;
          text-shadow: 0 0 10px #00ffff;
        }

        .neon-table-body {
          max-height: calc(100vh - 300px);
          overflow-y: auto;
        }

        .neon-table-row {
          display: grid;
          grid-template-columns: 80px 1fr 80px 80px 100px;
          border-bottom: 1px solid rgba(0, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .neon-table-row:hover {
          background: rgba(0, 255, 255, 0.05);
        }

        .neon-table-row.current-user {
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
          border-left: 4px solid #ff00ff;
        }

        .neon-table-row.current-user:hover {
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.2) 0%, rgba(255, 0, 255, 0.1) 100%);
        }

        .neon-cell {
          padding: 16px 8px;
          font-family: 'Orbitron', monospace;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes particles-float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-50px, 30px); }
          50% { transform: translate(30px, 50px); }
          75% { transform: translate(20px, -30px); }
          100% { transform: translate(0, 0); }
        }

        /* Custom scrollbar */
        .neon-table-body::-webkit-scrollbar {
          width: 8px;
        }

        .neon-table-body::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .neon-table-body::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
          border-radius: 4px;
        }

        .neon-table-body::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
        }

        @media (max-width: 768px) {
          .neon-table-header,
          .neon-table-row {
            grid-template-columns: 60px 1fr 60px 60px 80px;
          }
          
          .neon-header-cell,
          .neon-cell {
            padding: 12px 6px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
