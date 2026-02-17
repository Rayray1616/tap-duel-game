import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeasonalEvents } from '@/hooks/useSeasonalEvents';
import { useGems } from '@/hooks/useGems';
import { useTelegram } from '@/telegram/useTelegram';
import { getEventIcon, getEventColor, getEventBorderColor, getEventRewardDescription, getEventProgressTarget, getEventProgressPercentage, isEventClaimable } from '@/data/seasonalEvents';

export function SeasonalEventsScreen() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { activeEvents, userEvents, activeMultipliers, loading, claiming, claimEventReward, getClaimableRewards, getActiveEventCount, getMultiplierDisplayText, hasActiveMultipliers, refresh } = useSeasonalEvents(user?.id?.toString());
  const { gemsInfo } = useGems(user?.id?.toString());
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardData, setRewardData] = useState<{ xp: number; gems: number; event_name: string } | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClaimReward = async (eventKey: string, eventName: string) => {
    try {
      const result = await claimEventReward(eventKey);
      
      if (result?.success) {
        setRewardData({
          xp: result.reward_xp,
          gems: result.reward_gems,
          event_name: eventName
        });
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 3000);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getEventStatus = (event: any) => {
    if (!event.is_active) {
      return { text: 'Ended', color: 'text-gray-400', bgColor: 'bg-gray-800' };
    }
    
    if (event.claimed) {
      return { text: 'Claimed', color: 'text-green-400', bgColor: 'bg-green-900' };
    }
    
    if (isEventClaimable(event)) {
      return { text: 'Ready to Claim!', color: 'text-yellow-400', bgColor: 'bg-yellow-900' };
    }
    
    return { text: 'In Progress', color: 'text-blue-400', bgColor: 'bg-blue-900' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-orange-400 text-2xl font-bold animate-pulse">LOADING EVENTS...</div>
      </div>
    );
  }

  const activeEventCount = getActiveEventCount();
  const claimableCount = getClaimableRewards();

  return (
    <div className="min-h-screen bg-black text-white p-4"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full animate-pulse"
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
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-orange-400">Seasonal Events</h1>
          <div className="text-orange-400">
            💎 {gemsInfo?.gems || 0}
          </div>
        </div>

        {/* Active Multipliers */}
        {hasActiveMultipliers() && (
          <div className="bg-gradient-to-r from-orange-900/30 to-blue-900/30 border border-orange-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-xl">🔥</div>
              <div className="text-lg font-bold text-orange-300">
                {getMultiplierDisplayText()}
              </div>
              <div className="text-xl">🔥</div>
            </div>
            <div className="text-center text-sm text-orange-400 mt-1">
              Active Bonuses
            </div>
          </div>
        )}

        {/* Event Status Summary */}
        <div className="flex space-x-2 mb-4">
          <div className="flex-1 bg-orange-900/30 border border-orange-500/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-300">{activeEventCount}</div>
            <div className="text-xs text-orange-400">Active Events</div>
          </div>
          <div className="flex-1 bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{claimableCount}</div>
            <div className="text-xs text-blue-400">Claimable</div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="relative z-10 space-y-4 max-h-[60vh] overflow-y-auto">
        {userEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎁</div>
            <div className="text-orange-400 text-xl">No Events Available</div>
            <div className="text-gray-400 text-sm mt-2">Check back soon for new seasonal events!</div>
          </div>
        ) : (
          userEvents.map((event) => {
            const status = getEventStatus(event);
            const progressTarget = getEventProgressTarget(event.event_key);
            const progressPercentage = getEventProgressPercentage(event.event_key, event.progress);
            const canClaim = isEventClaimable(event);
            
            return (
              <div
                key={event.id}
                className={`bg-gray-900/80 border rounded-lg p-4 backdrop-blur-sm transition-all duration-300 ${getEventBorderColor(event.event_key)}`}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getEventIcon(event.event_key)}</div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-white">{event.name}</div>
                      <div className="text-sm text-gray-400">{event.description}</div>
                      {event.is_active && (
                        <div className="text-xs text-orange-400 mt-1">
                          ⏰ {event.time_remaining}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.color}`}>
                    {status.text}
                  </div>
                </div>

                {/* Multipliers */}
                {(event.multiplier_xp > 1.0 || event.multiplier_gems > 1.0) && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {event.multiplier_xp > 1.0 && (
                        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded px-2 py-1 text-xs text-yellow-400">
                          ⚡ {event.multiplier_xp}x XP
                        </div>
                      )}
                      {event.multiplier_gems > 1.0 && (
                        <div className="bg-blue-900/30 border border-blue-500/50 rounded px-2 py-1 text-xs text-blue-400">
                          💎 {event.multiplier_gems}x Gems
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress: {event.progress} / {progressTarget}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getEventColor(event.event_key)} rounded-full transition-all duration-500`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Reward Preview */}
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Reward:</div>
                  <div className="text-sm font-bold text-orange-300">
                    {getEventRewardDescription(event.event_key, progressTarget)}
                  </div>
                </div>

                {/* Claim Button */}
                {canClaim && (
                  <div className="text-center">
                    <button
                      onClick={() => handleClaimReward(event.event_key, event.name)}
                      disabled={claiming === event.event_key}
                      className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:from-orange-600 hover:to-blue-600 transition-all animate-pulse disabled:opacity-50"
                    >
                      {claiming === event.event_key ? 'Claiming...' : 'Claim Reward'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reward Animation */}
      {showRewardAnimation && rewardData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold text-orange-400 mb-2">Event Reward!</div>
            <div className="text-xl text-orange-300 mb-2">{rewardData.event_name}</div>
            {rewardData.xp > 0 && (
              <div className="text-2xl text-yellow-400 mb-1">+{rewardData.xp} XP</div>
            )}
            {rewardData.gems > 0 && (
              <div className="text-2xl text-blue-400 mb-1">+{rewardData.gems} 💎</div>
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
        
        .neon-events-card {
          background: linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%);
          border: 2px solid rgba(255, 165, 0, 0.3);
          box-shadow: 
            0 0 20px rgba(255, 165, 0, 0.2),
            inset 0 0 20px rgba(255, 165, 0, 0.1);
        }
        
        .neon-events-card:hover {
          border-color: rgba(255, 165, 0, 0.5);
          box-shadow: 
            0 0 30px rgba(255, 165, 0, 0.3),
            inset 0 0 30px rgba(255, 165, 0, 0.2);
        }
        
        .neon-claim-button {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(0, 123, 255, 0.2) 100%);
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
