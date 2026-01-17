
import React from 'react';
import { Screen } from '../types';

interface Props {
  onStart: () => void;
  onGuest: () => void;
  navigate: (screen: Screen) => void;
}

const Welcome: React.FC<Props> = ({ onStart, onGuest, navigate }) => {
  return (
    <div className="flex-1 flex flex-col p-8 screen-fade relative overflow-hidden bg-transparent pt-safe text-center z-10 h-full">
      {/* Background Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4AF37] opacity-[0.03] blur-[140px] rounded-full pointer-events-none"></div>
      
      {/* Header Info */}
      <div className="mt-12 mb-8 stagger-item">
        <div className="inline-block border border-white/5 text-zinc-600 text-[8px] font-black px-5 py-2 rounded-full uppercase mb-12 tracking-[0.6em] bg-white/[0.02] mono">
          INDUSTRY_CORE_v4.5
        </div>
        
        {/* Fixed Title with padding-right (pr-4) to prevent italic clipping */}
        <h1 className="text-7xl font-black text-white leading-[0.85] uppercase italic tracking-tighter mb-6 pr-4">
          ЦЕХ <br/>
          <span className="gold-text">СИЛЫ</span>
        </h1>

        <div className="max-w-[280px] mx-auto space-y-6">
          <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed italic opacity-80">
            Платформа прямой связи <br/> 
            без посредников и комиссий
          </p>

          <button 
            onClick={() => navigate(Screen.ABOUT)}
            className="inline-flex items-center gap-3 bg-zinc-900/60 border border-[#D4AF37]/30 px-6 py-3 rounded-2xl animate-pulse active-press group"
          >
             <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
             <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic group-hover:text-[#D4AF37] transition-colors">ЧТО ЭТО ТАКОЕ?</span>
          </button>
          
          <div className="h-[1px] w-12 bg-[#D4AF37] mx-auto opacity-40"></div>
          
          <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] leading-relaxed mono italic">
            JOBS • ROTATION • MASTERS • LOGISTICS
          </p>
        </div>
      </div>

      {/* Spacer to keep buttons at the bottom but center the content slightly */}
      <div className="flex-1"></div>

      {/* COMPACT ACTIONS */}
      <div className="grid grid-cols-2 gap-4 mb-10 px-2 stagger-item" style={{ animationDelay: '150ms' }}>
        <button 
          onClick={() => { onGuest(); navigate(Screen.JOBS); }}
          className="bg-zinc-900/40 border border-white/5 rounded-[35px] p-7 text-left active-press transition-all group backdrop-blur-md"
        >
          <div className="text-2xl mb-4 opacity-40 group-hover:opacity-100 transition-opacity">💼</div>
          <h3 className="gold-text font-black text-[10px] uppercase tracking-wider mb-1 italic">РАБОТА</h3>
          <p className="text-zinc-700 text-[7px] font-black uppercase tracking-widest mono italic leading-none">DIRECT_VACANCIES</p>
        </button>

        <button 
          onClick={() => { onGuest(); navigate(Screen.RANKING); }}
          className="bg-zinc-900/40 border border-white/5 rounded-[35px] p-7 text-left active-press transition-all group backdrop-blur-md"
        >
          <div className="text-2xl mb-4 opacity-40 group-hover:opacity-100 transition-opacity">🛡️</div>
          <h3 className="gold-text font-black text-[10px] uppercase tracking-wider mb-1 italic">РЕЙТИНГ</h3>
          <p className="text-zinc-700 text-[7px] font-black uppercase tracking-widest mono italic leading-none">VERIFIED_MASTERS</p>
        </button>
      </div>

      {/* PRIMARY ACTIONS */}
      <div className="mb-8 px-2 space-y-4 stagger-item" style={{ animationDelay: '300ms' }}>
        <button 
          onClick={onStart}
          className="active-press relative w-full h-20 bg-gradient-to-r from-[#D4AF37] via-[#FFF5D1] to-[#9A7D0A] text-black font-black rounded-[40px] text-[13px] uppercase italic tracking-[0.1em] shadow-[0_20px_50px_rgba(212,175,55,0.15)] flex items-center justify-center gap-6"
        >
          ВХОД В ТЕРМИНАЛ
          <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>
        
        <button 
          onClick={onGuest}
          className="w-full h-14 text-zinc-700 font-black rounded-3xl text-[9px] uppercase italic tracking-[0.5em] active-press transition-all"
        >
          ПРОДОЛЖИТЬ КАК ГОСТЬ
        </button>
      </div>

      {/* Footer Branding */}
      <div className="pb-4 opacity-10">
        <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[1em] mono">CORE_PROTOCOL_ACTIVE</span>
      </div>
    </div>
  );
};

export default Welcome;
