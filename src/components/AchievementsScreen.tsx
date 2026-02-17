import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from '@/hooks/useAchievements';
import { useGems } from '@/hooks/useGems';
import { useTelegram } from '@/telegram/useTelegram';
import { getAchievementCategories } from '@/data/achievements';

export function AchievementsScreen() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { achievements, loading, claiming, getClaimableCount, claimAchievement, getAchievementsByCategory, getRarityColor, getRarityBgColor, refresh } = useAchievements(user?.id?.toString());
  const { gemsInfo } = useGems(user?.id?.toString());
  const [claimingAchievement, setClaimingAchievement] = useState<string | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClaimAchievement = async (achievementId: string, rewardGems: number) => {
    try {
      setClaimingAchievement(achievementId);
      const result = await claimAchievement(achievementId);
      
      if (result?.success) {
        setRewardAmount(result.reward_gems);
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 3000);
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
    } finally {
      setClaimingAchievement(null);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (percentage >= 75) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getAchievementStatusColor = (achievement: any): string => {
    if (achievement.claimed) return 'text-gray-500';
    if (achievement.completed) return 'text-purple-400';
    if (achievement.progress_percentage >= 50) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  const categories = ['All', ...getAchievementCategories()];
  
  const filteredAchievements = selectedCategory === 'All' 
    ? achievements 
    : getAchievementsByCategory(selectedCategory);

  const groupedAchievements = selectedCategory === 'All' 
    ? categories.slice(1).reduce((acc, category) => {
        acc[category] = getAchievementsByCategory(category);
        return acc;
      }, {} as Record<string, any[]>)
    : { [selectedCategory]: filteredAchievements };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-purple-400 text-2xl font-bold animate-pulse">LOADING ACHIEVEMENTS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-yellow-900/20"></div>
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
          <h1 className="text-2xl font-bold text-purple-400">Achievements</h1>
          <div className="text-purple-400">
            💎 {gemsInfo?.gems || 0}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3 text-center">
            <div className="text-purple-400 text-2xl font-bold">{getClaimableCount()}</div>
            <div className="text-purple-300 text-xs">Claimable</div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 text-center">
            <div className="text-yellow-400 text-2xl font-bold">
              {achievements.filter(a => a.completed).length}/{achievements.length}
            </div>
            <div className="text-yellow-300 text-xs">Completed</div>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-3 text-center">
            <div className="text-cyan-400 text-2xl font-bold">
              {Math.round(achievements.reduce((total, a) => total + a.progress_percentage, 0) / achievements.length)}%
            </div>
            <div className="text-cyan-300 text-xs">Progress</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements List */}
      <div className="relative z-10 space-y-6 max-h-[60vh] overflow-y-auto">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category}>
            {selectedCategory === 'All' && (
              <h2 className="text-xl font-bold text-purple-400 mb-3">{category}</h2>
            )}
            <div className="space-y-4">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`bg-gray-900/80 border rounded-lg p-4 backdrop-blur-sm transition-all duration-300 ${getRarityBgColor(achievement.rarity)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <h3 className={`font-bold text-lg ${getAchievementStatusColor(achievement)}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{achievement.description}</p>
                        <div className={`text-xs mt-1 font-bold ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">+{achievement.reward_gems} 💎</div>
                      <div className="text-gray-400 text-xs">
                        {achievement.progress}/{achievement.target}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(achievement.progress_percentage)}`}
                        style={{ width: `${achievement.progress_percentage}%` }}
                      >
                        <div className="h-full bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-1">
                      {Math.round(achievement.progress_percentage)}% Complete
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div className="flex justify-center">
                    {achievement.claimed ? (
                      <div className="px-6 py-2 bg-gray-700 text-gray-500 rounded-full font-bold text-sm">
                        ✅ Claimed
                      </div>
                    ) : achievement.completed ? (
                      <button
                        onClick={() => handleClaimAchievement(achievement.id, achievement.reward_gems)}
                        disabled={claimingAchievement === achievement.id}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                      >
                        {claimingAchievement === achievement.id ? 'Claiming...' : 'Claim Reward'}
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
          </div>
        ))}
      </div>

      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">💎</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">+{rewardAmount} Gems!</div>
            <div className="text-purple-300">Achievement Unlocked!</div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .neon-achievement-card {
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border: 2px solid rgba(128, 0, 255, 0.3);
          box-shadow: 
            0 0 20px rgba(128, 0, 255, 0.2),
            inset 0 0 20px rgba(128, 0, 255, 0.1);
        }
        
        .neon-achievement-card:hover {
          border-color: rgba(128, 0, 255, 0.5);
          box-shadow: 
            0 0 30px rgba(128, 0, 255, 0.3),
            inset 0 0 30px rgba(128, 0, 255, 0.2);
        }
        
        .neon-claim-button {
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%);
          border: 2px solid rgba(128, 0, 255, 0.5);
          box-shadow: 
            0 0 20px rgba(128, 0, 255, 0.4),
            inset 0 0 20px rgba(128, 0, 255, 0.2);
        }
        
        .neon-claim-button:hover {
          transform: scale(1.05);
          border-color: rgba(128, 0, 255, 0.7);
          box-shadow: 
            0 0 30px rgba(128, 0, 255, 0.6),
            inset 0 0 30px rgba(128, 0, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
