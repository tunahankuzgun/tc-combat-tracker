'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Battle, Unit, FactionType, FACTION_CONFIGS } from '@/types/game';
import { saveBattle, generateId, calculateTurnOrder } from '@/lib/storage';

export default function BattleSetup() {
  const router = useRouter();
  const [battleName, setBattleName] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const createBattle = () => {
    if (!battleName.trim() || units.length === 0) {
      alert('Please enter a battle name and add at least one unit.');
      return;
    }

    const battle: Battle = {
      id: generateId(),
      name: battleName.trim(),
      created: new Date(),
      lastModified: new Date(),
      units,
      turnOrder: calculateTurnOrder(units),
      currentTurn: 1,
      currentUnitIndex: 0,
      gloryPool: 0,
      bloodMarkers: 0,
      combatLog: [],
      notes: ''
    };

    saveBattle(battle);
    router.push('/battle');
  };

  const addUnit = (unit: Unit) => {
    setUnits([...units, unit]);
    setShowAddUnit(false);
  };

  const removeUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    setUnits(units.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Setup New Battle
        </h1>
        <p className="text-sm text-slate-400">
          Create warbands and configure your Trench Crusade battle
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Battle Name */}
        <div className="grimdark-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-red-500">
            Battle Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Battle Name
              </label>
              <input
                type="text"
                value={battleName}
                onChange={(e) => setBattleName(e.target.value)}
                placeholder="Enter battle name..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Units List */}
        <div className="grimdark-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-500">
              Warbands ({units.length})
            </h3>
            <button
              onClick={() => setShowAddUnit(true)}
              className="grimdark-button px-4 py-2 text-sm bg-green-700 hover:bg-green-600"
            >
              Add Unit
            </button>
          </div>

          {units.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No units added yet. Click &quot;Add Unit&quot; to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {units.map((unit) => (
                <UnitCard 
                  key={unit.id} 
                  unit={unit} 
                  onRemove={removeUnit}
                  onUpdate={updateUnit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="grimdark-button px-6 py-3"
          >
            Cancel
          </Link>
          <button
            onClick={createBattle}
            disabled={!battleName.trim() || units.length === 0}
            className="grimdark-button px-6 py-3 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Battle
          </button>
        </div>
      </main>

      {/* Add Unit Modal */}
      {showAddUnit && (
        <AddUnitModal 
          onAdd={addUnit} 
          onCancel={() => setShowAddUnit(false)} 
        />
      )}
    </div>
  );
}

interface UnitCardProps {
  unit: Unit;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Unit>) => void;
}

function UnitCard({ unit, onRemove }: UnitCardProps) {
  const factionConfig = FACTION_CONFIGS[unit.faction];

  return (
    <div className="bg-slate-800 border border-slate-600 rounded p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-slate-100">{unit.name}</h4>
          <p className="text-sm text-slate-400" style={{ color: factionConfig.color }}>
            {factionConfig.name}
          </p>
        </div>
        <button
          onClick={() => onRemove(unit.id)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-slate-400">Wounds:</span>
          <span className="ml-1 text-slate-100">{unit.wounds}/{unit.maxWounds}</span>
        </div>
        <div>
          <span className="text-slate-400">Agility:</span>
          <span className="ml-1 text-slate-100">{unit.agility}</span>
        </div>
        <div>
          <span className="text-slate-400">Armour:</span>
          <span className="ml-1 text-slate-100">{unit.armour}</span>
        </div>
        <div>
          <span className="text-slate-400">Glory:</span>
          <span className="ml-1 text-slate-100">{unit.gloryPoints}</span>
        </div>
      </div>
    </div>
  );
}

interface AddUnitModalProps {
  onAdd: (unit: Unit) => void;
  onCancel: () => void;
}

function AddUnitModal({ onAdd, onCancel }: AddUnitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    faction: FactionType.TRENCH_PILGRIMS,
    wounds: 3,
    maxWounds: 3,
    armour: 6,
    movement: 4,
    agility: 3,
    rangedAttack: 6,
    meleeAttack: 6,
    gloryPoints: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a unit name.');
      return;
    }

    const unit: Unit = {
      id: generateId(),
      ...formData,
      name: formData.name.trim(),
      effects: [],
      equipment: []
    };

    onAdd(unit);
  };

  const updateField = (field: keyof typeof formData, value: string | number | FactionType) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="grimdark-card p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-red-500">
          Add New Unit
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Unit Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter unit name..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:border-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Faction
            </label>
            <select
              value={formData.faction}
              onChange={(e) => updateField('faction', e.target.value as FactionType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
            >
              {Object.entries(FACTION_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Wounds
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.wounds}
                onChange={(e) => {
                  const wounds = parseInt(e.target.value);
                  updateField('wounds', wounds);
                  updateField('maxWounds', Math.max(wounds, formData.maxWounds));
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Agility
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.agility}
                onChange={(e) => updateField('agility', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Armour
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={formData.armour}
                onChange={(e) => updateField('armour', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Movement
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.movement}
                onChange={(e) => updateField('movement', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Ranged Attack
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={formData.rangedAttack}
                onChange={(e) => updateField('rangedAttack', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Melee Attack
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={formData.meleeAttack}
                onChange={(e) => updateField('meleeAttack', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="grimdark-button px-4 py-2 flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="grimdark-button px-4 py-2 flex-1 bg-green-700 hover:bg-green-600"
            >
              Add Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}