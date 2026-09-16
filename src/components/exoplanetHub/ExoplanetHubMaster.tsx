import React, { useState, useEffect } from 'react';
import { NASAArchiveExoplanet, Target } from '../../types';
import { nasaArchiveService } from '../../services/nasaArchiveService';
import { generateExoplanetPDF } from '../../utils/pdfExport';
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
  Layers,
  Download
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

        {/* Quick Export PDF for Selected Planet */}
        {selectedPlanet && (
          <button
            onClick={() => {
              const targetObj: Target = {
                target: selectedPlanet.pl_name,
                v_mag: selectedPlanet.sy_vmag || 12.0,
                transit_depth_pct: (selectedPlanet.pl_rade && selectedPlanet.st_rad) ? (Math.pow(selectedPlanet.pl_rade * 0.009158 / selectedPlanet.st_rad, 2) * 100) : 2.1,
                duration_hours: 2.0,
                period_days: selectedPlanet.pl_orbper || 1.5,
                ra_deg: selectedPlanet.ra,
                dec_deg: selectedPlanet.dec,
                nights: 1
              };
              generateExoplanetPDF({
                selectedTarget: targetObj,
                planetPhysics: {
                  target: selectedPlanet.pl_name,
                  summary: `NASA Archive discovery (${selectedPlanet.discoverymethod}) orbiting ${selectedPlanet.hostname}.`,
                  catalog_inputs: {
                    target: selectedPlanet.pl_name,
                    hostname: selectedPlanet.hostname,
                    pl_name: selectedPlanet.pl_name,
                    pl_orbper: selectedPlanet.pl_orbper,
                    pl_orbsmax: selectedPlanet.pl_orbsmax,
                    pl_eqt: selectedPlanet.pl_eqt,
                    st_teff: selectedPlanet.st_teff,
                    st_lum: selectedPlanet.st_lum,
                    st_rad: selectedPlanet.st_rad,
                    st_mass: selectedPlanet.st_mass,
                    sy_dist: selectedPlanet.sy_dist,
                    sy_vmag: selectedPlanet.sy_vmag,
                    ra: selectedPlanet.ra,
                    dec: selectedPlanet.dec
                  }
                }
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-card border border-borderHairline hover:border-opticsCyan text-xs font-mono text-textSecondary hover:text-white flex items-center gap-2 transition cursor-pointer shadow-sm"
            title={`Export PDF Dossier for ${selectedPlanet.pl_name}`}
          >
            <Download className="w-3.5 h-3.5 text-opticsCyan" />
            <span>Export {selectedPlanet.pl_name} PDF</span>
          </button>
        )}
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
