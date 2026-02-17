import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { useGems } from '@/hooks/useGems';
import { useTelegram } from '@/telegram/useTelegram';

export function DailyMissionsScreen() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { missions, loading, claiming, getClaimableCount, claimMission, refresh } = useDailyMissions(user?.id?.toString());
  const { gemsInfo } = useGems(user?.id?.toString());
  const [claimingMission, setClaimingMission] = useState<string | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClaimMission = async (missionId: string, rewardGems: number) => {
    try {
      setClaimingMission(missionId);
      const result = await claimMission(missionId);
      
      if (result?.success) {
        setRewardAmount(result.reward_gems);
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 3000);
      }
    } catch (error) {
      console.error('Error claiming mission:', error);
    } finally {
      setClaimingMission(null);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage >= 75) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getMissionStatusColor = (mission: any): string => {
    if (mission.claimed) return 'text-gray-500';
    if (mission.completed) return 'text-green-400';
    if (mission.progress_percentage >= 50) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-green-400 text-2xl font-bold animate-pulse">LOADING MISSIONS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-yellow-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-green-400">Daily Missions</h1>
          <div className="text-green-400">
            💎 {gemsInfo?.gems || 0}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-center">
            <div className="text-green-400 text-2xl font-bold">{getClaimableCount()}</div>
            <div className="text-green-300 text-xs">Claimable</div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 text-center">
            <div className="text-yellow-400 text-2xl font-bold">
              {missions.filter(m => m.completed).length}/{missions.length}
            </div>
            <div className="text-yellow-300 text-xs">Completed</div>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-3 text-center">
            <div className="text-cyan-400 text-2xl font-bold">
              {Math.round(missions.reduce((total, m) => total + m.progress_percentage, 0) / missions.length)}%
            </div>
            <div className="text-cyan-300 text-xs">Progress</div>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="relative z-10 space-y-4 max-h-[60vh] overflow-y-auto">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`bg-gray-900/80 border rounded-lg p-4 backdrop-blur-sm transition-all duration-300 ${
              mission.claimed 
                ? 'border-gray-600 opacity-60' 
                : mission.completed 
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                  : 'border-cyan-500/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{mission.icon}</div>
                <div>
                  <h3 className={`font-bold text-lg ${getMissionStatusColor(mission)}`}>
                    {mission.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{mission.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">+{mission.reward_gems} 💎</div>
                <div className="text-gray-400 text-xs">
                  {mission.progress}/{mission.target}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(mission.progress_percentage)}`}
                  style={{ width: `${mission.progress_percentage}%` }}
                >
                  <div className="h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-1">
                {Math.round(mission.progress_percentage)}% Complete
              </div>
            </div>

            {/* Claim Button */}
            <div className="flex justify-center">
              {mission.claimed ? (
                <div className="px-6 py-2 bg-gray-700 text-gray-500 rounded-full font-bold text-sm">
                  ✅ Claimed
                </div>
              ) : mission.completed ? (
                <button
                  onClick={() => handleClaimMission(mission.id, mission.reward_gems)}
                  disabled={claimingMission === mission.id}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                >
                  {claimingMission === mission.id ? 'Claiming...' : 'Claim Reward'}
                </button>
              ) : (
                <div className="px-6 py-2 bg-gray-700 text-gray-400 rounded-full font-bold text-sm">
                  In Progress
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">💎</div>
            <div className="text-3xl font-bold text-green-400 mb-2">+{rewardAmount} Gems!</div>
            <div className="text-green-300">Mission Completed!</div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .neon-mission-card {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(255, 255, 0, 0.05) 100%);
          border: 2px solid rgba(0, 255, 0, 0.3);
          box-shadow: 
            0 0 20px rgba(0, 255, 0, 0.2),
            inset 0 0 20px rgba(0, 255, 0, 0.1);
        }
        
        .neon-mission-card:hover {
          border-color: rgba(0, 255, 0, 0.5);
          box-shadow: 
            0 0 30px rgba(0, 255, 0, 0.3),
            inset 0 0 30px rgba(0, 255, 0, 0.2);
        }
        
        .neon-claim-button {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.3) 0%, rgba(255, 255, 0, 0.2) 100%);
          border: 2px solid rgba(0, 255, 0, 0.5);
          box-shadow: 
            0 0 20px rgba(0, 255, 0, 0.4),
            inset 0 0 20px rgba(0, 255, 0, 0.2);
        }
        
        .neon-claim-button:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 0, 0.7);
          box-shadow: 
            0 0 30px rgba(0, 255, 0, 0.6),
            inset 0 0 30px rgba(0, 255, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
