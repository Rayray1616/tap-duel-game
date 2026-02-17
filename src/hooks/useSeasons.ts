import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Season, BattlePassProgress, BattlePassTrackWithStatus, SeasonWithProgress, getActiveSeason, getDaysRemaining } from '@/data/seasons';

interface AddBattlePassXPResult {
  success: boolean;
  new_season_xp: number;
  new_tier: number;
  tier_up: boolean;
  message: string;
}

interface UnlockPremiumResult {
  success: boolean;
  message: string;
}

interface ClaimRewardResult {
  success: boolean;
  reward_type: string;
  reward_value: string;
  message: string;
}

export function useSeasons(userId?: string) {
  const [currentSeason, setCurrentSeason] = useState<SeasonWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getCurrentSeason();
  }, [userId]);

  const getCurrentSeason = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get current season
      const { data: seasonData, error: seasonError } = await supabase.rpc('get_current_season');

      if (seasonError) {
        console.error('Error fetching current season:', seasonError);
        setLoading(false);
        return;
      }

      if (!seasonData || seasonData.length === 0) {
        console.log('No active season found');
        setLoading(false);
        return;
      }

      const season = seasonData[0] as Season;
      
      // Get or create battle pass progress
      const { data: progressData, error: progressError } = await supabase.rpc('get_or_create_battle_pass_progress', {
        user_id: userId,
        season_id: season.id
      });

      if (progressError) {
        console.error('Error fetching battle pass progress:', progressError);
        setLoading(false);
        return;
      }

      const progress = progressData[0] as BattlePassProgress;
      
      // Get battle pass tracks with claim status
      const { data: tracksData, error: tracksError } = await supabase.rpc('get_battle_pass_tracks', {
        user_id: userId,
        season_id: season.id
      });

      if (tracksError) {
        console.error('Error fetching battle pass tracks:', tracksError);
        setLoading(false);
        return;
      }

      const tracks = tracksData as BattlePassTrackWithStatus[];
      
      // Combine season data with progress and tracks
      const seasonWithProgress: SeasonWithProgress = {
        ...season,
        progress,
        tracks,
        days_remaining: getDaysRemaining(season),
        is_active: true
      };

      setCurrentSeason(seasonWithProgress);
    } catch (error) {
      console.error('Error in getCurrentSeason:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBattlePassXP = async (xpAmount: number): Promise<AddBattlePassXPResult | null> => {
    if (!userId || !currentSeason || updating) return null;

    try {
      setUpdating(true);
      
      const { data, error } = await supabase.rpc('add_battle_pass_xp', {
        user_id: userId,
        season_id: currentSeason.id,
        xp_amount: xpAmount
      });

      if (error) {
        console.error('Error adding battle pass XP:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as AddBattlePassXPResult;
        
        // Refresh season data
        await getCurrentSeason();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in addBattlePassXP:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const unlockPremiumBattlePass = async (): Promise<UnlockPremiumResult | null> => {
    if (!userId || !currentSeason) return null;

    try {
      const { data, error } = await supabase.rpc('unlock_premium_battle_pass', {
        user_id: userId,
        season_id: currentSeason.id
      });

      if (error) {
        console.error('Error unlocking premium battle pass:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as UnlockPremiumResult;
        
        // Refresh season data
        await getCurrentSeason();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in unlockPremiumBattlePass:', error);
      return null;
    }
  };

  const claimBattlePassReward = async (tier: number, trackType: 'free' | 'premium'): Promise<ClaimRewardResult | null> => {
    if (!userId || !currentSeason || claiming) return null;

    try {
      setClaiming(`${tier}-${trackType}`);
      
      const { data, error } = await supabase.rpc('claim_battle_pass_reward', {
        user_id: userId,
        season_id: currentSeason.id,
        tier: tier,
        track_type: trackType
      });

      if (error) {
        console.error('Error claiming battle pass reward:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ClaimRewardResult;
        
        // Refresh season data
        await getCurrentSeason();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in claimBattlePassReward:', error);
      return null;
    } finally {
      setClaiming(null);
    }
  };

  const getClaimableRewards = (): number => {
    if (!currentSeason?.tracks) return 0;
    
    return currentSeason.tracks.filter(track => 
      track.eligible && !track.claimed && !track.locked
    ).length;
  };

  const getXPProgressToNextTier = () => {
    if (!currentSeason?.progress) return { current: 0, required: 0, percentage: 0 };
    
    const currentXP = currentSeason.progress.season_xp;
    const currentTier = currentSeason.progress.current_tier;
    
    // Get XP required for next tier
    const nextTierXP = currentSeason.tracks?.find(track => 
      track.tier === currentTier + 1 && track.track_type === 'free'
    )?.required_xp || 0;
    
    const currentTierXP = currentSeason.tracks?.find(track => 
      track.tier === currentTier && track.track_type === 'free'
    )?.required_xp || 0;
    
    const xpInCurrentTier = currentXP - currentTierXP;
    const xpRequiredForNextTier = nextTierXP - currentTierXP;
    
    return {
      current: Math.max(0, xpInCurrentTier),
      required: Math.max(0, xpRequiredForNextTier),
      percentage: xpRequiredForNextTier > 0 ? (xpInCurrentTier / xpRequiredForNextTier) * 100 : 100
    };
  };

  const getTierProgress = () => {
    if (!currentSeason?.progress) return { current: 0, max: 30 };
    
    return {
      current: currentSeason.progress.current_tier,
      max: 30 // Maximum tier
    };
  };

  const refresh = () => {
    getCurrentSeason();
  };

  return {
    currentSeason,
    loading,
    updating,
    claiming,
    getCurrentSeason,
    addBattlePassXP,
    unlockPremiumBattlePass,
    claimBattlePassReward,
    getClaimableRewards,
    getXPProgressToNextTier,
    getTierProgress,
    refresh
  };
}
