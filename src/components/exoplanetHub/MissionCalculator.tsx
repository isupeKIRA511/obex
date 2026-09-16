import React, { useState } from 'react';
import { NASAArchiveExoplanet, MissionCalculation } from '../../types';
import { calculateInterstellarMission, SPEED_OF_LIGHT_KMS, VOYAGER_1_SPEED_KMS, CHEMICAL_ROCKET_SPEED_KMS } from '../../utils/missionPhysics';
import { 
  Rocket, 
  Clock, 
  Zap, 
  Gauge, 
  ArrowRight, 
  Activity, 
  Info, 
  Compass, 
  ShieldAlert, 
  Sparkles,
  Layers,
  Flame
} from 'lucide-react';

interface MissionCalculatorProps {
  planets: NASAArchiveExoplanet[];
  selectedPlanet: NASAArchiveExoplanet | null;
  onSelectPlanet: (planet: NASAArchiveExoplanet) => void;
}

const SPEED_PRESETS = [
  { label: 'Chemical Propulsion (11.2 km/s)', fraction: 0.0000373, desc: 'Saturn V / SLS escape velocity' },
  { label: 'Voyager 1 Velocity (17 km/s)', fraction: 0.0000567, desc: 'Current interstellar probe standard' },
  { label: 'Breakthrough Starshot (0.2c)', fraction: 0.2, desc: 'Laser sail micro-probes (20% speed of light)' },
  { label: 'Fusion Drive (0.5c)', fraction: 0.5, desc: 'Project Daedalus / Continuous thrust fusion' },
  { label: 'Relativistic Antimatter (0.9c)', fraction: 0.9, desc: '90% speed of light (γ = 2.29x time dilation)' },
  { label: 'Ultra-Relativistic (0.99c)', fraction: 0.99, desc: '99% speed of light (γ = 7.09x time dilation)' },
];

