import React, { useState, useEffect } from 'react';
import { ArrowRight, Satellite, ShieldCheck, Activity, Eye, Zap, Layers, Sparkles, Scale, Compass } from 'lucide-react';
import { Target, SessionSummary, KpiDashboardResponse } from '../../types';
import { apiService, FALLBACK_KPIS } from '../../services/api';

interface BentoHeroProps {
  onExploreTransit: () => void;
  onExplore3D: () => void;
  onExploreDiagnostic: () => void;
  onExplorePhysics?: () => void;
  onExploreHub?: () => void;
  selectedTarget: Target;
}

export const BentoHero: React.FC<BentoHeroProps> = ({
  onExploreTransit,
  onExplore3D,
  onExploreDiagnostic,
  onExplorePhysics,
  onExploreHub,
  selectedTarget
}) => {
  const [kpis, setKpis] = useState<KpiDashboardResponse>(FALLBACK_KPIS);

  useEffect(() => {
    let isCancelled = false;
    const fetchKpis = async () => {
      try {
        const data = await apiService.getKPIs();
        if (!isCancelled && data) {
          setKpis(data);
        }
      } catch (err) {
        console.warn('Could not load KPIs:', err);
      }
    };
    fetchKpis();
    return () => { isCancelled = true; };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Live Executive KPI Telemetry Bar (Powered by live /api/kpis) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted flex items-center justify-between">
            <span>Photometry Gain</span>
            <span className="w-1.5 h-1.5 rounded-full bg-telemetryGreen"></span>
          </div>
          <div className="text-xl font-bold text-telemetryGreen font-mono">
            {kpis?.photometry?.median_comparison_star_improvement ?? 4.02}x
          </div>
          <div className="text-[10px] text-textSecondary font-mono truncate">
            Precision: {kpis?.photometry?.best_precision_ppt ?? 4.76} ppt
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted flex items-center justify-between">
            <span>Physics Agreement</span>
            <span className="w-1.5 h-1.5 rounded-full bg-opticsCyan"></span>
          </div>
          <div className="text-xl font-bold text-opticsCyan font-mono">
            {kpis?.physics_validation?.equation_checks_agree_pct ?? 87.5}%
          </div>
          <div className="text-[10px] text-textSecondary font-mono truncate">
            42 of 48 checks |z| ≤ 2
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted flex items-center justify-between">
            <span>Fastest Orbit</span>
            <span className="w-1.5 h-1.5 rounded-full bg-aerospaceBlue"></span>
          </div>
          <div className="text-xl font-bold text-textPrimary font-mono">
            {kpis?.planets?.fastest?.value ?? 190.1} km/s
          </div>
          <div className="text-[10px] text-textSecondary font-mono truncate">
            {kpis?.planets?.fastest?.planet ?? 'TrES-3 b'}
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted flex items-center justify-between">
            <span>Hottest Planet</span>
            <span className="w-1.5 h-1.5 rounded-full bg-calibAmber"></span>
          </div>
          <div className="text-xl font-bold text-calibAmber font-mono">
            {kpis?.planets?.hottest?.value ?? 1642.2} K
          </div>
          <div className="text-[10px] text-textSecondary font-mono truncate">
            {kpis?.planets?.hottest?.planet ?? 'TrES-3 b'}
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted flex items-center justify-between">
            <span>Nearest Host</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          </div>
          <div className="text-xl font-bold text-textPrimary font-mono">
            {kpis?.planets?.nearest?.value ?? 406.8} ly
          </div>
          <div className="text-[10px] text-textSecondary font-mono truncate">
            {kpis?.planets?.nearest?.planet ?? 'WASP-11 b'} (Gaia)
          </div>
        </div>

        <div className="bg-card border border-borderHairline rounded-xl p-3 space-y-1">
          <div className="text-[10px] font-mono uppercase text-textMuted flex items-center justify-between">
            <span>Dataset Scope</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-xl font-bold text-textPrimary font-mono">
            {kpis?.dataset?.science_frames ?? 1681}
          </div>
          <div className="text-[10px] text-textSecondary font-mono truncate">
            FITS Frames • 22 Nights
          </div>
        </div>
      </div>

      {/* Top Asymmetric Bento Grid (Direct clone of reference design structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Hero Card 1: 3D Mission Hardware & Target Overview (Spans 7 cols) */}
        <div className="lg:col-span-7 bg-card border border-borderHairline rounded-2xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle cosmic background glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-aerospaceBlue/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-opticsCyan animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-opticsCyan">
                Automated Mission Telemetry
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-textPrimary tracking-tight leading-tight">
              Proven Technologies for Exoplanet Transit Photometry, Engineered for Unfiltered Celestial Data.
            </h1>

            <p className="text-textSecondary text-xs sm:text-sm max-w-lg leading-relaxed">
              Analyzing 1,741 raw FITS exposures from the Cecilia 6-inch robotic telescope. 
              Targeting confirmed hot-Jupiter hosts with high-cadence differential photometry and automated alt-az drift rejection.
            </p>
          </div>

          {/* Quick Metrics & Call to Action */}
          <div className="pt-8 flex items-center justify-between border-t border-borderHairline mt-6 relative z-10 flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[10px] uppercase font-mono text-textMuted">Active Target</div>
                <div className="text-lg font-bold text-textPrimary font-mono">{selectedTarget?.target || 'TRES-5'} b</div>
              </div>
              <div className="border-l border-borderHairline pl-6">
                <div className="text-[10px] uppercase font-mono text-textMuted">Transit Depth</div>
                <div className="text-lg font-bold text-opticsCyan font-mono">{selectedTarget?.transit_depth_pct ?? 2.1}%</div>
              </div>
              <div className="border-l border-borderHairline pl-6">
                <div className="text-[10px] uppercase font-mono text-textMuted">Host Star</div>
                <div className="text-lg font-bold text-textPrimary font-mono">V = {selectedTarget?.v_mag ?? 13.72}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onExploreHub && (
                <button
                  onClick={onExploreHub}
                  className="px-4 py-2.5 rounded-full bg-canvas border border-borderHairline hover:border-emerald-500 text-textSecondary hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NASA Exoplanet Hub</span>
                </button>
              )}

              {onExplorePhysics && (
                <button
                  onClick={onExplorePhysics}
                  className="px-4 py-2.5 rounded-full bg-canvas border border-borderHairline hover:border-opticsCyan text-textSecondary hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <Scale className="w-3.5 h-3.5 text-opticsCyan" />
                  <span>Kepler Validation</span>
                </button>
              )}

              <button
                onClick={onExploreTransit}
                className="px-5 py-2.5 rounded-full bg-aerospaceBlue hover:bg-aerospaceBlueHover text-white text-xs font-medium flex items-center gap-2 transition-all group-hover:gap-3"
              >
                <span>Inspect Transit Light Curve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Card 2: 3D Celestial / Satellite Render Preview (Spans 5 cols) */}
        <div 
          onClick={onExplore3D}
          className="lg:col-span-5 bg-card border border-borderHairline rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-borderSubtle transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-xs text-textSecondary mb-4">
            <span className="font-mono">: 3D CELESTIAL SUITE</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-borderHairline text-opticsCyan">
              R3F + GSAP 60 FPS
            </span>
          </div>

          {/* Embedded Visual 3D Preview */}
          <div className="w-full h-48 rounded-xl overflow-hidden bg-black relative border border-borderHairline flex items-center justify-center">
            <img 
              src="/assets/nasa_fov_apertures.png" 
              alt="Orbital Sensor View"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <span className="font-mono text-white text-[11px]">Procedural Planetary Globes</span>
              <span className="text-opticsCyan text-[11px] flex items-center gap-1 font-medium">
                Launch 3D Suite <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="pt-4 space-y-1">
            <h3 className="font-semibold text-textPrimary text-sm">Interactive Procedural Textures & NASA Simulator.</h3>
            <p className="text-textSecondary text-xs leading-relaxed">
              Standardized WebGL sphere mapping using high-res Solar System Scope textures with dynamic cloud rotation and city night lights.
            </p>
          </div>
        </div>

      </div>

      {/* Second Bento Row: 3 Modular Cards (Clone of image 1 structure) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Bento Sub-Card 1: Photometric Apertures */}
        <div className="bg-card border border-borderHairline rounded-2xl p-6 flex flex-col justify-between hover:border-borderSubtle transition-all">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-800/30 flex items-center justify-center text-accentScience">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-textPrimary text-sm">
              Ensemble Aperture Photometry.
            </h3>
            <p className="text-textSecondary text-xs leading-relaxed">
              Three isolated comparison stars normalized against the host star, completely decorrelating sudden atmospheric extinction.
            </p>
          </div>

          <div className="pt-6 border-t border-borderHairline mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-textMuted">Cadence Interval</span>
            <span className="text-textPrimary font-bold">179.8s (2.9 min)</span>
          </div>
        </div>

        {/* Bento Sub-Card 2: Master Dark Noise Suppression */}
        <div className="bg-card border border-borderHairline rounded-2xl p-6 flex flex-col justify-between hover:border-borderSubtle transition-all">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-calibAmber">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-textPrimary text-sm">
              Master Dark Thermal Rejection.
            </h3>
            <p className="text-textSecondary text-xs leading-relaxed">
              60 calibration dark frames stacked by camera temperature, suppressing raw sensor noise from 1,562 ADU down to 12 ADU Gaussian.
            </p>
          </div>

          <div className="pt-6 border-t border-borderHairline mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-textMuted">Noise Scaling</span>
            <span className="text-telemetryGreen font-bold">1 / √N Verified</span>
          </div>
        </div>

        {/* Bento Sub-Card 3: 11 False Positive Cases */}
        <div 
          onClick={onExploreDiagnostic}
          className="bg-card border border-borderHairline rounded-2xl p-6 flex flex-col justify-between hover:border-borderSubtle transition-all cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-telemetryGreen">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-textPrimary text-sm group-hover:text-opticsCyan transition-colors">
              11-Case Triage Diagnostic.
            </h3>
            <p className="text-textSecondary text-xs leading-relaxed">
              Systematic ruling out of telescope tracking slips, chromatic airmass trends, and background blended eclipsing binaries.
            </p>
          </div>

          <div className="pt-6 border-t border-borderHairline mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-textMuted">Quality Triage</span>
            <span className="text-opticsCyan font-bold flex items-center gap-1">
              View Matrix <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

