import React from 'react';
import { Menu, X, Download } from 'lucide-react';
import { Target, SessionSummary } from '../../types';
import { generateExoplanetPDF } from '../../utils/pdfExport';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedTarget?: Target | null;
  selectedSession?: SessionSummary | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  selectedTarget,
  selectedSession
}) => {
  return (
    <header className="h-18 py-3 px-6 border-b border-borderHairline bg-canvasSubtle flex items-center justify-between sticky top-0 z-50">
      
      {/* Left: Sidebar Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl bg-card border border-borderHairline hover:border-opticsCyan/50 hover:bg-cardHover text-textSecondary hover:text-white transition-all duration-300 focus:outline-none flex items-center gap-2 group cursor-pointer"
          title="Toggle Navigation Menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-opticsCyan" /> : <Menu className="w-5 h-5 group-hover:text-opticsCyan transition-colors" />}
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-textMuted group-hover:text-textPrimary">Menu</span>
        </button>
      </div>

      {/* Center: BRAND NAME OBEX - MATHEMATICALLY CENTERED */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.25em] text-white select-none drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
          OBEX
        </span>
      </div>

      {/* Right Controls: Dynamic Planet PDF Export Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => generateExoplanetPDF({ selectedTarget, selectedSession })}
          className="px-4 py-2.5 rounded-xl bg-aerospaceBlue hover:bg-aerospaceBlueHover border border-blue-400/30 hover:border-opticsCyan text-white text-xs font-mono font-medium flex items-center gap-2 shadow-lg shadow-blue-600/15 transition-all duration-200 active:scale-95 cursor-pointer"
          title={`Export PDF Dossier for ${selectedTarget?.target || 'Active Exoplanet'}`}
        >
          <Download className="w-3.5 h-3.5 text-opticsCyan" />
          <span className="hidden sm:inline">Export {selectedTarget?.target || 'Planet'} PDF Dossier</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>

    </header>
  );
};
