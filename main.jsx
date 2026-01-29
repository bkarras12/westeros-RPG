import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Sword, Shield, Flame, Skull, Map as MapIcon, 
  Heart, Coins, Scroll, Crown, User, 
  ChevronRight, RefreshCw, Backpack, MapPin,
  Tent, Compass, Zap, Hammer, Shirt, Target,
  Save, Dices, Gem, X, Trash2, CheckCircle,
  ShoppingBag, Store, Droplets, Snowflake,
  Sun, Moon, CloudRain, CloudSnow, Wind, MessageSquare,
  Scale, Gavel, Box, BookOpen, Users
} from 'lucide-react';

// --- Constants & Game Data ---

const HOUSES = {
  STARK: {
    id: 'stark',
    name: 'House Stark',
    words: 'Winter is Coming',
    color: 'text-slate-300',
    bgColor: 'bg-slate-800',
    icon: <Shield className="w-8 h-8" />,
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
    icon: <Coins className="w-8 h-8" />,
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
    icon: <Flame className="w-8 h-8" />,
    bonus: 'High Attack Power',
    baseStats: { hp: 100, maxHp: 100, atk: 18, def: 2, gold: 50 },
    ability: { name: "Dracarys", desc: "Massive DMG + Apply Burn", cooldown: 5, type: 'BURN_NUKE' }
  }
};

const RARITY_COLORS = {
  common: 'text-slate-400 border-slate-600',
  rare: 'text-cyan-400 border-cyan-600',
  epic: 'text-purple-400 border-purple-600',
  legendary: 'text-amber-400 border-amber-600 shadow-amber-500/20 shadow-lg'
};

const WEATHER_TYPES = {
  CLEAR: { name: 'Clear Skies', icon: <Sun size={16} className="text-amber-400" />, effect: null },
  RAIN: { name: 'Heavy Rain', icon: <CloudRain size={16} className="text-blue-400" />, effect: 'Fire DMG -50%' },
  SNOW: { name: 'Blizzard', icon: <CloudSnow size={16} className="text-white" />, effect: 'Travel Slower' },
  WIND: { name: 'Strong Winds', icon: <Wind size={16} className="text-slate-400" />, effect: 'Attack Miss Chance 10%' }
};

const WORLD_NEWS = [
  "Rumors: The King is holding a tourney in King's Landing.",
  "Ravens report wildlings massing near Eastwatch.",
  "Iron Bank representatives are collecting debts in the Riverlands.",
  "A red comet was seen in the sky last night.",
  "Prices of steel have risen due to the ongoing war.",
  "Brotherhood Without Banners spotted ambushing convoys.",
  "The Citadel announces winter has officially arrived.",
  "A large wolf pack is terrorizing the Kingsroad."
];

