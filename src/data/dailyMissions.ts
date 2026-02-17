export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  reward_gems: number;
  event_key: string;
  icon: string;
}

export const dailyMissions: DailyMission[] = [
  {
    id: 'daily_duel_played',
    title: 'Daily Duelist',
    description: 'Play 1 duel today',
    target: 1,
    reward_gems: 10,
    event_key: 'duel_played',
    icon: '⚔️'
  },
  {
    id: 'daily_duel_won',
    title: 'Victory Hunter',
    description: 'Win 1 duel today',
    target: 1,
    reward_gems: 15,
    event_key: 'duel_won',
    icon: '🏆'
  },
  {
    id: 'daily_duels_played',
    title: 'Battle Enthusiast',
    description: 'Play 3 duels today',
    target: 3,
    reward_gems: 20,
    event_key: 'duel_played',
    icon: '⚔️'
  },
  {
    id: 'daily_duels_won',
    title: 'Champion',
    description: 'Win 2 duels today',
    target: 2,
    reward_gems: 25,
    event_key: 'duel_won',
    icon: '🏆'
  },
  {
    id: 'daily_taps_reached',
    title: 'Tap Master',
    description: 'Reach 500 total taps today',
    target: 500,
    reward_gems: 15,
    event_key: 'taps_reached',
    icon: '👆'
  },
  {
    id: 'daily_xp_gained',
    title: 'Experience Seeker',
    description: 'Gain 100 XP today',
    target: 100,
    reward_gems: 20,
    event_key: 'xp_gain',
    icon: '⭐'
  },
  {
    id: 'daily_referral_confirmed',
    title: 'Social Butterfly',
    description: 'Confirm 1 referral today',
    target: 1,
    reward_gems: 30,
    event_key: 'referral_confirmed',
    icon: '👥'
  },
  {
    id: 'daily_gem_earned',
    title: 'Gem Collector',
    description: 'Earn 50 gems today',
    target: 50,
    reward_gems: 10,
    event_key: 'gem_earned',
    icon: '💎'
  },
  {
    id: 'daily_level_up',
    title: 'Level Up',
    description: 'Level up once today',
    target: 1,
    reward_gems: 25,
    event_key: 'level_up',
    icon: '📈'
  },
  {
    id: 'daily_daily_claim',
    title: 'Daily Routine',
    description: 'Claim daily reward today',
    target: 1,
    reward_gems: 5,
    event_key: 'daily_claim',
    icon: '🎁'
  }
];

export const getDailyMissionById = (id: string): DailyMission | undefined => {
  return dailyMissions.find(mission => mission.id === id);
};

export const getDailyMissionsByEventKey = (eventKey: string): DailyMission[] => {
  return dailyMissions.filter(mission => mission.event_key === eventKey);
};
