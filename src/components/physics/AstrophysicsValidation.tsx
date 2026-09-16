import React, { useState, useEffect } from 'react';
import { 
  PlanetPhysicalData, 
  EquationsResponse, 
  PhysicsValidationResponse, 
  ValidationRow,
  KpiDashboardResponse 
} from '../../types';
import { apiService, FALLBACK_KPIS } from '../../services/api';
import { safeFixed } from '../../utils/targetUtils';
import { 
  Atom, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  Scale, 
  Layers, 
  Compass, 
  Flame, 
  Gauge, 
  Zap,
  Filter,
  Info
} from 'lucide-react';

export const AstrophysicsValidation: React.FC = () => {
  const [planets, setPlanets] = useState<PlanetPhysicalData[]>([]);
  const [equationsData, setEquationsData] = useState<EquationsResponse | null>(null);
  const [validationData, setValidationData] = useState<PhysicsValidationResponse | null>(null);
  const [kpiData, setKpiData] = useState<KpiDashboardResponse>(FALLBACK_KPIS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filter states
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'validation' | 'equations' | 'catalog'>('validation');

  useEffect(() => {
    let isCancelled = false;
    const loadPhysicsData = async () => {
      setIsLoading(true);
      try {
        const [p, eq, val, kpi] = await Promise.all([
          apiService.getPlanets(),
          apiService.getEquations(),
          apiService.getPhysicsValidation(),
          apiService.getKPIs()
        ]);
        if (!isCancelled) {
          if (p && p.length > 0) setPlanets(p);
          if (eq) setEquationsData(eq);
          if (val) setValidationData(val);
          if (kpi) setKpiData(kpi);
        }
      } catch (err) {
        console.warn('Error loading astrophysics data:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    loadPhysicsData();
    return () => { isCancelled = true; };
  }, []);

  // Filtered validation rows
  const filteredRows = (validationData?.rows || []).filter((row) => {
    if (selectedTargetFilter !== 'all' && row.target.toLowerCase() !== selectedTargetFilter.toLowerCase()) {
      return false;
    }
    if (selectedStatusFilter !== 'all') {
      if (selectedStatusFilter === 'agrees' && row.status !== 'agrees') return false;
      if (selectedStatusFilter === 'disagrees' && row.status !== 'disagrees') return false;
      if (selectedStatusFilter === 'close' && row.status !== 'close') return false;
      if (selectedStatusFilter === 'measurement' && !row.uses_our_data) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agrees':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/40 text-telemetryGreen">
            <CheckCircle2 className="w-3 h-3" /> Agrees (|z| ≤ 2)
          </span>
        );
      case 'close':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/60 border border-amber-800/40 text-calibAmber">
            <AlertTriangle className="w-3 h-3" /> Close (&lt; 10%)
          </span>
        );
      case 'disagrees':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950/60 border border-rose-800/40 text-rose-400">
            <AlertTriangle className="w-3 h-3" /> Disagrees
          </span>
        );
      case 'null (star brightened)':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-borderHairline text-textMuted">
            Null (No Dip)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-borderHairline text-textSecondary">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Header & Sub-Navigation */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-opticsCyan animate-pulse"></span>
            <h2 className="text-base font-bold text-textPrimary font-mono">
              Astrophysics & Keplerian Physics Validation Suite
            </h2>
          </div>
          <p className="text-xs text-textSecondary mt-1">
            48 Equation Checks verified against NASA Exoplanet Archive (Kepler III, Orbital Mechanics, Insolation & Gaia Distances)
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-canvas p-1 rounded-xl border border-borderHairline text-xs font-mono">
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'validation'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Validation Matrix (48 Checks)
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'catalog'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Confirmed Planets (8 Systems)
          </button>
          <button
            onClick={() => setActiveTab('equations')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'equations'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Equations & Constants
          </button>
        </div>
      </div>

      {/* Live KPI Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted">Physics Agreement</div>
          <div className="text-lg font-bold text-telemetryGreen font-mono">
            {kpiData.physics_validation.equation_checks_agree_pct}%
          </div>
          <div className="text-[10px] text-textSecondary font-mono">
            42 of 48 checks |z| ≤ 2
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted">Median Semi-Major Axis Δ</div>
          <div className="text-lg font-bold text-opticsCyan font-mono">
            ±{kpiData.physics_validation.median_abs_pct_diff_semi_major_axis}%
          </div>
          <div className="text-[10px] text-textSecondary font-mono">
            Kepler III vs Catalog
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted">Fastest Planet</div>
          <div className="text-lg font-bold text-textPrimary font-mono">
            {kpiData.planets.fastest.value} km/s
          </div>
          <div className="text-[10px] text-textSecondary font-mono">
            {kpiData.planets.fastest.planet}
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted">Hottest Exoplanet</div>
          <div className="text-lg font-bold text-calibAmber font-mono">
            {kpiData.planets.hottest.value} K
          </div>
          <div className="text-[10px] text-textSecondary font-mono">
            {kpiData.planets.hottest.planet}
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted">Nearest Host Star</div>
          <div className="text-lg font-bold text-textPrimary font-mono">
            {kpiData.planets.nearest.value} ly
          </div>
          <div className="text-[10px] text-textSecondary font-mono">
            {kpiData.planets.nearest.planet} (Gaia)
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted">Comparison Star Gain</div>
          <div className="text-lg font-bold text-telemetryGreen font-mono">
            {kpiData.photometry.median_comparison_star_improvement}x
          </div>
          <div className="text-[10px] text-textSecondary font-mono">
            Noise Floor: {kpiData.photometry.best_precision_ppt} ppt
          </div>
        </div>
      </div>

      {/* VIEW 1: VALIDATION MATRIX */}
      {activeTab === 'validation' && (
        <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-4">
          
          {/* Header & Filters */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-borderHairline">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-opticsCyan" />
              <div>
                <h3 className="text-sm font-bold text-textPrimary font-mono">
                  Theoretical Derivations vs Published Catalogues
                </h3>
                <p className="text-xs text-textSecondary">
                  Evaluated with combined uncertainties: z = (derived - published) / √(σ_derived² + σ_pub²)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              {/* Target filter */}
              <select
                value={selectedTargetFilter}
                onChange={(e) => setSelectedTargetFilter(e.target.value)}
                className="bg-canvas border border-borderHairline rounded-lg px-3 py-1.5 text-textPrimary focus:border-opticsCyan cursor-pointer"
              >
                <option value="all">All Targets (8 Systems)</option>
                <option value="TRES-5">TrES-5</option>
                <option value="TRES-3">TrES-3</option>
                <option value="TRES-1">TrES-1</option>
                <option value="WASP-11">WASP-11 (HAT-P-10)</option>
                <option value="WASP-10">WASP-10</option>
                <option value="WASP-2">WASP-2</option>
                <option value="Qatar-1">Qatar-1</option>
                <option value="CoRoT-2">CoRoT-2</option>
              </select>

              {/* Status filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-canvas border border-borderHairline rounded-lg px-3 py-1.5 text-textPrimary focus:border-opticsCyan cursor-pointer"
              >
                <option value="all">All Statuses ({filteredRows.length})</option>
                <option value="agrees">Agrees (|z| ≤ 2)</option>
                <option value="close">Close (&lt; 10%)</option>
                <option value="disagrees">Disagrees</option>
                <option value="measurement">Our Measured Depths</option>
              </select>
            </div>
          </div>

          {/* Validation Table */}
          <div className="overflow-x-auto rounded-xl border border-borderHairline">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-canvasSubtle text-textMuted border-b border-borderHairline text-[11px] uppercase">
                  <th className="p-3">Target & Planet</th>
                  <th className="p-3">Physical Quantity</th>
                  <th className="p-3">Derived Value</th>
                  <th className="p-3">Published Catalog</th>
                  <th className="p-3">Pct Diff</th>
                  <th className="p-3">Z-Score</th>
                  <th className="p-3">Validation Status</th>
                  <th className="p-3">Equation Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderHairline">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-canvas/50 transition-colors">
                    <td className="p-3 text-textPrimary font-semibold">
                      <div>{row.planet}</div>
                      <div className="text-[10px] text-textMuted">{row.target}</div>
                    </td>
                    <td className="p-3 text-textSecondary">
                      <div className="font-sans text-xs text-textPrimary font-medium">
                        {row.quantity.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-textMuted">Unit: {row.unit}</div>
                    </td>
                    <td className="p-3 text-opticsCyan font-bold">
                      {typeof row.derived === 'number' ? safeFixed(row.derived, 4) : (row.derived || '—')}
                      {row.derived_err ? (
                        <span className="text-[10px] text-textMuted font-normal"> ± {safeFixed(row.derived_err, 4)}</span>
                      ) : null}
                    </td>
                    <td className="p-3 text-textPrimary">
                      {typeof row.published === 'number' ? safeFixed(row.published, 4) : (row.published || '—')}
                      {row.published_err ? (
                        <span className="text-[10px] text-textMuted font-normal"> ± {safeFixed(row.published_err, 4)}</span>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <span className={typeof row.pct_diff === 'number' && Math.abs(row.pct_diff) < 5 ? 'text-telemetryGreen' : 'text-textSecondary'}>
                        {typeof row.pct_diff === 'number' ? (row.pct_diff > 0 ? `+${safeFixed(row.pct_diff, 2)}` : `${safeFixed(row.pct_diff, 2)}`) : '—'}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={typeof row.z_score === 'number' && Math.abs(row.z_score) <= 2 ? 'text-telemetryGreen font-bold' : 'text-amber-400'}>
                        {typeof row.z_score === 'number' ? `${safeFixed(row.z_score, 2)} σ` : '—'}
                      </span>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="p-3 text-[11px] text-textMuted max-w-[200px] truncate" title={row.equation}>
                      {row.equation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Finding Banner */}
          {validationData?.finding && (
            <div className="p-4 rounded-xl bg-canvas border border-borderHairline text-xs font-mono text-textSecondary flex items-start gap-3">
              <Info className="w-4 h-4 text-opticsCyan shrink-0 mt-0.5" />
              <div>
                <span className="text-textPrimary font-semibold">Validation Finding: </span>
                {validationData.finding}
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: CONFIRMED PLANETS (8 Systems with Real Physical Metrics) */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planets.map((p) => (
            <div 
              key={p.target} 
              className="bg-card border border-borderHairline rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-opticsCyan/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-opticsCyan font-bold">{p.target}</span>
                  <span className="px-2 py-0.5 rounded bg-canvas border border-borderHairline text-textMuted text-[10px]">
                    V = {p.star_vmag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-textPrimary group-hover:text-opticsCyan transition-colors">
                  {p.planet}
                </h3>
                <p className="text-xs text-textSecondary mt-0.5 font-mono">
                  Host: {p.archive_host} • {safeFixed(p.distance_ly, 0)} ly away (Gaia)
                </p>
              </div>

              {/* Physical Telemetry Grid */}
              <div className="space-y-2 font-mono text-xs pt-2 border-t border-borderHairline">
                <div className="flex justify-between text-textSecondary">
                  <span>Semi-Major Axis:</span>
                  <span className="text-textPrimary font-bold">{safeFixed(p.a_au, 4)} AU</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Orbital Velocity:</span>
                  <span className="text-opticsCyan font-bold">{safeFixed(p.orbital_speed_kms, 1)} km/s</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Period:</span>
                  <span className="text-textPrimary">{safeFixed(p.orbital_period_days, 3)} days</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Equilibrium Temp:</span>
                  <span className="text-calibAmber font-bold">{safeFixed(p.teq_k, 0)} K</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Incident Flux:</span>
                  <span className="text-textPrimary">{safeFixed(p.insolation_earth, 0)}x Earth</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Transit Duration:</span>
                  <span className="text-textPrimary">{safeFixed(p.transit_duration_h, 2)} hours</span>
                </div>
              </div>

              <div className="pt-3 border-t border-borderHairline text-[10px] text-textMuted font-mono flex items-center justify-between">
                <span>Speed vs Earth:</span>
                <span className="text-telemetryGreen font-bold">{safeFixed(p.orbital_speed_vs_earth, 1)}x faster</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: EQUATIONS & CONSTANTS */}
      {activeTab === 'equations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Equations List (8 cols) */}
          <div className="lg:col-span-8 bg-card border border-borderHairline rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-textPrimary font-mono">
                Mathematical Formulations & Derivation Equations
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Exact physical formulas implemented in the Keplerian derivation pipeline
              </p>
            </div>

            <div className="space-y-3">
              {(equationsData?.equations || []).map((eq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-canvas border border-borderHairline space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-opticsCyan font-mono">
                      {eq.name || eq.quantity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-borderHairline text-textMuted">
                      Quantity: {eq.quantity}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-black/60 border border-borderHairline/80 font-mono text-xs text-textPrimary overflow-x-auto">
                    {eq.formula}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-textMuted font-mono flex-wrap gap-2 pt-1">
                    <span>Inputs: {eq.inputs.join(', ')}</span>
                    {eq.assumption && (
                      <span className="text-textSecondary italic">Assumption: {eq.assumption}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Constants & Methodology (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Astronomical Constants */}
            <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-textPrimary font-mono">
                CODATA & IAU Constants
              </h3>

              <div className="space-y-2 font-mono text-xs divide-y divide-borderHairline">
                {equationsData?.constants && Object.entries(equationsData.constants).map(([key, val]) => (
                  <div key={key} className="pt-2 flex justify-between text-textSecondary">
                    <span className="font-bold text-textPrimary">{key}</span>
                    <span className="text-[11px] text-right text-textMuted max-w-[180px] truncate" title={val}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology & Uncertainties */}
            <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-textPrimary">
                Monte Carlo Uncertainties
              </h3>
              <p className="text-textSecondary text-[11px] leading-relaxed">
                {equationsData?.uncertainties || '20,000 normal draws of every NASA Exoplanet Archive input with its published error; median and 16-84% half-width reported.'}
              </p>

              <div className="pt-2 border-t border-borderHairline text-[10px] text-textMuted">
                {equationsData?.external_data_disclosure}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
