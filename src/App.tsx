import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BentoHero } from './components/layout/BentoHero';
import { TransitLab } from './components/transit/TransitLab';
import { FITSExplorer } from './components/fits/FITSExplorer';
import { FalsePositiveCases } from './components/diagnostic/FalsePositiveCases';
import { QualityTriageHub } from './components/quality/QualityTriageHub';
import { CelestialSuite } from './components/3d/CelestialSuite';
import { AstrophysicsValidation } from './components/physics/AstrophysicsValidation';
import { ExoplanetHubMaster } from './components/exoplanetHub/ExoplanetHubMaster';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { findSessionForTarget } from './utils/targetUtils';
import { apiService, FALLBACK_TARGETS, FALLBACK_SESSIONS, FALLBACK_META, FALLBACK_FALSE_POSITIVES } from './services/api';
import { Target, SessionSummary, DatasetMeta, FalsePositiveCase, SessionLightCurve } from './types';

const TARGET_BENCHMARKS: Record<string, { v_mag: number; depth_pct: number; duration_hours: number; period_days: number }> = {
  'tres-5': { v_mag: 13.72, depth_pct: 2.10, duration_hours: 1.82, period_days: 1.4822 },
  'tres-1': { v_mag: 11.79, depth_pct: 2.20, duration_hours: 2.45, period_days: 3.0300 },
  'tres-3': { v_mag: 12.40, depth_pct: 2.90, duration_hours: 1.35, period_days: 1.3061 },
  'wasp-10': { v_mag: 12.70, depth_pct: 1.60, duration_hours: 2.20, period_days: 3.0927 },
  'wasp-2': { v_mag: 11.98, depth_pct: 1.80, duration_hours: 1.70, period_days: 2.1522 },
  'qatar-1': { v_mag: 12.84, depth_pct: 2.05, duration_hours: 1.60, period_days: 1.4200 },
  'corot-2': { v_mag: 12.57, depth_pct: 3.40, duration_hours: 2.25, period_days: 1.7429 },
  'hat-p-10': { v_mag: 11.89, depth_pct: 1.45, duration_hours: 2.70, period_days: 3.7224 },
  'hatp-10': { v_mag: 11.89, depth_pct: 1.45, duration_hours: 2.70, period_days: 3.7224 },
};

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '');
    }
    return 'bento';
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  
  const [meta, setMeta] = useState<DatasetMeta>(FALLBACK_META);
  const [targets, setTargets] = useState<Target[]>(FALLBACK_TARGETS);
  const [sessions, setSessions] = useState<SessionSummary[]>(FALLBACK_SESSIONS);
  const [falsePositiveCases, setFalsePositiveCases] = useState<FalsePositiveCase[]>(FALLBACK_FALSE_POSITIVES);
  
  const [selectedTarget, setSelectedTarget] = useState<Target>(FALLBACK_TARGETS[0]); // TrES-5
  const [selectedSession, setSelectedSession] = useState<SessionSummary>(FALLBACK_SESSIONS[0]);
  const [currentLightCurve, setCurrentLightCurve] = useState<SessionLightCurve | null>(null);
  const [isLoadingLightCurve, setIsLoadingLightCurve] = useState<boolean>(false);

  // Fetch live API data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, t, s, fp] = await Promise.all([
          apiService.getMeta(),
          apiService.getTargets(),
          apiService.getSessions(),
          apiService.getFalsePositiveCases()
        ]);
        if (m) setMeta(m);
        if (t && t.length > 0) {
          const enrichedTargets = t.map((target) => {
            const key = target.target.toLowerCase().replace(/[^a-z0-9]/g, '');
            const b = TARGET_BENCHMARKS[target.target.toLowerCase()] || TARGET_BENCHMARKS[key];
            return {
              ...target,
              v_mag: target.v_mag ?? b?.v_mag ?? 12.5,
              period_days: target.period_days ?? b?.period_days ?? 1.5,
              transit_depth_pct: target.transit_depth_pct ?? b?.depth_pct ?? 2.1,
              duration_hours: target.duration_hours ?? b?.duration_hours ?? 1.8
            };
          });
          setTargets(enrichedTargets);
          setSelectedTarget(enrichedTargets[0]);
          if (s && s.length > 0) {
            const initialSession = findSessionForTarget(s, enrichedTargets[0].target);
            if (initialSession) setSelectedSession(initialSession);
          }
        }
        if (s && s.length > 0) {
          setSessions(s);
        }
        if (fp && fp.length > 0) {
          setFalsePositiveCases(fp);
        }
      } catch (e) {
        console.warn('Using scientific cached dataset.', e);
      }
    };
    loadData();
  }, []);

  // When target changes, auto-select its best session using fuzzy matching
  const handleSelectTarget = (target: Target) => {
    setSelectedTarget(target);
    const matchingSession = findSessionForTarget(sessions, target.target);
    if (matchingSession) {
      setSelectedSession(matchingSession);
    }
  };

  // Fetch light curve when session changes
  useEffect(() => {
    let isCancelled = false;
    const fetchCurve = async () => {
      if (!selectedSession?.session_id) return;
      setIsLoadingLightCurve(true);
      try {
        const curve = await apiService.getLightCurve(selectedSession.session_id);
        if (!isCancelled) {
          setCurrentLightCurve(curve);
        }
      } catch (err) {
        console.error('Error fetching light curve:', err);
      } finally {
        if (!isCancelled) setIsLoadingLightCurve(false);
      }
    };
    fetchCurve();
    return () => {
      isCancelled = true;
    };
  }, [selectedSession]);

  return (
    <ErrorBoundary fallbackTitle="Application Root Crash Protection">
      <div className="min-h-screen bg-canvas text-textPrimary flex flex-col font-sans selection:bg-aerospaceBlue selection:text-white">
        
        {/* Top Header featuring ONLY K.A.A in the center + sidebar toggle */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          totalFiles={meta?.total_files || 1741}
        />

        {/* Main Body with Left Interactive Sidebar Menu + Dynamic Workspace */}
        <div className="flex-1 flex overflow-x-hidden">
          
          {/* Left Side Menu (Collapsible & 0.5s Interactive Transition) */}
          <Sidebar
            isOpen={isSidebarOpen}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            selectedTarget={selectedTarget}
            targets={targets}
            setSelectedTarget={handleSelectTarget}
          />

          {/* Dynamic Workspace Canvas */}
          <main className="flex-1 p-6 lg:p-8 flex flex-col items-center overflow-y-auto w-full transition-all duration-400 ease-in-out">
            {activeTab === 'bento' && (
              <ErrorBoundary fallbackTitle="Mission Control Hub Error">
                <BentoHero
                  onExploreTransit={() => handleTabChange('transit')}
                  onExplore3D={() => handleTabChange('3d')}
                  onExploreDiagnostic={() => handleTabChange('diagnostic')}
                  onExplorePhysics={() => handleTabChange('physics')}
                  onExploreHub={() => handleTabChange('exoplanethub')}
                  selectedTarget={selectedTarget}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'transit' && (
              <ErrorBoundary fallbackTitle="Transit Photometry Lab Error">
                <TransitLab
                  targets={targets}
                  sessions={sessions}
                  selectedTarget={selectedTarget}
                  setSelectedTarget={handleSelectTarget}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                  lightCurve={currentLightCurve}
                  isLoadingLightCurve={isLoadingLightCurve}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'fits' && (
              <ErrorBoundary fallbackTitle="FITS Frame & Calibration Hub Error">
                <FITSExplorer
                  selectedTarget={selectedTarget}
                  selectedSession={selectedSession}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'diagnostic' && (
              <ErrorBoundary fallbackTitle="Diagnostic False Positive Matrix Error">
                <FalsePositiveCases cases={falsePositiveCases} />
              </ErrorBoundary>
            )}

            {activeTab === 'physics' && (
              <ErrorBoundary fallbackTitle="Astrophysics Validation Hub Error">
                <AstrophysicsValidation />
              </ErrorBoundary>
            )}

            {activeTab === 'quality' && (
              <ErrorBoundary fallbackTitle="Quality & Triage Hub Error">
                <QualityTriageHub 
                  sessions={sessions} 
                  targets={targets} 
                />
              </ErrorBoundary>
            )}

            {activeTab === 'exoplanethub' && (
              <ErrorBoundary fallbackTitle="NASA Exoplanet Hub Error">
                <ExoplanetHubMaster />
              </ErrorBoundary>
            )}

            {activeTab === '3d' && (
              <ErrorBoundary fallbackTitle="3D Celestial Suite Error">
                <CelestialSuite />
              </ErrorBoundary>
            )}
          </main>
        </div>

      </div>
    </ErrorBoundary>
  );
};

export default App;
