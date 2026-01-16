
import React from 'react';
import { Screen } from '../types';

interface LayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, subtitle, onBack, children, headerRight }) => {
  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar pb-32 bg-[#080808] animate-slide-up">
      <header className="flex flex-col gap-2 py-4 mb-6 sticky top-0 bg-[#080808]/80 backdrop-blur-md z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-10 h-10 bg-[#121212] card-border rounded-xl flex items-center justify-center text-[#F5C518] active-scale"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <div className="flex flex-col text-left">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{title}</h2>
              {subtitle && <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">{subtitle}</span>}
            </div>
          </div>
          {headerRight}
        </div>
      </header>
      {children}
    </div>
  );
};

export default Layout;
