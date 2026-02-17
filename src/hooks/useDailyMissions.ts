import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { dailyMissions, getDailyMissionById } from '@/data/dailyMissions';

export interface MissionProgress {
  mission_id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  updated_at: string;
}

export interface MissionWithProgress {
  id: string;
  title: string;
  description: string;
  target: number;
  reward_gems: number;
  event_key: string;
  icon: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  progress_percentage: number;
  can_claim: boolean;
}

interface UpdateMissionResult {
  success: boolean;
  new_progress: number;
  completed: boolean;
  message: string;
}

interface ClaimMissionResult {
  success: boolean;
  reward_gems: number;
  message: string;
}

export function useDailyMissions(userId?: string) {
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getDailyMissions();
  }, [userId]);

  const getDailyMissions = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get user's mission progress
      const { data: progressData, error: progressError } = await supabase
        .from('daily_missions_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching mission progress:', progressError);
        setLoading(false);
        return;
      }

      // Combine mission data with progress
      const missionsWithProgress: MissionWithProgress[] = dailyMissions.map(mission => {
        const progress = progressData?.find(p => p.mission_id === mission.id);
        
        return {
          ...mission,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          claimed: progress?.claimed || false,
          progress_percentage: Math.min((progress?.progress || 0) / mission.target * 100, 100),
          can_claim: (progress?.completed || false) && !(progress?.claimed || false)
        };
      });

      setMissions(missionsWithProgress);
    } catch (error) {
      console.error('Error in getDailyMissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMissionProgress = async (eventKey: string, increment: number = 1): Promise<UpdateMissionResult[]> => {
    if (!userId || updating) return [];

    try {
      setUpdating(true);
      
      // Get missions that match this event key
      const relevantMissions = dailyMissions.filter(mission => mission.event_key === eventKey);
      
      const results: UpdateMissionResult[] = [];
      
      for (const mission of relevantMissions) {
        const { data, error } = await supabase.rpc('update_daily_mission_progress', {
          user_id: userId,
          mission_id: mission.id,
          increment: increment
        });

        if (error) {
          console.error(`Error updating mission ${mission.id}:`, error);
          results.push({
            success: false,
            new_progress: 0,
            completed: false,
            message: error.message
          });
        } else if (data && data.length > 0) {
          const result = data[0] as UpdateMissionResult;
          results.push(result);
        }
      }

      // Refresh missions data
      await getDailyMissions();
      
      return results;
    } catch (error) {
      console.error('Error in updateMissionProgress:', error);
      return [];
    } finally {
      setUpdating(false);
    }
  };

  const claimMission = async (missionId: string): Promise<ClaimMissionResult | null> => {
    if (!userId || claiming) return null;

    try {
      setClaiming(missionId);
      
      const { data, error } = await supabase.rpc('claim_daily_mission', {
        user_id: userId,
        mission_id: missionId
      });

      if (error) {
        console.error('Error claiming mission:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ClaimMissionResult;
        
        // Refresh missions data
        await getDailyMissions();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in claimMission:', error);
      return null;
    } finally {
      setClaiming(null);
    }
  };

  const resetDailyMissions = async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase.rpc('reset_daily_missions', {
        user_id: userId
      });

      if (error) {
        console.error('Error resetting daily missions:', error);
        return false;
      }

      // Refresh missions data
      await getDailyMissions();
      
      return true;
    } catch (error) {
      console.error('Error in resetDailyMissions:', error);
      return false;
    }
  };

  const getClaimableCount = (): number => {
    return missions.filter(mission => mission.can_claim).length;
  };

  const getCompletedCount = (): number => {
    return missions.filter(mission => mission.completed).length;
  };

  const getTotalProgress = (): number => {
    return missions.reduce((total, mission) => total + mission.progress_percentage, 0) / missions.length;
  };

  const refresh = () => {
    getDailyMissions();
  };

  return {
    missions,
    loading,
    updating,
    claiming,
    getDailyMissions,
    updateMissionProgress,
    claimMission,
    resetDailyMissions,
    getClaimableCount,
    getCompletedCount,
    getTotalProgress,
    refresh
  };
}
