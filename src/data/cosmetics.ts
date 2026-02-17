export interface Cosmetic {
  id: string;
  cosmetic_key: string;
  name: string;
  type: 'aura' | 'frame' | 'emoji' | 'title';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface UserCosmetic {
  user_id: string;
  cosmetic_key: string;
  owned: boolean;
  equipped: boolean;
  acquired_at: string;
}

export interface UserTitle {
  user_id: string;
  title_key: string;
  owned: boolean;
  equipped: boolean;
  acquired_at: string;
}

export interface UserProfile {
  username: string;
  equipped_aura: string;
  equipped_frame: string;
  equipped_emoji: string;
  equipped_title: string;
  owned_cosmetics: Cosmetic[];
  owned_titles: UserTitle[];
}

export interface CosmeticWithStatus extends Cosmetic {
  owned: boolean;
  equipped: boolean;
}

export interface TitleWithStatus {
  title_key: string;
  name: string;
  owned: boolean;
  equipped: boolean;
}

export const getCosmeticById = (cosmetics: Cosmetic[], id: string): Cosmetic | undefined => {
  return cosmetics.find(cosmetic => cosmetic.id === id);
};

export const getCosmeticByKey = (cosmetics: Cosmetic[], cosmetic_key: string): Cosmetic | undefined => {
  return cosmetics.find(cosmetic => cosmetic.cosmetic_key === cosmetic_key);
};

export const getCosmeticsByType = (cosmetics: Cosmetic[], type: Cosmetic['type']): Cosmetic[] => {
  return cosmetics.filter(cosmetic => cosmetic.type === type);
};

export const getCosmeticsByRarity = (cosmetics: Cosmetic[], rarity: Cosmetic['rarity']): Cosmetic[] => {
  return cosmetics.filter(cosmetic => cosmetic.rarity === rarity);
};

export const getRarityColor = (rarity: Cosmetic['rarity']): string => {
  const colors: Record<Cosmetic['rarity'], string> = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-500'
  };
  
  return colors[rarity] || 'from-gray-500 to-gray-600';
};

export const getRarityBorderColor = (rarity: Cosmetic['rarity']): string => {
  const colors: Record<Cosmetic['rarity'], string> = {
    common: 'border-gray-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-yellow-500/50'
  };
  
  return colors[rarity] || 'border-gray-500/50';
};

export const getRarityBgColor = (rarity: Cosmetic['rarity']): string => {
  const colors: Record<Cosmetic['rarity'], string> = {
    common: 'bg-gray-900/30',
    rare: 'bg-blue-900/30',
    epic: 'bg-purple-900/30',
    legendary: 'bg-yellow-900/30'
  };
  
  return colors[rarity] || 'bg-gray-900/30';
};

export const getRarityTextColor = (rarity: Cosmetic['rarity']): string => {
  const colors: Record<Cosmetic['rarity'], string> = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  };
  
  return colors[rarity] || 'text-gray-400';
};

export const getCosmeticIcon = (type: Cosmetic['type']): string => {
  const icons: Record<Cosmetic['type'], string> = {
    aura: '✨',
    frame: '🖼️',
    emoji: '😎',
    title: '🏷️'
  };
  
  return icons[type] || '🎁';
};

export const getCosmeticDisplayValue = (cosmetic_key: string): string => {
  const displayValues: Record<string, string> = {
    // Auras
    'NEON_AURA': '✨',
    'CYBER_AURA': '🌐',
    'PLASMA_AURA': '⚡',
    'QUANTUM_AURA': '🔮',
    'GALACTIC_AURA': '🌌',
    'OMEGA_AURA': 'Ω',
    'INFINITY_AURA': '∞',
    
    // Frames
    'NEON_FRAME': '🟦',
    'CYBER_FRAME': '🟪',
    'PLASMA_FRAME': '🟥',
    'QUANTUM_FRAME': '⬛',
    'GALACTIC_FRAME': '🌠',
    'OMEGA_FRAME': '🔶',
    'INFINITY_FRAME': '🔷',
    
    // Emojis
    'LIGHTNING_EMOJI': '⚡',
    'FIRE_EMOJI': '🔥',
    'GEM_EMOJI': '💎',
    'CROWN_EMOJI': '👑',
    'STAR_EMOJI': '🌟',
    'ROCKET_EMOJI': '🚀',
    'DRAGON_EMOJI': '🐉',
    
    // Titles
    'ROOKIE_TITLE': 'Rookie',
    'WARRIOR_TITLE': 'Warrior',
    'CHAMPION_TITLE': 'Champion',
    'LEGEND_TITLE': 'Legend',
    'MASTER_TITLE': 'Master',
    'GRANDMASTER_TITLE': 'Grandmaster',
    'IMMORTAL_TITLE': 'Immortal'
  };
  
  return displayValues[cosmetic_key] || cosmetic_key;
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

export const isCosmeticEquipped = (userCosmetics: CosmeticWithStatus[], cosmetic_key: string): boolean => {
  const cosmetic = userCosmetics.find(c => c.cosmetic_key === cosmetic_key);
  return cosmetic?.equipped || false;
};

export const getEquippedCosmeticByType = (userCosmetics: CosmeticWithStatus[], type: Cosmetic['type']): CosmeticWithStatus | undefined => {
  return userCosmetics.find(c => c.type === type && c.equipped);
};

export const getEquippedTitle = (userTitles: TitleWithStatus[]): TitleWithStatus | undefined => {
  return userTitles.find(t => t.equipped);
};

export const getOwnedCosmeticsByType = (userCosmetics: CosmeticWithStatus[], type: Cosmetic['type']): CosmeticWithStatus[] => {
  return userCosmetics.filter(c => c.type === type && c.owned);
};

export const getUnownedCosmeticsByType = (userCosmetics: CosmeticWithStatus[], type: Cosmetic['type']): CosmeticWithStatus[] => {
  return userCosmetics.filter(c => c.type === type && !c.owned);
};

export const getRarityOrder = (): Cosmetic['rarity'][] => {
  return ['legendary', 'epic', 'rare', 'common'];
};

export const sortCosmeticsByRarity = (cosmetics: Cosmetic[]): Cosmetic[] => {
  const rarityOrder = getRarityOrder();
  return [...cosmetics].sort((a, b) => {
    const aIndex = rarityOrder.indexOf(a.rarity);
    const bIndex = rarityOrder.indexOf(b.rarity);
    return aIndex - bIndex;
  });
};

export const getCosmeticTypeLabel = (type: Cosmetic['type']): string => {
  const labels: Record<Cosmetic['type'], string> = {
    aura: 'Auras',
    frame: 'Frames',
    emoji: 'Emojis',
    title: 'Titles'
  };
  
  return labels[type] || type;
};

export const getCosmeticTypeDescription = (type: Cosmetic['type']): string => {
  const descriptions: Record<Cosmetic['type'], string> = {
    aura: 'Magical auras that surround your avatar',
    frame: 'Decorative frames for your profile',
    emoji: 'Special emojis to express yourself',
    title: 'Prestigious titles to show off'
  };
  
  return descriptions[type] || '';
};

export const formatCosmeticKey = (cosmetic_key: string): string => {
  return cosmetic_key.replace(/_(TITLE|EMOJI|AURA|FRAME)$/, '');
};
