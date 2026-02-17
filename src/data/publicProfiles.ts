export interface PublicProfile {
  user_id: string;
  username: string;
  bio: string | null;
  country_code: string | null;
  avatar_emoji: string | null;
  is_public: boolean;
  equipped_aura: string;
  equipped_frame: string;
  equipped_emoji: string;
  equipped_title: string;
  total_duels: number;
  wins: number;
  losses: number;
  best_streak: number;
  level: number;
  total_xp: number;
  current_season_tier: number;
  current_season_xp: number;
  total_achievements_unlocked: number;
  total_cosmetics_owned: number;
  created_at: string;
  updated_at: string;
}

export interface MyPublicProfile {
  user_id: string;
  username: string;
  bio: string | null;
  country_code: string | null;
  avatar_emoji: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileSearchResult {
  user_id: string;
  username: string;
  bio: string | null;
  country_code: string | null;
  avatar_emoji: string | null;
  is_public: boolean;
  level: number;
  total_duels: number;
  wins: number;
  created_at: string;
}

export interface UpdateProfilePayload {
  username: string;
  bio?: string;
  country_code?: string;
  avatar_emoji?: string;
  is_public?: boolean;
}

export interface ProfileStats {
  total_duels: number;
  wins: number;
  losses: number;
  win_rate: number;
  best_streak: number;
  level: number;
  total_xp: number;
  current_season_tier: number;
  current_season_xp: number;
  total_achievements_unlocked: number;
  total_cosmetics_owned: number;
}

export const getWinRate = (wins: number, losses: number): number => {
  const total = wins + losses;
  return total > 0 ? Math.round((wins / total) * 100) : 0;
};

export const getProfileStats = (profile: PublicProfile): ProfileStats => {
  return {
    total_duels: profile.total_duels,
    wins: profile.wins,
    losses: profile.losses,
    win_rate: getWinRate(profile.wins, profile.losses),
    best_streak: profile.best_streak,
    level: profile.level,
    total_xp: profile.total_xp,
    current_season_tier: profile.current_season_tier,
    current_season_xp: profile.current_season_xp,
    total_achievements_unlocked: profile.total_achievements_unlocked,
    total_cosmetics_owned: profile.total_cosmetics_owned
  };
};

export const getCountryFlag = (countryCode: string | null): string => {
  if (!countryCode) return '';
  
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'NL': '🇳🇱',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'DK': '🇩🇰',
    'FI': '🇫🇮',
    'PL': '🇵🇱',
    'RU': '🇷🇺',
    'UA': '🇺🇦',
    'BR': '🇧🇷',
    'AR': '🇦🇷',
    'MX': '🇲🇽',
    'JP': '🇯🇵',
    'KR': '🇰🇷',
    'CN': '🇨🇳',
    'IN': '🇮🇳',
    'EG': '🇪🇬',
    'ZA': '🇿🇦',
    'NG': '🇳🇬',
    'KE': '🇰🇪',
    'TR': '🇹🇷',
    'SA': '🇸🇦',
    'AE': '🇦🇪',
    'IL': '🇮🇱',
    'PK': '🇵🇰',
    'BD': '🇧🇩',
    'LK': '🇱🇰',
    'NP': '🇳🇵',
    'MM': '🇲🇲',
    'KH': '🇰🇭',
    'LA': '🇱🇦',
    'BT': '🇧🇹',
    'MV': '🇲🇻',
    'NZ': '🇳🇿',
    'FJ': '🇫🇯',
    'PG': '🇵🇬',
    'SB': '🇸🇧',
    'VU': '🇻🇺',
    'NC': '🇳🇨',
    'PF': '🇵🇫',
    'WS': '🇼🇸',
    'TO': '🇹🇴',
    'KI': '🇰🇮',
    'TV': '🇹🇻',
    'NR': '🇳🇷',
    'PW': '🇵🇼',
    'FM': '🇫🇲',
    'MH': '🇲🇭',
    'GU': '🇬🇺',
    'MP': '🇲🇵',
    'VI': '🇻🇮',
    'PR': '🇵🇷',
    'DO': '🇩🇴',
    'HT': '🇭🇹',
    'JM': '🇯🇲',
    'TT': '🇹🇹',
    'BB': '🇧🇧',
    'GD': '🇬🇩',
    'LC': '🇱🇨',
    'VC': '🇻🇨',
    'AG': '🇦🇬',
    'DM': '🇩🇲',
    'KN': '🇰🇳',
    'AW': '🇦🇼',
    'CU': '🇨🇺',
    'CR': '🇨🇷',
    'PA': '🇵🇦',
    'CO': '🇨🇴',
    'VE': '🇻🇪',
    'EC': '🇪🇨',
    'PE': '🇵🇪',
    'PY': '🇵🇾',
    'UY': '🇺🇾',
    'GY': '🇬🇾',
    'SR': '🇸🇷',
    'GF': '🇬🇫',
    'CL': '🇨🇱',
    'GL': '🇬🇱',
    'IS': '🇮🇸',
    'IE': '🇮🇪',
    'PT': '🇵🇹',
    'GR': '🇬🇷',
    'CY': '🇨🇾',
    'MT': '🇲🇹',
    'AL': '🇦🇱',
    'MK': '🇲🇰',
    'ME': '🇲🇪',
    'RS': '🇷🇸',
    'BA': '🇧🇦',
    'HR': '🇭🇷',
    'SI': '🇸🇮',
    'SK': '🇸🇰',
    'CZ': '🇨🇿',
    'HU': '🇭🇺',
    'RO': '🇷🇴',
    'BG': '🇧🇬',
    'MD': '🇲🇩',
    'BY': '🇧🇾',
    'LT': '🇱🇹',
    'LV': '🇱🇻',
    'EE': '🇪🇪',
    'AM': '🇦🇲',
    'AZ': '🇦🇿',
    'GE': '🇬🇪',
    'KZ': '🇰🇿',
    'KG': '🇰🇬',
    'UZ': '🇺🇿',
    'TJ': '🇹🇯',
    'TM': '🇹🇲',
    'AF': '🇦🇫',
    'TL': '🇹🇱',
    'MN': '🇲🇳',
    'KP': '🇰🇵',
    'MO': '🇲🇴',
    'HK': '🇭🇰',
    'TW': '🇹🇼'
  };
  
