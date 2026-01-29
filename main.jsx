// --- Game Constants ---

export const HOUSES_DATA = {
  STARK: {
    id: 'stark',
    name: 'House Stark',
    words: 'Winter is Coming',
    color: 'text-slate-300',
    bgColor: 'bg-slate-800',
    bonus: 'High Defense & Health',
    baseStats: { hp: 130, maxHp: 130, atk: 10, def: 5, gold: 50 },
    ability: { name: "Wolf's Blood", desc: "Heavy DMG + Apply Bleed", cooldown: 4, type: 'BLEED_STRIKE' }
  },
  LANNISTER: {
    id: 'lannister',
    name: 'House Lannister',
    words: 'Hear Me Roar',
    color: 'text-yellow-500',
    bgColor: 'bg-red-900',
    bonus: 'Start with extra Gold',
    baseStats: { hp: 110, maxHp: 110, atk: 12, def: 3, gold: 250 },
    ability: { name: "Pay Debts", desc: "Stun Enemy (Skip Turn)", cooldown: 5, type: 'STUN' }
  },
  TARGARYEN: {
    id: 'targaryen',
    name: 'House Targaryen',
    words: 'Fire and Blood',
    color: 'text-red-500',
    bgColor: 'bg-slate-900',
    bonus: 'High Attack Power',
    baseStats: { hp: 100, maxHp: 100, atk: 18, def: 2, gold: 50 },
    ability: { name: "Dracarys", desc: "Massive DMG + Apply Burn", cooldown: 5, type: 'BURN_NUKE' }
  }
};

export const RARITY_COLORS = {
  common: 'text-slate-400 border-slate-600',
  rare: 'text-cyan-400 border-cyan-600',
  epic: 'text-purple-400 border-purple-600',
  legendary: 'text-amber-400 border-amber-600 shadow-amber-500/20 shadow-lg'
};

export const WORLD_NEWS = [
  "Rumors: The King is holding a tourney in King's Landing.",
  "Ravens report wildlings massing near Eastwatch.",
  "Iron Bank representatives are collecting debts in the Riverlands.",
  "A red comet was seen in the sky last night.",
  "Prices of steel have risen due to the ongoing war.",
  "Brotherhood Without Banners spotted ambushing convoys.",
  "The Citadel announces winter has officially arrived.",
  "A large wolf pack is terrorizing the Kingsroad."
];

export const NPCS = {
  'jon_snow': { 
    id: 'jon_snow', name: 'Jon Snow', title: 'Lord Commander', location: 'wall', faction: 'STARK', 
    desc: 'The brooding bastard of Winterfell, now commanding the Night\'s Watch.',
    dialogue: [
      { text: "Winter is truly here. We need dragonglass to fight the White Walkers.", reqRep: 0 },
      { text: "My brothers are dying out there. Help us hold the Wall.", reqRep: 10 }
    ]
  },
  'tyrion': { 
    id: 'tyrion', name: 'Tyrion Lannister', title: 'Hand of the King', location: 'kingslanding', faction: 'LANNISTER', 
    desc: 'A small man with a large shadow, drinking wine.',
    dialogue: [
      { text: "I drink and I know things. Mostly about how to stay alive.", reqRep: 0 },
      { text: "My sister wants you dead. I, however, have a use for you.", reqRep: 10 }
    ]
  },
  'melisandre': { 
    id: 'melisandre', name: 'Melisandre', title: 'The Red Woman', location: 'dragonstone', faction: 'TARGARYEN', 
    desc: 'A priestess of R\'hllor, staring into the flames.',
    dialogue: [
      { text: "The night is dark and full of terrors.", reqRep: 0 },
      { text: "I see a darkness in you... and a light.", reqRep: 10 }
    ]
  },
  'arya': { 
    id: 'arya', name: 'Arya Stark', title: 'No One', location: 'twins', faction: 'STARK', 
    desc: 'A young girl with cold eyes and a small sword.',
    dialogue: [
      { text: "Valar Morghulis.", reqRep: 0 },
      { text: "I have a list. Would you like to know who is on it?", reqRep: 10 }
    ]
  }
};

export const WEAPON_SKILLS = {
  JAB: { name: "Quick Jab", desc: "Low DMG, Fast CD", cd: 2, mult: 1.2 },
  PIERCE: { name: "Armor Pierce", desc: "Ignores Defense", cd: 3, mult: 1.1, ignoreDef: true },
  SUNDER: { name: "Sunder", desc: "Reduces Enemy DEF", cd: 4, mult: 1.3, effect: 'SUNDER' },
  EXECUTE: { name: "Execute", desc: "3x DMG if HP < 30%", cd: 5, mult: 1.0, effect: 'EXECUTE' },
  LIFESTEAL: { name: "Vampiric Strike", desc: "Heals 50% of DMG", cd: 4, mult: 1.0, effect: 'LIFESTEAL' },
  FLAME_SLASH: { name: "Flame Slash", desc: "High DMG + Burn", cd: 4, mult: 1.5, effect: 'BURN' }
};

