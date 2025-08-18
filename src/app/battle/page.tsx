'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Battle, Unit, FACTION_CONFIGS, DiceResult, DiceRoll } from '@/types/game';
import { 
  getCurrentBattle, 
  saveBattle, 
  logTurnStart, 
  logDamage, 
  logGloryEarned 
} from '@/lib/storage';
import { 
  getWoundPercentage, 
  getWoundStatus, 
  applyDamage, 
  healUnit,
  processEndOfTurnEffects,
  createDiceRoll
} from '@/lib/gameUtils';

export default function BattlePage() {
  const router = useRouter();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showCombatLog, setShowCombatLog] = useState(false);

  useEffect(() => {
    const currentBattle = getCurrentBattle();
    if (!currentBattle) {
      router.push('/');
      return;
    }
    setBattle(currentBattle);
    setLoading(false);
  }, [router]);

  const saveBattleState = (updatedBattle: Battle) => {
    setBattle(updatedBattle);
    saveBattle(updatedBattle);
  };

  const nextTurn = () => {
    if (!battle) return;

    const currentUnit = getCurrentUnit(battle);

    // Remove unused variable warning
    if (!currentUnit) {
      // No current unit available
    }
    const nextIndex = (battle.currentUnitIndex + 1) % battle.turnOrder.length;
    const isNewTurn = nextIndex === 0;

    let updatedBattle = { ...battle };
    updatedBattle.currentUnitIndex = nextIndex;
    
    if (isNewTurn) {
      updatedBattle.currentTurn += 1;
      // Process end-of-turn effects for all units
      updatedBattle.units = updatedBattle.units.map(processEndOfTurnEffects);
    }

    const nextUnit = updatedBattle.units.find(u => u.id === updatedBattle.turnOrder[nextIndex]);
    if (nextUnit) {
      logTurnStart(updatedBattle.id, nextUnit.id);
      updatedBattle = getCurrentBattle()!; // Reload to get updated log
    }

    saveBattleState(updatedBattle);
  };

  const getCurrentUnit = (battle: Battle): Unit | null => {
    if (battle.units.length === 0) return null;
    const currentUnitId = battle.turnOrder[battle.currentUnitIndex];
    return battle.units.find(u => u.id === currentUnitId) || null;
  };

  const updateUnit = (unitId: string, updates: Partial<Unit>) => {
    if (!battle) return;

    const updatedBattle = {
      ...battle,
      units: battle.units.map(u => 
        u.id === unitId ? { ...u, ...updates } : u
      )
    };

    saveBattleState(updatedBattle);
  };

  const damageUnit = (unitId: string, damage: number) => {
    if (!battle) return;

    const unit = battle.units.find(u => u.id === unitId);
    if (!unit) return;

    const updatedUnit = applyDamage(unit, damage);
    updateUnit(unitId, updatedUnit);
    
    logDamage(battle.id, unitId, damage);
  };

  const healUnitAction = (unitId: string, healing: number) => {
    if (!battle) return;

    const unit = battle.units.find(u => u.id === unitId);
    if (!unit) return;

    const updatedUnit = healUnit(unit, healing);
    updateUnit(unitId, updatedUnit);
  };

  const addGlory = (unitId: string, amount: number, reason?: string) => {
    if (!battle) return;

    const unit = battle.units.find(u => u.id === unitId);
    if (!unit) return;

    updateUnit(unitId, { gloryPoints: unit.gloryPoints + amount });
    logGloryEarned(battle.id, unitId, amount, reason);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading battle...</div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-red-500 mb-4">No Battle Found</h2>
          <Link href="/" className="grimdark-button px-4 py-2">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const currentUnit = getCurrentUnit(battle);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-red-600">{battle.name}</h1>
            <p className="text-sm text-slate-400">
              Turn {battle.currentTurn} • {currentUnit?.name || 'No units'} turn
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDiceRoller(true)}
              className="grimdark-button px-3 py-2 text-sm"
            >
              🎲 Dice
            </button>
            <button
              onClick={() => setShowCombatLog(true)}
              className="grimdark-button px-3 py-2 text-sm"
            >
              📜 Log
            </button>
            <Link href="/" className="grimdark-button px-3 py-2 text-sm">
              🏠 Home
            </Link>
          </div>
        </div>

        {/* Battle Status */}
        <div className="grimdark-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-slate-400">Glory Pool</div>
              <div className="text-xl font-bold text-yellow-400">{battle.gloryPool}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Blood Markers</div>
              <div className="text-xl font-bold text-red-400">{battle.bloodMarkers}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Turn</div>
              <div className="text-xl font-bold text-slate-100">{battle.currentTurn}</div>
            </div>
            <div className="text-center">
              <button
                onClick={nextTurn}
                className="grimdark-button px-4 py-2 bg-green-700 hover:bg-green-600 w-full"
              >
                Next Turn
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Turn Order */}
        <div className="grimdark-card p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-500">Initiative Order</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {battle.turnOrder.map((unitId, index) => {
              const unit = battle.units.find(u => u.id === unitId);
              if (!unit) return null;

              const isCurrent = index === battle.currentUnitIndex;
              const factionConfig = FACTION_CONFIGS[unit.faction];

              return (
                <div
                  key={unitId}
                  className={`flex-shrink-0 p-3 rounded border-2 min-w-[120px] text-center ${
                    isCurrent 
                      ? 'border-yellow-400 bg-yellow-900/20' 
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-100">{unit.name}</div>
                  <div className="text-xs text-slate-400">Agility {unit.agility}</div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: factionConfig.color }}
                  >
                    {factionConfig.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unit Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {battle.units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isCurrentTurn={currentUnit?.id === unit.id}
              onDamage={(damage) => damageUnit(unit.id, damage)}
              onHeal={(healing) => healUnitAction(unit.id, healing)}
              onAddGlory={(amount, reason) => addGlory(unit.id, amount, reason)}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      {showDiceRoller && (
        <DiceRollerModal 
          battle={battle}
          onClose={() => setShowDiceRoller(false)}
          onRoll={(roll) => {
            // Handle dice roll results
            const updatedBattle = { ...battle };
            if (roll.results.some((r: DiceResult) => r.roll === 1)) {
              updatedBattle.bloodMarkers += 1;
            }
            saveBattleState(updatedBattle);
          }}
        />
      )}

      {showCombatLog && (
        <CombatLogModal
          battle={battle}
          onClose={() => setShowCombatLog(false)}
        />
      )}
    </div>
  );
}

interface UnitCardProps {
  unit: Unit;
  isCurrentTurn: boolean;
  onDamage: (damage: number) => void;
  onHeal: (healing: number) => void;
  onAddGlory: (amount: number, reason?: string) => void;
}

function UnitCard({ unit, isCurrentTurn, onDamage, onHeal, onAddGlory }: UnitCardProps) {
  const factionConfig = FACTION_CONFIGS[unit.faction];
  const woundPercentage = getWoundPercentage(unit);
  const woundStatus = getWoundStatus(unit);

  const getWoundBarColor = () => {
    switch (woundStatus) {
      case 'healthy': return 'bg-green-600';
      case 'wounded': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      case 'defeated': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className={`grimdark-card p-4 ${isCurrentTurn ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-slate-100">{unit.name}</h4>
          <p className="text-sm" style={{ color: factionConfig.color }}>
            {factionConfig.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Glory</div>
          <div className="text-lg font-bold text-yellow-400">{unit.gloryPoints}</div>
        </div>
      </div>

      {/* Wound Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Wounds</span>
          <span className="text-slate-100">{unit.wounds}/{unit.maxWounds}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getWoundBarColor()}`}
            style={{ width: `${woundPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-slate-400">Agility:</span>
          <span className="ml-1 text-slate-100">{unit.agility}</span>
        </div>
        <div>
          <span className="text-slate-400">Armour:</span>
          <span className="ml-1 text-slate-100">{unit.armour}</span>
        </div>
        <div>
          <span className="text-slate-400">Movement:</span>
          <span className="ml-1 text-slate-100">{unit.movement}</span>
        </div>
        <div>
          <span className="text-slate-400">Melee:</span>
          <span className="ml-1 text-slate-100">{unit.meleeAttack}</span>
        </div>
      </div>

      {/* Effects */}
      {unit.effects.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-slate-400 mb-1">Effects:</div>
          <div className="flex flex-wrap gap-1">
            {unit.effects.map((effect) => (
              <span
                key={effect.id}
                className="px-2 py-1 bg-purple-900 text-purple-200 text-xs rounded"
              >
                {effect.name}
                {effect.duration && ` (${effect.duration})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onDamage(1)}
          className="grimdark-button px-2 py-1 text-xs bg-red-700 hover:bg-red-600"
        >
          -1 Wound
        </button>
        <button
          onClick={() => onHeal(1)}
          className="grimdark-button px-2 py-1 text-xs bg-green-700 hover:bg-green-600"
        >
          +1 Wound
        </button>
        <button
          onClick={() => onAddGlory(1)}
          className="grimdark-button px-2 py-1 text-xs bg-yellow-700 hover:bg-yellow-600"
        >
          +1 Glory
        </button>
      </div>
    </div>
  );
}

interface DiceRollerModalProps {
  battle: Battle;
  onClose: () => void;
  onRoll: (roll: DiceRoll) => void;
}

function DiceRollerModal({ battle, onClose, onRoll }: DiceRollerModalProps) {
  const [diceCount, setDiceCount] = useState(1);
  const [target, setTarget] = useState(6);
  const [description, setDescription] = useState('');
  const [bloodMarkersUsed, setBloodMarkersUsed] = useState(0);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);

  const rollDice = () => {
    const roll = createDiceRoll(
      description || 'Dice roll',
      undefined,
      target,
      diceCount,
      bloodMarkersUsed
    );

    setLastRoll(roll);
    onRoll(roll);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="grimdark-card p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-red-500">
          Dice Roller
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Attack roll, test, etc..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Dice Count
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={diceCount}
                onChange={(e) => setDiceCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Target Number
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Blood Markers Used (max {battle.bloodMarkers})
            </label>
            <input
              type="number"
              min="0"
              max={battle.bloodMarkers}
              value={bloodMarkersUsed}
              onChange={(e) => setBloodMarkersUsed(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            onClick={rollDice}
            className="w-full grimdark-button py-3 bg-red-700 hover:bg-red-600 font-semibold"
          >
            🎲 Roll Dice
          </button>

          {lastRoll && (
            <div className="bg-slate-800 p-4 rounded border border-slate-600">
              <h4 className="font-semibold mb-2 text-slate-100">Result:</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  {lastRoll.rolls.map((roll: number, index: number) => {
                    const result = lastRoll.results[index];
                    let bgColor = 'bg-gray-600';
                    if (result.critical) bgColor = 'bg-yellow-600';
                    else if (result.type === 'success') bgColor = 'bg-green-600';
                    else if (result.type === 'failure') bgColor = 'bg-red-600';

                    return (
                      <span key={index} className={`px-2 py-1 rounded ${bgColor} text-white font-bold`}>
                        {roll}
                      </span>
                    );
                  })}
                </div>
                <div className="text-sm text-slate-300">
                  Successes: {lastRoll.results.filter((r: DiceResult) => r.type === 'success' || r.critical).length}
                  {lastRoll.results.some((r: DiceResult) => r.critical) && (
                    <span className="text-yellow-400 ml-2">CRITICAL!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="grimdark-button px-4 py-2 flex-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CombatLogModalProps {
  battle: Battle;
  onClose: () => void;
}

function CombatLogModal({ battle, onClose }: CombatLogModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="grimdark-card p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-red-500">
          Combat Log
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2">
          {battle.combatLog.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No log entries yet.</p>
          ) : (
            battle.combatLog.slice().reverse().map((entry) => (
              <div key={entry.id} className="bg-slate-800 p-3 rounded border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm text-slate-100">{entry.message}</span>
                  <span className="text-xs text-slate-400">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {entry.type.replace('_', ' ')}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="grimdark-button px-4 py-2 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}