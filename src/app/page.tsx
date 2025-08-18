export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          TRENCH CRUSADE
        </h1>
        <h2 className="text-xl text-slate-300 mb-4">
          Combat Tracker
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Mobile-friendly combat tracker for Trench Crusade tabletop battles. 
          Track warbands, glory points, and turn order in the grimdark trenches.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="grimdark-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-red-500">
            Quick Start
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <button className="grimdark-button py-3 text-left">
              <div className="font-semibold">🆓 Free Version</div>
              <div className="text-sm text-slate-400">
                Single device • Local storage • Offline-first
              </div>
            </button>
            <button className="grimdark-button py-3 text-left opacity-50 cursor-not-allowed">
              <div className="font-semibold">💰 Premium Version</div>
              <div className="text-sm text-slate-400">
                Multi-device • Real-time sync • Coming soon
              </div>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grimdark-card p-4">
            <h4 className="font-semibold text-red-400 mb-2">⚔️ Combat Tracking</h4>
            <p className="text-sm text-slate-400">
              Initiative order, wounds, armor, and equipment management
            </p>
          </div>
          <div className="grimdark-card p-4">
            <h4 className="font-semibold text-red-400 mb-2">🎲 Dice System</h4>
            <p className="text-sm text-slate-400">
              D10 rolls with success/failure/critical results
            </p>
          </div>
          <div className="grimdark-card p-4">
            <h4 className="font-semibold text-red-400 mb-2">📜 Battle Log</h4>
            <p className="text-sm text-slate-400">
              Glory points tracking and combat history
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
