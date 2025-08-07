
export const codexData = [
  { 
    id: 1, 
    name: 'Turian the Durian', 
    type: 'character', 
    region: 'Golden Grove', 
    description: 'The magical turtle-durian guardian. Catchphrase: Dee mak!',
    image: '🐢🥥',
    rarity: 'legendary'
  },
  { 
    id: 2, 
    name: 'Jay-Sing', 
    type: 'character', 
    region: 'Royal Canopy', 
    description: 'The lion prince of Udoni, brave and noble.',
    image: '🦁👑',
    rarity: 'epic'
  },
  { 
    id: 3, 
    name: 'Lotus Lake', 
    type: 'region', 
    description: 'Peaceful water kingdom home to Non Bua and Coconut Cruze.',
    image: '🪷🏞️',
    rarity: 'common'
  },
  { 
    id: 4, 
    name: 'Non Bua', 
    type: 'character', 
    region: 'Lotus Lake', 
    description: 'The gentle lotus spirit who guides lost travelers.',
    image: '🌸✨',
    rarity: 'rare'
  },
  { 
    id: 5, 
    name: 'Golden Grove', 
    type: 'region', 
    description: 'Ancient forest where durian trees hold mystical powers.',
    image: '🌳🌟',
    rarity: 'uncommon'
  },
  { 
    id: 6, 
    name: 'Royal Canopy', 
    type: 'region', 
    description: 'Majestic treetop kingdom ruled by noble creatures.',
    image: '👑🌲',
    rarity: 'rare'
  }
];

export const codexCategories = ['all', 'character', 'region', 'item', 'spell'];

export const rarityColors = {
  common: 'text-gray-600 border-gray-300',
  uncommon: 'text-green-600 border-green-300',
  rare: 'text-blue-600 border-blue-300',
  epic: 'text-purple-600 border-purple-300',
  legendary: 'text-yellow-600 border-yellow-300'
};