  return flags[countryCode.toUpperCase()] || '';
};

export const getCountryName = (countryCode: string | null): string => {
  if (!countryCode) return '';
  
  const names: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'RU': 'Russia',
    'UA': 'Ukraine',
    'BR': 'Brazil',
    'AR': 'Argentina',
    'MX': 'Mexico',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'TR': 'Turkey',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'IL': 'Israel',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'MM': 'Myanmar',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'BT': 'Bhutan',
    'MV': 'Maldives',
    'NZ': 'New Zealand',
    'FJ': 'Fiji',
    'PG': 'Papua New Guinea',
    'SB': 'Solomon Islands',
    'VU': 'Vanuatu',
    'NC': 'New Caledonia',
    'PF': 'French Polynesia',
    'WS': 'Samoa',
    'TO': 'Tonga',
    'KI': 'Kiribati',
    'TV': 'Tuvalu',
    'NR': 'Nauru',
    'PW': 'Palau',
    'FM': 'Micronesia',
    'MH': 'Marshall Islands',
    'GU': 'Guam',
    'MP': 'Northern Mariana Islands',
    'VI': 'Virgin Islands',
    'PR': 'Puerto Rico',
    'DO': 'Dominican Republic',
    'HT': 'Haiti',
    'JM': 'Jamaica',
    'TT': 'Trinidad and Tobago',
    'BB': 'Barbados',
    'GD': 'Grenada',
    'LC': 'St. Lucia',
    'VC': 'St. Vincent',
    'AG': 'Antigua',
    'DM': 'Dominica',
    'KN': 'St. Kitts',
    'AW': 'Aruba',
    'CU': 'Cuba',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'PE': 'Peru',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'GF': 'French Guiana',
    'CL': 'Chile',
    'GL': 'Greenland',
    'IS': 'Iceland',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'CY': 'Cyprus',
    'MT': 'Malta',
    'AL': 'Albania',
    'MK': 'North Macedonia',
    'ME': 'Montenegro',
    'RS': 'Serbia',
    'BA': 'Bosnia',
    'HR': 'Croatia',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'MD': 'Moldova',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'AM': 'Armenia',
    'AZ': 'Azerbaijan',
    'GE': 'Georgia',
    'KZ': 'Kazakhstan',
    'KG': 'Kyrgyzstan',
    'UZ': 'Uzbekistan',
    'TJ': 'Tajikistan',
    'TM': 'Turkmenistan',
    'AF': 'Afghanistan',
    'TL': 'Timor-Leste',
    'MN': 'Mongolia',
    'KP': 'North Korea',
    'MO': 'Macau',
    'HK': 'Hong Kong',
    'TW': 'Taiwan'
  };
  
  return names[countryCode.toUpperCase()] || countryCode;
};

