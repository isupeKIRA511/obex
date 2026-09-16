import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Globe, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  BarChart2,
  FileSearch,
  Scale
} from 'lucide-react';
import { Target } from '../../types';
import { safeFixed, isSameTarget } from '../../utils/targetUtils';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTarget: Target;
  targets: Target[];
  setSelectedTarget: (target: Target) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  setActiveTab,
  selectedTarget,
  targets,
  setSelectedTarget
}) => {
  const menuItems = [
    {
      id: 'bento',
      label: 'Mission Control',
      sublabel: 'Aerospace Bento Overview',
      icon: LayoutDashboard
    },
    {
      id: 'transit',
      label: 'Transit Photometry Lab',
      sublabel: 'Normalized Flux & Airmass',
      icon: Activity
    },
    {
      id: 'fits',
      label: 'FITS & Sensor Catalog',
      sublabel: 'CCD Frames & Headers',
      icon: Layers
    },
    {
      id: 'physics',
      label: 'Astrophysics Validation',
      sublabel: 'Kepler III & 48 Checks',
      icon: Scale
    },
    {
      id: 'quality',
      label: 'Quality & Triage Hub',
      sublabel: '22 Sessions & Control Sample',
      icon: BarChart2
    },
    {
      id: '3d',
      label: '3D Celestial Suite',
      sublabel: 'R3F Planets & NASA Eyes',
      icon: Globe
    },
  ];

  return (
    <aside 
      className={`h-[calc(100vh-4.5rem)] sticky top-18 z-40 flex flex-col justify-between bg-canvasSubtle border-r border-borderHairline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden ${
        isOpen 
          ? 'w-76 opacity-100 translate-x-0 p-4 shadow-2xl shadow-black/60' 
          : 'w-0 opacity-0 -translate-x-full p-0 border-r-0 pointer-events-none'
      }`}
    >
      <div className="w-68 min-w-[17rem] flex flex-col justify-between h-full space-y-6">
        
        {/* Top Section: Navigation Links */}
        <div className="space-y-6">
          
          {/* Navigation Category Header */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-textMuted px-2 mb-3">
              <span>Exploration Modules</span>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full p-3 rounded-xl text-left flex items-center justify-between group transition-all duration-300 transform hover:translate-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-card border border-opticsCyan/60 shadow-lg shadow-cyan-950/30 text-textPrimary'
                        : 'hover:bg-card/70 text-textSecondary hover:text-white border border-transparent hover:border-borderHairline/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                        isActive 
                          ? 'bg-aerospaceBlue text-white shadow-md shadow-blue-500/20' 
                          : 'bg-card border border-borderHairline text-textSecondary group-hover:text-opticsCyan group-hover:border-opticsCyan/40'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-textPrimary leading-tight group-hover:text-opticsCyan transition-colors duration-200">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-textMuted font-mono group-hover:text-textSecondary transition-colors duration-200">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Target Quick Selector Card */}
          <div className="p-3.5 rounded-xl bg-card border border-borderHairline hover:border-opticsCyan/40 transition-all duration-300 transform hover:-translate-y-0.5 space-y-2.5 group">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-textMuted uppercase group-hover:text-textSecondary transition-colors">Active System</span>
              <span className="text-opticsCyan font-bold">{selectedTarget?.target || 'Target'} b</span>
            </div>

            <select
              value={selectedTarget?.target || ''}
              onChange={(e) => {
                const t = targets.find((item) => isSameTarget(item.target, e.target.value));
                if (t) setSelectedTarget(t);
              }}
              className="w-full bg-canvas border border-borderHairline rounded-lg px-2.5 py-1.5 text-xs font-mono text-textPrimary focus:outline-none focus:border-opticsCyan cursor-pointer transition-colors"
            >
              {targets.map((t) => (
                <option key={t.target} value={t.target}>
                  {t.target} ({t.nights} Nights • V={safeFixed(t.v_mag, 2)})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-textMuted pt-1">
              <div className="bg-canvas p-1.5 rounded border border-borderHairline group-hover:border-borderSubtle transition-colors">
                <span>Depth: </span>
                <span className="text-textPrimary font-bold">{safeFixed(selectedTarget?.transit_depth_pct, 2)}%</span>
              </div>
              <div className="bg-canvas p-1.5 rounded border border-borderHairline group-hover:border-borderSubtle transition-colors">
                <span>Period: </span>
                <span className="text-textPrimary font-bold">{safeFixed(selectedTarget?.period_days, 2)}d</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </aside>
  );
};