export const ITEMS = {
  WEAPONS: [
    { name: "Rusty Dagger", atk: 2, tier: 1, rarity: 'common', value: 10, skillId: 'JAB' },
    { name: "Iron Spear", atk: 4, tier: 1, rarity: 'common', value: 25, skillId: 'JAB' },
    { name: "Steel Longsword", atk: 8, tier: 2, rarity: 'rare', value: 80, skillId: 'PIERCE' },
    { name: "Obsidian Dagger", atk: 10, tier: 2, rarity: 'rare', value: 120, skillId: 'LIFESTEAL' },
    { name: "Castle-Forged Greatsword", atk: 15, tier: 3, rarity: 'epic', value: 300, skillId: 'SUNDER' },
    { name: "Warhammer of the Smith", atk: 18, tier: 3, rarity: 'epic', value: 400, skillId: 'SUNDER' },
    { name: "Valyrian Steel Blade", atk: 25, tier: 4, rarity: 'legendary', value: 1000, skillId: 'EXECUTE' },
    { name: "Lightbringer", atk: 30, tier: 4, rarity: 'legendary', value: 1500, skillId: 'FLAME_SLASH' }
  ],
  ARMOR: [
    { name: "Leather Jerkin", def: 1, hp: 0, tier: 1, rarity: 'common', value: 15 },
    { name: "Padded Gambeson", def: 2, hp: 5, tier: 1, rarity: 'common', value: 30 },
    { name: "Chainmail Hauberk", def: 5, hp: 15, tier: 2, rarity: 'rare', value: 100 },
    { name: "Northern Fur Cloak", def: 4, hp: 25, tier: 2, rarity: 'rare', value: 120 },
    { name: "Plate Armor", def: 10, hp: 40, tier: 3, rarity: 'epic', value: 350 },
    { name: "Kingsguard Plate", def: 12, hp: 50, tier: 3, rarity: 'epic', value: 500 },
    { name: "Dragonscale Armor", def: 18, hp: 80, tier: 4, rarity: 'legendary', value: 1200 }
  ]
};

export const LOCATIONS = [
  { id: 'kingslanding', name: "King's Landing", difficulty: 4, enemies: ['Gold Cloak', 'Lannister Guard'], desc: "The capital of the Seven Kingdoms.", market: true, region: 'SOUTH', npc: 'tyrion' },
  { id: 'dragonstone', name: 'Dragonstone', difficulty: 5, enemies: ['Red Priest', 'Stone Man'], desc: "An ancient island fortress.", region: 'SEA', npc: 'melisandre' },
  { id: 'twins', name: 'The Twins', difficulty: 3, enemies: ['Frey Mercenary', 'Bandit'], desc: "A crucial river crossing.", region: 'RIVER', npc: 'arya' },
  { id: 'winterfell', name: 'Winterfell', difficulty: 2, enemies: ['Bolton Soldier', 'Deserter', 'Bandit', 'Wolf'], desc: "The ancestral home of House Stark.", market: true, region: 'NORTH' },
  { id: 'wall', name: 'The Wall', difficulty: 1, enemies: ['Wildling', 'Ice Spider', 'Wolf'], desc: "The massive ice barrier protecting the realm.", region: 'NORTH', npc: 'jon_snow' },
  { id: 'north', name: 'True North', difficulty: 6, enemies: ['White Walker', 'Wight Giant'], boss: true, desc: "The land of always winter.", region: 'ICE' }
];

export const ENEMIES = {
  'Wolf': { hp: 30, atk: 12, gold: 0, exp: 25, tier: 1, special: 'BLEED' },
  'Wildling': { hp: 40, atk: 8, gold: 15, exp: 20, tier: 1 },
  'Ice Spider': { hp: 35, atk: 10, gold: 20, exp: 25, tier: 1, special: 'POISON' },
  'Bolton Soldier': { hp: 60, atk: 12, gold: 35, exp: 40, tier: 2 },
  'Deserter': { hp: 50, atk: 10, gold: 25, exp: 30, tier: 2 },
  'Frey Mercenary': { hp: 70, atk: 14, gold: 45, exp: 50, tier: 2 },
  'Bandit': { hp: 55, atk: 11, gold: 30, exp: 35, tier: 2 },
  'Gold Cloak': { hp: 90, atk: 16, gold: 65, exp: 70, tier: 3 },
  'Lannister Guard': { hp: 100, atk: 18, gold: 85, exp: 85, tier: 3, special: 'STUN' },
  'Red Priest': { hp: 80, atk: 25, gold: 100, exp: 100, tier: 3, special: 'BURN' },
  'Stone Man': { hp: 120, atk: 15, gold: 55, exp: 90, tier: 3 },
  'White Walker': { hp: 250, atk: 30, gold: 0, exp: 500, tier: 4, special: 'FREEZE' }, 
  'Wight Giant': { hp: 300, atk: 25, gold: 0, exp: 400, tier: 4 },
};
