// Core game types for Trench Crusade Combat Tracker

export interface Unit {
  id: string;
  name: string;
  faction: FactionType;

  // Core stats
  wounds: number;
  maxWounds: number;
  armour: number;
  movement: number;
  agility: number;
  rangedAttack: number;
  meleeAttack: number;

  // Game state
  gloryPoints: number;
  effects: Effect[];
  equipment: Equipment[];

  // Display
  color?: string;
}

export interface Effect {
  id: string;
  name: string;
  type: EffectType;
  duration?: number; // turns remaining, undefined for permanent
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  durability?: number;
  maxDurability?: number;
  ammunition?: number;
  maxAmmunition?: number;
  description: string;
}

export interface Battle {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;

  units: Unit[];
  turnOrder: string[]; // unit IDs in initiative order
  currentTurn: number;
  currentUnitIndex: number;

  gloryPool: number;
  bloodMarkers: number;

  combatLog: LogEntry[];
  notes: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: LogType;
  message: string;
  unitId?: string;
  data?: unknown;
}

// Enums
export enum FactionType {
  TRENCH_PILGRIMS = "trench_pilgrims",
  IRON_SULTANATE = "iron_sultanate",
  COURT_OF_SEVEN_HEADED_SERPENT = "court_of_seven_headed_serpent",
  HERETIC_LEGION = "heretic_legion",
  NEW_ANTIOCH = "new_antioch",
  CUSTOM = "custom",
}

export enum EffectType {
  PINNED = "pinned",
  BLOOD_DRUNK = "blood_drunk",
  TERRIFIED = "terrified",
  ON_FIRE = "on_fire",
  GAS_MASK = "gas_mask",
  BARBED_WIRE = "barbed_wire",
  TRENCHES = "trenches",
  CUSTOM = "custom",
}

export enum EquipmentType {
  WEAPON = "weapon",
  ARMOR = "armor",
  TOOL = "tool",
  CONSUMABLE = "consumable",
}

export enum LogType {
  TURN_START = "turn_start",
  ATTACK = "attack",
  DAMAGE = "damage",
  HEAL = "heal",
  EFFECT_APPLIED = "effect_applied",
  EFFECT_REMOVED = "effect_removed",
  GLORY_EARNED = "glory_earned",
  DICE_ROLL = "dice_roll",
  NOTE = "note",
}

// Dice roll types
export interface DiceRoll {
  id: string;
  timestamp: Date;
  unitId?: string;
  rolls: number[];
  target?: number;
  results: DiceResult[];
  bloodMarkersUsed: number;
  description: string;
}

export interface DiceResult {
  roll: number;
  type: DiceResultType;
  critical?: boolean;
}

export enum DiceResultType {
  FAILURE = "failure",
  SUCCESS = "success",
  CRITICAL = "critical",
}

// Faction configurations
export interface FactionConfig {
  name: string;
  color: string;
  description: string;
  specialRules?: string[];
}

export const FACTION_CONFIGS: Record<FactionType, FactionConfig> = {
  [FactionType.TRENCH_PILGRIMS]: {
    name: "Trench Pilgrims",
    color: "#8B4513", // brown
    description:
      "Faithful soldiers of the Church, fighting in the name of righteousness.",
    specialRules: ["Faith Points", "Divine Protection"],
  },
  [FactionType.IRON_SULTANATE]: {
    name: "Iron Sultanate",
    color: "#DC143C", // crimson
    description:
      "Elite warriors of the Sultanate, masters of steel and gunpowder.",
    specialRules: ["Discipline", "Superior Equipment"],
  },
  [FactionType.COURT_OF_SEVEN_HEADED_SERPENT]: {
    name: "Court of the Seven-Headed Serpent",
    color: "#4B0082", // indigo
    description:
      "Heretical cultists wielding dark magic and forbidden knowledge.",
    specialRules: ["Dark Magic", "Serpent's Blessing"],
  },
  [FactionType.HERETIC_LEGION]: {
    name: "Heretic Legion",
    color: "#8B0000", // dark red
    description: "Corrupted soldiers turned against their former faith.",
    specialRules: ["Corruption", "Unholy Strength"],
  },
  [FactionType.NEW_ANTIOCH]: {
    name: "New Antioch",
    color: "#2F4F4F", // dark slate gray
    description: "Survivors of the great siege, hardened by endless warfare.",
    specialRules: ["Siege Warfare", "Desperate Courage"],
  },
  [FactionType.CUSTOM]: {
    name: "Custom Faction",
    color: "#696969", // dim gray
    description: "User-defined faction with custom rules.",
  },
};
