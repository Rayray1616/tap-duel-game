import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SeasonalEvent, SeasonalEventWithParticipation, EventMultipliers, ActiveMultipliers, getActiveEvents, getTimeRemaining, isEventClaimable } from '@/data/seasonalEvents';

interface UpdateEventProgressResult {
  success: boolean;
  new_progress: number;
  message: string;
}

interface ClaimEventRewardResult {
  success: boolean;
  reward_xp: number;
  reward_gems: number;
  message: string;
}

export function useSeasonalEvents(userId?: string) {
  const [activeEvents, setActiveEvents] = useState<SeasonalEvent[]>([]);
  const [userEvents, setUserEvents] = useState<SeasonalEventWithParticipation[]>([]);
  const [activeMultipliers, setActiveMultipliers] = useState<ActiveMultipliers>({
    total_xp_multiplier: 1.0,
    total_gems_multiplier: 1.0,
    active_event_keys: []
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchEventData();
  }, [userId]);

  const fetchEventData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get active events
      const { data: activeEventsData, error: activeEventsError } = await supabase.rpc('get_active_events');

      if (activeEventsError) {
        console.error('Error fetching active events:', activeEventsError);
      } else {
        const events = activeEventsData || [];
        setActiveEvents(events);
      }

      // Get user event participation
      const { data: userEventsData, error: userEventsError } = await supabase.rpc('get_user_event_participation', {
        user_id: userId
      });

      if (userEventsError) {
        console.error('Error fetching user event participation:', userEventsError);
      } else {
        const events = (userEventsData || []).map((event: any) => ({
          ...event,
          time_remaining: event.time_remaining ? `${event.time_remaining.days || 0}d ${event.time_remaining.hours || 0}h` : 'Ended'
        }));
        setUserEvents(events);
      }

      // Get active multipliers
      const { data: multipliersData, error: multipliersError } = await supabase.rpc('get_active_multipliers', {
        user_id: userId
      });

      if (multipliersError) {
        console.error('Error fetching active multipliers:', multipliersError);
      } else if (multipliersData && multipliersData.length > 0) {
        setActiveMultipliers(multipliersData[0]);
      }
    } catch (error) {
      console.error('Error in fetchEventData:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyEventMultipliers = async (baseXP: number, baseGems: number): Promise<EventMultipliers | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.rpc('apply_event_multipliers', {
        user_id: userId,
        base_xp: baseXP,
        base_gems: baseGems
      });

      if (error) {
        console.error('Error applying event multipliers:', error);
        return null;
      }

      if (data && data.length > 0) {
        return data[0] as EventMultipliers;
      }

      return null;
    } catch (error) {
      console.error('Error in applyEventMultipliers:', error);
      return null;
    }
  };

  const updateEventProgress = async (eventKey: string, increment: number): Promise<UpdateEventProgressResult | null> => {
    if (!userId || updating) return null;

    try {
      setUpdating(true);
      
      const { data, error } = await supabase.rpc('update_event_progress', {
        user_id: userId,
        event_key: eventKey,
        increment: increment
      });

      if (error) {
        console.error('Error updating event progress:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as UpdateEventProgressResult;
        
        // Refresh user events
        await fetchEventData();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in updateEventProgress:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const claimEventReward = async (eventKey: string): Promise<ClaimEventRewardResult | null> => {
    if (!userId || claiming) return null;

    try {
      setClaiming(eventKey);
      
      const { data, error } = await supabase.rpc('claim_event_reward', {
        user_id: userId,
        event_key: eventKey
      });

      if (error) {
        console.error('Error claiming event reward:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ClaimEventRewardResult;
        
        // Refresh user events
        await fetchEventData();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in claimEventReward:', error);
      return null;
    } finally {
      setClaiming(null);
    }
  };

  const getClaimableRewards = (): number => {
    return userEvents.filter(event => isEventClaimable(event)).length;
  };

  const getActiveEventCount = (): number => {
    return activeEvents.length;
  };

  const getEventByEventKey = (eventKey: string): SeasonalEventWithParticipation | undefined => {
    return userEvents.find(event => event.event_key === eventKey);
  };

  const getMultiplierDisplayText = (): string => {
    const parts: string[] = [];
    
    if (activeMultipliers.total_xp_multiplier > 1.0) {
      parts.push(`${activeMultipliers.total_xp_multiplier}x XP`);
    }
    
    if (activeMultipliers.total_gems_multiplier > 1.0) {
      parts.push(`${activeMultipliers.total_gems_multiplier}x Gems`);
    }
    
    if (parts.length === 0) {
      return 'No active bonuses';
    }
    
    return parts.join(' + ');
  };

  const hasActiveMultipliers = (): boolean => {
    return activeMultipliers.total_xp_multiplier > 1.0 || activeMultipliers.total_gems_multiplier > 1.0;
  };

  const refresh = () => {
    fetchEventData();
  };

  return {
    activeEvents,
    userEvents,
    activeMultipliers,
    loading,
    updating,
    claiming,
    fetchEventData,
    applyEventMultipliers,
    updateEventProgress,
    claimEventReward,
    getClaimableRewards,
    getActiveEventCount,
    getEventByEventKey,
    getMultiplierDisplayText,
    hasActiveMultipliers,
    refresh
  };
}
