import React, { useState, useMemo } from 'react';
import { NASAArchiveExoplanet } from '../../types';
import { 
  Search, 
  Filter, 
  Globe, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  RefreshCw, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Snowflake,
  Sun,
  Database
} from 'lucide-react';

interface NASAArchiveExplorerProps {
  planets: NASAArchiveExoplanet[];
  isLoading: boolean;
  onRefresh: () => void;
  selectedPlanet: NASAArchiveExoplanet | null;
  onSelectPlanet: (planet: NASAArchiveExoplanet) => void;
  onOpenHabitableZone: (planet: NASAArchiveExoplanet) => void;
  onOpenMissionCalc: (planet: NASAArchiveExoplanet) => void;
}

export const NASAArchiveExplorer: React.FC<NASAArchiveExplorerProps> = ({
  planets,
  isLoading,
  onRefresh,
  selectedPlanet,
  onSelectPlanet,
  onOpenHabitableZone,
  onOpenMissionCalc,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [spectralFilter, setSpectralFilter] = useState<string>('all');
  const [habitabilityFilter, setHabitabilityFilter] = useState<string>('all');
  const [maxDistanceLy, setMaxDistanceLy] = useState<number>(1500);
  const [activeViewMode, setActiveViewMode] = useState<'table' | 'cards'>('table');

  // Filtered dataset
  const filteredPlanets = useMemo(() => {
    return planets.filter((p) => {
      // Search
      const searchMatch =
        !searchTerm.trim() ||
        p.pl_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.disc_facility && p.disc_facility.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // Distance
      const dist = p.distance_ly || (p.sy_dist ? p.sy_dist * 3.26156 : 50);
      if (dist > maxDistanceLy) return false;

      // Spectral type
      if (spectralFilter !== 'all') {
        const spec = (p.st_spectype || '').toUpperCase();
        if (!spec.startsWith(spectralFilter.toUpperCase())) return false;
      }

      // Habitability
      if (habitabilityFilter === 'habitable' && !p.habitability?.isHabitable) return false;
      if (habitabilityFilter === 'too_hot' && p.habitability?.status !== 'too_hot') return false;
      if (habitabilityFilter === 'too_cold' && p.habitability?.status !== 'too_cold') return false;

      return true;
    });
  }, [planets, searchTerm, spectralFilter, habitabilityFilter, maxDistanceLy]);

  // Summary KPIs
  const stats = useMemo(() => {
    const total = planets.length;
    const habitableCount = planets.filter((p) => p.habitability?.isHabitable).length;
    const nearest = [...planets].sort((a, b) => (a.distance_ly || 9999) - (b.distance_ly || 9999))[0];
    const tessCount = planets.filter((p) => (p.disc_facility || '').toLowerCase().includes('tess')).length;

    return { total, habitableCount, nearest, tessCount };
  }, [planets]);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        <div className="bg-card border border-borderHairline rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-textMuted text-[11px]">
            <span>Total Catalog Planets</span>
            <Database className="w-4 h-4 text-aerospaceBlue" />
          </div>
          <div className="text-2xl font-bold text-textPrimary">{stats.total}</div>
          <div className="text-[10px] text-textSecondary">NASA Archive TAP Synced</div>
        </div>

        <div className="bg-card border border-borderHairline rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-textMuted text-[11px]">
            <span>Habitable Zone Candidates</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.habitableCount}</div>
          <div className="text-[10px] text-textSecondary">Kopparapu (2013) Verified</div>
        </div>

        <div className="bg-card border border-borderHairline rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-textMuted text-[11px]">
            <span>TESS Mission Discoveries</span>
            <Globe className="w-4 h-4 text-opticsCyan" />
          </div>
          <div className="text-2xl font-bold text-opticsCyan">{stats.tessCount}</div>
          <div className="text-[10px] text-textSecondary">Primary Survey Transit Detections</div>
        </div>

        <div className="bg-card border border-borderHairline rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-textMuted text-[11px]">
            <span>Nearest Exoplanet Target</span>
            <Sun className="w-4 h-4 text-calibAmber" />
          </div>
          <div className="text-xl font-bold text-textPrimary truncate">{stats.nearest?.pl_name || 'Proxima b'}</div>
          <div className="text-[10px] text-calibAmber font-bold">
            {stats.nearest?.distance_ly?.toFixed(1) || '4.2'} light years
          </div>
        </div>

      </div>

      {/* Main Filter & Search Hub */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-aerospaceBlue animate-pulse"></span>
            <h3 className="text-sm font-bold text-textPrimary font-mono">
              NASA Exoplanet Archive TAP Query Engine & Catalog
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-canvas border border-borderHairline text-textSecondary hover:text-textPrimary text-xs font-mono flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Query Live NASA TAP Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-opticsCyan' : ''}`} />
              <span>{isLoading ? 'Querying NASA...' : 'Sync NASA Archive'}</span>
            </button>
            <div className="bg-canvas border border-borderHairline rounded-xl p-1 flex text-xs font-mono">
              <button
                onClick={() => setActiveViewMode('table')}
                className={`px-3 py-1 rounded-lg transition ${activeViewMode === 'table' ? 'bg-aerospaceBlue text-white font-semibold' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                Table View
              </button>
              <button
                onClick={() => setActiveViewMode('cards')}
                className={`px-3 py-1 rounded-lg transition ${activeViewMode === 'cards' ? 'bg-aerospaceBlue text-white font-semibold' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                Cards Grid
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Planet or Host Star..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-canvas border border-borderHairline rounded-xl pl-9 pr-3 py-2 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-opticsCyan"
            />
          </div>

          {/* Spectral Type */}
          <div>
            <select
              value={spectralFilter}
              onChange={(e) => setSpectralFilter(e.target.value)}
              className="w-full bg-canvas border border-borderHairline rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-opticsCyan cursor-pointer"
            >
              <option value="all">All Spectral Types (O, B, A, F, G, K, M)</option>
              <option value="M">M-Dwarfs (Red Dwarfs)</option>
              <option value="K">K-Dwarfs (Orange Stars)</option>
              <option value="G">G-Type (Solar Analogs)</option>
              <option value="F">F-Type (Hot Stars)</option>
              <option value="A">A-Type Stars</option>
            </select>
          </div>

          {/* Habitability Status */}
          <div>
            <select
              value={habitabilityFilter}
              onChange={(e) => setHabitabilityFilter(e.target.value)}
              className="w-full bg-canvas border border-borderHairline rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-opticsCyan cursor-pointer"
            >
              <option value="all">All Habitability Classes</option>
              <option value="habitable">Habitable Zone Only (Kopparapu 2013)</option>
              <option value="too_hot">Too Hot (Inside Inner Boundary)</option>
              <option value="too_cold">Too Cold (Beyond Outer Boundary)</option>
            </select>
          </div>

          {/* Distance Slider */}
          <div className="bg-canvas border border-borderHairline rounded-xl px-3 py-1.5 space-y-1">
            <div className="flex justify-between text-[10px] text-textSecondary">
              <span>Max Distance:</span>
              <span className="text-opticsCyan font-bold">{maxDistanceLy} ly</span>
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              step="20"
              value={maxDistanceLy}
              onChange={(e) => setMaxDistanceLy(parseInt(e.target.value))}
              className="w-full accent-opticsCyan cursor-pointer h-1.5"
            />
          </div>

        </div>
      </div>

      {/* Content: Table View */}
      {activeViewMode === 'table' && (
        <div className="bg-card border border-borderHairline rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-canvasSubtle border-b border-borderHairline text-[11px] text-textMuted uppercase">
                <tr>
                  <th className="py-3 px-4">Planet & Host Star</th>
                  <th className="py-3 px-3">Spectral Type</th>
                  <th className="py-3 px-3">Distance</th>
                  <th className="py-3 px-3">Radius (R⊕)</th>
                  <th className="py-3 px-3">Period (Days)</th>
                  <th className="py-3 px-3">Semi-Major Axis</th>
                  <th className="py-3 px-3">Equilibrium Temp</th>
                  <th className="py-3 px-3">Habitability Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderHairline/60">
                {filteredPlanets.map((p) => {
                  const isSelected = selectedPlanet?.pl_name === p.pl_name;
                  const isHabitable = p.habitability?.isHabitable;
                  const distLy = p.distance_ly || (p.sy_dist ? p.sy_dist * 3.26156 : 0);

                  return (
                    <tr
                      key={p.pl_name}
                      onClick={() => onSelectPlanet(p)}
                      className={`hover:bg-canvas/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-aerospaceBlue/10 border-l-2 border-l-opticsCyan' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-textPrimary">{p.pl_name}</div>
                        <div className="text-[10px] text-textMuted">Host: {p.hostname} ({p.disc_facility || 'Survey'})</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-canvas border border-borderHairline text-[11px] text-amber-300">
                          {p.st_spectype || 'G-Type'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-textPrimary">
                        {distLy > 0 ? `${distLy.toFixed(1)} ly` : 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-textSecondary">
                        {p.pl_rade ? `${p.pl_rade.toFixed(2)} R⊕` : 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-textSecondary">
                        {p.pl_orbper ? `${p.pl_orbper.toFixed(2)} d` : 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-opticsCyan font-semibold">
                        {p.pl_orbsmax ? `${p.pl_orbsmax.toFixed(4)} AU` : 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-calibAmber font-bold">
                        {p.pl_eqt ? `${p.pl_eqt.toFixed(0)} K` : 'N/A'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          isHabitable 
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' 
                            : p.habitability?.status === 'too_cold'
                              ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                              : 'bg-red-950/60 border-red-500/60 text-red-300'
                        }`}>
                          {isHabitable && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          <span>{p.habitability?.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenHabitableZone(p);
                          }}
                          className="px-2 py-1 rounded bg-canvas border border-borderHairline hover:border-emerald-500 text-[10px] text-emerald-400 hover:text-white transition"
                          title="Analyze in Habitable Zone Engine"
                        >
                          HZ Lab
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMissionCalc(p);
                          }}
                          className="px-2 py-1 rounded bg-canvas border border-borderHairline hover:border-opticsCyan text-[10px] text-opticsCyan hover:text-white transition"
                          title="Calculate Relativistic Mission Duration"
                        >
                          Mission
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Cards Grid View */}
      {activeViewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {filteredPlanets.map((p) => {
            const isSelected = selectedPlanet?.pl_name === p.pl_name;
            const isHabitable = p.habitability?.isHabitable;
            const distLy = p.distance_ly || (p.sy_dist ? p.sy_dist * 3.26156 : 0);

            return (
              <div
                key={p.pl_name}
                onClick={() => onSelectPlanet(p)}
                className={`bg-card border rounded-2xl p-5 space-y-4 hover:border-opticsCyan/60 transition-all cursor-pointer shadow-lg ${
                  isSelected ? 'border-opticsCyan bg-aerospaceBlue/10 shadow-cyan-950/30' : 'border-borderHairline'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-textPrimary">{p.pl_name}</h4>
                    <div className="text-[10px] text-textMuted">Host: {p.hostname}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isHabitable 
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' 
                      : p.habitability?.status === 'too_cold'
                        ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                        : 'bg-red-950/60 border-red-500/60 text-red-300'
                  }`}>
                    {p.habitability?.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-canvas p-2 rounded-lg border border-borderHairline">
                    <span className="text-textMuted block text-[10px]">Distance:</span>
                    <span className="text-textPrimary font-bold">{distLy.toFixed(1)} ly</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-lg border border-borderHairline">
                    <span className="text-textMuted block text-[10px]">Semi-Major Axis:</span>
                    <span className="text-opticsCyan font-bold">{p.pl_orbsmax ? `${p.pl_orbsmax.toFixed(4)} AU` : 'N/A'}</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-lg border border-borderHairline">
                    <span className="text-textMuted block text-[10px]">Equilibrium Temp:</span>
                    <span className="text-calibAmber font-bold">{p.pl_eqt ? `${p.pl_eqt.toFixed(0)} K` : 'N/A'}</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-lg border border-borderHairline">
                    <span className="text-textMuted block text-[10px]">Stellar Spec:</span>
                    <span className="text-amber-300 font-bold">{p.st_spectype || 'G-Type'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-borderHairline text-[10px]">
                  <span className="text-textMuted">{p.disc_facility || 'Survey'} ({p.disc_year || '2024'})</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHabitableZone(p);
                      }}
                      className="px-2 py-1 rounded bg-canvas border border-borderHairline text-emerald-400 hover:text-white"
                    >
                      HZ Lab
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMissionCalc(p);
                      }}
                      className="px-2 py-1 rounded bg-canvas border border-borderHairline text-opticsCyan hover:text-white"
                    >
                      Mission
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 rounded-xl bg-canvas border border-borderHairline font-mono text-[11px] text-textMuted flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-aerospaceBlue shrink-0" />
          <span>NASA Exoplanet Archive Table Access Protocol (TAP) querying Planetary Systems (`ps`) table.</span>
        </div>
        <a
          href="https://exoplanetarchive.ipac.caltech.edu/"
          target="_blank"
          rel="noreferrer"
          className="text-opticsCyan hover:underline flex items-center gap-1"
        >
          <span>Official Caltech Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

    </div>
  );
};
