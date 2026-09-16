import React, { useState, useEffect } from 'react';
import { NASAArchiveExoplanet } from '../../types';
import { nasaArchiveService } from '../../services/nasaArchiveService';
import { NASAArchiveExplorer } from './NASAArchiveExplorer';
import { HabitableZoneAnalysis } from './HabitableZoneAnalysis';
import { MissionCalculator } from './MissionCalculator';
import { 
  Database, 
  Sparkles, 
  Rocket, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  Compass, 
  Layers
} from 'lucide-react';

export const ExoplanetHubMaster: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'explorer' | 'habitable' | 'mission'>('explorer');
  const [planets, setPlanets] = useState<NASAArchiveExoplanet[]>(() => nasaArchiveService.getCachedPlanets());
  const [selectedPlanet, setSelectedPlanet] = useState<NASAArchiveExoplanet | null>(() => {
    const cached = nasaArchiveService.getCachedPlanets();
    return cached[0] || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load live NASA data on mount
  useEffect(() => {
    let isCancelled = false;
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const live = await nasaArchiveService.fetchLiveTAPExoplanets(80);
        if (!isCancelled && live && live.length > 0) {
          setPlanets(live);
          if (!selectedPlanet) {
            setSelectedPlanet(live[0]);
          }
        }
      } catch (err) {
        console.warn('NASA TAP API sync error, loaded fallback dataset:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    fetchCatalog();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const live = await nasaArchiveService.fetchLiveTAPExoplanets(80);
      if (live && live.length > 0) {
        setPlanets(live);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenHZ = (planet: NASAArchiveExoplanet) => {
    setSelectedPlanet(planet);
    setActiveSubTab('habitable');
  };

  const handleOpenMission = (planet: NASAArchiveExoplanet) => {
    setSelectedPlanet(planet);
    setActiveSubTab('mission');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-opticsCyan animate-pulse"></span>
            <h2 className="text-base font-bold text-textPrimary font-mono">
              NASA Exoplanet Discovery Hub & Astrophysics Suite
            </h2>
          </div>
          <p className="text-xs text-textSecondary mt-1">
            Real-time Table Access Protocol (TAP) data, Kopparapu (2013) Habitable Zone calculations, and Relativistic Mission Physics
          </p>
        </div>

        {/* Sub-tab buttons */}
        <div className="flex items-center gap-2 bg-canvas p-1 rounded-xl border border-borderHairline text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('explorer')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'explorer'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>NASA TAP Archive</span>
          </button>

          <button
            onClick={() => setActiveSubTab('habitable')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'habitable'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Habitable Zone Lab</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mission')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'mission'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-opticsCyan" />
            <span>Mission Calculator</span>
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeSubTab === 'explorer' && (
        <NASAArchiveExplorer
          planets={planets}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
          onOpenHabitableZone={handleOpenHZ}
          onOpenMissionCalc={handleOpenMission}
        />
      )}

      {activeSubTab === 'habitable' && (
        <HabitableZoneAnalysis
          planets={planets}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
        />
      )}

      {activeSubTab === 'mission' && (
        <MissionCalculator
          planets={planets}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
        />
      )}

    </div>
  );
};
