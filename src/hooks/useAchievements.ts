import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { achievements, getAchievementById } from '@/data/achievements';

export interface AchievementProgress {
  achievement_id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  updated_at: string;
}

export interface AchievementWithProgress {
  id: string;
  category: string;
  title: string;
  description: string;
  target: number;
  reward_gems: number;
  event_key: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  completed: boolean;
  claimed: boolean;
  progress_percentage: number;
  can_claim: boolean;
}

interface UpdateAchievementResult {
  success: boolean;
  new_progress: number;
  completed: boolean;
  message: string;
}

interface ClaimAchievementResult {
  success: boolean;
  reward_gems: number;
  message: string;
}

export function useAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getAchievements();
  }, [userId]);

  const getAchievements = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get user's achievement progress
      const { data: progressData, error: progressError } = await supabase
        .from('achievements_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching achievement progress:', progressError);
        setLoading(false);
        return;
      }

      // Combine achievement data with progress
      const achievementsWithProgress: AchievementWithProgress[] = achievements.map(achievement => {
        const progress = progressData?.find(p => p.achievement_id === achievement.id);
        
        return {
          ...achievement,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          claimed: progress?.claimed || false,
          progress_percentage: Math.min((progress?.progress || 0) / achievement.target * 100, 100),
          can_claim: (progress?.completed || false) && !(progress?.claimed || false)
        };
      });

      setAchievements(achievementsWithProgress);
    } catch (error) {
      console.error('Error in getAchievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAchievementProgress = async (eventKey: string, increment: number = 1): Promise<UpdateAchievementResult[]> => {
    if (!userId || updating) return [];

    try {
      setUpdating(true);
      
      // Get achievements that match this event key
      const relevantAchievements = achievements.filter(achievement => achievement.event_key === eventKey);
      
      const results: UpdateAchievementResult[] = [];
      
      for (const achievement of relevantAchievements) {
        const { data, error } = await supabase.rpc('update_achievement_progress', {
          user_id: userId,
          achievement_id: achievement.id,
          increment: increment
        });

        if (error) {
          console.error(`Error updating achievement ${achievement.id}:`, error);
          results.push({
            success: false,
            new_progress: 0,
            completed: false,
            message: error.message
          });
        } else if (data && data.length > 0) {
          const result = data[0] as UpdateAchievementResult;
          results.push(result);
        }
      }

      // Refresh achievements data
      await getAchievements();
      
      return results;
    } catch (error) {
      console.error('Error in updateAchievementProgress:', error);
      return [];
    } finally {
      setUpdating(false);
    }
  };

  const claimAchievement = async (achievementId: string): Promise<ClaimAchievementResult | null> => {
    if (!userId || claiming) return null;

    try {
      setClaiming(achievementId);
      
      const { data, error } = await supabase.rpc('claim_achievement', {
        user_id: userId,
        achievement_id: achievementId
      });

      if (error) {
        console.error('Error claiming achievement:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ClaimAchievementResult;
        
        // Refresh achievements data
        await getAchievements();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in claimAchievement:', error);
      return null;
    } finally {
      setClaiming(null);
    }
  };

  const getClaimableCount = (): number => {
    return achievements.filter(achievement => achievement.can_claim).length;
  };

  const getCompletedCount = (): number => {
    return achievements.filter(achievement => achievement.completed).length;
  };

  const getTotalProgress = (): number => {
    return achievements.reduce((total, achievement) => total + achievement.progress_percentage, 0) / achievements.length;
  };

  const getAchievementsByCategory = (category: string): AchievementWithProgress[] => {
    return achievements.filter(achievement => achievement.category === category);
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRarityBgColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-400/20 border-gray-400/50';
      case 'rare':
        return 'bg-blue-400/20 border-blue-400/50';
      case 'epic':
        return 'bg-purple-400/20 border-purple-400/50';
      case 'legendary':
        return 'bg-yellow-400/20 border-yellow-400/50';
      default:
        return 'bg-gray-400/20 border-gray-400/50';
    }
  };

  const refresh = () => {
    getAchievements();
  };

  return {
    achievements,
    loading,
    updating,
    claiming,
    getAchievements,
    updateAchievementProgress,
    claimAchievement,
    getClaimableCount,
    getCompletedCount,
    getTotalProgress,
    getAchievementsByCategory,
    getRarityColor,
    getRarityBgColor,
    refresh
  };
}
