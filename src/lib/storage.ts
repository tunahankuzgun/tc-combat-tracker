import { Battle, Unit, LogEntry, LogType, DiceRoll } from '@/types/game';

const STORAGE_KEYS = {
  BATTLES: 'tc_battles',
  CURRENT_BATTLE: 'tc_current_battle',
  DICE_HISTORY: 'tc_dice_history'
} as const;

// Battle management
export function saveBattle(battle: Battle): void {
  try {
    const battles = getAllBattles();
    const existingIndex = battles.findIndex(b => b.id === battle.id);
    
    battle.lastModified = new Date();
    
    if (existingIndex >= 0) {
      battles[existingIndex] = battle;
    } else {
      battles.push(battle);
    }
    
    localStorage.setItem(STORAGE_KEYS.BATTLES, JSON.stringify(battles));
    localStorage.setItem(STORAGE_KEYS.CURRENT_BATTLE, battle.id);
  } catch (error) {
    console.error('Failed to save battle:', error);
  }
}

export function getAllBattles(): Battle[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BATTLES);
    if (!stored) return [];
    
    const battles = JSON.parse(stored) as Battle[];
    return battles.map((battle: Battle) => ({
      ...battle,
      created: new Date(battle.created),
      lastModified: new Date(battle.lastModified),
      combatLog: battle.combatLog.map((entry: LogEntry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load battles:', error);
    return [];
  }
}

export function getBattle(id: string): Battle | null {
  const battles = getAllBattles();
  return battles.find(b => b.id === id) || null;
}

export function getCurrentBattle(): Battle | null {
  try {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_BATTLE);
    if (!currentId) return null;
    
    return getBattle(currentId);
  } catch (error) {
    console.error('Failed to get current battle:', error);
    return null;
  }
}

export function deleteBattle(id: string): void {
  try {
    const battles = getAllBattles().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BATTLES, JSON.stringify(battles));
    
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_BATTLE);
    if (currentId === id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_BATTLE);
    }
  } catch (error) {
    console.error('Failed to delete battle:', error);
  }
}

// Combat log helpers
export function addLogEntry(battleId: string, entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
  const battle = getBattle(battleId);
  if (!battle) return;
  
  const logEntry: LogEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date()
  };
  
  battle.combatLog.push(logEntry);
  saveBattle(battle);
}

export function logTurnStart(battleId: string, unitId: string): void {
  const battle = getBattle(battleId);
  const unit = battle?.units.find(u => u.id === unitId);
  if (!battle || !unit) return;
  
  addLogEntry(battleId, {
    type: LogType.TURN_START,
    message: `${unit.name} begins their turn`,
    unitId
  });
}

export function logDamage(battleId: string, targetId: string, damage: number, attackerId?: string): void {
  const battle = getBattle(battleId);
  const target = battle?.units.find(u => u.id === targetId);
  const attacker = attackerId ? battle?.units.find(u => u.id === attackerId) : null;
  if (!battle || !target) return;
  
  const message = attacker 
    ? `${attacker.name} deals ${damage} damage to ${target.name}`
    : `${target.name} takes ${damage} damage`;
    
  addLogEntry(battleId, {
    type: LogType.DAMAGE,
    message,
    unitId: targetId,
    data: { damage, attackerId }
  });
}

export function logGloryEarned(battleId: string, unitId: string, amount: number, reason?: string): void {
  const battle = getBattle(battleId);
  const unit = battle?.units.find(u => u.id === unitId);
  if (!battle || !unit) return;
  
  const message = reason 
    ? `${unit.name} earns ${amount} Glory Points for ${reason}`
    : `${unit.name} earns ${amount} Glory Points`;
    
  addLogEntry(battleId, {
    type: LogType.GLORY_EARNED,
    message,
    unitId,
    data: { amount, reason }
  });
}

// Dice roll management
export function saveDiceRoll(battleId: string, roll: DiceRoll): void {
  try {
    const battle = getBattle(battleId);
    if (!battle) return;
    
    addLogEntry(battleId, {
      type: LogType.DICE_ROLL,
      message: `${roll.description}: [${roll.rolls.join(', ')}]`,
      unitId: roll.unitId,
      data: roll
    });
    
    // Also save to dice history
    const history = getDiceHistory();
    history.unshift(roll);
    
    // Keep only last 100 rolls
    const trimmedHistory = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.DICE_HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save dice roll:', error);
  }
}

export function getDiceHistory(): DiceRoll[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DICE_HISTORY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as DiceRoll[];
    return history.map((roll: DiceRoll) => ({
      ...roll,
      timestamp: new Date(roll.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load dice history:', error);
    return [];
  }
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateTurnOrder(units: Unit[]): string[] {
  return [...units]
    .sort((a, b) => {
      // Primary sort: Agility (higher first)
      if (b.agility !== a.agility) {
        return b.agility - a.agility;
      }
      // Secondary sort: Name (alphabetical)
      return a.name.localeCompare(b.name);
    })
    .map(unit => unit.id);
}

export function getNextUnit(battle: Battle): Unit | null {
  if (battle.units.length === 0) return null;
  
  const currentIndex = battle.currentUnitIndex;
  const nextIndex = (currentIndex + 1) % battle.turnOrder.length;
  const nextUnitId = battle.turnOrder[nextIndex];
  
  return battle.units.find(u => u.id === nextUnitId) || null;
}

export function getCurrentUnit(battle: Battle): Unit | null {
  if (battle.units.length === 0) return null;
  
  const currentUnitId = battle.turnOrder[battle.currentUnitIndex];
  return battle.units.find(u => u.id === currentUnitId) || null;
}

// Storage size management
export function getStorageUsage(): { used: number; available: number } {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }
    
    // Estimate available space (browsers typically allow 5-10MB)
    const available = 5 * 1024 * 1024; // 5MB estimate
    
    return { used, available };
  } catch {
    return { used: 0, available: 0 };
  }
}

export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch {
    console.error('Failed to clear data');
  }
}