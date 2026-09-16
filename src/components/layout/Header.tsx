import React from 'react';
import { Menu, X, Download } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  totalFiles?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  totalFiles = 1741 
}) => {
  return (
    <header className="h-18 py-3 px-6 border-b border-borderHairline bg-canvasSubtle flex items-center justify-between sticky top-0 z-50">
      
      {/* Left: Sidebar Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl bg-card border border-borderHairline hover:border-opticsCyan/50 hover:bg-cardHover text-textSecondary hover:text-white transition-all duration-300 focus:outline-none flex items-center gap-2 group"
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

      {/* Right Controls: Royal Blue Export Button */}
      <div className="flex items-center gap-4">
        <a
          href="/Exoplanet_Data_Analysis_Report.pdf"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-full bg-aerospaceBlue hover:bg-aerospaceBlueHover text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-600/10 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF Report</span>
          <span className="sm:hidden">PDF</span>
        </a>
      </div>

    </header>
  );
};
