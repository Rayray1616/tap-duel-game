export interface SeasonalEvent {
  id: string;
  event_key: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  multiplier_xp: number;
  multiplier_gems: number;
  created_at: string;
}

export interface SeasonalEventParticipation {
  user_id: string;
  event_id: string;
  progress: number;
  claimed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonalEventWithParticipation extends SeasonalEvent {
  progress: number;
  claimed: boolean;
  is_active: boolean;
  time_remaining?: string;
}

export interface EventMultipliers {
  multiplied_xp: number;
  multiplied_gems: number;
  total_xp_multiplier: number;
  total_gems_multiplier: number;
}

export interface ActiveMultipliers {
  total_xp_multiplier: number;
  total_gems_multiplier: number;
  active_event_keys: string[];
}

export const getEventById = (events: SeasonalEvent[], id: string): SeasonalEvent | undefined => {
  return events.find(event => event.id === id);
};

export const getEventByKey = (events: SeasonalEvent[], event_key: string): SeasonalEvent | undefined => {
  return events.find(event => event.event_key === event_key);
};

export const getActiveEvents = (events: SeasonalEvent[]): SeasonalEvent[] => {
  const now = new Date();
  return events.filter(event => {
    const start = new Date(event.starts_at);
    const end = new Date(event.ends_at);
    return start <= now && end >= now;
  });
};

export const getTimeRemaining = (event: SeasonalEvent): string => {
  const now = new Date();
  const end = new Date(event.ends_at);
  const diffTime = end.getTime() - now.getTime();
  
  if (diffTime <= 0) return 'Ended';
  
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const getEventIcon = (event_key: string): string => {
  const icons: Record<string, string> = {
    'XP_WEEKEND': '⚡',
    'DOUBLE_GEMS_DAY': '💎',
    'MEGA_WEEKEND': '🔥',
    'NEW_PLAYER_BOOST': '🌟',
    'ANNIVERSARY_EVENT': '🎉',
    'BATTLE_ROYALE': '⚔️',
    'TOURNAMENT_SEASON': '🏆',
    'COLLABORATION_EVENT': '🤝',
    'HOLIDAY_SPECIAL': '🎄',
    'SUMMER_FESTIVAL': '☀️'
  };
  
  return icons[event_key] || '🎁';
};

export const getEventColor = (event_key: string): string => {
  const colors: Record<string, string> = {
    'XP_WEEKEND': 'from-yellow-500 to-orange-500',
    'DOUBLE_GEMS_DAY': 'from-blue-500 to-cyan-500',
    'MEGA_WEEKEND': 'from-red-500 to-pink-500',
    'NEW_PLAYER_BOOST': 'from-green-500 to-emerald-500',
    'ANNIVERSARY_EVENT': 'from-purple-500 to-indigo-500',
    'BATTLE_ROYALE': 'from-red-600 to-orange-600',
    'TOURNAMENT_SEASON': 'from-yellow-600 to-amber-600',
    'COLLABORATION_EVENT': 'from-teal-500 to-blue-500',
    'HOLIDAY_SPECIAL': 'from-red-500 to-green-500',
    'SUMMER_FESTIVAL': 'from-orange-500 to-yellow-500'
  };
  
  return colors[event_key] || 'from-gray-500 to-gray-600';
};

export const getEventBorderColor = (event_key: string): string => {
  const colors: Record<string, string> = {
    'XP_WEEKEND': 'border-yellow-500/50',
    'DOUBLE_GEMS_DAY': 'border-blue-500/50',
    'MEGA_WEEKEND': 'border-red-500/50',
    'NEW_PLAYER_BOOST': 'border-green-500/50',
    'ANNIVERSARY_EVENT': 'border-purple-500/50',
    'BATTLE_ROYALE': 'border-red-600/50',
    'TOURNAMENT_SEASON': 'border-yellow-600/50',
    'COLLABORATION_EVENT': 'border-teal-500/50',
    'HOLIDAY_SPECIAL': 'border-red-500/50',
    'SUMMER_FESTIVAL': 'border-orange-500/50'
  };
  
  return colors[event_key] || 'border-gray-500/50';
};

export const getEventRewardDescription = (event_key: string, progress: number): string => {
  const rewards: Record<string, (progress: number) => string> = {
    'XP_WEEKEND': (progress) => `${progress * 100} XP`,
    'DOUBLE_GEMS_DAY': (progress) => `${progress * 50} Gems`,
    'MEGA_WEEKEND': (progress) => `${progress * 150} XP + ${progress * 75} Gems`,
    'NEW_PLAYER_BOOST': (progress) => `${progress * 80} XP + ${progress * 40} Gems`,
    'ANNIVERSARY_EVENT': (progress) => `${progress * 200} XP + ${progress * 100} Gems`,
    'BATTLE_ROYALE': (progress) => `${progress * 120} XP + ${progress * 60} Gems`,
    'TOURNAMENT_SEASON': (progress) => `${progress * 180} XP + ${progress * 90} Gems`,
    'COLLABORATION_EVENT': (progress) => `${progress * 90} XP + ${progress * 45} Gems`,
    'HOLIDAY_SPECIAL': (progress) => `${progress * 110} XP + ${progress * 55} Gems`,
    'SUMMER_FESTIVAL': (progress) => `${progress * 130} XP + ${progress * 65} Gems`
  };
  
  const rewardFn = rewards[event_key];
  return rewardFn ? rewardFn(progress) : `${progress * 50} XP + ${progress * 25} Gems`;
};

export const getEventProgressTarget = (event_key: string): number => {
  const targets: Record<string, number> = {
    'XP_WEEKEND': 10,
    'DOUBLE_GEMS_DAY': 5,
    'MEGA_WEEKEND': 15,
    'NEW_PLAYER_BOOST': 8,
    'ANNIVERSARY_EVENT': 20,
    'BATTLE_ROYALE': 12,
    'TOURNAMENT_SEASON': 18,
    'COLLABORATION_EVENT': 9,
    'HOLIDAY_SPECIAL': 11,
    'SUMMER_FESTIVAL': 14
  };
  
  return targets[event_key] || 10;
};

export const getEventProgressPercentage = (event_key: string, progress: number): number => {
  const target = getEventProgressTarget(event_key);
  return Math.min(100, (progress / target) * 100);
};

export const isEventClaimable = (event: SeasonalEventWithParticipation): boolean => {
  if (!event.is_active || event.claimed) return false;
  const target = getEventProgressTarget(event.event_key);
  return event.progress >= target;
};

export const formatMultiplier = (multiplier: number): string => {
  return multiplier === 1.0 ? '1x' : `${multiplier}x`;
};

export const getMultiplierDisplayText = (multiplier_xp: number, multiplier_gems: number): string => {
  const parts: string[] = [];
  
  if (multiplier_xp > 1.0) {
    parts.push(`${formatMultiplier(multiplier_xp)} XP`);
  }
  
  if (multiplier_gems > 1.0) {
    parts.push(`${formatMultiplier(multiplier_gems)} Gems`);
  }
  
  if (parts.length === 0) {
    return 'No active bonuses';
  }
  
  return parts.join(' + ');
};