export const getLevelColor = (level: number): string => {
  if (level >= 100) return 'text-yellow-400';
  if (level >= 50) return 'text-purple-400';
  if (level >= 25) return 'text-blue-400';
  if (level >= 10) return 'text-green-400';
  return 'text-gray-400';
};

export const getLevelBgColor = (level: number): string => {
  if (level >= 100) return 'bg-yellow-900/30';
  if (level >= 50) return 'bg-purple-900/30';
  if (level >= 25) return 'bg-blue-900/30';
  if (level >= 10) return 'bg-green-900/30';
  return 'bg-gray-900/30';
};

export const getSeasonTierColor = (tier: number): string => {
  if (tier >= 50) return 'text-yellow-400';
  if (tier >= 40) return 'text-purple-400';
  if (tier >= 30) return 'text-blue-400';
  if (tier >= 20) return 'text-green-400';
  if (tier >= 10) return 'text-orange-400';
  return 'text-gray-400';
};

export const getSeasonTierBgColor = (tier: number): string => {
  if (tier >= 50) return 'bg-yellow-900/30';
  if (tier >= 40) return 'bg-purple-900/30';
  if (tier >= 30) return 'bg-blue-900/30';
  if (tier >= 20) return 'bg-green-900/30';
  if (tier >= 10) return 'bg-orange-900/30';
  return 'bg-gray-900/30';
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getProfileCompletionPercentage = (profile: MyPublicProfile): number => {
  let completed = 0;
  const total = 5;
  
  if (profile.username) completed++;
  if (profile.bio) completed++;
  if (profile.country_code) completed++;
  if (profile.avatar_emoji) completed++;
  if (profile.is_public !== undefined) completed++;
  
  return Math.round((completed / total) * 100);
};

export const isValidUsername = (username: string): boolean => {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const isValidCountryCode = (countryCode: string): boolean => {
  // Should be 2 letters
  const countryCodeRegex = /^[A-Z]{2}$/;
  return countryCodeRegex.test(countryCode.toUpperCase());
};

export const isValidBio = (bio: string): boolean => {
  // Bio should be max 200 characters
  return bio.length <= 200;
};

export const isValidAvatarEmoji = (emoji: string): boolean => {
  // Should be a single emoji (basic validation)
  const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
  return emojiRegex.test(emoji) && emoji.length <= 10;
};

export const getCosmeticDisplayName = (cosmetic_key: string): string => {
  const displayNames: Record<string, string> = {
    // Auras
    'NEON_AURA': 'Neon Aura',
    'CYBER_AURA': 'Cyber Aura',
    'PLASMA_AURA': 'Plasma Aura',
    'QUANTUM_AURA': 'Quantum Aura',
    'GALACTIC_AURA': 'Galactic Aura',
    'OMEGA_AURA': 'Omega Aura',
    'INFINITY_AURA': 'Infinity Aura',
    
    // Frames
    'NEON_FRAME': 'Neon Frame',
    'CYBER_FRAME': 'Cyber Frame',
    'PLASMA_FRAME': 'Plasma Frame',
    'QUANTUM_FRAME': 'Quantum Frame',
    'GALACTIC_FRAME': 'Galactic Frame',
    'OMEGA_FRAME': 'Omega Frame',
    'INFINITY_FRAME': 'Infinity Frame',
    
    // Emojis
    'LIGHTNING_EMOJI': 'Lightning',
    'FIRE_EMOJI': 'Fire',
    'GEM_EMOJI': 'Gem',
    'CROWN_EMOJI': 'Crown',
    'STAR_EMOJI': 'Star',
    'ROCKET_EMOJI': 'Rocket',
    'DRAGON_EMOJI': 'Dragon',
    
    // Titles
    'ROOKIE_TITLE': 'Rookie',
    'WARRIOR_TITLE': 'Warrior',
    'CHAMPION_TITLE': 'Champion',
    'LEGEND_TITLE': 'Legend',
    'MASTER_TITLE': 'Master',
    'GRANDMASTER_TITLE': 'Grandmaster',
    'IMMORTAL_TITLE': 'Immortal'
  };
  
  return displayNames[cosmetic_key] || cosmetic_key;
};

export const getTitleDisplayName = (title_key: string): string => {
  return getCosmeticDisplayName(title_key);
};
