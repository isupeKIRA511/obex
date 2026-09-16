import React, { useState } from 'react';
import { NASAArchiveExoplanet, HabitableZoneBoundaries } from '../../types';
import { calculateHabitableZone, evaluatePlanetHabitability, SUN_TEMP_K } from '../../utils/habitableZone';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Thermometer, 
  Sun, 
  Orbit, 
  CheckCircle2, 
  XCircle, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HabitableZoneAnalysisProps {
  planets: NASAArchiveExoplanet[];
  selectedPlanet: NASAArchiveExoplanet | null;
  onSelectPlanet: (planet: NASAArchiveExoplanet) => void;
}

export const HabitableZoneAnalysis: React.FC<HabitableZoneAnalysisProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet,
}) => {
  const current = selectedPlanet || planets[0] || null;

  // Custom interactive test parameters for what-if simulations
  const [customRad, setCustomRad] = useState<number>(current?.st_rad || 1.0);
  const [customTeff, setCustomTeff] = useState<number>(current?.st_teff || 5778);
  const [customOrbDist, setCustomOrbDist] = useState<number>(current?.pl_orbsmax || 1.0);
  const [customTeq, setCustomTeq] = useState<number>(current?.pl_eqt || 255);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  // Derive boundaries
  const activeRad = isSimulationMode ? customRad : (current?.st_rad || 1.0);
  const activeTeff = isSimulationMode ? customTeff : (current?.st_teff || 5778);
  const activeDist = isSimulationMode ? customOrbDist : (current?.pl_orbsmax || 1.0);
  const activeTeq = isSimulationMode ? customTeq : current?.pl_eqt;

  const boundaries: HabitableZoneBoundaries = calculateHabitableZone(activeRad, activeTeff);
  const classification = evaluatePlanetHabitability(activeDist, activeTeq, activeRad, activeTeff);

  // Notable test cases demonstrating the sanity check
  const benchmarkCases = [
    { name: 'Earth (Sol III)', target: 'Earth', desc: 'Solar Baseline Reference', hz: true, teq: 255 },
    { name: 'TOI-700 d', target: 'TOI-700 d', desc: 'Confirmed Habitable Zone Planet', hz: true, teq: 269 },
    { name: 'TOI-715 b', target: 'TOI-715 b', desc: 'Super-Earth in Conservative HZ', hz: true, teq: 280 },
    { name: 'TOI-6478 b', target: 'TOI-6478 b', desc: 'Filtered: Frozen (Teq = 204 K)', hz: false, teq: 204 },
    { name: 'TrES-5 b', target: 'TrES-5 b', desc: 'Hot Jupiter (Teq = 1482 K)', hz: false, teq: 1482 },
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* Header & Theoretical Context Banner */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-telemetryGreen">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-textPrimary font-mono tracking-wide">
                  Habitable Zone & Kopparapu (2013) Theoretical Engine
                </h2>
                <p className="text-xs text-textSecondary mt-0.5">
                  Conservative liquid water boundaries based on 4th-order polynomial radiative flux (S_eff) and Stefan-Boltzmann luminosity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                isSimulationMode 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40' 
                  : 'bg-canvas border-borderHairline text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>{isSimulationMode ? 'Simulation Mode Active' : 'Enable What-If Sandbox'}</span>
            </button>
          </div>
        </div>

        {/* Quick Target Carousel */}
        <div className="mt-5 pt-4 border-t border-borderHairline flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono text-textMuted uppercase whitespace-nowrap mr-2">
            Target Presets:
          </span>
          {benchmarkCases.map((b) => {
            const match = planets.find(p => p.pl_name.toLowerCase() === b.target.toLowerCase() || p.hostname.toLowerCase() === b.target.toLowerCase());
            return (
              <button
                key={b.target}
                onClick={() => {
                  setIsSimulationMode(false);
                  if (match) onSelectPlanet(match);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 flex items-center gap-2 border transition-all cursor-pointer ${
                  current?.pl_name.toLowerCase() === b.target.toLowerCase()
                    ? 'bg-aerospaceBlue text-white border-blue-500 font-bold shadow-md'
                    : 'bg-canvas/80 border-borderHairline text-textSecondary hover:text-textPrimary hover:border-textMuted'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${b.hz ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span>{b.name}</span>
                <span className="text-[10px] opacity-70">({b.teq} K)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Visual Habitable Strip & Boundary Indicators (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Radiative Strip Visualizer */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Orbit className="w-4 h-4 text-opticsCyan" />
                <span className="font-bold text-textPrimary">Orbital Radiative Flux Mapping (AU)</span>
              </div>
              <span className="text-[11px] font-mono text-textMuted">
                Target: <strong className="text-white">{isSimulationMode ? 'Sandbox Model' : current?.pl_name}</strong>
              </span>
            </div>

            {/* Graphical Habitable Zone Strip */}
            <div className="space-y-2 pt-2">
              <div className="relative h-16 w-full bg-canvas rounded-xl border border-borderHairline overflow-hidden flex">
                
                {/* Too Hot Zone */}
                <div 
                  className="h-full bg-gradient-to-r from-red-950/80 to-amber-950/60 border-r border-red-500/40 relative flex items-center justify-center text-[10px] font-mono text-red-300 font-semibold select-none"
                  style={{ width: `${Math.min(35, Math.max(15, (boundaries.innerBoundary / (boundaries.outerBoundary * 1.6)) * 100))}%` }}
                >
                  <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur">Too Hot (&lt; {boundaries.innerBoundary.toFixed(3)} AU)</span>
                </div>

                {/* Conservative Habitable Zone */}
                <div 
                  className="h-full bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-950/90 border-r border-emerald-400/60 relative flex flex-col items-center justify-center text-[10px] font-mono text-emerald-300 font-bold select-none shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                  style={{ width: `${Math.max(30, Math.min(50, ((boundaries.outerBoundary - boundaries.innerBoundary) / (boundaries.outerBoundary * 1.6)) * 100))}%` }}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 shadow-md">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>Conservative HZ</span>
                  </div>
                  <span className="text-[9px] text-emerald-400/80 font-normal mt-0.5">
                    {boundaries.innerBoundary.toFixed(3)} - {boundaries.outerBoundary.toFixed(3)} AU
                  </span>
                </div>

                {/* Too Cold Zone */}
                <div 
                  className="h-full flex-1 bg-gradient-to-r from-blue-950/60 to-slate-950/80 relative flex items-center justify-center text-[10px] font-mono text-blue-300 select-none"
                >
                  <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur">Too Cold (&gt; {boundaries.outerBoundary.toFixed(3)} AU)</span>
                </div>

                {/* Planet Position Marker */}
                {activeDist > 0 && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_#ffffff] z-20 transition-all duration-500 flex flex-col items-center"
                    style={{ 
                      left: `${Math.min(96, Math.max(4, (activeDist / (boundaries.outerBoundary * 1.6)) * 100))}%` 
                    }}
                  >
                    <div className="w-4 h-4 -mt-1.5 rounded-full bg-white border-2 border-aerospaceBlue shadow-lg flex items-center justify-center text-[8px] font-bold text-black">
                      ●
                    </div>
                    <div className="mt-auto mb-1 px-1.5 py-0.5 rounded bg-black/90 border border-white/30 text-[9px] font-mono text-white whitespace-nowrap shadow-lg">
                      a = {activeDist.toFixed(3)} AU
                    </div>
                  </div>
                )}
              </div>

              {/* Strip Legend */}
              <div className="flex items-center justify-between text-[10px] font-mono text-textMuted px-1">
                <span>0.0 AU (Host Star)</span>
                <span>Runaway Greenhouse: {boundaries.innerBoundary.toFixed(3)} AU</span>
                <span>Max Greenhouse: {boundaries.outerBoundary.toFixed(3)} AU</span>
              </div>
            </div>

            {/* Current Classification Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
              classification.isHabitable 
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30' 
                : classification.status === 'too_cold'
                  ? 'bg-blue-950/40 border-blue-500/40'
                  : 'bg-amber-950/40 border-amber-500/40'
            }`}>
              {classification.isHabitable ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Classification Result:
                  </span>
                  <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                    classification.isHabitable 
                      ? 'bg-emerald-500 text-black' 
                      : classification.status === 'too_cold' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-amber-500 text-black'
                  }`}>
                    {classification.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed font-mono">
                  {classification.reason}
                </p>
              </div>
            </div>

            {/* Dual-Stage Sanity Check Card (Preventing False Positives) */}
            <div className="p-4 rounded-xl bg-canvas border border-borderHairline space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-textPrimary font-semibold">
                  <ShieldCheck className="w-4 h-4 text-opticsCyan" />
                  <span>Dual-Stage Data Quality & Sanity Check</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  classification.passedSanityCheck 
                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300' 
                    : 'bg-red-950/60 border-red-800/60 text-red-300'
                }`}>
                  {classification.passedSanityCheck ? 'Passed Dual Check' : 'Sanity Filter Triggered'}
                </span>
              </div>
              <p className="text-[11px] text-textSecondary leading-relaxed">
                TESS preliminary parameter discrepancies can artificially place frozen or superheated planets inside calculated geometric boundaries (e.g. <strong>TOI-6478 b</strong>). Our engine cross-validates orbital radius with individual equilibrium temperature (Range: <strong>235 K – 350 K</strong>).
              </p>
            </div>

          </div>

          {/* Mathematical Equations Card */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 font-mono text-xs space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-textPrimary font-bold border-b border-borderHairline pb-3">
              <Layers className="w-4 h-4 text-aerospaceBlue" />
              <span>Astrophysical Equations (Kopparapu et al. 2013)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-canvas rounded-xl border border-borderHairline space-y-1.5">
                <div className="text-[11px] text-opticsCyan font-bold">1. Stefan-Boltzmann Stellar Luminosity</div>
                <div className="text-[11px] text-textPrimary font-mono bg-card p-2 rounded border border-borderHairline/60">
                  L/L☉ = (R* / R☉)² × (T* / 5778)⁴
                </div>
                <div className="text-[10px] text-textMuted">
                  Calculated Luminosity: <strong className="text-white">{boundaries.luminosity.toFixed(4)} L☉</strong>
                </div>
              </div>

              <div className="p-3 bg-canvas rounded-xl border border-borderHairline space-y-1.5">
                <div className="text-[11px] text-telemetryGreen font-bold">2. Effective Stellar Flux Boundary</div>
                <div className="text-[11px] text-textPrimary font-mono bg-card p-2 rounded border border-borderHairline/60">
                  d(AU) = √( L / Seff )
                </div>
                <div className="text-[10px] text-textMuted">
                  4th-order polynomial with stellar temperature offset T* = T_eff - 5780 K
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Parameters & Interactive What-If Sandbox (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Target Properties Card */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 font-mono text-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-borderHairline pb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-calibAmber" />
                <span className="font-bold text-textPrimary">Stellar & Orbital Parameters</span>
              </div>
              <span className="text-[10px] text-textMuted">{isSimulationMode ? 'Interactive Sandbox' : 'NASA Archive TAP'}</span>
            </div>

            {/* Interactive Inputs or Real Data Values */}
            <div className="space-y-3.5">
              
              {/* Stellar Radius */}
              <div className="space-y-1">
                <div className="flex justify-between text-textSecondary text-[11px]">
                  <span>Stellar Radius (R☉):</span>
                  <span className="text-textPrimary font-bold">{activeRad.toFixed(3)} R☉</span>
                </div>
                {isSimulationMode && (
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={customRad}
                    onChange={(e) => setCustomRad(parseFloat(e.target.value))}
                    className="w-full accent-aerospaceBlue cursor-pointer"
                  />
                )}
              </div>

              {/* Stellar Effective Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-textSecondary text-[11px]">
                  <span>Stellar Temperature (T_eff):</span>
                  <span className="text-calibAmber font-bold">{activeTeff.toFixed(0)} K</span>
                </div>
                {isSimulationMode && (
                  <input
                    type="range"
                    min="2200"
                    max="10000"
                    step="50"
                    value={customTeff}
                    onChange={(e) => setCustomTeff(parseFloat(e.target.value))}
                    className="w-full accent-calibAmber cursor-pointer"
                  />
                )}
              </div>

              {/* Orbital Semi-Major Axis */}
              <div className="space-y-1">
                <div className="flex justify-between text-textSecondary text-[11px]">
                  <span>Semi-Major Axis (a):</span>
                  <span className="text-opticsCyan font-bold">{activeDist.toFixed(4)} AU</span>
                </div>
                {isSimulationMode && (
                  <input
                    type="range"
                    min="0.01"
                    max="3.0"
                    step="0.01"
                    value={customOrbDist}
                    onChange={(e) => setCustomOrbDist(parseFloat(e.target.value))}
                    className="w-full accent-opticsCyan cursor-pointer"
                  />
                )}
              </div>

              {/* Equilibrium Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-textSecondary text-[11px]">
                  <span>Equilibrium Temp (T_eq):</span>
                  <span className="text-textPrimary font-bold">
                    {activeTeq ? `${activeTeq.toFixed(0)} K (${(activeTeq - 273.15).toFixed(0)}°C)` : 'N/A'}
                  </span>
                </div>
                {isSimulationMode && (
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="10"
                    value={customTeq}
                    onChange={(e) => setCustomTeq(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                )}
              </div>

            </div>

            {/* Calculated Values Summary */}
            <div className="pt-3 border-t border-borderHairline space-y-2 text-[11px]">
              <div className="flex justify-between text-textSecondary">
                <span>Inner Boundary (Runaway HZ):</span>
                <span className="text-red-400 font-bold">{boundaries.innerBoundary.toFixed(3)} AU</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Outer Boundary (Max HZ):</span>
                <span className="text-blue-400 font-bold">{boundaries.outerBoundary.toFixed(3)} AU</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Optimistic Inner (Venus):</span>
                <span className="text-textMuted">{boundaries.innerOptimistic?.toFixed(3)} AU</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Optimistic Outer (Mars):</span>
                <span className="text-textMuted">{boundaries.outerOptimistic?.toFixed(3)} AU</span>
              </div>
            </div>

          </div>

          {/* Peer-Reviewed Scientific Citation Box */}
          <div className="p-4 rounded-xl bg-canvas border border-borderHairline font-mono text-[11px] text-textMuted space-y-2">
            <div className="flex items-center gap-1.5 text-textPrimary font-bold">
              <Info className="w-3.5 h-3.5 text-aerospaceBlue" />
              <span>Reference Standard</span>
            </div>
            <p className="leading-relaxed">
              Kopparapu, R. K. et al. (2013). "Habitable Zones Around Main-Sequence Stars: New Estimates." <em>The Astrophysical Journal</em>, 765(2), 131.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
