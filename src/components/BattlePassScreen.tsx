import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeasons } from '@/hooks/useSeasons';
import { useGems } from '@/hooks/useGems';
import { useTelegram } from '@/telegram/useTelegram';
import { getCosmeticDisplayName, getTitleDisplayName } from '@/data/seasons';

export function BattlePassScreen() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { currentSeason, loading, claiming, unlockPremiumBattlePass, claimBattlePassReward, getClaimableRewards, getXPProgressToNextTier, getTierProgress, refresh } = useSeasons(user?.id?.toString());
  const { gemsInfo } = useGems(user?.id?.toString());
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardData, setRewardData] = useState<{ type: string; value: string; amount?: number } | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleUnlockPremium = async () => {
    try {
      const result = await unlockPremiumBattlePass();
      if (result?.success) {
        console.log('Premium Battle Pass unlocked!');
      }
    } catch (error) {
      console.error('Error unlocking premium:', error);
    }
  };

  const handleClaimReward = async (tier: number, trackType: 'free' | 'premium', rewardType: string, rewardValue: string) => {
    try {
      const result = await claimBattlePassReward(tier, trackType);
      
      if (result?.success) {
        let displayValue = rewardValue;
        let amount: number | undefined;
        
        if (rewardType === 'gems') {
          amount = parseInt(rewardValue);
          displayValue = `${amount} 💎`;
        } else if (rewardType === 'cosmetic') {
          displayValue = getCosmeticDisplayName(rewardValue);
        } else if (rewardType === 'title') {
          displayValue = getTitleDisplayName(rewardValue);
        } else if (rewardType === 'emoji') {
          displayValue = rewardValue;
        }
        
        setRewardData({ type: rewardType, value: displayValue, amount });
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 3000);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getTrackColor = (trackType: 'free' | 'premium') => {
    return trackType === 'free' ? 'from-green-500 to-emerald-500' : 'from-purple-500 to-pink-500';
  };

  const getTrackBorderColor = (trackType: 'free' | 'premium') => {
    return trackType === 'free' ? 'border-green-500/50' : 'border-purple-500/50';
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'gems': return '💎';
      case 'cosmetic': return '✨';
      case 'title': return '🏷️';
      case 'emoji': return '😎';
      default: return '🎁';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-purple-400 text-2xl font-bold animate-pulse">LOADING BATTLE PASS...</div>
      </div>
    );
  }

  if (!currentSeason) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-purple-400 text-xl">No Active Season</div>
          <div className="text-gray-400 text-sm mt-2">Check back soon for new seasons!</div>
        </div>
      </div>
    );
  }

  const xpProgress = getXPProgressToNextTier();
  const tierProgress = getTierProgress();
  const claimableCount = getClaimableRewards();

  return (
    <div className="min-h-screen bg-black text-white p-4"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
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
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-purple-400">Battle Pass</h1>
          <div className="text-purple-400">
            💎 {gemsInfo?.gems || 0}
          </div>
        </div>

        {/* Season Info */}
        <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-purple-300">{currentSeason.name}</h2>
            <div className="text-sm text-purple-400">
              {currentSeason.days_remaining} days left
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-purple-400 mb-1">
              <span>Season XP</span>
              <span>{currentSeason.progress?.season_xp || 0}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
            <div className="text-center text-xs text-purple-400 mt-1">
              {xpProgress.current} / {xpProgress.required} XP to next tier
            </div>
          </div>

          {/* Tier Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-purple-400 mb-1">
              <span>Tier</span>
              <span>{tierProgress.current} / {tierProgress.max}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(tierProgress.current / tierProgress.max) * 100}%` }}
              />
            </div>
          </div>

          {/* Claimable Rewards Badge */}
          {claimableCount > 0 && (
            <div className="text-center">
              <div className="inline-block bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {claimableCount} Claimable Rewards!
              </div>
            </div>
          )}
        </div>

        {/* Track Toggle */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSelectedTrack('free')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              selectedTrack === 'free'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Free Track
          </button>
          <button
            onClick={() => setSelectedTrack('premium')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              selectedTrack === 'premium'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Premium Track
          </button>
        </div>

        {/* Premium Unlock Button */}
        {selectedTrack === 'premium' && !currentSeason.progress?.premium_unlocked && (
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-300 mb-2">Unlock Premium Track</h3>
              <p className="text-sm text-purple-400 mb-4">Get exclusive rewards and double the benefits!</p>
              <button
                onClick={handleUnlockPremium}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Unlock Premium
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Battle Pass Tracks */}
      <div className="relative z-10 space-y-3 max-h-[50vh] overflow-y-auto">
        {currentSeason.tracks
          ?.filter(track => track.track_type === selectedTrack)
          ?.map((track) => (
            <div
              key={`${track.tier}-${track.track_type}`}
              className={`bg-gray-900/80 border rounded-lg p-3 backdrop-blur-sm transition-all duration-300 ${getTrackBorderColor(track.track_type)}`}
            >
              <div className="flex items-center justify-between">
                {/* Tier and Reward */}
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {track.tier}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">{getRewardIcon(track.reward_type)}</div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {track.reward_type === 'gems' && `${track.reward_value} Gems`}
                        {track.reward_type === 'cosmetic' && getCosmeticDisplayName(track.reward_value)}
                        {track.reward_type === 'title' && getTitleDisplayName(track.reward_value)}
                        {track.reward_type === 'emoji' && track.reward_value}
                      </div>
                      <div className="text-xs text-gray-400">
                        {track.required_xp} XP
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {track.locked && (
                    <div className="px-3 py-1 bg-gray-700 text-gray-500 rounded-full text-xs font-bold">
                      🔒 Locked
                    </div>
                  )}
                  {track.claimed && (
                    <div className="px-3 py-1 bg-green-700 text-green-400 rounded-full text-xs font-bold">
                      ✅ Claimed
                    </div>
                  )}
                  {!track.locked && !track.claimed && track.eligible && (
                    <button
                      onClick={() => handleClaimReward(track.tier, track.track_type, track.reward_type, track.reward_value)}
                      disabled={claiming === `${track.tier}-${track.track_type}`}
                      className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xs font-bold hover:from-yellow-600 hover:to-orange-600 transition-all animate-pulse disabled:opacity-50"
                    >
                      {claiming === `${track.tier}-${track.track_type}` ? 'Claiming...' : 'Claim'}
                    </button>
                  )}
                  {!track.locked && !track.claimed && !track.eligible && (
                    <div className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs font-bold">
                      {track.required_xp - (currentSeason.progress?.season_xp || 0)} XP to go
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Reward Animation */}
      {showRewardAnimation && rewardData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">{getRewardIcon(rewardData.type)}</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">Reward Claimed!</div>
            <div className="text-2xl text-purple-300 mb-2">{rewardData.value}</div>
            {rewardData.amount && (
              <div className="text-lg text-green-400">+{rewardData.amount} Gems!</div>
            )}
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .neon-battle-pass-card {
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
          border: 2px solid rgba(128, 0, 255, 0.3);
          box-shadow: 
            0 0 20px rgba(128, 0, 255, 0.2),
            inset 0 0 20px rgba(128, 0, 255, 0.1);
        }
        
        .neon-battle-pass-card:hover {
          border-color: rgba(128, 0, 255, 0.5);
          box-shadow: 
            0 0 30px rgba(128, 0, 255, 0.3),
            inset 0 0 30px rgba(128, 0, 255, 0.2);
        }
        
        .neon-claim-button {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%);
          border: 2px solid rgba(255, 215, 0, 0.5);
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.4),
            inset 0 0 20px rgba(255, 215, 0, 0.2);
        }
        
        .neon-claim-button:hover {
          transform: scale(1.05);
          border-color: rgba(255, 215, 0, 0.7);
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.6),
            inset 0 0 30px rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
