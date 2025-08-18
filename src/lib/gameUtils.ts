import {
  DiceRoll,
  DiceResult,
  DiceResultType,
  Unit,
  Effect,
  EffectType,
} from "@/types/game";
import { generateId } from "./storage";

// Dice rolling mechanics for Trench Crusade
export function rollD10(count: number = 1): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * 10) + 1);
  }
  return rolls;
}

export function evaluateDiceRolls(
  rolls: number[],
  target: number = 6,
  bloodMarkersUsed: number = 0
): DiceResult[] {
  return rolls.map((roll) => {
    const modifiedRoll = roll + bloodMarkersUsed;
    let type: DiceResultType;
    let critical = false;

    if (roll === 10) {
      type = DiceResultType.CRITICAL;
      critical = true;
    } else if (modifiedRoll >= target) {
      type = DiceResultType.SUCCESS;
    } else {
      type = DiceResultType.FAILURE;
    }

    return { roll, type, critical };
  });
}

export function createDiceRoll(
  description: string,
  unitId?: string,
  target?: number,
  diceCount: number = 1,
  bloodMarkersUsed: number = 0
): DiceRoll {
  const rolls = rollD10(diceCount);
  const results = evaluateDiceRolls(rolls, target, bloodMarkersUsed);

  return {
    id: generateId(),
    timestamp: new Date(),
    unitId,
    rolls,
    target,
    results,
    bloodMarkersUsed,
    description,
  };
}

// Effect management
export function getEffectDescription(effectType: EffectType): string {
  const descriptions: Record<EffectType, string> = {
    [EffectType.PINNED]: "Unit cannot move or charge. -1 to all rolls.",
    [EffectType.BLOOD_DRUNK]:
      "Unit must charge if possible. +1 to melee attacks.",
    [EffectType.TERRIFIED]: "Unit must make morale checks. -2 to all rolls.",
    [EffectType.ON_FIRE]: "Takes 1 wound at start of turn. Roll to extinguish.",
    [EffectType.GAS_MASK]: "Immunity to gas attacks.",
    [EffectType.BARBED_WIRE]: "Movement reduced by half in difficult terrain.",
    [EffectType.TRENCHES]: "Counts as in cover when in trenches.",
    [EffectType.CUSTOM]: "Custom effect defined by GM.",
  };

  return descriptions[effectType] || "Unknown effect";
}

export function createEffect(
  type: EffectType,
  duration?: number,
  customName?: string
): Effect {
  const name =
    customName ||
    type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    id: generateId(),
    name,
    type,
    duration,
    description: getEffectDescription(type),
  };
}

export function processEndOfTurnEffects(unit: Unit): Unit {
  const updatedEffects = unit.effects
    .map((effect) => {
      if (effect.duration !== undefined && effect.duration > 0) {
        return { ...effect, duration: effect.duration - 1 };
      }
      return effect;
    })
    .filter((effect) => effect.duration === undefined || effect.duration > 0);

  // Handle On Fire damage
  let updatedWounds = unit.wounds;
  const onFire = unit.effects.find((e) => e.type === EffectType.ON_FIRE);
  if (onFire) {
    updatedWounds = Math.max(0, updatedWounds - 1);
  }

  return {
    ...unit,
    wounds: updatedWounds,
    effects: updatedEffects,
  };
}

// Unit stat calculations with effects
export function getEffectiveAgility(unit: Unit): number {
  let agility = unit.agility;

  // Apply effect modifiers
  if (unit.effects.some((e) => e.type === EffectType.TERRIFIED)) {
    agility -= 2;
  }
  if (unit.effects.some((e) => e.type === EffectType.PINNED)) {
    agility -= 1;
  }

  return Math.max(1, agility);
}

export function getEffectiveMeleeAttack(unit: Unit): number {
  let attack = unit.meleeAttack;

  // Apply effect modifiers
  if (unit.effects.some((e) => e.type === EffectType.BLOOD_DRUNK)) {
    attack += 1;
  }
  if (unit.effects.some((e) => e.type === EffectType.TERRIFIED)) {
    attack -= 2;
  }
  if (unit.effects.some((e) => e.type === EffectType.PINNED)) {
    attack -= 1;
  }

  return Math.max(1, attack);
}

export function getEffectiveRangedAttack(unit: Unit): number {
  let attack = unit.rangedAttack;

  // Apply effect modifiers
  if (unit.effects.some((e) => e.type === EffectType.TERRIFIED)) {
    attack -= 2;
  }
  if (unit.effects.some((e) => e.type === EffectType.PINNED)) {
    attack -= 1;
  }

  return Math.max(1, attack);
}

export function getEffectiveMovement(unit: Unit): number {
  let movement = unit.movement;

  // Apply effect modifiers
  if (unit.effects.some((e) => e.type === EffectType.PINNED)) {
    movement = 0; // Cannot move when pinned
  }
  if (unit.effects.some((e) => e.type === EffectType.BARBED_WIRE)) {
    movement = Math.floor(movement / 2);
  }

  return Math.max(0, movement);
}

// Wound management
export function applyDamage(unit: Unit, damage: number): Unit {
  const newWounds = Math.max(0, unit.wounds - damage);

  return {
    ...unit,
    wounds: newWounds,
  };
}

export function healUnit(unit: Unit, healing: number): Unit {
  const newWounds = Math.min(unit.maxWounds, unit.wounds + healing);

  return {
    ...unit,
    wounds: newWounds,
  };
}

export function isUnitDefeated(unit: Unit): boolean {
  return unit.wounds <= 0;
}

// Glory point calculations
export function calculateGloryFromDamage(damage: number): number {
  // Basic: 1 glory per 2 damage dealt
  return Math.floor(damage / 2);
}

export function calculateGloryFromDefeat(defeatedUnit: Unit): number {
  // Glory based on defeated unit's max wounds and equipment
  let glory = Math.floor(defeatedUnit.maxWounds / 2);

  // Bonus for equipment
  glory += defeatedUnit.equipment.length;

  return Math.max(1, glory);
}

// Blood marker management
export function shouldIncrementBloodMarkers(diceRoll: DiceRoll): boolean {
  // Blood markers increment on critical failures (rolling 1)
  return diceRoll.results.some((result) => result.roll === 1);
}

// Utility functions for game state
export function getWoundPercentage(unit: Unit): number {
  if (unit.maxWounds === 0) return 0;
  return (unit.wounds / unit.maxWounds) * 100;
}

export function getWoundStatus(
  unit: Unit
): "healthy" | "wounded" | "critical" | "defeated" {
  const percentage = getWoundPercentage(unit);

  if (percentage <= 0) return "defeated";
  if (percentage <= 25) return "critical";
  if (percentage <= 75) return "wounded";
  return "healthy";
}

export function formatStatWithEffects(
  baseStat: number,
  effectiveStat: number
): string {
  if (baseStat === effectiveStat) {
    return baseStat.toString();
  }
  return `${baseStat} (${effectiveStat})`;
}
