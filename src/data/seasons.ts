export interface Season {
  id: string;
  season_key: string;
  name: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface BattlePassTrack {
  id: string;
  season_id: string;
  tier: number;
  track_type: 'free' | 'premium';
  required_xp: number;
  reward_type: 'gems' | 'cosmetic' | 'title' | 'emoji';
  reward_value: string;
  created_at: string;
}

export interface BattlePassTrackWithStatus extends BattlePassTrack {
  claimed: boolean;
  eligible: boolean;
  locked: boolean;
}

export interface BattlePassProgress {
  user_id: string;
  season_id: string;
  season_xp: number;
  current_tier: number;
  premium_unlocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface BattlePassClaim {
  user_id: string;
  season_id: string;
  tier: number;
  track_type: 'free' | 'premium';
  claimed_at: string;
}

export interface SeasonWithProgress extends Season {
  progress?: BattlePassProgress;
  tracks?: BattlePassTrackWithStatus[];
  days_remaining?: number;
  is_active?: boolean;
}

export const getSeasonById = (seasons: Season[], id: string): Season | undefined => {
  return seasons.find(season => season.id === id);
};

export const getSeasonByKey = (seasons: Season[], season_key: string): Season | undefined => {
  return seasons.find(season => season.season_key === season_key);
};

export const getActiveSeason = (seasons: Season[]): Season | undefined => {
  const now = new Date();
  return seasons.find(season => {
    const start = new Date(season.starts_at);
    const end = new Date(season.ends_at);
    return start <= now && end >= now;
  });
};

export const getDaysRemaining = (season: Season): number => {
  const now = new Date();
  const end = new Date(season.ends_at);
  const diffTime = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const getXPRequiredForTier = (tier: number): number => {
  // XP requirements for each tier (cumulative)
  const xpRequirements = [
    0,      // Tier 1
    100,    // Tier 2
    250,    // Tier 3
    500,    // Tier 4
    1000,   // Tier 5
    1500,   // Tier 6
    2500,   // Tier 7
    4000,   // Tier 8
    6000,   // Tier 9
    8500,   // Tier 10
    11500,  // Tier 11
    15000,  // Tier 12
    19000,  // Tier 13
    23500,  // Tier 14
    28500,  // Tier 15
    34000,  // Tier 16
    40000,  // Tier 17
    46500,  // Tier 18
    53500,  // Tier 19
    61000,  // Tier 20
    69000,  // Tier 21
    77500,  // Tier 22
    86500,  // Tier 23
    96000,  // Tier 24
    106000, // Tier 25
    116500, // Tier 26
    127500, // Tier 27
    139000, // Tier 28
    151000, // Tier 29
    163500  // Tier 30
  ];
  
  if (tier <= 0) return 0;
  if (tier > xpRequirements.length) return xpRequirements[xpRequirements.length - 1];
  
  return xpRequirements[tier - 1];
};

export const getTierFromXP = (xp: number): number => {
  const xpRequirements = [
    0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500,
    11500, 15000, 19000, 23500, 28500, 34000, 40000, 46500, 53500, 61000,
    69000, 77500, 86500, 96000, 106000, 116500, 127500, 139000, 151000, 163500
  ];
  
  for (let i = xpRequirements.length - 1; i >= 0; i--) {
    if (xp >= xpRequirements[i]) {
      return i + 1;
    }
  }
  
  return 1;
};

export const getXPProgressToNextTier = (currentXP: number): { current: number; required: number; percentage: number } => {
  const currentTier = getTierFromXP(currentXP);
  const currentTierXP = getXPRequiredForTier(currentTier);
  const nextTierXP = getXPRequiredForTier(currentTier + 1);
  
  const xpInCurrentTier = currentXP - currentTierXP;
  const xpRequiredForNextTier = nextTierXP - currentTierXP;
  
  return {
    current: xpInCurrentTier,
    required: xpRequiredForNextTier,
    percentage: xpRequiredForNextTier > 0 ? (xpInCurrentTier / xpRequiredForNextTier) * 100 : 100
  };
};

export const getCosmeticDisplayName = (cosmeticId: string): string => {
  const cosmetics: Record<string, string> = {
    'NEON_AURA': 'Neon Aura',
    'CYBER_FRAME': 'Cyber Frame',
    'PLASMA_EFFECT': 'Plasma Effect',
    'QUANTUM_AURA': 'Quantum Aura',
    'GALACTIC_FRAME': 'Galactic Frame',
    'OMEGA_AURA': 'Omega Aura',
    'COSMIC_FRAME': 'Cosmic Frame',
    'INFINITY_AURA': 'Infinity Aura'
  };
  
  return cosmetics[cosmeticId] || cosmeticId;
};

export const getTitleDisplayName = (titleId: string): string => {
  const titles: Record<string, string> = {
    'ROOKIE_DUELIST': 'Rookie Duelist',
    'NEON_WARRIOR': 'Neon Warrior',
    'ELITE_FIGHTER': 'Elite Fighter',
    'MASTER_DUELIST': 'Master Duelist',
    'LEGENDARY_CHAMPION': 'Legendary Champion',
    'IMMORTAL_DUELIST': 'Immortal Duelist',
    'TRANSCENDENT_MASTER': 'Transcendent Master'
  };
  
  return titles[titleId] || titleId;
};