const NPCS = {
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

const WEAPON_SKILLS = {
  JAB: { name: "Quick Jab", desc: "Low DMG, Fast CD", cd: 2, mult: 1.2 },
  PIERCE: { name: "Armor Pierce", desc: "Ignores Defense", cd: 3, mult: 1.1, ignoreDef: true },
  SUNDER: { name: "Sunder", desc: "Reduces Enemy DEF", cd: 4, mult: 1.3, effect: 'SUNDER' },
  EXECUTE: { name: "Execute", desc: "3x DMG if HP < 30%", cd: 5, mult: 1.0, effect: 'EXECUTE' },
  LIFESTEAL: { name: "Vampiric Strike", desc: "Heals 50% of DMG", cd: 4, mult: 1.0, effect: 'LIFESTEAL' },
  FLAME_SLASH: { name: "Flame Slash", desc: "High DMG + Burn", cd: 4, mult: 1.5, effect: 'BURN' }
};

const ITEMS = {
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

const LOCATIONS = [
  { id: 'kingslanding', name: "King's Landing", difficulty: 4, enemies: ['Gold Cloak', 'Lannister Guard'], desc: "The capital of the Seven Kingdoms.", market: true, region: 'SOUTH', npc: 'tyrion' },
  { id: 'dragonstone', name: 'Dragonstone', difficulty: 5, enemies: ['Red Priest', 'Stone Man'], desc: "An ancient island fortress.", region: 'SEA', npc: 'melisandre' },
  { id: 'twins', name: 'The Twins', difficulty: 3, enemies: ['Frey Mercenary', 'Bandit'], desc: "A crucial river crossing.", region: 'RIVER', npc: 'arya' },
  { id: 'winterfell', name: 'Winterfell', difficulty: 2, enemies: ['Bolton Soldier', 'Deserter', 'Bandit', 'Wolf'], desc: "The ancestral home of House Stark.", market: true, region: 'NORTH' },
  { id: 'wall', name: 'The Wall', difficulty: 1, enemies: ['Wildling', 'Ice Spider', 'Wolf'], desc: "The massive ice barrier protecting the realm.", region: 'NORTH', npc: 'jon_snow' },
  { id: 'north', name: 'True North', difficulty: 6, enemies: ['White Walker', 'Wight Giant'], boss: true, desc: "The land of always winter.", region: 'ICE' }
];

const ENEMIES = {
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

// --- Helper: Get House Data Safely ---
const getHouseData = (houseId) => {
    if (!houseId) return null;
    return HOUSES[houseId.toUpperCase()] || HOUSES.STARK;
};

// --- Pure Components ---

const Button = React.memo(({ onClick, children, disabled, className = "", variant = "primary" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-serif font-bold transition-all active:scale-95 flex items-center justify-center gap-2 select-none";
  const variants = {
    primary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-500 shadow-md",
    danger: "bg-red-900 hover:bg-red-800 text-red-100 border border-red-700",
    success: "bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700",
    outline: "bg-transparent border border-slate-500 hover:bg-slate-800 text-slate-300",
    special: "bg-amber-700 hover:bg-amber-600 text-amber-100 border border-amber-500 shadow-amber-900/50 shadow-lg",
    market: "bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-500"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
    >
      {children}
    </button>
  );
});

const ProgressBar = React.memo(({ current, max, color = "bg-red-600" }) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-700 overflow-hidden relative">
      <div 
        className={`h-full ${color} transition-all duration-500`} 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
});

const FloatingText = React.memo(({ text, type }) => (
  <div className={`absolute pointer-events-none animate-floatUp font-bold text-xl z-50 
    ${type === 'damage' ? 'text-red-500' : type === 'heal' ? 'text-emerald-400' : 'text-amber-400'}`}
    style={{ top: '40%', left: '50%', transform: 'translateX(-50%)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
  >
    {text}
  </div>
));

const Header = React.memo(({ player, world, totalStats, toggleInventory, toggleJournal }) => {
  const houseData = getHouseData(player.house?.id);
  
  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-slate-200 hidden md:block">{houseData?.icon}</div>
          <div>
            <h1 className="font-serif font-bold text-slate-200 leading-tight">{houseData?.name}</h1>
            <p className="text-xs text-slate-400">Lvl {player.lvl} Warrior</p>
          </div>
        </div>

        {/* Weather & Honor */}
        {world && (
          <div className="hidden sm:flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
              <div title={world.timeOfDay}>{world.timeOfDay === 'DAY' ? <Sun size={16} className="text-amber-400"/> : <Moon size={16} className="text-indigo-400"/>}</div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div title="Current Honor" className={`flex items-center gap-2 text-xs font-bold ${player.honor >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                <Scale size={16} />
                {player.honor}
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div title={WEATHER_TYPES[world.weather].name} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                {WEATHER_TYPES[world.weather].icon}
                {WEATHER_TYPES[world.weather].name}
              </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-mono">
          <div className="flex items-center gap-2 text-red-400 font-bold" title="Health">
            <Heart size={16} />
            <span>{player.hp}/{totalStats.totalMaxHp}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400" title="Gold">
            <Coins size={16} />
            <span>{player.gold}</span>
          </div>
            <div className="flex items-center gap-2 text-emerald-400" title="Potions">
            <Zap size={16} />
            <span>{player.potions}</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={toggleJournal} className="bg-slate-700 hover:bg-slate-600 text-indigo-100 p-1.5 rounded border border-slate-600 transition-colors" title="Open Journal">
                <BookOpen size={16} />
            </button>
            <button onClick={toggleInventory} className="bg-indigo-900 hover:bg-indigo-800 text-indigo-100 p-1.5 rounded border border-indigo-700 transition-colors" title="Open Inventory">
                <Backpack size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const JournalScreen = React.memo(({ player, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-600 w-full max-w-2xl h-[70vh] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <BookOpen className="text-amber-500" /> Journal
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900 space-y-6">
          <section>
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2">Active Quest</h3>
            {player.quest ? (
              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-indigo-300">{player.quest.desc}</span>
                    <span className="text-sm bg-indigo-900 px-2 py-1 rounded">{player.quest.current} / {player.quest.total}</span>
                 </div>
                 <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${(player.quest.current / player.quest.total) * 100}%` }}></div>
                 </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">No active quests.</p>
            )}
          </section>

          <section>
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2">Factions & Reputation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {Object.entries(player.reputation || {}).map(([faction, rep]) => (
                 <div key={faction} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                    <span className="font-serif font-bold capitalize">{faction.toLowerCase()}</span>
                    <span className={`font-mono ${rep > 0 ? 'text-emerald-400' : rep < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                       {rep > 0 ? '+' : ''}{rep}
                    </span>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

const NPCDialogue = React.memo(({ npc, player, onClose, onInteract }) => {
  if (!npc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-600 w-full max-w-lg rounded-xl flex flex-col overflow-hidden shadow-2xl">
         <div className="p-6 flex flex-col items-center text-center border-b border-slate-700 bg-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-3 border-2 border-indigo-500">
               <User size={40} className="text-indigo-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">{npc.name}</h2>
            <p className="text-indigo-400 text-sm uppercase tracking-wide">{npc.title}</p>
            <p className="text-slate-400 text-sm mt-2 italic">"{npc.desc}"</p>
         </div>
         
         <div className="p-6 bg-slate-900 space-y-4">
            {npc.dialogue.map((line, idx) => (
               <div key={idx} className={`p-3 rounded border ${player.reputation[npc.faction] >= line.reqRep ? 'bg-slate-800 border-slate-700' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                  <p className="text-slate-300 text-sm">"{line.text}"</p>
                  {player.reputation[npc.faction] < line.reqRep && (
                     <span className="text-xs text-red-500 mt-1 block">Requires {line.reqRep} Reputation with {npc.faction}</span>
                  )}
               </div>
            ))}
         </div>

         <div className="p-4 bg-slate-800 flex gap-3">
            <Button onClick={() => onInteract(npc.faction, 5)} variant="primary" className="flex-1">
               Pledge Aid (+Rep)
            </Button>
             <Button onClick={onClose} variant="outline" className="flex-1">
               Leave
            </Button>
         </div>
      </div>
    </div>
  );
});

const LootScreen = React.memo(({ loot, takeLoot, discardLoot }) => {
  if (!loot) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200 items-center justify-center p-6">
       <div className="max-w-lg w-full bg-slate-800 border border-slate-600 rounded-xl p-8 shadow-2xl animate-fadeIn text-center">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full border-2 bg-slate-900 ${RARITY_COLORS[loot.rarity]}`}>
               {loot.atk ? <Hammer size={48} /> : <Shirt size={48} />}
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2 text-slate-100">Victory Loot!</h2>
          <p className="text-slate-400 mb-6">You found a dropped item.</p>

          <div className={`bg-slate-900 p-4 rounded border mb-8 ${RARITY_COLORS[loot.rarity]}`}>
            <h3 className="font-bold text-xl mb-1">{loot.name}</h3>
            <span className="text-xs uppercase tracking-widest opacity-70 mb-2 block">{loot.rarity} {loot.atk ? 'Weapon' : 'Armor'}</span>
            <p className="text-sm text-slate-300">
              {loot.atk ? `+${loot.atk} Attack Power` : `+${loot.def} Defense`}
            </p>
            {loot.skillId && <p className="text-xs text-amber-500 font-bold mt-2">Skill: {WEAPON_SKILLS[loot.skillId].name}</p>}
            <p className="text-xs text-slate-500 mt-4">Value: {loot.value} Gold</p>
          </div>

          <div className="flex gap-4">
            <Button onClick={takeLoot} variant="primary" className="flex-1">
              Take Item
            </Button>
            <Button onClick={discardLoot} variant="outline" className="flex-1">
              Discard (+{loot.value}g)
            </Button>
          </div>
       </div>
    </div>
  );
});

const InventoryScreen = React.memo(({ player, totalStats, equipItem, sellItem, onClose }) => {
  const houseData = getHouseData(player.house?.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-600 w-full max-w-4xl h-[80vh] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Backpack className="text-amber-500" /> Inventory
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-600 flex items-center justify-center mb-4">
              {houseData?.icon}
            </div>
            <h3 className="font-bold text-xl mb-1">{houseData?.name}</h3>
            <p className="text-sm text-slate-400 mb-6">Level {player.lvl} Warrior</p>
            <div className="w-full space-y-3 mb-6">
                <div className="flex justify-between text-sm border-b border-slate-700 pb-1"><span className="text-slate-400">Attack</span><span className="font-bold text-indigo-400">{totalStats.totalAtk}</span></div>
                <div className="flex justify-between text-sm border-b border-slate-700 pb-1"><span className="text-slate-400">Defense</span><span className="font-bold text-emerald-400">{totalStats.totalDef}</span></div>
                <div className="flex justify-between text-sm border-b border-slate-700 pb-1"><span className="text-slate-400">Health</span><span className="font-bold text-red-400">{totalStats.totalMaxHp}</span></div>
                <div className="flex justify-between text-sm border-b border-slate-700 pb-1"><span className="text-slate-400">Gold</span><span className="font-bold text-amber-400">{player.gold}</span></div>
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Equipped Gear</p>
              <div className="bg-slate-900 p-3 rounded border border-slate-700 flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded"><Hammer size={16}/></div>
                <div className="flex-1 overflow-hidden"><p className="text-xs text-slate-400">Main Hand</p><p className={`text-sm font-bold truncate ${player.gear.weapon ? RARITY_COLORS[player.gear.weapon.rarity].split(' ')[0] : 'text-slate-500'}`}>{player.gear.weapon ? player.gear.weapon.name : "Empty"}</p></div>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700 flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded"><Shirt size={16}/></div>
                <div className="flex-1 overflow-hidden"><p className="text-xs text-slate-400">Armor</p><p className={`text-sm font-bold truncate ${player.gear.armor ? RARITY_COLORS[player.gear.armor.rarity].split(' ')[0] : 'text-slate-500'}`}>{player.gear.armor ? player.gear.armor.name : "Empty"}</p></div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
            <div className="flex justify-between items-end mb-4"><h4 className="text-sm uppercase tracking-widest text-slate-500 font-bold">Backpack Contents</h4><span className="text-xs text-slate-400">{player.inventory.length} / {player.maxInventory} Slots</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {player.inventory.map((item) => (
                <div key={item.id} className={`bg-slate-800 p-3 rounded-lg border relative group hover:-translate-y-1 transition-transform ${RARITY_COLORS[item.rarity]}`}>
                  <div className="flex justify-between items-start mb-2"><span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-black/30`}>{item.rarity}</span>{item.atk ? <Hammer size={14} /> : <Shirt size={14} />}</div>
                  <h4 className="font-bold text-sm mb-1 line-clamp-1" title={item.name}>{item.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{item.atk ? `+${item.atk} Attack` : `+${item.def} Defense`}</p>
                  {item.skillId && <p className="text-xs text-amber-500 font-bold mb-2">Skill: {WEAPON_SKILLS[item.skillId].name}</p>}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => equipItem(item)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1"><CheckCircle size={12} /> Equip</button>
                    <button onClick={() => sellItem(item)} className="px-2 bg-slate-900 hover:bg-red-900/50 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 text-xs rounded flex items-center justify-center" title={`Sell for ${item.value}g`}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const MarketScreen = React.memo(({ player, buyItem, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-600 w-full max-w-3xl rounded-xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2 text-amber-500">
              <Store /> City Market
            </h2>
            <p className="text-slate-400 text-sm">Spend your hard-earned gold.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>
        <div className="p-8 bg-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Potion */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors group">
            <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-emerald-500">
              <Droplets className="text-emerald-500 w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Milk of the Poppy</h3>
            <p className="text-xs text-slate-400 mb-4">Restores 50 HP instantly.</p>
            <Button onClick={() => buyItem('POTION', 50)} variant="market" className="w-full">
              50 Gold
            </Button>
          </div>
          {/* Mystery Box 1 */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors group">
              <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-cyan-500">
              <ShoppingBag className="text-cyan-500 w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Soldier's Cache</h3>
            <p className="text-xs text-slate-400 mb-4">Random Common or Rare item.</p>
            <Button onClick={() => buyItem('MYSTERY_COMMON', 150)} variant="market" className="w-full">
              150 Gold
            </Button>
          </div>
            {/* Mystery Box 2 */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors group">
              <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-purple-500">
              <Gem className="text-purple-500 w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-1">Lord's Chest</h3>
            <p className="text-xs text-slate-400 mb-4">Random Rare or Epic item.</p>
            <Button onClick={() => buyItem('MYSTERY_RARE', 400)} variant="market" className="w-full">
              400 Gold
            </Button>
          </div>
        </div>
        <div className="p-4 bg-slate-800 text-center border-t border-slate-700">
          <p className="text-amber-400 font-mono font-bold flex items-center justify-center gap-2"><Coins size={16}/> Your Gold: {player.gold}</p>
        </div>
      </div>
    </div>
  );
});

const MapScreen = React.memo(({ player, world, handleTravel, setShowMarket, setNPC }) => {
  return (
    <div className="flex-1 p-4 max-w-3xl mx-auto w-full relative pb-32">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif text-slate-100">Westeros</h2>
        <p className="text-slate-500 text-sm italic">Day {world.day} • {world.timeOfDay}</p>
      </div>

      {/* Quest Display */}
      {player.quest && (
        <div className="bg-indigo-950/50 border border-indigo-500/30 p-4 rounded-lg mb-6 flex items-center gap-4 animate-fadeIn">
          <div className="bg-indigo-500/20 p-2 rounded-full"><Target className="text-indigo-400" size={20}/></div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wide">Current Quest</h4>
            <p className="text-slate-300">{player.quest.desc}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-bold">{player.quest.current}/{player.quest.total}</span>
          </div>
        </div>
      )}

      {/* Map Line */}
      <div className="absolute left-8 md:left-1/2 top-48 bottom-32 w-1 bg-slate-800 transform md:-translate-x-1/2 z-0"></div>
      
      {/* Locations */}
      <div className="space-y-6 relative z-10">
        {LOCATIONS.map((loc, index) => {
          const isCurrent = player.locationId === loc.id;
          const isBoss = loc.boss;

          return (
            <div key={loc.id} className={`flex flex-col md:flex-row items-start md:items-center gap-4 group ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              <div className="absolute left-8 w-4 h-4 bg-slate-800 rounded-full border-2 border-slate-600 -translate-x-[7px] md:hidden mt-8"></div>

              <div 
                onClick={() => !isCurrent && handleTravel(loc)}
                className={`flex-1 w-full ml-12 md:ml-0 bg-slate-800 p-5 rounded-xl border transition-all duration-300 relative overflow-hidden
                ${isCurrent ? 'border-amber-500 shadow-amber-900/20 shadow-xl ring-1 ring-amber-500/50' : 'border-slate-700 hover:border-indigo-500 cursor-pointer hover:bg-slate-800/80'}
              `}>
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <MapPin size={10} /> HERE
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`text-xl font-bold font-serif flex items-center gap-2 ${isBoss ? 'text-red-400' : 'text-slate-200'}`}>
                      {loc.name}
                      {isBoss && <Skull size={16} />}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">{loc.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 border-t border-slate-700 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-bold">Threat:</span>
                    <div className="flex">{Array(loc.difficulty).fill(0).map((_,i) => <span key={i} className="text-red-500">⚔️</span>)}</div>
                  </div>
                  {loc.market && (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <Store size={12} /> <span className="font-bold">Market</span>
                    </div>
                  )}
                  {loc.npc && (
                    <div className="flex items-center gap-1 text-indigo-400">
                       <Users size={12} /> <span className="font-bold">{NPCS[loc.npc].name}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  {isCurrent ? (
                    <div className="w-full flex flex-wrap gap-2">
                      <Button onClick={(e) => { e.stopPropagation(); handleTravel(loc); }} variant="outline" className="flex-1 py-2 text-sm border-dashed">
                        <Tent size={16} /> Patrol
                      </Button>
                      {loc.market && (
                          <Button onClick={(e) => { e.stopPropagation(); setShowMarket(true); }} variant="market" className="flex-1 py-2 text-sm">
                          <Store size={16} /> Market
                        </Button>
                      )}
                      {loc.npc && (
                          <Button onClick={(e) => { e.stopPropagation(); setNPC(NPCS[loc.npc]); }} variant="special" className="flex-1 py-2 text-sm">
                           <MessageSquare size={16} /> Talk
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button onClick={(e) => { e.stopPropagation(); handleTravel(loc); }} variant="primary" className="w-full py-2 text-sm">
                      <Compass size={16} /> Travel Here
                    </Button>
                  )}
                </div>
              </div>

              <div className="hidden md:flex w-8 justify-center">
                  <div className={`w-4 h-4 rounded-full border-4 z-10 ${isCurrent ? 'bg-amber-500 border-amber-900' : 'bg-slate-800 border-slate-600'}`}></div>
              </div>
              <div className="hidden md:block flex-1"></div>
            </div>
          );
        })}
      </div>
      
      {/* News Ticker Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-700 p-3 z-20 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3 text-sm text-slate-400">
          <MessageSquare size={16} className="text-slate-500 shrink-0"/>
          <div className="truncate animate-pulse">
            <span className="font-bold text-slate-300">Raven Scroll:</span> {world.news}
          </div>
        </div>
      </div>
    </div>
  );
});

const CombatScreen = React.memo(({ 
  combatState, player, totalStats, 
  playerAttack, playerDefend, useAbility, useWeaponSkill, playerHeal,
  logsEndRef 
}) => {
  const { enemy, enemyHp, enemyMaxHp, log, abilityCd, weaponCd, floatingText, effects } = combatState;
  const equippedWeapon = player.gear.weapon;
  const weaponSkill = equippedWeapon && WEAPON_SKILLS[equippedWeapon.skillId];
  const houseData = getHouseData(player.house?.id);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-8 mb-6 bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {floatingText && <FloatingText text={floatingText.text} type={floatingText.type} />}

        {/* Player Side */}
        <div className="text-center z-10 relative">
          <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center mb-4 shadow-lg bg-slate-800 ${combatState.turn === 'ENEMY' ? 'animate-shake border-red-900' : 'border-indigo-500'}`}>
            {houseData?.icon}
          </div>
          
          {/* Player Effects Indicators */}
          <div className="absolute top-0 left-0 flex flex-col gap-1">
            {effects.filter(e => e.target === 'PLAYER').map((eff, i) => (
              <div key={i} className="bg-black/60 text-red-400 text-xs px-1 rounded flex items-center gap-1 border border-red-900">
                {eff.type === 'BURN' ? <Flame size={10}/> : eff.type === 'BLEED' ? <Droplets size={10}/> : <Zap size={10}/>}
                {eff.type} ({eff.duration})
              </div>
            ))}
          </div>

          <h3 className="font-bold text-lg">{houseData?.name}</h3>
          <div className="w-32 mx-auto mt-2">
            <ProgressBar current={player.hp} max={totalStats.totalMaxHp} color="bg-emerald-500" />
            <p className="text-xs mt-1">{player.hp} / {totalStats.totalMaxHp} HP</p>
          </div>
        </div>

        <div className="text-slate-600 font-serif italic z-10">VS</div>

        {/* Enemy Side */}
        <div className="text-center z-10 relative">
          <div className={`w-24 h-24 mx-auto rounded-full border-4 border-red-700 bg-slate-800 flex items-center justify-center mb-4 shadow-lg ${combatState.turn === 'PLAYER' ? 'animate-shake' : ''}`}>
              {enemy.name === 'White Walker' ? <Skull className="w-12 h-12 text-cyan-300" /> : <User className="w-12 h-12 text-red-500" />}
          </div>

          {/* Enemy Effects Indicators */}
          <div className="absolute top-0 right-0 flex flex-col gap-1">
            {effects.filter(e => e.target === 'ENEMY').map((eff, i) => (
              <div key={i} className="bg-black/60 text-red-400 text-xs px-1 rounded flex items-center gap-1 border border-red-900">
                {eff.type === 'BURN' ? <Flame size={10}/> : eff.type === 'BLEED' ? <Droplets size={10}/> : <Zap size={10}/>}
                {eff.type} ({eff.duration})
              </div>
            ))}
          </div>

          <h3 className="font-bold text-lg text-red-400">{enemy.name}</h3>
          <div className="w-32 mx-auto mt-2">
            <ProgressBar current={enemyHp} max={enemyMaxHp} color="bg-red-600" />
            <p className="text-xs mt-1">{enemyHp} / {enemyMaxHp} HP</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center gap-3">
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={playerAttack} disabled={combatState.turn !== 'PLAYER'} variant="primary">
              <Sword size={18} /> Attack
            </Button>
            <Button onClick={playerDefend} disabled={combatState.turn !== 'PLAYER'} variant="outline">
              <Shield size={18} /> Defend
            </Button>
          </div>
          
          {/* House Ability */}
          <Button 
            onClick={useAbility} 
            disabled={combatState.turn !== 'PLAYER' || abilityCd > 0} 
            variant="special"
            className="relative overflow-hidden"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <Zap size={18} /> 
                {houseData?.ability.name} 
                {abilityCd > 0 && <span className="text-xs bg-black/30 px-2 py-0.5 rounded">CD: {abilityCd}</span>}
              </div>
              <span className="text-[10px] font-normal opacity-80">{houseData?.ability.desc}</span>
            </div>
          </Button>
          
          {/* Weapon Skill - Only if weapon equipped */}
          {weaponSkill && (
            <Button 
              onClick={useWeaponSkill} 
              disabled={combatState.turn !== 'PLAYER' || weaponCd > 0} 
              variant="special"
              className="relative overflow-hidden border-amber-500 bg-slate-800 hover:bg-amber-900/30"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-amber-400">
                  <Hammer size={18} /> 
                  {weaponSkill.name} 
                  {weaponCd > 0 && <span className="text-xs bg-black/30 px-2 py-0.5 rounded text-white">CD: {weaponCd}</span>}
                </div>
                <span className="text-[10px] font-normal opacity-60 text-slate-300">{weaponSkill.desc}</span>
              </div>
            </Button>
          )}

          <Button onClick={playerHeal} disabled={combatState.turn !== 'PLAYER' || player.potions === 0} variant="success">
            <Heart size={18} /> Potion ({player.potions})
          </Button>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-y-auto font-mono text-sm custom-scrollbar">
          {log.map((msg, i) => (
            <p key={i} className={`mb-2 ${msg.includes('You') ? 'text-indigo-300' : 'text-red-300'}`}>
              <span className="text-slate-600 mr-2">[{i + 1}]</span>{msg}
            </p>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
});

const EventScreen = React.memo(({ 
    player, world, totalStats, activeEvent, 
    handleEventChoice, setScreen, toggleInventory, toggleJournal
}) => {
    let title = "Respite on the Road";
    let desc = "A wandering merchant stops his cart.";
    let icon = <Scroll className="w-16 h-16 text-amber-500" />;
    let buttons = [];

    if (activeEvent === 'MERCHANT') {
      buttons = [
        { label: "Buy Potion", sub: "50 Gold", action: 'MERCHANT', variant: 'outline' },
        { label: "Rob Merchant", sub: "Get Gold / Lose Honor", action: 'ROB_MERCHANT', variant: 'danger' },
        { label: "Sharpen Blade", sub: "100 Gold (+2 Atk)", action: 'TRAINING', variant: 'outline' }
      ];
    } else if (activeEvent === 'GAMBLER') {
      title = "The Gambler";
      desc = "A man with a gold tooth offers to play dice. Do you feel lucky?";
      icon = <Dices className="w-16 h-16 text-purple-500" />;
      buttons = [
        { label: "Play Dice", sub: "Bet 50 Gold", action: 'GAMBLE', variant: 'special' },
        { label: "Decline", sub: "Leave", action: 'LEAVE', variant: 'outline' }
      ];
    } else if (activeEvent === 'PRIEST') {
      title = "The Red Priest";
      desc = "A priest of R'hllor stares into the flames. 'Only death can pay for life,' he whispers.";
      icon = <Flame className="w-16 h-16 text-red-600" />;
      buttons = [
        { label: "Blood Sacrifice", sub: "-HP, +Stats, -Honor", action: 'SACRIFICE', variant: 'danger' },
        { label: "Pray", sub: "+HP, +Honor", action: 'PRAY', variant: 'outline' }
      ];
    }

    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200 items-center justify-center p-6">
        <Header player={player} world={world} totalStats={totalStats} toggleInventory={toggleInventory} toggleJournal={toggleJournal} />
        
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="max-w-lg w-full bg-slate-800 border border-slate-600 rounded-xl p-8 shadow-2xl animate-fadeIn">
            <div className="flex justify-center mb-6">{icon}</div>
            <h2 className="text-2xl font-serif font-bold text-center mb-4">{title}</h2>
            <p className="text-slate-300 text-center mb-8">{desc}</p>
            
            <div className="flex flex-col gap-3">
              {buttons.map((btn, i) => (
                <Button key={i} onClick={() => btn.action === 'LEAVE' ? setScreen('MAP') : handleEventChoice(btn.action)} variant={btn.variant}>
                  <div className="flex justify-between w-full">
                    <span>{btn.label}</span>
                    <span className="text-xs opacity-75">{btn.sub}</span>
                  </div>
                </Button>
              ))}
              <Button onClick={() => setScreen('MAP')} variant="primary" className="mt-4">
                Continue Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
});

const RenderStart = React.memo(({ selectHouse }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center animate-fadeIn">
      <h1 className="text-4xl md:text-6xl font-serif text-slate-200 mb-2 tracking-widest uppercase">Westeros Chronicles</h1>
      <h2 className="text-xl text-slate-500 mb-12 tracking-widest uppercase border-t border-slate-800 pt-2 mt-2">The Long Night</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {Object.values(HOUSES).map(house => (
          <div key={house.id} onClick={() => selectHouse(house.id.toUpperCase())} className={`cursor-pointer group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-6 hover:border-slate-400 transition-all hover:-translate-y-1`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-center mb-4 text-slate-400 group-hover:text-white transition-colors">{house.icon}</div>
            <h3 className={`text-2xl font-serif font-bold mb-2 ${house.color}`}>{house.name}</h3>
            <p className="text-sm text-slate-400 italic mb-4">"{house.words}"</p>
            <div className="space-y-2">
              <div className="text-xs text-slate-500 bg-slate-950 p-2 rounded border border-slate-800"><p className="font-bold text-slate-300">Perk:</p> {house.bonus}</div>
              <div className="text-xs text-amber-500/80 bg-slate-950 p-2 rounded border border-amber-900/30"><p className="font-bold text-amber-500 flex items-center justify-center gap-1"><Zap size={12}/> Ability:</p> {house.ability.name} - {house.ability.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {localStorage.getItem('got_rpg_save_v8') && (<div className="mt-8 text-slate-500 text-sm animate-pulse">Save file found. Resuming automatically...</div>)}
    </div>
));

const RenderGameOver = React.memo(({ restartGame, activeLocation }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-600 p-6 animate-fadeIn">
      <Skull className="w-24 h-24 mb-6" />
      <h1 className="text-6xl font-serif font-bold mb-4 tracking-widest">VALAR MORGHULIS</h1>
      <p className="text-slate-400 mb-8">You fell in battle at {activeLocation?.name || 'Westeros'}.</p>
      <Button onClick={restartGame} variant="primary"><RefreshCw size={18} /> Start New Lineage</Button>
    </div>
));

const RenderVictory = React.memo(({ restartGame, player }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-amber-400 p-6 animate-fadeIn">
      <Crown className="w-24 h-24 mb-6 animate-bounce" />
      <h1 className="text-5xl font-serif font-bold mb-4">VICTORY</h1>
      <p className="text-slate-300 text-xl mb-8 text-center max-w-2xl">The Night King has fallen. Dawn breaks over a grateful Westeros.</p>
      <div className="bg-slate-800 p-6 rounded-lg border border-amber-700 mb-8 min-w-[300px]">
        <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-4 border-b border-slate-700 pb-2">Legendary Hero</h3>
        <div className="flex justify-between mb-2 text-slate-300"><span>House:</span> <span>{player?.house?.name}</span></div>
        <div className="flex justify-between mb-2 text-slate-300"><span>Level:</span> <span>{player?.lvl}</span></div>
        <div className="flex justify-between mb-2 text-slate-300"><span>Gold Amassed:</span> <span>{player?.gold}</span></div>
      </div>
      <Button onClick={restartGame} variant="primary">Play Again</Button>
    </div>
));

// --- Main App Component ---

export default function GameOfThronesRPG() {
  // ... (all state and logic from the previous turn, essentially unchanged)
  const [screen, setScreen] = useState('START');
  const [showInventory, setShowInventory] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [activeNPC, setActiveNPC] = useState(null);
  const [loot, setLoot] = useState(null); 
  
  const [world, setWorld] = useState({
    day: 1,
    timeOfDay: 'DAY', 
    weather: 'CLEAR',
    news: WORLD_NEWS[0]
  });

  const [player, setPlayer] = useState({
    house: null,
    lvl: 1,
    exp: 0,
    expToNext: 100,
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 0,
    gold: 0,
    potions: 1,
    honor: 0, 
    locationId: 'winterfell',
    gear: { weapon: null, armor: null },
    inventory: [], 
    maxInventory: 12,
    quest: null,
    reputation: { STARK: 0, LANNISTER: 0, TARGARYEN: 0 } 
  });

  const [combatState, setCombatState] = useState({
    enemy: null,
    enemyHp: 0,
    enemyMaxHp: 0,
    turn: 'PLAYER', 
    log: [],
    abilityCd: 0,
    weaponCd: 0, 
    bossPhase: 1,
    floatingText: null,
    effects: [] 
  });

  const [activeLocation, setActiveLocation] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null); 
  const logsEndRef = useRef(null);

  // --- Save/Load System ---
  useEffect(() => {
    const savedData = localStorage.getItem('got_rpg_save_v8'); 
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPlayer(parsed.player);
        setWorld(parsed.world || { day: 1, timeOfDay: 'DAY', weather: 'CLEAR', news: WORLD_NEWS[0] });
        if (parsed.player.house) setScreen('MAP'); 
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  useEffect(() => {
    if (player.house) {
      localStorage.setItem('got_rpg_save_v8', JSON.stringify({ player, world }));
    }
  }, [player, world]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatState.log]);

  // --- Memoized Stats ---
  const totalStats = useMemo(() => {
    let totalAtk = player.atk + (player.gear.weapon?.atk || 0);
    let totalDef = player.def + (player.gear.armor?.def || 0);
    let totalMaxHp = player.maxHp + (player.gear.armor?.hp || 0);

    if (player.honor >= 20) totalDef += 5; 
    if (player.honor <= -20) totalAtk += 5; 

    return { totalAtk, totalDef, totalMaxHp };
  }, [player.atk, player.def, player.maxHp, player.gear, player.honor]);

  // --- World Logic ---
  const advanceTime = useCallback((region) => {
    setWorld(prev => {
        const newTime = prev.timeOfDay === 'DAY' ? 'NIGHT' : 'DAY';
        const newDay = newTime === 'DAY' ? prev.day + 1 : prev.day;
        
        let possibleWeather = ['CLEAR', 'CLEAR', 'WIND']; 
        if (region === 'NORTH' || region === 'ICE') possibleWeather = ['SNOW', 'WIND', 'CLEAR'];
        if (region === 'RIVER' || region === 'SEA') possibleWeather = ['RAIN', 'WIND', 'CLEAR'];
        if (region === 'SOUTH') possibleWeather = ['CLEAR', 'CLEAR', 'RAIN'];
        
        const newWeather = possibleWeather[Math.floor(Math.random() * possibleWeather.length)];
        const newNews = WORLD_NEWS[Math.floor(Math.random() * WORLD_NEWS.length)];

        return {
            day: newDay,
            timeOfDay: newTime,
            weather: newWeather,
            news: newNews
        };
    });
  }, []);

  // --- Inventory Actions ---
  const addToInventory = useCallback((item) => {
    // Fixed logic: check against current player state passed to this function, or use a functional update pattern properly if needed.
    // Since this function needs to return a boolean immediately, we rely on the closure value of player.
    // However, player might be stale if not in dependency array.
    // Better approach: Since we need a return value, we can't easily use the functional setter for the check.
    // We will rely on the `player` prop passed to this callback, assuming it is fresh.
    // To ensure freshness, we add `player` to dependency array.
    if (player.inventory.length >= player.maxInventory) {
        return false;
    }
    
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) }; 
    setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
    return true;
  }, [player.inventory, player.maxInventory]);

  const equipItem = useCallback((item) => {
    const type = item.atk !== undefined ? 'weapon' : 'armor';
    
    setPlayer(prev => {
      const currentEquipped = prev.gear[type];
      const newInv = prev.inventory.filter(i => i.id !== item.id);
      if (currentEquipped) newInv.push(currentEquipped);
      return { ...prev, inventory: newInv, gear: { ...prev.gear, [type]: item } };
    });
  }, []);

  const sellItem = useCallback((item) => {
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold + item.value,
      inventory: prev.inventory.filter(i => i.id !== item.id)
    }));
  }, []);

  // --- Quest System ---
  const generateQuest = useCallback(() => {
    const types = ['KILL', 'TRAVEL'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'KILL') {
      const enemies = Object.keys(ENEMIES).filter(e => !ENEMIES[e].tier || ENEMIES[e].tier <= 2);
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      return {
        type: 'KILL',
        desc: `Defeat ${target}s`,
        target: target,
        current: 0,
        total: Math.floor(Math.random() * 3) + 2,
        reward: 100
      };
    } else {
      const locs = LOCATIONS.filter(l => !l.boss); 
      const target = locs[Math.floor(Math.random() * locs.length)];
      return {
        type: 'TRAVEL',
        desc: `Travel to ${target.name}`,
        target: target.id,
        current: 0,
        total: 1,
        reward: 50
      };
    }
  }, []);

  const checkQuestProgress = useCallback((actionType, value) => {
    setPlayer(prev => {
        if (!prev.quest) return prev;
        
        let updatedQuest = { ...prev.quest };
        let completed = false;

        if (actionType === 'KILL' && prev.quest.type === 'KILL' && prev.quest.target === value) {
          updatedQuest.current += 1;
          if (updatedQuest.current >= updatedQuest.total) completed = true;
        } else if (actionType === 'TRAVEL' && prev.quest.type === 'TRAVEL' && prev.quest.target === value) {
          updatedQuest.current += 1;
          if (updatedQuest.current >= updatedQuest.total) completed = true;
        }

        if (completed) {
           setTimeout(() => alert(`Quest Completed: ${updatedQuest.desc}! Gained ${updatedQuest.reward} Gold.`), 0);
           return {
            ...prev,
            gold: prev.gold + updatedQuest.reward,
            quest: generateQuest() 
           };
        } else if (updatedQuest.current !== prev.quest.current) {
          return { ...prev, quest: updatedQuest };
        }
        return prev;
    });
  }, [generateQuest]);

  const handleNPCInteraction = (faction, repGain) => {
    setPlayer(prev => ({
       ...prev,
       reputation: {
          ...prev.reputation,
          [faction]: (prev.reputation[faction] || 0) + repGain
       }
    }));
    alert(`You pledged aid to ${faction}. Reputation increased!`);
    setActiveNPC(null);
  };

  const buyItem = useCallback((type, cost) => {
    if (player.gold < cost) {
      alert("Not enough gold!");
      return;
    }
    
    let success = false;
    let msg = "";

    if (type === 'POTION') {
      setPlayer(prev => ({ ...prev, gold: prev.gold - cost, potions: prev.potions + 1 }));
      success = true;
      msg = "Purchased Milk of the Poppy.";
    } else if (type === 'MYSTERY_COMMON' || type === 'MYSTERY_RARE') {
      const tierMin = type === 'MYSTERY_COMMON' ? 1 : 2;
      const tierMax = type === 'MYSTERY_COMMON' ? 2 : 3;
      
      const pool = [...ITEMS.WEAPONS, ...ITEMS.ARMOR].filter(i => i.tier >= tierMin && i.tier <= tierMax);
      const item = pool[Math.floor(Math.random() * pool.length)];
      
      // Since we need to check inventory, we reuse the logic but inside this function scope to avoid async issues
      if (player.inventory.length >= player.maxInventory) {
          alert("Inventory Full!");
          return;
      }
      
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      setPlayer(prev => ({ ...prev, gold: prev.gold - cost, inventory: [...prev.inventory, newItem] }));
      success = true;
      msg = `Purchased ${item.name}!`;
    }

    if (success) alert(msg);
  }, [player.gold, player.inventory, player.maxInventory]);

  const selectHouse = (houseKey) => {
    const house = HOUSES[houseKey];
    const initialQuest = generateQuest();
    setPlayer({
      ...player,
      house: house,
      ...house.baseStats,
      potions: 2,
      locationId: 'winterfell',
      gear: { weapon: null, armor: null },
      inventory: [],
      quest: initialQuest,
      honor: 0,
      reputation: { STARK: 0, LANNISTER: 0, TARGARYEN: 0 }
    });
    setWorld({ day: 1, timeOfDay: 'DAY', weather: 'SNOW', news: WORLD_NEWS[0] }); 
    setScreen('MAP');
  };

  const triggerEvent = () => {
    const events = ['MERCHANT', 'GAMBLER', 'PRIEST'];
    const selected = events[Math.floor(Math.random() * events.length)];
    setActiveEvent(selected);
    setScreen('EVENT');
  };

  const startCombat = useCallback((location) => {
    const enemyType = location.enemies[Math.floor(Math.random() * location.enemies.length)];
    const enemyStats = ENEMIES[enemyType];
    
    const weather = WEATHER_TYPES[world.weather];
    const logs = [`You encounter a ${enemyType}!`, `Conditions: ${weather.name} (${weather.effect || 'None'})`];

    setCombatState({
      enemy: { name: enemyType, ...enemyStats },
      enemyHp: enemyStats.hp,
      enemyMaxHp: enemyStats.hp,
      turn: 'PLAYER',
      log: logs,
      abilityCd: 0,
      weaponCd: 0,
      bossPhase: 1,
      floatingText: null,
      effects: []
    });
    setScreen('COMBAT');
  }, [world.weather]);

  const handleTravel = useCallback((targetLocation) => {
    setActiveLocation(targetLocation);
    checkQuestProgress('TRAVEL', targetLocation.id);
    
    if (targetLocation.id !== player.locationId) {
      advanceTime(targetLocation.region);
    }

    if (targetLocation.id === player.locationId) {
      startCombat(targetLocation);
    } else {
      const roll = Math.random();
      if (roll > 0.4 && !targetLocation.boss) {
        triggerEvent();
      } else {
        startCombat(targetLocation);
      }
    }
  }, [player.locationId, checkQuestProgress, advanceTime, startCombat]);

  const showFloatingText = (text, type) => {
    setCombatState(prev => ({ ...prev, floatingText: { text, type } }));
    setTimeout(() => setCombatState(prev => ({ ...prev, floatingText: null })), 800);
  };

  const combatLog = (msg) => {
    setCombatState(prev => ({
      ...prev,
      log: [...prev.log, msg].slice(-30)
    }));
  };

  const processDoT = useCallback((turnOwner, currentState) => {
    const { effects, enemyHp, enemy } = currentState;
    let currentEnemyHp = enemyHp;
    let currentPlayerHp = player.hp;
    let logUpdates = [];
    let remainingEffects = [];
    let stun = false;
    let sunder = 0;

    effects.forEach(eff => {
      if (eff.type === 'SUNDER' && eff.target === 'ENEMY') sunder += 5; 

      if (eff.target === turnOwner) {
        if (eff.type === 'BURN') {
          if (turnOwner === 'ENEMY') {
             currentEnemyHp -= eff.val;
             logUpdates.push(`${enemy.name} burns for ${eff.val} dmg.`);
             showFloatingText(`${eff.val}`, 'burn');
          } else {
             currentPlayerHp -= eff.val;
             logUpdates.push(`You burn for ${eff.val} dmg.`);
             showFloatingText(`-${eff.val}`, 'damage');
          }
        } else if (eff.type === 'BLEED') {
           if (turnOwner === 'ENEMY') {
             currentEnemyHp -= eff.val;
             logUpdates.push(`${enemy.name} bleeds for ${eff.val} dmg.`);
             showFloatingText(`${eff.val}`, 'bleed');
          } else {
             currentPlayerHp -= eff.val;
             logUpdates.push(`You bleed for ${eff.val} dmg.`);
             showFloatingText(`-${eff.val}`, 'damage');
          }
        } else if (eff.type === 'STUN') {
          stun = true;
          logUpdates.push(`${turnOwner === 'ENEMY' ? enemy.name : 'You'} is stunned!`);
          showFloatingText(`STUN`, 'special');
        }

        if (eff.duration > 1) {
          remainingEffects.push({ ...eff, duration: eff.duration - 1 });
        }
      } else {
        remainingEffects.push(eff);
      }
    });

    return { currentEnemyHp, currentPlayerHp, logUpdates, remainingEffects, stun, sunder };
  }, [player.hp]); 

  const checkDeath = useCallback((hp, currentEnemy) => {
    if (hp <= 0) {
       if (currentEnemy.name === 'White Walker' && combatState.bossPhase === 1) {
         setTimeout(() => {
           combatLog("The Night King raises his hands... The White Walker rises again!");
           setCombatState(prev => ({
             ...prev,
             enemyHp: Math.floor(prev.enemyMaxHp * 0.6),
             bossPhase: 2,
             turn: 'PLAYER',
             effects: [] 
           }));
         }, 1000);
         return true;
       }
       setTimeout(() => winCombat(), 1000);
       return true;
    }
    return false;
  }, [combatState.bossPhase]);

  const winCombat = useCallback(() => {
    setCombatState(prevCombat => {
        const enemy = prevCombat.enemy;
        let expGain = enemy.exp;
        let goldGain = enemy.gold;
        let droppedItem = null;

        checkQuestProgress('KILL', enemy.name);

        const dropRoll = Math.random();
        const threshold = world.timeOfDay === 'NIGHT' ? 0.2 : 0.4;

        if (dropRoll > threshold) { 
          const tier = enemy.tier || 1;
          const lootTier = (enemy.name === 'White Walker' || Math.random() > 0.9) ? Math.min(4, tier + 1) : tier;
          const lootType = Math.random() > 0.5 ? 'WEAPON' : 'ARMOR';
          const collection = lootType === 'WEAPON' ? ITEMS.WEAPONS : ITEMS.ARMOR;
          const possibleItems = collection.filter(i => i.tier === lootTier);
          const itemTemplate = possibleItems.length > 0 ? possibleItems[Math.floor(Math.random() * possibleItems.length)] : collection[0];
          droppedItem = { ...itemTemplate, id: Math.random().toString(36).substr(2, 9) };
        }

        setPlayer(prevPlayer => {
            let newExp = prevPlayer.exp + expGain;
            let newLvl = prevPlayer.lvl;
            let newStats = { ...prevPlayer }; 

            if (newExp >= prevPlayer.expToNext) {
              newLvl++;
              newExp -= prevPlayer.expToNext;
              newStats.maxHp += 15;
              newStats.hp = newStats.maxHp; 
              newStats.atk += 2;
              newStats.def += 1;
              newStats.expToNext = Math.floor(newStats.expToNext * 1.4);
            }

            return {
                ...prevPlayer,
                maxHp: prevPlayer.maxHp + (newStats.maxHp - prevPlayer.maxHp),
                atk: prevPlayer.atk + (newStats.atk - prevPlayer.atk),
                def: prevPlayer.def + (newStats.def - prevPlayer.def),
                expToNext: newStats.expToNext,
                hp: prevPlayer.hp + (newStats.hp - prevPlayer.hp), 
                lvl: newLvl,
                exp: newExp,
                gold: prevPlayer.gold + goldGain,
                locationId: activeLocation?.id || prevPlayer.locationId
            };
        });
        
        if (activeLocation?.boss) {
            setScreen('VICTORY');
        } else {
            if (droppedItem) {
              setLoot(droppedItem);
              setScreen('LOOT');
            } else {
              setScreen('MAP');
            }
        }

        return prevCombat; 
    });
  }, [world.timeOfDay, activeLocation, checkQuestProgress]);

  // ... (Rest of combat logic functions: playerTurnStart, enemyAttack, startEnemyTurnCycle, nextTurn, playerAttack, useWeaponSkill, useAbility, playerDefend, playerHeal)
  const playerTurnStart = useCallback(() => {
    setCombatState(prev => {
        const { currentPlayerHp, logUpdates, remainingEffects, stun } = processDoT('PLAYER', prev);
        
        if (logUpdates.length > 0) {
            setPlayer(p => ({ ...p, hp: Math.max(0, currentPlayerHp) }));
        }

        if (currentPlayerHp <= 0) {
            setTimeout(() => setScreen('GAMEOVER'), 1000);
            return prev; 
        }

        if (stun) {
             setTimeout(() => {
                 combatLog("You are stunned and cannot act!");
                 startEnemyTurnCycle(); 
            }, 1000);
            return {
                ...prev,
                turn: 'ENEMY',
                log: [...prev.log, ...logUpdates],
                effects: remainingEffects
            };
        }

        return {
            ...prev,
            log: [...prev.log, ...logUpdates],
            effects: remainingEffects
        };
    });
  }, [processDoT]);

  const enemyAttack = useCallback((currentEnemyHp, sunderVal = 0) => {
    setCombatState(prev => {
        const enemy = prev.enemy;
        const { totalDef } = totalStats; 
        
        let atkMultiplier = 1;
        if (world.timeOfDay === 'NIGHT') atkMultiplier = 1.2;
        if (enemy.name === 'White Walker' && prev.bossPhase === 2) atkMultiplier = 1.5;

        let specialUsed = false;
        if (enemy.special && Math.random() < 0.25) {
            specialUsed = true;
        }

        let damage = Math.floor((enemy.atk * atkMultiplier) + (Math.random() * 5) - totalDef);
        damage = Math.max(0, damage);
        
        let msg = `${enemy.name} attacks! Took ${damage} DMG.`;
        let addedEffects = [];

        if (specialUsed) {
            if (enemy.special === 'POISON') {
                msg = `${enemy.name} bites with Venom! You are poisoned.`;
                addedEffects.push({ type: 'BLEED', duration: 3, val: 5, target: 'PLAYER' }); 
                damage += 5;
            } else if (enemy.special === 'STUN') {
                msg = `${enemy.name} bashes you! You are Stunned.`;
                addedEffects.push({ type: 'STUN', duration: 1, val: 0, target: 'PLAYER' });
            } else if (enemy.special === 'BURN') {
                msg = `${enemy.name} casts fire! You burn.`;
                addedEffects.push({ type: 'BURN', duration: 3, val: 8, target: 'PLAYER' });
            }
        }

        if (damage > 0) showFloatingText(`-${damage}`, 'damage');
        
        setPlayer(p => {
            const newHp = p.hp - damage;
            if (newHp <= 0) setTimeout(() => setScreen('GAMEOVER'), 1000);
            return { ...p, hp: newHp };
        });
        
        setTimeout(() => playerTurnStart(), 1000);

        return {
            ...prev,
            log: [...prev.log, msg].slice(-30),
            turn: 'PLAYER',
            effects: [...prev.effects, ...addedEffects]
        };
    });
  }, [totalStats, world.timeOfDay, playerTurnStart]);

  const startEnemyTurnCycle = useCallback((targetHp) => {
     setCombatState(prev => {
        const { currentEnemyHp, logUpdates, remainingEffects, stun, sunder } = processDoT('ENEMY', prev);
        
        if (currentEnemyHp <= 0) {
             if (checkDeath(currentEnemyHp, prev.enemy)) return prev; 
        }

        if (stun) {
             setTimeout(() => {
                 setCombatState(p => ({ ...p, turn: 'PLAYER' }));
             }, 1000);
             return {
                 ...prev,
                 enemyHp: currentEnemyHp,
                 log: [...prev.log, ...logUpdates],
                 effects: remainingEffects
             };
        }
        
        setTimeout(() => enemyAttack(currentEnemyHp, sunder), 800);

        return {
            ...prev,
            enemyHp: currentEnemyHp,
            log: [...prev.log, ...logUpdates],
            effects: remainingEffects
        };
     });
  }, [processDoT, enemyAttack, checkDeath]);

  const nextTurn = useCallback((newEnemyHp) => {
    if (checkDeath(newEnemyHp, combatState.enemy)) return;

    setCombatState(prev => ({
      ...prev,
      enemyHp: newEnemyHp,
      turn: 'ENEMY',
      abilityCd: Math.max(0, prev.abilityCd - 1),
      weaponCd: Math.max(0, prev.weaponCd - 1),
    }));
    
    setTimeout(() => startEnemyTurnCycle(newEnemyHp), 1000);
  }, [combatState.enemy, checkDeath, startEnemyTurnCycle]);

  const playerAttack = useCallback(() => {
    if (combatState.turn !== 'PLAYER') return;

    const { sunder } = processDoT('ENEMY', combatState); 
    const { totalAtk } = totalStats;
    
    const isCrit = Math.random() < 0.15;
    let damage = Math.floor(totalAtk * (isCrit ? 1.5 : 1) + (Math.random() * 4));
    if (sunder > 0) damage += sunder;

    if (world.weather === 'RAIN') damage = Math.floor(damage * 0.9); 
    if (world.weather === 'WIND' && Math.random() < 0.2) {
        combatLog("Strong winds cause your attack to miss!");
        setCombatState(prev => ({ ...prev, turn: 'ENEMY' }));
        setTimeout(() => startEnemyTurnCycle(combatState.enemyHp), 1000);
        return;
    }

    damage = Math.max(1, damage);
    const newEnemyHp = Math.max(0, combatState.enemyHp - damage);
    
    combatLog(`You hit ${combatState.enemy.name} for ${damage} DMG! ${isCrit ? 'Critical Hit!' : ''}`);
    showFloatingText(`-${damage}`, 'damage');

    nextTurn(newEnemyHp);
  }, [combatState, totalStats, world.weather, processDoT, nextTurn, startEnemyTurnCycle]);

  const useWeaponSkill = useCallback(() => {
    if (combatState.turn !== 'PLAYER' || combatState.weaponCd > 0 || !player.gear.weapon) return;
    
    const skillId = player.gear.weapon.skillId;
    if (!skillId) return;
    
    const skill = WEAPON_SKILLS[skillId];
    const { totalAtk } = totalStats;
    let damage = Math.floor(totalAtk * skill.mult);
    let addedEffects = [];
    let heal = 0;

    combatLog(`Weapon Art: ${skill.name}!`);

    if (skill.effect === 'BURN') {
      addedEffects.push({ type: 'BURN', duration: 3, val: 10, target: 'ENEMY' });
    } else if (skill.effect === 'SUNDER') {
      addedEffects.push({ type: 'SUNDER', duration: 100, val: 5, target: 'ENEMY' }); 
      combatLog("Enemy armor shattered!");
    } else if (skill.effect === 'EXECUTE') {
      const hpPercent = combatState.enemyHp / combatState.enemyMaxHp;
      if (hpPercent < 0.4) {
         damage = damage * 2.5;
         combatLog("EXECUTE! Massive Damage.");
      }
    } else if (skill.effect === 'LIFESTEAL') {
      heal = Math.floor(damage * 0.5);
    }

    const newEnemyHp = Math.max(0, combatState.enemyHp - damage);
    if (damage > 0) showFloatingText(`-${damage}`, 'damage');

    if (heal > 0) {
      const newHp = Math.min(totalStats.totalMaxHp, player.hp + heal);
      setPlayer(prev => ({ ...prev, hp: newHp }));
      showFloatingText(`+${heal}`, 'heal');
    }
    
    setCombatState(prev => ({
      ...prev,
      enemyHp: newEnemyHp,
      weaponCd: skill.cd + 1,
      effects: [...prev.effects, ...addedEffects]
    }));

    nextTurn(newEnemyHp);
  }, [combatState, player.gear.weapon, player.hp, totalStats, nextTurn]);

  const useAbility = useCallback(() => {
    if (combatState.turn !== 'PLAYER' || combatState.abilityCd > 0) return;

    const { ability } = player.house;
    const { totalAtk } = totalStats;
    let damage = 0;
    let addedEffects = [];

    combatLog(`Used Ability: ${ability.name}!`);

    if (ability.type === 'BURN_NUKE') {
      damage = Math.floor(totalAtk * 2.0);
      if (world.weather === 'RAIN') {
        damage = Math.floor(damage * 0.5);
        combatLog("The rain stifles your flames!");
      }
      combatLog(`Fire engulfs the enemy! Applied BURN.`);
      addedEffects.push({ type: 'BURN', duration: 3, val: 10, target: 'ENEMY' });
      showFloatingText(`-${damage}`, 'damage');
    } else if (ability.type === 'BLEED_STRIKE') {
      damage = Math.floor(totalAtk * 1.5);
      combatLog(`A vicious slash! Applied BLEED.`);
      addedEffects.push({ type: 'BLEED', duration: 3, val: 8, target: 'ENEMY' });
      showFloatingText(`-${damage}`, 'damage');
    } else if (ability.type === 'STUN') {
      damage = Math.floor(totalAtk * 1.0);
      combatLog(`You bash the enemy for ${damage} DMG and STUN them!`);
      addedEffects.push({ type: 'STUN', duration: 1, val: 0, target: 'ENEMY' });
      showFloatingText(`STUN`, 'special');
    }

    const newEnemyHp = Math.max(0, combatState.enemyHp - damage);
    
    setCombatState(prev => ({
      ...prev,
      enemyHp: newEnemyHp,
      abilityCd: ability.cooldown + 1,
      effects: [...prev.effects, ...addedEffects]
    }));

    nextTurn(newEnemyHp);
  }, [combatState, player.house, totalStats, world.weather, nextTurn]);

  const playerDefend = useCallback(() => {
    if (combatState.turn !== 'PLAYER') return;
    combatLog(`You brace for impact.`);
    setCombatState(prev => ({ ...prev, turn: 'ENEMY_BLOCKED', abilityCd: Math.max(0, prev.abilityCd - 1), weaponCd: Math.max(0, prev.weaponCd - 1) }));
    setTimeout(() => startEnemyTurnCycle(combatState.enemyHp), 1000); 
  }, [combatState, startEnemyTurnCycle]);

  const playerHeal = useCallback(() => {
    if (combatState.turn !== 'PLAYER') return;
    if (player.potions <= 0) {
      combatLog("No potions left!");
      return;
    }
    const healAmount = 50;
    const { totalMaxHp } = totalStats;
    const newHp = Math.min(totalMaxHp, player.hp + healAmount);
    setPlayer(prev => ({ ...prev, hp: newHp, potions: prev.potions - 1 }));
    combatLog(`Used Potion. Recovered ${healAmount} HP.`);
    showFloatingText(`+${healAmount}`, 'heal');
    nextTurn(combatState.enemyHp);
  }, [combatState, player.potions, player.hp, totalStats, nextTurn]);


  const handleEventChoice = (choice) => {
    const { totalMaxHp } = totalStats;

    if (choice === 'REST') {
      setPlayer(prev => ({ ...prev, hp: Math.min(totalMaxHp, prev.hp + 40), locationId: activeLocation.id }));
      alert("You rested and recovered 40 HP.");
    } else if (choice === 'MERCHANT') {
      if (player.gold >= 50) {
        setPlayer(prev => ({ ...prev, gold: prev.gold - 50, potions: prev.potions + 1, locationId: activeLocation.id }));
        alert("Bought a potion.");
      } else {
        alert("Not enough gold!");
        return; 
      }
    } else if (choice === 'ROB_MERCHANT') {
       const success = Math.random() > 0.5;
       if (success) {
          const loot = Math.floor(Math.random() * 100) + 50;
          setPlayer(prev => ({ ...prev, gold: prev.gold + loot, honor: prev.honor - 15, locationId: activeLocation.id }));
          alert(`You threatened the merchant and took ${loot} Gold. (Honor -15)`);
       } else {
          setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - 30), honor: prev.honor - 10, locationId: activeLocation.id }));
          alert(`The merchant's guards beat you up! Took 30 DMG. (Honor -10)`);
       }
    } else if (choice === 'TRAINING') {
       if (player.gold >= 100) {
        setPlayer(prev => ({ ...prev, gold: prev.gold - 100, atk: prev.atk + 2, locationId: activeLocation.id }));
        alert("Attack increased by 2.");
       } else {
        alert("Not enough gold.");
        return;
       }
    } else if (choice === 'GAMBLE') {
      const bet = 50;
      if (player.gold < bet) { alert("Not enough gold."); return; }
      const win = Math.random() > 0.5;
      if (win) {
        setPlayer(prev => ({ ...prev, gold: prev.gold + bet, locationId: activeLocation.id }));
        alert("You won 50 Gold!");
      } else {
        setPlayer(prev => ({ ...prev, gold: prev.gold - bet, locationId: activeLocation.id }));
        alert("You lost 50 Gold.");
      }
    } else if (choice === 'SACRIFICE') {
      if (player.hp <= 30) { alert("Too weak to sacrifice blood."); return; }
      const type = Math.random() > 0.5 ? 'ATK' : 'HP';
      setPlayer(prev => ({ 
        ...prev, 
        hp: prev.hp - 20, 
        atk: type === 'ATK' ? prev.atk + 3 : prev.atk,
        maxHp: type === 'HP' ? prev.maxHp + 20 : prev.maxHp,
        locationId: activeLocation.id,
        honor: prev.honor - 5
      }));
      alert(`You offered blood. Gained permanent ${type === 'ATK' ? 'Attack' : 'Max HP'}. (Honor -5)`);
    } else if (choice === 'PRAY') {
      setPlayer(prev => ({ 
        ...prev, 
        hp: Math.min(totalMaxHp, prev.hp + 20),
        honor: prev.honor + 10,
        locationId: activeLocation.id 
      }));
      alert("You prayed to the Seven. Recovered 20 HP. (Honor +10)");
    }

    setScreen('MAP');
  };

  const restartGame = () => {
    localStorage.removeItem('got_rpg_save_v8');
    setPlayer({
      house: null,
      lvl: 1,
      exp: 0,
      expToNext: 100,
      hp: 100,
      maxHp: 100,
      atk: 10,
      def: 0,
      gold: 0,
      potions: 1,
      locationId: 'winterfell',
      gear: { weapon: null, armor: null },
      inventory: [],
      maxInventory: 12,
      quest: null,
      honor: 0
    });
    setWorld({ day: 1, timeOfDay: 'DAY', weather: 'SNOW', news: WORLD_NEWS[0] });
    setScreen('START');
  };

  // --- Loot Logic ---
  const takeLoot = useCallback(() => {
      if (addToInventory(loot)) {
          setScreen('MAP');
          setLoot(null);
      } else {
          alert("Inventory Full! Discard loot or sell items first.");
      }
  }, [loot, addToInventory]);

  const discardLoot = useCallback(() => {
      setPlayer(prev => ({ ...prev, gold: prev.gold + loot.value }));
      setLoot(null);
      setScreen('MAP');
  }, [loot]);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -30px); } }
        .animate-floatUp { animation: floatUp 0.8s ease-out forwards; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
      `}</style>
      
      <div className="font-sans bg-slate-950 min-h-screen text-slate-200 select-none">
        {screen === 'START' && <RenderStart selectHouse={selectHouse} />}
        
        {/* Always show Header except on Start, GameOver, Victory */}
        {['MAP', 'COMBAT', 'EVENT', 'LOOT'].includes(screen) && (
             <Header 
                player={player} 
                world={world} 
                totalStats={totalStats} 
                toggleInventory={() => setShowInventory(true)} 
                toggleJournal={() => setShowJournal(true)}
            />
        )}

        {screen === 'MAP' && (
            <MapScreen 
                player={player} 
                world={world} 
                handleTravel={handleTravel} 
                setShowMarket={setShowMarket} 
                setNPC={setActiveNPC}
            />
        )}
        {screen === 'COMBAT' && (
            <CombatScreen 
                combatState={combatState}
                player={player}
                totalStats={totalStats}
                playerAttack={playerAttack}
                playerDefend={playerDefend}
                useAbility={useAbility}
                useWeaponSkill={useWeaponSkill}
                playerHeal={playerHeal}
                logsEndRef={logsEndRef}
            />
        )}
        {screen === 'EVENT' && (
            <EventScreen 
                player={player}
                world={world}
                totalStats={totalStats}
                activeEvent={activeEvent}
                handleEventChoice={handleEventChoice}
                setScreen={setScreen}
                toggleInventory={() => setShowInventory(true)}
                toggleJournal={() => setShowJournal(true)}
            />
        )}
        {screen === 'LOOT' && (
            <LootScreen 
                loot={loot} 
                takeLoot={takeLoot} 
                discardLoot={discardLoot} 
            />
        )}

        {screen === 'GAMEOVER' && <RenderGameOver restartGame={restartGame} activeLocation={activeLocation} />}
        {screen === 'VICTORY' && <RenderVictory restartGame={restartGame} player={player} />}
        
        {showInventory && (
            <InventoryScreen 
                player={player} 
                totalStats={totalStats} 
                equipItem={equipItem} 
                sellItem={sellItem} 
                onClose={() => setShowInventory(false)} 
            />
        )}
        
        {showMarket && (
            <MarketScreen 
                player={player} 
                buyItem={buyItem} 
                onClose={() => setShowMarket(false)} 
            />
        )}

        {showJournal && (
            <JournalScreen 
                player={player} 
                onClose={() => setShowJournal(false)}
            />
        )}

        {activeNPC && (
            <NPCDialogue 
               npc={activeNPC} 
               player={player}
               onClose={() => setActiveNPC(null)}
               onInteract={handleNPCInteraction}
            />
        )}
      </div>
    </>
  );
}
