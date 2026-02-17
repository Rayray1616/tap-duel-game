export interface Achievement {
  id: string;
  category: string;
  title: string;
  description: string;
  target: number;
  reward_gems: number;
  event_key: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const achievements: Achievement[] = [
  // Duel Achievements
  {
    id: 'first_duel',
    category: 'Duels',
    title: 'First Blood',
    description: 'Play your first duel',
    target: 1,
    reward_gems: 10,
    event_key: 'duel_played',
    icon: '⚔️',
    rarity: 'common'
  },
  {
    id: 'duel_veteran',
    category: 'Duels',
    title: 'Duel Veteran',
    description: 'Play 50 duels',
    target: 50,
    reward_gems: 100,
    event_key: 'duel_played',
    icon: '⚔️',
    rarity: 'rare'
  },
  {
    id: 'duel_master',
    category: 'Duels',
    title: 'Duel Master',
    description: 'Play 200 duels',
    target: 200,
    reward_gems: 500,
    event_key: 'duel_played',
    icon: '⚔️',
    rarity: 'epic'
  },
  {
    id: 'first_win',
    category: 'Duels',
    title: 'First Victory',
    description: 'Win your first duel',
    target: 1,
    reward_gems: 15,
    event_key: 'duel_won',
    icon: '🏆',
    rarity: 'common'
  },
  {
    id: 'win_streak_5',
    category: 'Duels',
    title: 'Hot Streak',
    description: 'Win 5 duels in a row',
    target: 5,
    reward_gems: 50,
    event_key: 'duel_won',
    icon: '🔥',
    rarity: 'rare'
  },
  {
    id: 'win_streak_10',
    category: 'Duels',
    title: 'Unstoppable',
    description: 'Win 10 duels in a row',
    target: 10,
    reward_gems: 150,
    event_key: 'duel_won',
    icon: '🔥',
    rarity: 'epic'
  },
  {
    id: 'total_wins_10',
    category: 'Duels',
    title: 'Champion',
    description: 'Win 10 duels total',
    target: 10,
    reward_gems: 50,
    event_key: 'duel_won',
    icon: '🏆',
    rarity: 'common'
  },
  {
    id: 'total_wins_50',
    category: 'Duels',
    title: 'Arena Legend',
    description: 'Win 50 duels total',
    target: 50,
    reward_gems: 200,
    event_key: 'duel_won',
    icon: '🏆',
    rarity: 'rare'
  },
  {
    id: 'total_wins_100',
    category: 'Duels',
    title: 'Immortal',
    description: 'Win 100 duels total',
    target: 100,
    reward_gems: 500,
    event_key: 'duel_won',
    icon: '👑',
    rarity: 'epic'
  },

  // Tap Achievements
  {
    id: 'first_tap',
    category: 'Tapping',
    title: 'First Tap',
    description: 'Make your first tap',
    target: 1,
    reward_gems: 5,
    event_key: 'taps_reached',
    icon: '👆',
    rarity: 'common'
  },
  {
    id: 'tap_1000',
    category: 'Tapping',
    title: 'Tap Enthusiast',
    description: 'Reach 1,000 total taps',
    target: 1000,
    reward_gems: 50,
    event_key: 'taps_reached',
    icon: '👆',
    rarity: 'common'
  },
  {
    id: 'tap_5000',
    category: 'Tapping',
    title: 'Tap Master',
    description: 'Reach 5,000 total taps',
    target: 5000,
    reward_gems: 150,
    event_key: 'taps_reached',
    icon: '👆',
    rarity: 'rare'
  },
  {
    id: 'tap_10000',
    category: 'Tapping',
    title: 'Tap Legend',
    description: 'Reach 10,000 total taps',
    target: 10000,
    reward_gems: 300,
    event_key: 'taps_reached',
    icon: '👆',
    rarity: 'epic'
  },
  {
    id: 'tap_50000',
    category: 'Tapping',
    title: 'Tap God',
    description: 'Reach 50,000 total taps',
    target: 50000,
    reward_gems: 1000,
    event_key: 'taps_reached',
    icon: '👆',
    rarity: 'legendary'
  },

  // XP Achievements
  {
    id: 'first_xp',
    category: 'Progression',
    title: 'Experience Beginner',
    description: 'Gain 10 XP',
    target: 10,
    reward_gems: 10,
    event_key: 'xp_gain',
    icon: '⭐',
    rarity: 'common'
  },
  {
    id: 'xp_100',
    category: 'Progression',
    title: 'Experienced',
    description: 'Gain 100 XP',
    target: 100,
    reward_gems: 50,
    event_key: 'xp_gain',
    icon: '⭐',
    rarity: 'common'
  },
  {
    id: 'xp_500',
    category: 'Progression',
    title: 'Expert',
    description: 'Gain 500 XP',
    target: 500,
    reward_gems: 150,
    event_key: 'xp_gain',
    icon: '⭐',
    rarity: 'rare'
  },
  {
    id: 'xp_1000',
    category: 'Progression',
    title: 'Master',
    description: 'Gain 1,000 XP',
    target: 1000,
    reward_gems: 300,
    event_key: 'xp_gain',
    icon: '⭐',
    rarity: 'epic'
  },
  {
    id: 'xp_5000',
    category: 'Progression',
    title: 'Grandmaster',
    description: 'Gain 5,000 XP',
    target: 5000,
    reward_gems: 1000,
    event_key: 'xp_gain',
    icon: '⭐',
    rarity: 'legendary'
  },

  // Level Achievements
  {
    id: 'level_5',
    category: 'Progression',
    title: 'Rising Star',
    description: 'Reach level 5',
    target: 5,
    reward_gems: 25,
    event_key: 'level_up',
    icon: '📈',
    rarity: 'common'
  },
  {
    id: 'level_10',
    category: 'Progression',
    title: 'Skilled Fighter',
    description: 'Reach level 10',
    target: 10,
    reward_gems: 50,
    event_key: 'level_up',
    icon: '📈',
    rarity: 'common'
  },
  {
    id: 'level_25',
    category: 'Progression',
    title: 'Elite Warrior',
    description: 'Reach level 25',
    target: 25,
    reward_gems: 150,
    event_key: 'level_up',
    icon: '📈',
    rarity: 'rare'
  },
  {
    id: 'level_50',
    category: 'Progression',
    title: 'Master Fighter',
    description: 'Reach level 50',
    target: 50,
    reward_gems: 300,
    event_key: 'level_up',
    icon: '📈',
    rarity: 'epic'
  },
  {
    id: 'level_100',
    category: 'Progression',
    title: 'Legendary',
    description: 'Reach level 100',
    target: 100,
    reward_gems: 1000,
    event_key: 'level_up',
    icon: '👑',
    rarity: 'legendary'
  },

  // Gem Achievements
  {
    id: 'gems_100',
    category: 'Gems',
    title: 'Gem Collector',
    description: 'Earn 100 gems',
    target: 100,
    reward_gems: 25,
    event_key: 'gem_earned',
    icon: '💎',
    rarity: 'common'
  },
  {
    id: 'gems_500',
    category: 'Gems',
    title: 'Gem Hoarder',
    description: 'Earn 500 gems',
    target: 500,
    reward_gems: 100,
    event_key: 'gem_earned',
    icon: '💎',
    rarity: 'rare'
  },
  {
    id: 'gems_1000',
    category: 'Gems',
    title: 'Gem Tycoon',
    description: 'Earn 1,000 gems',
    target: 1000,
    reward_gems: 250,
    event_key: 'gem_earned',
    icon: '💎',
    rarity: 'epic'
  },
  {
    id: 'gems_5000',
    category: 'Gems',
    title: 'Gem Emperor',
    description: 'Earn 5,000 gems',
    target: 5000,
    reward_gems: 1000,
    event_key: 'gem_earned',
    icon: '💎',
    rarity: 'legendary'
  },

  // Social Achievements
  {
    id: 'first_referral',
    category: 'Social',
    title: 'Social Butterfly',
    description: 'Confirm your first referral',
    target: 1,
    reward_gems: 25,
    event_key: 'referral_confirmed',
    icon: '👥',
    rarity: 'common'
  },
  {
    id: 'referrals_5',
    category: 'Social',
    title: 'Network Builder',
    description: 'Confirm 5 referrals',
    target: 5,
    reward_gems: 150,
    event_key: 'referral_confirmed',
    icon: '👥',
    rarity: 'rare'
  },
  {
    id: 'referrals_10',
    category: 'Social',
    title: 'Community Leader',
    description: 'Confirm 10 referrals',
    target: 10,
    reward_gems: 300,
    event_key: 'referral_confirmed',
    icon: '👥',
    rarity: 'epic'
  },
  {
    id: 'referrals_25',
    category: 'Social',
    title: 'Influencer',
    description: 'Confirm 25 referrals',
    target: 25,
    reward_gems: 1000,
    event_key: 'referral_confirmed',
    icon: '👥',
    rarity: 'legendary'
  },

  // Daily Achievements
  {
    id: 'daily_streak_3',
    category: 'Daily',
    title: 'Consistent',
    description: 'Claim daily reward 3 days in a row',
    target: 3,
    reward_gems: 30,
    event_key: 'daily_claim',
    icon: '🎁',
    rarity: 'common'
  },
  {
    id: 'daily_streak_7',
    category: 'Daily',
    title: 'Dedicated',
    description: 'Claim daily reward 7 days in a row',
    target: 7,
    reward_gems: 100,
    event_key: 'daily_claim',
    icon: '🎁',
    rarity: 'rare'
  },
  {
    id: 'daily_streak_30',
    category: 'Daily',
    title: 'Loyal',
    description: 'Claim daily reward 30 days in a row',
    target: 30,
    reward_gems: 500,
    event_key: 'daily_claim',
    icon: '🎁',
    rarity: 'epic'
  },
  {
    id: 'daily_streak_100',
    category: 'Daily',
    title: 'Veteran',
    description: 'Claim daily reward 100 days in a row',
    target: 100,
    reward_gems: 2000,
    event_key: 'daily_claim',
    icon: '🎁',
    rarity: 'legendary'
  }
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(achievement => achievement.id === id);
};

export const getAchievementsByCategory = (category: string): Achievement[] => {
  return achievements.filter(achievement => achievement.category === category);
};

export const getAchievementsByEventKey = (eventKey: string): Achievement[] => {
  return achievements.filter(achievement => achievement.event_key === eventKey);
};

export const getAchievementCategories = (): string[] => {
  return [...new Set(achievements.map(achievement => achievement.category))];
};
