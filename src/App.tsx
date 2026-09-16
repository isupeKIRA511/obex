import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BentoHero } from './components/layout/BentoHero';
import { TransitLab } from './components/transit/TransitLab';
import { FITSExplorer } from './components/fits/FITSExplorer';
import { FalsePositiveCases } from './components/diagnostic/FalsePositiveCases';
import { QualityTriageHub } from './components/quality/QualityTriageHub';
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
      const h = window.location.hash.replace('#', '');
      if (h !== '3d') return h;
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
      if (hash && hash !== '3d') setActiveTab(hash);
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

  // Synchronize target metadata & fetch targets/sessions from backend API
  useEffect(() => {
    let isCancelled = false;
    const initializeTelemetry = async () => {
      try {
        const [metaRes, targetsRes, sessionsRes, fpRes] = await Promise.all([
          apiService.getMeta(),
          apiService.getTargets(),
          apiService.getSessions(),
          apiService.getFalsePositiveCases()
        ]);
        
        if (!isCancelled) {
          if (metaRes) setMeta(metaRes);
          if (targetsRes && targetsRes.length > 0) {
            setTargets(targetsRes);
            setSelectedTarget(targetsRes[0]);
          }
          if (sessionsRes && sessionsRes.length > 0) {
            setSessions(sessionsRes);
            setSelectedSession(sessionsRes[0]);
          }
          if (fpRes && fpRes.length > 0) setFalsePositiveCases(fpRes);
        }
      } catch (err) {
        console.warn('Using robust fallback telemetry store:', err);
      }
    };

    initializeTelemetry();
    return () => { isCancelled = true; };
  }, []);

  // Synchronize active session & light curve whenever target changes
  useEffect(() => {
    if (!selectedTarget || sessions.length === 0) return;
    const matchedSession = findSessionForTarget(sessions, selectedTarget.target);
    if (matchedSession) {
      setSelectedSession(matchedSession);
    }
  }, [selectedTarget, sessions]);

  // Fetch real transit photometry light curve when session changes
  useEffect(() => {
    if (!selectedSession?.session_id) return;
    let isCancelled = false;
    const loadLightCurve = async () => {
      setIsLoadingLightCurve(true);
      try {
        const data = await apiService.getLightCurve(selectedSession.session_id);
        if (!isCancelled) {
          setCurrentLightCurve(data);
        }
      } catch (err) {
        console.warn('Failed loading session light curve:', err);
      } finally {
        if (!isCancelled) setIsLoadingLightCurve(false);
      }
    };
    loadLightCurve();
    return () => { isCancelled = true; };
  }, [selectedSession]);

  const handleSelectTarget = (target: Target) => {
    const key = target.target.toLowerCase();
    const bench = TARGET_BENCHMARKS[key];
    const enrichedTarget: Target = {
      ...target,
      transit_depth_pct: bench?.depth_pct ?? target.transit_depth_pct ?? 2.10,
      duration_hours: bench?.duration_hours ?? target.duration_hours ?? 1.82,
      period_days: bench?.period_days ?? target.period_days ?? 1.4822,
      v_mag: bench?.v_mag ?? target.v_mag ?? 13.72,
    };
    setSelectedTarget(enrichedTarget);
  };

  return (
    <ErrorBoundary fallbackTitle="Application Root Crash Protection">
      <div className="min-h-screen bg-canvas text-textPrimary flex flex-col font-sans selection:bg-aerospaceBlue selection:text-white">
        
        {/* Top Header featuring OBEX + Dynamic PDF Dossier Export */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedTarget={selectedTarget}
          selectedSession={selectedSession}
        />

        {/* Main Body with Left Interactive Sidebar Menu + Dynamic Workspace */}
        <div className="flex-1 flex overflow-x-hidden">
          
          {/* Left Side Menu (Collapsible & 0.4s Symmetrical Transition) */}
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
          </main>
        </div>

      </div>
    </ErrorBoundary>
  );
};

export default App;
