import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PlayerProgression {
  xp: number;
  level: number;
  xp_to_next_level: number;
  xp_progress: number;
}

interface XPResult {
  xp: number;
  level: number;
  leveled_up: boolean;
  xp_to_next_level: number;
  xp_progress: number;
}

export function usePlayerProgression(userId?: string) {
  const [progression, setProgression] = useState<PlayerProgression | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchProgression();
  }, [userId]);

  const fetchProgression = async () => {
    if (!userId) return;

    try {
      // Get current progression data
      const { data, error } = await supabase
        .from('player_progression')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching progression:', error);
        return;
      }

      if (data) {
        // Calculate XP to next level and progress
        const xpThreshold = (data.level * data.level) * 100;
        const prevThreshold = ((data.level - 1) * (data.level - 1)) * 100;
        const xpToNext = xpThreshold - data.xp;
        const xpProgress = ((data.xp - prevThreshold) * 100) / (xpThreshold - prevThreshold);

        setProgression({
          xp: data.xp,
          level: data.level,
          xp_to_next_level: xpToNext,
          xp_progress: Math.min(xpProgress, 100)
        });
      } else {
        // Create initial progression record
        await supabase
          .from('player_progression')
          .insert({
            user_id: userId,
            xp: 0,
            level: 1
          });

        setProgression({
          xp: 0,
          level: 1,
          xp_to_next_level: 100,
          xp_progress: 0
        });
      }
    } catch (error) {
      console.error('Error in fetchProgression:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async (amount: number): Promise<XPResult | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.rpc('award_xp', {
        user_id: userId,
        amount: amount
      });

      if (error) {
        console.error('Error awarding XP:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as XPResult;
        
        // Update local state
        setProgression({
          xp: result.xp,
          level: result.level,
          xp_to_next_level: result.xp_to_next_level,
          xp_progress: result.xp_progress
        });

        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return null;
    }
  };

  return {
    progression,
    loading,
    awardXP,
    refetch: fetchProgression
  };
}
