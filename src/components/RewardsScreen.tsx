import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/telegram/useTelegram';
import { useRewards } from '@/hooks/useRewards';
import { useGems } from '@/hooks/useGems';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { useAchievements } from '@/hooks/useAchievements';

interface ClaimResult {
  success: boolean;
  reward_amount: number;
  streak: number;
  streak_reset: boolean;
  message: string;
}

export function RewardsScreen() {
  const navigate = useNavigate();
  const { user: telegramUser } = useTelegram();
  const { rewardStatus, loading, claiming, claimReward } = useRewards(telegramUser?.id?.toString());
  const { addGems } = useGems(telegramUser?.id?.toString());
  const { updateMissionProgress } = useDailyMissions(telegramUser?.id?.toString());
  const { updateAchievementProgress } = useAchievements(telegramUser?.id?.toString());
  const [claimedReward, setClaimedReward] = useState<ClaimResult | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  const handleClaimReward = async () => {
    const result = await claimReward();
    if (result && result.success) {
      setClaimedReward(result);
      setShowRewardAnimation(true);
      
      // Award gems: 5 + (streak * 2)
      const gemsAwarded = 5 + (result.streak * 2);
      await addGems(gemsAwarded);
      
      // Update missions and achievements for daily claim
      await updateMissionProgress('daily_claim', 1);
      await updateAchievementProgress('daily_claim', 1);
      
      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowRewardAnimation(false);
      }, 3000);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatLastClaimed = (lastClaimed: string | null) => {
    if (!lastClaimed) return 'Never';
    const date = new Date(lastClaimed);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatHoursUntil = (hours: number) => {
    if (hours <= 0) return 'Available now!';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              DAILY REWARDS
            </span>
          </h1>
          
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 pb-4 flex items-center justify-center">
        {loading ? (
          <div className="text-center">
            <div className="text-cyan-400 text-xl font-bold animate-pulse">LOADING REWARDS...</div>
          </div>
        ) : !rewardStatus ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎁</div>
            <div className="text-xl text-cyan-400">No reward data available</div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Reward Card */}
            <div className="neon-reward-card">
              {/* Streak Display */}
              <div className="text-center mb-6">
                <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Current Streak</div>
                <div className="flex justify-center items-center space-x-2">
                  <div className="text-4xl font-black text-orange-400">{rewardStatus.streak}</div>
                  <div className="text-2xl">🔥</div>
                </div>
                <div className="text-sm text-cyan-600 mt-1">
                  Total Claims: {rewardStatus.total_claims}
                </div>
              </div>

              {/* Reward Amount */}
              <div className="text-center mb-6">
                <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Today's Reward</div>
                <div className="text-5xl font-black text-yellow-400">
                  +{rewardStatus.reward_amount}
                </div>
                <div className="text-sm text-cyan-600 mt-1">XP</div>
              </div>

              {/* Claim Button */}
              <div className="text-center mb-6">
                {rewardStatus.can_claim ? (
                  <button
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className={`neon-claim-button ${claiming ? 'claiming' : ''}`}
                  >
                    {claiming ? 'CLAIMING...' : 'CLAIM REWARD'}
                  </button>
                ) : (
                  <div className="neon-claim-button disabled">
                    CLAIMED TODAY
                  </div>
                )}
              </div>

              {/* Status Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-600">Last Claimed:</span>
                  <span className="text-cyan-400">{formatLastClaimed(rewardStatus.last_claimed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-600">Next Reward:</span>
                  <span className="text-cyan-400">{formatHoursUntil(rewardStatus.hours_until_next_claim)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-600">Formula:</span>
                  <span className="text-cyan-400">20 + (streak × 10) XP</span>
                </div>
              </div>
            </div>

            {/* Streak Progress */}
            <div className="mt-6">
              <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Streak Progress</div>
              <div className="neon-streak-bar">
                <div 
                  className="neon-streak-fill"
                  style={{ width: `${Math.min((rewardStatus.streak % 10) * 10, 100)}%` }}
                >
                  <div className="neon-streak-glow"></div>
                </div>
                <div className="neon-streak-text">
                  Day {rewardStatus.streak % 10 || 10} of 10
                </div>
              </div>
              {claimedReward?.streak_reset && (
                <div className="text-sm text-orange-400 mt-2">
                  Streak reset - start fresh!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reward Animation Overlay */}
      {showRewardAnimation && claimedReward && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <div className="text-4xl font-black text-yellow-400 mb-2">
              REWARD CLAIMED!
            </div>
            <div className="text-2xl text-orange-400 mb-2">
              +{claimedReward.reward_amount} XP
            </div>
            <div className="text-2xl text-green-400 mb-2">
              +{5 + (claimedReward.streak * 2)} 💎 Gems
            </div>
            <div className="text-lg text-cyan-400">
              Streak: {claimedReward.streak} 🔥
            </div>
            {claimedReward.streak_reset && (
              <div className="text-sm text-orange-400 mt-2">
                Streak reset - start fresh!
              </div>
            )}
          </div>
        </div>
      )}

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

        .neon-reward-card {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .neon-reward-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
          pointer-events: none;
        }

        .neon-claim-button {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 50%, #ff8c00 100%);
          border: none;
          padding: 16px 32px;
          font-family: 'Orbitron', monospace;
          font-size: 1.2rem;
          font-weight: 900;
          color: #000;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 
            0 0 30px #ffd700,
            inset 0 0 30px rgba(255, 215, 0, 0.3);
          animation: claim-pulse 2s ease-in-out infinite;
        }

        .neon-claim-button:hover:not(.disabled) {
          transform: scale(1.05);
          box-shadow: 
            0 0 40px #ffd700,
            inset 0 0 40px rgba(255, 215, 0, 0.4);
        }

        .neon-claim-button.claiming {
          animation: claim-processing 1s ease-in-out infinite;
        }

        .neon-claim-button.disabled {
          background: linear-gradient(135deg, #333 0%, #222 50%, #111 100%);
          color: #666;
          cursor: not-allowed;
          animation: none;
          box-shadow: none;
        }

        .neon-streak-bar {
          position: relative;
          height: 24px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(255, 165, 0, 0.3);
          border-radius: 12px;
          overflow: hidden;
        }

        .neon-streak-fill {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #ff8c00 0%, #ffa500 50%, #ffd700 100%);
          transition: width 0.5s ease;
          border-radius: 10px;
        }

        .neon-streak-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
          animation: streak-shine 2s ease-in-out infinite;
        }

        .neon-streak-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 0.75rem;
          color: #fff;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
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

        @keyframes claim-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 30px #ffd700,
              inset 0 0 30px rgba(255, 215, 0, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 40px #ffd700,
              inset 0 0 40px rgba(255, 215, 0, 0.4);
          }
        }

        @keyframes claim-processing {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(0.95);
            opacity: 0.8;
          }
        }

        @keyframes streak-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .neon-reward-card {
            padding: 1.5rem;
          }
          
          .neon-claim-button {
            padding: 14px 28px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