export const MissionCalculator: React.FC<MissionCalculatorProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet,
}) => {
  const current = selectedPlanet || planets[0] || null;
  const [targetName, setTargetName] = useState<string>(current?.pl_name || 'Proxima Centauri b');
  const [distanceLy, setDistanceLy] = useState<number>(current?.distance_ly || 4.24);
  const [velocityFractionC, setVelocityFractionC] = useState<number>(0.2); // Default 0.2c (Starshot)

  // Calculate mission physics
  const mission: MissionCalculation = calculateInterstellarMission(
    targetName,
    distanceLy,
    velocityFractionC
  );

  const handleSelectPredefined = (p: NASAArchiveExoplanet) => {
    onSelectPlanet(p);
    setTargetName(p.pl_name);
    setDistanceLy(p.distance_ly || (p.sy_dist ? p.sy_dist * 3.26156 : 50));
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/40 text-aerospaceBlue">
                <Rocket className="w-5 h-5 text-opticsCyan" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-textPrimary font-mono tracking-wide">
                  Relativistic Interstellar Mission & Trajectory Calculator
                </h2>
                <p className="text-xs text-textSecondary mt-0.5">
                  Computes Einsteinian time dilation, Lorentz contraction (γ), spacecraft proper time, and propulsion feasibility
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-canvas border border-borderHairline text-opticsCyan font-bold">
              c = 299,792.458 km/s
            </span>
          </div>
        </div>

        {/* Quick Targets Selection */}
        <div className="mt-5 pt-4 border-t border-borderHairline flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono text-textMuted uppercase whitespace-nowrap mr-2">
            Target Destinations:
          </span>
          {planets.slice(0, 8).map((p) => {
            const isSelected = targetName.toLowerCase() === p.pl_name.toLowerCase();
            const dLy = p.distance_ly || (p.sy_dist ? p.sy_dist * 3.26156 : 50);
            return (
              <button
                key={p.pl_name}
                onClick={() => handleSelectPredefined(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 flex items-center gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-aerospaceBlue text-white border-blue-500 font-bold shadow-md'
                    : 'bg-canvas/80 border-borderHairline text-textSecondary hover:text-textPrimary hover:border-textMuted'
                }`}
              >
                <span>{p.pl_name}</span>
                <span className="text-[10px] text-opticsCyan">({dLy.toFixed(0)} ly)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calculation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Control & Configuration Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Controls Card */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 font-mono text-xs space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-borderHairline pb-3">
              <div className="flex items-center gap-2 font-bold text-textPrimary">
                <Compass className="w-4 h-4 text-aerospaceBlue" />
                <span>Mission Parameters</span>
              </div>
              <span className="text-[10px] text-textMuted">Special Relativity</span>
            </div>

            {/* Target Destination & Distance */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-textSecondary text-[11px] block">Target Destination Name:</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-canvas border border-borderHairline rounded-lg px-3 py-2 text-xs font-mono text-textPrimary focus:outline-none focus:border-opticsCyan"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-textSecondary">
                  <span>Distance from Earth:</span>
                  <span className="text-textPrimary font-bold">{distanceLy.toFixed(1)} Light Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1500"
                  step="1"
                  value={distanceLy}
                  onChange={(e) => setDistanceLy(parseFloat(e.target.value))}
                  className="w-full accent-aerospaceBlue cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-textMuted">
                  <span>1.3 ly (Proxima)</span>
                  <span>500 ly (Kepler)</span>
                  <span>1500 ly (Deep space)</span>
                </div>
              </div>

              {/* Velocity Fraction Slider */}
              <div className="space-y-1.5 pt-2 border-t border-borderHairline">
                <div className="flex justify-between text-[11px] text-textSecondary">
                  <span>Cruising Velocity (v / c):</span>
                  <span className="text-opticsCyan font-bold">{(velocityFractionC * 100).toFixed(1)}% c ({mission.velocityKms.toLocaleString(undefined, { maximumFractionDigits: 0 })} km/s)</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={velocityFractionC}
                  onChange={(e) => setVelocityFractionC(parseFloat(e.target.value))}
                  className="w-full accent-opticsCyan cursor-pointer"
                />
              </div>

              {/* Speed Presets Grid */}
              <div className="space-y-2 pt-2 border-t border-borderHairline">
                <span className="text-[11px] text-textSecondary block">Propulsion Technology Presets:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPEED_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setVelocityFractionC(preset.fraction)}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        Math.abs(velocityFractionC - preset.fraction) < 0.005
                          ? 'bg-aerospaceBlue/30 border-opticsCyan text-white'
                          : 'bg-canvas border-borderHairline text-textSecondary hover:text-textPrimary hover:border-textMuted'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{preset.label}</div>
                      <div className="text-[9px] text-textMuted mt-0.5 truncate">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Feasibility Assessment Card */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 font-mono text-xs space-y-3 shadow-xl">
            <div className="flex items-center gap-2 font-bold text-textPrimary">
              <ShieldAlert className="w-4 h-4 text-calibAmber" />
              <span>Propulsion Feasibility Level</span>
            </div>
            
            <div className="p-3 bg-canvas rounded-xl border border-borderHairline flex items-center justify-between">
              <span className="text-textSecondary">Classification:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-blue-950 border border-blue-500/50">
                {mission.feasibilityLevel}
              </span>
            </div>

            <div className="text-[11px] text-textSecondary leading-relaxed">
              Kinetic Energy required per kilogram: <strong className="text-opticsCyan">{(mission.kineticEnergyJoulesPerKg / 1e12).toFixed(2)} TeraJoules/kg</strong>.
            </div>
          </div>

        </div>

        {/* Right Telemetry & Relativistic Comparison Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Relativistic Time Dilation Visual Card */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-5 font-mono shadow-xl">
            <div className="flex items-center justify-between border-b border-borderHairline pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-textPrimary">
                <Clock className="w-4 h-4 text-telemetryGreen" />
                <span>Einsteinian Relativistic Time Dilation Breakdown</span>
              </div>
              <span className="text-[11px] text-telemetryGreen font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                Lorentz γ = {mission.lorentzGamma.toFixed(4)}x
              </span>
            </div>

            {/* Earth vs Spacecraft Time Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Earth Coordinate Time */}
              <div className="p-4 rounded-xl bg-canvas border border-borderHairline space-y-2">
                <div className="flex items-center justify-between text-textSecondary text-[11px]">
                  <span>Earth Observer Time:</span>
                  <span className="text-[10px] text-textMuted">(Stationary Frame)</span>
                </div>
                <div className="text-2xl font-bold text-textPrimary">
                  {mission.earthObserverYears < 1000 
                    ? `${mission.earthObserverYears.toFixed(2)} yrs` 
                    : `${(mission.earthObserverYears).toLocaleString(undefined, { maximumFractionDigits: 0 })} yrs`}
                </div>
                <p className="text-[10px] text-textMuted">
                  Years elapsed on Earth from mission launch to arrival at {mission.targetName}.
                </p>
              </div>

              {/* Spacecraft Ship Time */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/50 space-y-2 shadow-lg shadow-blue-950/20">
                <div className="flex items-center justify-between text-opticsCyan text-[11px]">
                  <span className="font-bold">Spacecraft Proper Time:</span>
                  <span className="text-[10px] text-white/70">(Crew Frame)</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {mission.spacecraftShipYears < 1000 
                    ? `${mission.spacecraftShipYears.toFixed(2)} yrs` 
                    : `${(mission.spacecraftShipYears).toLocaleString(undefined, { maximumFractionDigits: 0 })} yrs`}
                </div>
                <p className="text-[10px] text-textSecondary">
                  Proper biological time experienced by crew members onboard the ship (t_ship = t_Earth / γ).
                </p>
              </div>

            </div>

            {/* Time Dilation Savings Alert */}
            {mission.timeDilationSavedYears > 0.05 && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Crew Biological Time Saved via Relativity:</span>
                </div>
                <span className="text-white font-bold">
                  +{mission.timeDilationSavedYears < 100 
                    ? `${mission.timeDilationSavedYears.toFixed(2)} years younger` 
                    : `${mission.timeDilationSavedYears.toLocaleString(undefined, { maximumFractionDigits: 0 })} years`}
                </span>
              </div>
            )}
          </div>

          {/* Conventional vs Relativistic Comparison Table */}
          <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-4 font-mono text-xs shadow-xl">
            <div className="flex items-center gap-2 font-bold text-textPrimary border-b border-borderHairline pb-3">
              <Layers className="w-4 h-4 text-aerospaceBlue" />
              <span>Technology Comparison Table to {mission.targetName} ({distanceLy.toFixed(1)} ly)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-borderHairline text-[11px] text-textMuted uppercase">
                    <th className="pb-2">Propulsion Mode</th>
                    <th className="pb-2">Cruising Velocity</th>
                    <th className="pb-2 text-right">Flight Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderHairline/60 text-[11px]">
                  
                  <tr className="text-textSecondary">
                    <td className="py-2.5 font-semibold text-textPrimary">Chemical Rocket (SLS / Saturn V)</td>
                    <td className="py-2.5">11.2 km/s (0.000037c)</td>
                    <td className="py-2.5 text-right font-bold text-red-400">
                      {(mission.chemicalRocketYears).toLocaleString(undefined, { maximumFractionDigits: 0 })} years
                    </td>
                  </tr>

                  <tr className="text-textSecondary">
                    <td className="py-2.5 font-semibold text-textPrimary">Voyager 1 Deep-Space Probe</td>
                    <td className="py-2.5">17.0 km/s (0.000057c)</td>
                    <td className="py-2.5 text-right font-bold text-amber-400">
                      {(mission.voyager1Years).toLocaleString(undefined, { maximumFractionDigits: 0 })} years
                    </td>
                  </tr>

                  <tr className="text-textSecondary">
                    <td className="py-2.5 font-semibold text-textPrimary">Laser Sail (Breakthrough Starshot)</td>
                    <td className="py-2.5">60,000 km/s (0.20c)</td>
                    <td className="py-2.5 text-right font-bold text-opticsCyan">
                      {(distanceLy / 0.2).toFixed(1)} years
                    </td>
                  </tr>

                  <tr className="bg-blue-950/30 text-white font-bold">
                    <td className="py-2.5 pl-2 text-opticsCyan">Active Custom Cruiser (Selected)</td>
                    <td className="py-2.5">{(velocityFractionC * 100).toFixed(1)}% c ({mission.velocityKms.toLocaleString(undefined, { maximumFractionDigits: 0 })} km/s)</td>
                    <td className="py-2.5 pr-2 text-right text-telemetryGreen">
                      {mission.spacecraftShipYears < 1000 
                        ? `${mission.spacecraftShipYears.toFixed(2)} yrs (Ship)` 
                        : `${(mission.spacecraftShipYears).toLocaleString(undefined, { maximumFractionDigits: 0 })} yrs`}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Scientific Reference */}
          <div className="p-4 rounded-xl bg-canvas border border-borderHairline font-mono text-[11px] text-textMuted space-y-1">
            <div className="text-textPrimary font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-aerospaceBlue" />
              <span>Relativity Formulation</span>
            </div>
            <p className="leading-relaxed">
              Based on Special Relativity: Δt' = Δt · √(1 - v²/c²). As v → c, onboard ship time approaches zero, while Earth observer duration approaches d/c.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
