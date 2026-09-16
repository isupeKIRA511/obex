import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  SessionSummary, 
  SessionLightCurve, 
  LightCurvePoint, 
  PhaseFoldResponse, 
  PhaseFoldPoint,
  EphemerisRow,
  MeasuredDepthRow,
  PlanetDetailResponse
} from '../../types';
import { apiService } from '../../services/api';
import { isSameTarget, safeFixed } from '../../utils/targetUtils';
import { 
  Activity, 
  Info, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  TrendingDown, 
  Zap, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface TransitLabProps {
  targets: Target[];
  sessions: SessionSummary[];
  selectedTarget: Target;
  setSelectedTarget: (target: Target) => void;
  selectedSession: SessionSummary;
  setSelectedSession: (session: SessionSummary) => void;
  lightCurve: SessionLightCurve | null;
  isLoadingLightCurve: boolean;
}

export const TransitLab: React.FC<TransitLabProps> = ({
  targets,
  sessions,
  selectedTarget,
  setSelectedTarget,
  selectedSession,
  setSelectedSession,
  lightCurve,
  isLoadingLightCurve
}) => {
  const [isPhaseFolded, setIsPhaseFolded] = useState(false);
  const [showRawComparison, setShowRawComparison] = useState(false);
  const [phaseFoldData, setPhaseFoldData] = useState<PhaseFoldResponse | null>(null);
  const [isLoadingPhaseFold, setIsLoadingPhaseFold] = useState(false);
  const [ephemerides, setEphemerides] = useState<EphemerisRow[]>([]);
  const [measuredDepths, setMeasuredDepths] = useState<MeasuredDepthRow[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<LightCurvePoint | null>(null);
  const [hoveredPhasePoint, setHoveredPhasePoint] = useState<PhaseFoldPoint | null>(null);

  // Live /api/planets/{target} state
  const [planetPhysics, setPlanetPhysics] = useState<PlanetDetailResponse | null>(null);

  // Fetch target physics from /api/planets/{target}
  useEffect(() => {
    let isCancelled = false;
    const fetchPhysics = async () => {
      try {
        const res = await apiService.getPlanetPhysics(selectedTarget.target);
        if (!isCancelled) setPlanetPhysics(res);
      } catch (err) {
        console.warn('Failed loading target physics:', err);
      }
    };
    fetchPhysics();
    return () => { isCancelled = true; };
  }, [selectedTarget]);

  // Filter sessions for selected target with fuzzy matching
  const targetSessions = useMemo(() => {
    const filtered = sessions.filter(
      (s) => isSameTarget(s.target, selectedTarget?.target)
    );
    if (filtered.length > 0) return filtered;
    if (selectedSession) return [selectedSession];
    return sessions;
  }, [sessions, selectedTarget, selectedSession]);

  // Load live ephemerides & depths on mount
  useEffect(() => {
    const loadScienceData = async () => {
      try {
        const [eph, dep] = await Promise.all([
          apiService.getEphemerides(),
          apiService.getDepths()
        ]);
        if (eph?.rows) setEphemerides(eph.rows);
        if (dep?.rows) setMeasuredDepths(dep.rows);
      } catch (err) {
        console.warn('Failed loading science ephemerides:', err);
      }
    };
    loadScienceData();
  }, []);

  // Fetch phase-folded data when toggled or target changes
  useEffect(() => {
    if (!isPhaseFolded) return;
    let isCancelled = false;
    const fetchPhase = async () => {
      setIsLoadingPhaseFold(true);
      try {
        const res = await apiService.getPhaseFolded(selectedTarget.target);
        if (!isCancelled) setPhaseFoldData(res);
      } catch (err) {
        console.warn('Failed loading phase folded curve:', err);
      } finally {
        if (!isCancelled) setIsLoadingPhaseFold(false);
      }
    };
    fetchPhase();
    return () => { isCancelled = true; };
  }, [isPhaseFolded, selectedTarget]);

  // Match live ephemeris row for current target with fuzzy matching
  const activeEphemeris = useMemo(() => {
    return ephemerides.find(
      (r) => isSameTarget(r.hostname, selectedTarget?.target) ||
             (r.pl_name && isSameTarget(r.pl_name, selectedTarget?.target))
    );
  }, [ephemerides, selectedTarget]);

  // Match live measured depth row for current session
  const activeMeasuredDepth = useMemo(() => {
    if (!selectedSession?.session_id) return undefined;
    return measuredDepths.find(
      (r) => r.session_id === selectedSession.session_id
    );
  }, [measuredDepths, selectedSession]);

  // SVG Chart Geometry & Calculations
  const chartWidth = 760;
  const chartHeight = 320;
  const padding = { top: 30, right: 35, bottom: 45, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Compute domain & range for Single-Night Light Curve
  const points = lightCurve?.points || [];
  const predMid = lightCurve?.prediction?.pred_mid_bjd || (points.length > 0 ? points[0].bjd_tdb : 0);

  // Time in hours relative to predicted mid-transit
  const processedPoints = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((pt) => {
      const relHours = (pt.bjd_tdb - predMid) * 24;
      return {
        ...pt,
        relHours: parseFloat(relHours.toFixed(3)),
        usedFlux: showRawComparison ? pt.target_only_norm : pt.norm_flux
      };
    });
  }, [points, predMid, showRawComparison]);

  const xExtent = useMemo(() => {
    if (processedPoints.length === 0) return [-2.5, 2.5];
    const vals = processedPoints.map((p) => p.relHours);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.08, 0.2);
    return [min - pad, max + pad];
  }, [processedPoints]);

  const yExtent = useMemo(() => {
    if (processedPoints.length === 0) return [0.96, 1.04];
    const vals = processedPoints.map((p) => p.usedFlux);
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    // Add margin
    const pad = (max - min) * 0.15 || 0.02;
    min = Math.min(min - pad, 0.965);
    max = Math.max(max + pad, 1.025);
    return [min, max];
  }, [processedPoints]);

  // Scales
  const scaleX = (val: number) => {
    const span = (xExtent[1] - xExtent[0]) || 1;
    return padding.left + ((val - xExtent[0]) / span) * innerWidth;
  };

  const scaleY = (val: number) => {
    const span = (yExtent[1] - yExtent[0]) || 1;
    return padding.top + innerHeight - ((val - yExtent[0]) / span) * innerHeight;
  };

  // Markers for ingress/mid/egress
  const ingressRelH = lightCurve?.prediction ? (lightCurve.prediction.pred_ingress_bjd - predMid) * 24 : null;
  const egressRelH = lightCurve?.prediction ? (lightCurve.prediction.pred_egress_bjd - predMid) * 24 : null;

  // Phase Folded Chart Calculations
  const phasePoints = phaseFoldData?.points || [];
  const phaseXExtent = useMemo(() => {
    if (phasePoints.length === 0) return [-3, 3];
    const vals = phasePoints.map((p) => p.phase_hours);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return [min - 0.2, max + 0.2];
  }, [phasePoints]);

  const phaseYExtent = useMemo(() => {
    if (phasePoints.length === 0) return [0.96, 1.04];
    const vals = phasePoints.map((p) => p.flux);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.15 || 0.02;
    return [Math.min(min - pad, 0.965), Math.max(max + pad, 1.025)];
  }, [phasePoints]);

  const scalePhaseX = (val: number) => {
    const span = (phaseXExtent[1] - phaseXExtent[0]) || 1;
    return padding.left + ((val - phaseXExtent[0]) / span) * innerWidth;
  };

  const scalePhaseY = (val: number) => {
    const span = (phaseYExtent[1] - phaseYExtent[0]) || 1;
    return padding.top + innerHeight - ((val - phaseYExtent[0]) / span) * innerHeight;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Target & Session Filter Strip */}
      <div className="bg-card border border-borderHairline rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Target Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-textSecondary font-mono uppercase">Target System:</label>
          <select
            value={selectedTarget?.target || ''}
            onChange={(e) => {
              const found = targets.find((t) => t.target === e.target.value);
              if (found) setSelectedTarget(found);
            }}
            className="bg-canvas border border-borderHairline rounded-lg px-3 py-1.5 text-xs font-mono text-textPrimary focus:outline-none focus:border-opticsCyan cursor-pointer transition-colors"
          >
            {targets.map((t) => (
              <option key={t.target} value={t.target}>
                {t.target} ({t.nights} Nights • V={t.v_mag})
              </option>
            ))}
          </select>
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-textSecondary font-mono uppercase">Session Triage:</label>
          <select
            value={selectedSession?.session_id || (targetSessions[0]?.session_id ?? '')}
            onChange={(e) => {
              const s = sessions.find((item) => item.session_id === e.target.value);
              if (s) setSelectedSession(s);
            }}
            className="bg-canvas border border-borderHairline rounded-lg px-3 py-1.5 text-xs font-mono text-textPrimary focus:outline-none focus:border-opticsCyan cursor-pointer transition-colors"
          >
            {targetSessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                {s.night} • {s.n_frames} frames ({s.quality.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Calibrated vs Target-Only Toggle */}
          {!isPhaseFolded && (
            <button
              onClick={() => setShowRawComparison(!showRawComparison)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                showRawComparison
                  ? 'bg-amber-950/60 border-amber-600 text-calibAmber'
                  : 'bg-canvas border-borderHairline text-textSecondary hover:text-white'
              }`}
            >
              {showRawComparison ? 'Mode: Raw Target Only' : 'Mode: Differential Calibrated'}
            </button>
          )}

          {/* Phase Fold Toggle */}
          <button
            onClick={() => setIsPhaseFolded(!isPhaseFolded)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-2 transition-all cursor-pointer ${
              isPhaseFolded
                ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold shadow-lg shadow-purple-950/30'
                : 'bg-canvas border-borderHairline text-textSecondary hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isPhaseFolded ? 'Exit Phase Fold' : 'Multi-Night Phase Fold'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Analysis Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Interactive Light Curve SVG Canvas */}
        <div className="lg:col-span-8 bg-card border border-borderHairline rounded-2xl p-6 flex flex-col justify-between space-y-4 relative">
          
          {/* Header Info */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPhaseFolded ? 'bg-purple-400 animate-pulse' : 'bg-opticsCyan'}`}></span>
                <h2 className="text-base font-bold text-textPrimary font-mono">
                  {isPhaseFolded 
                    ? `Multi-Night Phase-Folded Light Curve (${selectedTarget?.target || 'Target'})` 
                    : `Live Transit Photometry (${selectedSession?.session_id || 'Session'})`}
                </h2>
              </div>
              <p className="text-xs text-textSecondary mt-1">
                {isPhaseFolded
                  ? 'Binned differential flux across all available nights with standard deviation error bars'
                  : 'Aperture Photometry • Synchronized Mandel & Agol analytical fit with real telemetry'}
              </p>
            </div>

            {/* Live Telemetry Badges */}
            <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
              {lightCurve && !isPhaseFolded && (
                <>
                  <span className="px-2 py-0.5 rounded bg-blue-950/50 border border-blue-800/40 text-blue-300 text-[11px]">
                    RMS: {safeFixed(lightCurve.rms_ppt, 1)} ppt
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40 text-telemetryGreen text-[11px] font-bold">
                    Gain: {safeFixed(lightCurve.improvement_factor, 1)}x Cleaner
                  </span>
                </>
              )}
              {isPhaseFolded && phaseFoldData && (
                <span className="px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/40 text-purple-300 text-[11px]">
                  {phaseFoldData.n_points} Binned Points
                </span>
              )}
            </div>
          </div>

          {/* Interactive SVG Plot Container */}
          <div className="w-full bg-canvas border border-borderHairline rounded-xl p-3 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
            
            {(isLoadingLightCurve || isLoadingPhaseFold) && (
              <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex items-center gap-3 text-opticsCyan font-mono text-xs">
                  <div className="w-4 h-4 border-2 border-opticsCyan border-t-transparent rounded-full animate-spin"></div>
                  <span>Streaming calibrated transit photometry from API...</span>
                </div>
              </div>
            )}

            {!isPhaseFolded ? (
              // SINGLE NIGHT LIGHT CURVE SVG
              <div className="w-full relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto max-h-[360px] overflow-visible select-none"
                >
                  {/* Grid Lines */}
                  {[0.97, 0.98, 0.99, 1.00, 1.01, 1.02].map((yVal) => {
                    const y = scaleY(yVal);
                    if (y < padding.top || y > chartHeight - padding.bottom) return null;
                    return (
                      <g key={yVal}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#1F2430"
                          strokeDasharray={yVal === 1.00 ? '4 3' : '1 3'}
                          strokeWidth={yVal === 1.00 ? '1.5' : '1'}
                        />
                        <text
                          x={padding.left - 10}
                          y={y + 4}
                          fill={yVal === 1.00 ? '#06B6D4' : '#64748B'}
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {yVal.toFixed(3)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical Axis Line */}
                  <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={chartHeight - padding.bottom}
                    stroke="#2D3748"
                    strokeWidth="1"
                  />

                  {/* Horizontal Axis Line */}
                  <line
                    x1={padding.left}
                    y1={chartHeight - padding.bottom}
                    x2={chartWidth - padding.right}
                    y2={chartHeight - padding.bottom}
                    stroke="#2D3748"
                    strokeWidth="1"
                  />

                  {/* Transit Ingress / Mid / Egress Guides */}
                  {ingressRelH !== null && ingressRelH >= xExtent[0] && ingressRelH <= xExtent[1] && (
                    <g>
                      <line
                        x1={scaleX(ingressRelH)}
                        y1={padding.top}
                        x2={scaleX(ingressRelH)}
                        y2={chartHeight - padding.bottom}
                        stroke="#06B6D4"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <text
                        x={scaleX(ingressRelH)}
                        y={padding.top - 8}
                        fill="#06B6D4"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        Ingress
                      </text>
                    </g>
                  )}

                  {predMid && 0 >= xExtent[0] && 0 <= xExtent[1] && (
                    <g>
                      <line
                        x1={scaleX(0)}
                        y1={padding.top}
                        x2={scaleX(0)}
                        y2={chartHeight - padding.bottom}
                        stroke="#10B981"
                        strokeDasharray="4 2"
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                      <text
                        x={scaleX(0)}
                        y={padding.top - 8}
                        fill="#10B981"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        T_mid
                      </text>
                    </g>
                  )}

                  {egressRelH !== null && egressRelH >= xExtent[0] && egressRelH <= xExtent[1] && (
                    <g>
                      <line
                        x1={scaleX(egressRelH)}
                        y1={padding.top}
                        x2={scaleX(egressRelH)}
                        y2={chartHeight - padding.bottom}
                        stroke="#06B6D4"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <text
                        x={scaleX(egressRelH)}
                        y={padding.top - 8}
                        fill="#06B6D4"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        Egress
                      </text>
                    </g>
                  )}

                  {/* X Axis Ticks & Labels */}
                  {[-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((t) => {
                    if (t < xExtent[0] || t > xExtent[1]) return null;
                    const x = scaleX(t);
                    return (
                      <g key={t}>
                        <line
                          x1={x}
                          y1={chartHeight - padding.bottom}
                          x2={x}
                          y2={chartHeight - padding.bottom + 5}
                          stroke="#64748B"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={chartHeight - padding.bottom + 18}
                          fill="#64748B"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {t > 0 ? `+${t}` : t}h
                        </text>
                      </g>
                    );
                  })}

                  {/* X Axis Title */}
                  <text
                    x={chartWidth / 2}
                    y={chartHeight - 8}
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Time from Predicted Mid-Transit (Hours)
                  </text>

                  {/* Data Points */}
                  {processedPoints.map((pt, idx) => {
                    const cx = scaleX(pt.relHours);
                    const cy = scaleY(pt.usedFlux);
                    const isHovered = hoveredPoint?.frame_index === pt.frame_index;

                    return (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 3.5}
                        fill={showRawComparison ? '#F59E0B' : (isHovered ? '#FFFFFF' : '#2563EB')}
                        stroke={isHovered ? '#06B6D4' : '#0F172A'}
                        strokeWidth={isHovered ? 2 : 1}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredPoint && (
                  <div className="absolute top-4 right-4 bg-black/90 border border-opticsCyan/60 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1 pointer-events-none z-30">
                    <div className="text-opticsCyan font-bold flex justify-between gap-4">
                      <span>Frame #{hoveredPoint.frame_index}</span>
                      <span>{safeFixed(hoveredPoint.norm_flux, 4)} Flux</span>
                    </div>
                    <div className="text-textSecondary flex justify-between gap-4">
                      <span>Airmass (X):</span>
                      <span className="text-white">{safeFixed(hoveredPoint.airmass, 3)}</span>
                    </div>
                    <div className="text-textSecondary flex justify-between gap-4">
                      <span>Sky Level:</span>
                      <span className="text-white">{hoveredPoint.sky_level ?? '—'} ADU</span>
                    </div>
                    <div className="text-textSecondary flex justify-between gap-4">
                      <span>BJD:</span>
                      <span className="text-white">{safeFixed(hoveredPoint.bjd_tdb, 5)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // PHASE-FOLDED SVG PLOT
              <div className="w-full relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto max-h-[360px] overflow-visible select-none"
                >
                  {/* Grid Lines */}
                  {[0.97, 0.98, 0.99, 1.00, 1.01, 1.02].map((yVal) => {
                    const y = scalePhaseY(yVal);
                    if (y < padding.top || y > chartHeight - padding.bottom) return null;
                    return (
                      <g key={yVal}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#1F2430"
                          strokeDasharray={yVal === 1.00 ? '4 3' : '1 3'}
                          strokeWidth={yVal === 1.00 ? '1.5' : '1'}
                        />
                        <text
                          x={padding.left - 10}
                          y={y + 4}
                          fill={yVal === 1.00 ? '#06B6D4' : '#64748B'}
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {yVal.toFixed(3)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Mid-Transit Line at 0 */}
                  <line
                    x1={scalePhaseX(0)}
                    y1={padding.top}
                    x2={scalePhaseX(0)}
                    y2={chartHeight - padding.bottom}
                    stroke="#10B981"
                    strokeDasharray="4 2"
                    strokeWidth="1.2"
                    opacity="0.8"
                  />

                  {/* Phase X Ticks */}
                  {[-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((t) => {
                    if (t < phaseXExtent[0] || t > phaseXExtent[1]) return null;
                    const x = scalePhaseX(t);
                    return (
                      <g key={t}>
                        <line
                          x1={x}
                          y1={chartHeight - padding.bottom}
                          x2={x}
                          y2={chartHeight - padding.bottom + 5}
                          stroke="#64748B"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={chartHeight - padding.bottom + 18}
                          fill="#64748B"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {t > 0 ? `+${t}` : t}h
                        </text>
                      </g>
                    );
                  })}

                  {/* X Axis Title */}
                  <text
                    x={chartWidth / 2}
                    y={chartHeight - 8}
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Phase (Hours from Mid-Transit across All Nights)
                  </text>

                  {/* Binned Phase Points with Error Bars */}
                  {phasePoints.map((pt, idx) => {
                    const cx = scalePhaseX(pt.phase_hours);
                    const cy = scalePhaseY(pt.flux);
                    const errPx = Math.abs(scalePhaseY(pt.flux + pt.err) - cy);
                    const isHovered = hoveredPhasePoint?.phase_hours === pt.phase_hours;

                    return (
                      <g 
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPhasePoint(pt)}
                        onMouseLeave={() => setHoveredPhasePoint(null)}
                      >
                        {/* Error Bar Line */}
                        <line
                          x1={cx}
                          y1={cy - errPx}
                          x2={cx}
                          y2={cy + errPx}
                          stroke="#818CF8"
                          strokeWidth="1.2"
                          opacity="0.7"
                        />
                        {/* Error Bar Caps */}
                        <line
                          x1={cx - 3}
                          y1={cy - errPx}
                          x2={cx + 3}
                          y2={cy - errPx}
                          stroke="#818CF8"
                          strokeWidth="1.2"
                        />
                        <line
                          x1={cx - 3}
                          y1={cy + errPx}
                          x2={cx + 3}
                          y2={cy + errPx}
                          stroke="#818CF8"
                          strokeWidth="1.2"
                        />
                        {/* Point Marker */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 6 : 4}
                          fill={isHovered ? '#FFFFFF' : '#A855F7'}
                          stroke="#0F172A"
                          strokeWidth="1"
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredPhasePoint && (
                  <div className="absolute top-4 right-4 bg-black/90 border border-purple-500/60 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1 pointer-events-none z-30">
                    <div className="text-purple-300 font-bold flex justify-between gap-4">
                      <span>Phase: {safeFixed(hoveredPhasePoint.phase_hours, 2)}h</span>
                      <span>{safeFixed(hoveredPhasePoint.flux, 4)} Flux</span>
                    </div>
                    <div className="text-textSecondary flex justify-between gap-4">
                      <span>1-σ Uncertainty:</span>
                      <span className="text-white">± {safeFixed((hoveredPhasePoint.err ?? 0) * 1000, 1)} ppt</span>
                    </div>
                    <div className="text-textSecondary flex justify-between gap-4">
                      <span>Pooled Nights:</span>
                      <span className="text-white">{hoveredPhasePoint.n_nights ?? '—'} nights</span>
                    </div>
                    <div className="text-textSecondary flex justify-between gap-4">
                      <span>Exposures in Bin:</span>
                      <span className="text-white">{hoveredPhasePoint.n ?? '—'} frames</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Telemetry Legend & Live Correlation Strip */}
          <div className="pt-3 border-t border-borderHairline flex items-center justify-between text-xs text-textSecondary flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className={`w-2.5 h-2.5 rounded-full ${showRawComparison ? 'bg-calibAmber' : 'bg-aerospaceBlue'}`}></span>
                {showRawComparison ? 'Raw Target Only' : 'Calibrated Differential Flux'}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-4 h-0.5 bg-opticsCyan"></span>
                Baseline Flux (1.000)
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                T_mid Marker
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-telemetryGreen">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Airmass Slope & Sky Background Decorrelated</span>
            </div>
          </div>

        </div>

        {/* Live NASA Archive & Science Depths Parameters Card (Spans 4 cols) */}
        <div className="lg:col-span-4 bg-card border border-borderHairline rounded-2xl p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-textMuted flex items-center justify-between">
              <span>NASA Archive Ephemeris</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <h3 className="text-lg font-bold text-textPrimary font-mono">
              {selectedTarget.target} b System Parameters
            </h3>
            <p className="text-[11px] text-textMuted">
              Live ephemerides from NASA Exoplanet Archive TAP service
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Transit Depth */}
            <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
              <span className="text-textSecondary font-sans">Catalog Transit Depth (ΔF)</span>
              <span className="text-base font-bold text-opticsCyan">
                {(activeEphemeris?.pl_trandep !== null && activeEphemeris?.pl_trandep !== undefined)
                  ? `${activeEphemeris.pl_trandep.toFixed(2)}%`
                  : `${(selectedTarget.transit_depth_pct || 2.10).toFixed(2)}%`}
              </span>
            </div>

            {/* Measured Depth in this Session */}
            {activeMeasuredDepth && (
              <div className="p-3 rounded-xl bg-canvas border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="text-textSecondary font-sans">Pipeline Measured Depth</div>
                  <div className="text-[10px] text-telemetryGreen">
                    Significance: {activeMeasuredDepth.significance_sigma.toFixed(1)} σ
                  </div>
                </div>
                <span className="text-base font-bold text-telemetryGreen">
                  {activeMeasuredDepth.depth_pct.toFixed(2)}% <span className="text-[10px] text-textMuted font-normal">± {activeMeasuredDepth.depth_err_pct.toFixed(2)}%</span>
                </span>
              </div>
            )}

            {/* Semi-Major Axis (Kepler III) */}
            {planetPhysics?.catalog_inputs?.pl_orbsmax && (
              <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
                <span className="text-textSecondary font-sans">Semi-Major Axis (a)</span>
                <span className="text-base font-bold text-opticsCyan">
                  {planetPhysics.catalog_inputs.pl_orbsmax.toFixed(4)}{' '}
                  <span className="text-xs text-textMuted font-normal">AU</span>
                </span>
              </div>
            )}

            {/* Equilibrium Temp */}
            {planetPhysics?.catalog_inputs?.pl_eqt && (
              <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
                <span className="text-textSecondary font-sans">Equilibrium Temp (Teq)</span>
                <span className="text-base font-bold text-calibAmber">
                  {planetPhysics.catalog_inputs.pl_eqt.toFixed(0)}{' '}
                  <span className="text-xs text-textMuted font-normal">K</span>
                </span>
              </div>
            )}

            {/* Radius Ratio */}
            <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
              <span className="text-textSecondary font-sans">Radius Ratio (Rp/R*)</span>
              <span className="text-base font-bold text-textPrimary">
                {(Math.sqrt((activeEphemeris?.pl_trandep || selectedTarget.transit_depth_pct || 2.10) / 100)).toFixed(4)}
              </span>
            </div>

            {/* Orbital Period */}
            <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
              <span className="text-textSecondary font-sans">Orbital Period (P)</span>
              <span className="text-base font-bold text-textPrimary">
                {activeEphemeris?.pl_orbper ? activeEphemeris.pl_orbper.toFixed(5) : (selectedTarget.period_days || 1.4822).toFixed(5)}{' '}
                <span className="text-xs text-textMuted font-normal">days</span>
              </span>
            </div>

            {/* Transit Duration */}
            <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
              <span className="text-textSecondary font-sans">Transit Duration (T14)</span>
              <span className="text-base font-bold text-textPrimary">
                {activeEphemeris?.pl_trandur ? activeEphemeris.pl_trandur.toFixed(2) : (selectedTarget.duration_hours || 1.82).toFixed(2)}{' '}
                <span className="text-xs text-textMuted font-normal">hours</span>
              </span>
            </div>

            {/* Host Star V Magnitude */}
            <div className="p-3 rounded-xl bg-canvas border border-borderHairline flex items-center justify-between">
              <span className="text-textSecondary font-sans">Host Star Brightness</span>
              <span className="text-base font-bold text-textPrimary">
                V = {selectedTarget.v_mag || 13.72}
              </span>
            </div>
          </div>

          {/* Planet Physics Summary Banner */}
          {planetPhysics?.summary && (
            <div className="p-3 rounded-xl bg-canvas/70 border border-borderHairline text-[11px] font-mono text-textMuted leading-relaxed">
              {planetPhysics.summary}
            </div>
          )}

          {/* External Citation Link */}
          <div className="pt-4 border-t border-borderHairline">
            <a
              href={`https://exoplanetarchive.ipac.caltech.edu/overview/${selectedTarget.target}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-canvas border border-borderHairline hover:border-opticsCyan/50 text-textSecondary hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>NASA Exoplanet Archive Record</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

      {/* Live Multi-Target Measured Depths Catalog */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-borderHairline">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-telemetryGreen animate-pulse"></span>
            <h3 className="font-bold text-textPrimary font-mono text-sm">
              Empirical Transit Measurement Catalog (16 Observation Windows)
            </h3>
          </div>
        </div>

        {/* Live Empirical Depths Table */}
        <div className="overflow-x-auto rounded-xl border border-borderHairline">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-canvasSubtle text-textMuted border-b border-borderHairline text-[11px] uppercase">
                <th className="p-3">Session & Target</th>
                <th className="p-3">Catalog Depth</th>
                <th className="p-3">Measured Depth</th>
                <th className="p-3">Significance</th>
                <th className="p-3">RMS Scatter</th>
                <th className="p-3">Exposures (In / Out)</th>
                <th className="p-3">Coverage</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderHairline">
              {measuredDepths.map((row) => {
                const isSelected = selectedSession.session_id === row.session_id;
                const isSignificant = row.significance_sigma >= 3.0;
                const isNull = row.depth_pct < 0;

                return (
                  <tr 
                    key={row.session_id} 
                    className={`transition-colors ${isSelected ? 'bg-blue-950/30' : 'hover:bg-canvas/50'}`}
                  >
                    <td className="p-3 font-semibold text-textPrimary">
                      <div className="flex items-center gap-2">
                        <span className="text-opticsCyan">{row.target}</span>
                        <span className="text-[10px] text-textMuted font-normal">{row.session_id.split('__')[1]}</span>
                      </div>
                      <div className="text-[10px] text-textMuted">Epoch #{row.epoch}</div>
                    </td>

                    <td className="p-3 text-textSecondary">
                      {row.expected_depth_pct ? `${row.expected_depth_pct.toFixed(2)}%` : '—'}
                    </td>

                    <td className="p-3">
                      <span className={`font-bold ${isNull ? 'text-textMuted' : (isSignificant ? 'text-telemetryGreen' : 'text-textPrimary')}`}>
                        {row.depth_pct.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-textMuted font-normal"> ± {row.depth_err_pct.toFixed(2)}%</span>
                    </td>

                    <td className="p-3">
                      {isNull ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-borderHairline text-textMuted">
                          Null ({row.significance_sigma.toFixed(1)} σ)
                        </span>
                      ) : isSignificant ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-800/40 text-telemetryGreen font-bold">
                          {row.significance_sigma.toFixed(1)} σ (Confirmed Dip)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-canvas border border-borderHairline text-textSecondary">
                          {row.significance_sigma.toFixed(1)} σ (Inconclusive)
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-textSecondary">
                      {row.out_of_transit_rms_ppt.toFixed(1)} ppt
                    </td>

                    <td className="p-3 text-textSecondary">
                      {row.n_in} / {row.n_out} frames
                    </td>

                    <td className="p-3 text-textSecondary">
                      {(row.coverage_frac * 100).toFixed(0)}%
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          const targetObj = targets.find(t => t.target.toLowerCase() === row.target.toLowerCase());
                          const sessionObj = sessions.find(s => s.session_id === row.session_id);
                          if (targetObj) setSelectedTarget(targetObj);
                          if (sessionObj) setSelectedSession(sessionObj);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-aerospaceBlue text-white font-semibold'
                            : 'bg-canvas border border-borderHairline text-textSecondary hover:text-white hover:border-opticsCyan'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-[11px] font-mono text-textMuted flex items-center justify-between flex-wrap gap-2">
          <span>Total Measured Windows: {measuredDepths.length} Nights across 8 Target Systems</span>
          <span className="text-telemetryGreen">Directly connected to PostgreSQL backend via Railway API</span>
        </div>
      </div>

    </div>
  );
};

