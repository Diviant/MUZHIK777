
import React from 'react';

interface Props {
  onStart: () => void;
}

const Welcome: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col p-6 screen-fade relative overflow-hidden bg-[#080808] pt-2">
      {/* Сетка чертежа на фоне */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Эффект сканирующих линий (Industrial CRT) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}>
      </div>
      
      {/* Фоновое свечение */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#F5C518] opacity-[0.04] blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
      
      <div className="mt-8 mb-2 relative z-10 text-center">
        <div className="inline-block border border-[#F5C518]/30 text-[#F5C518] text-[8px] font-black px-3 py-1 rounded-sm uppercase mb-4 tracking-[0.3em] bg-[#F5C518]/5">
          INDUSTRIAL ECOSYSTEM
        </div>
        <h1 className="text-6xl font-black text-white leading-[0.85] uppercase italic tracking-tighter mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
          ЦЕХ <br/>
          <span className="text-[#F5C518]">СИЛЫ</span>
        </h1>
        <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#F5C518]/40 to-transparent mx-auto mb-4"></div>
        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.25em] leading-relaxed mx-auto max-w-[200px] italic">
          Экосистема для тех, <br/>кто строит этот мир.
        </p>
      </div>

      {/* ГЛАВНЫЙ СИМВОЛ: ГАЙКА-МОНОЛИТ */}
      <div className="flex-1 flex items-center justify-center relative py-4">
        <div className="relative w-52 h-52 flex items-center justify-center">
          
          {/* Декоративные орбиты */}
          <div className="absolute inset-0 border border-white/5 rounded-full scale-110"></div>
          <div className="absolute inset-0 border border-dashed border-[#F5C518]/10 rounded-full scale-125 animate-[spin_40s_linear_infinite]"></div>

          {/* ШЕСТИГРАННИК (ГАЙКА) */}
          <div className="relative w-40 h-40 bg-[#121212] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/5"
               style={{ 
                 clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
               }}>
            
            {/* Металлический отблеск */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 opacity-80"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
            
            {/* ГЕОМЕТРИЧЕСКАЯ БУКВА "Ц" */}
            <div className="relative z-10 flex flex-col items-center animate-[pulse_4s_ease-in-out_infinite]">
              <div className="flex items-end gap-[3px]">
                <div className="w-4.5 h-16 bg-white rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
                <div className="w-11 h-4.5 bg-white rounded-sm"></div>
                <div className="w-4.5 h-16 bg-white rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
                <div className="w-4 h-4 bg-[#F5C518] rounded-sm ml-[2px] mb-[-4px] shadow-[0_0_15px_rgba(245,197,24,0.5)]"></div>
              </div>
            </div>

            {/* Внутренняя кайма */}
            <div className="absolute inset-1.5 opacity-10 border border-white"
                 style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
          </div>

          {/* Техническая маркировка */}
          <div className="absolute top-2 right-4 text-[7px] font-mono text-zinc-700 font-black rotate-90 origin-bottom-right tracking-widest uppercase">
            Unit: 2025-PR
          </div>
          <div className="absolute bottom-2 left-4 text-[7px] font-mono text-zinc-700 font-black -rotate-90 origin-top-left tracking-widest uppercase">
            Grade: Heavy-Duty
          </div>
          
          {/* Статус системы */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0A0A0A] px-3 py-1 rounded-full border border-white/5 shadow-2xl">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.2em]">Core Protocol Active</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8 relative z-10 px-2">
        {[
          { icon: '🔨', title: 'Ресурс', desc: 'База заказов и мастеров' },
          { icon: '🛡️', title: 'Доверие', desc: 'Рейтинг, основанный на делах' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 bg-[#111111]/60 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-lg group transition-all active:scale-95">
            <div className="w-10 h-10 bg-zinc-900/80 rounded-xl flex items-center justify-center border border-white/5 text-lg group-hover:border-[#F5C518]/30 transition-colors">
              {item.icon}
            </div>
            <div className="text-left">
              <h3 className="text-white font-black text-[11px] uppercase italic tracking-tight leading-none mb-1">{item.title}</h3>
              <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-[0.15em] leading-none">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto mb-8 relative z-10 px-2">
        <button 
          onClick={onStart}
          className="active-scale w-full bg-[#F5C518] text-black font-black py-4.5 rounded-2xl text-lg uppercase italic tracking-tighter shadow-[0_15px_35px_rgba(245,197,24,0.2)] border-b-4 border-[#9A7D0A] flex items-center justify-center gap-3"
        >
          <span>ВХОД В ЦЕХ</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <div className="flex items-center justify-between mt-6 px-1">
          <span className="text-[7px] text-zinc-800 font-black uppercase tracking-[0.4em]">Ironclad Solutions</span>
          <div className="flex gap-1.5">
            <div className="w-1 h-1 bg-[#F5C518]/20 rounded-full"></div>
            <div className="w-1 h-1 bg-[#F5C518]/20 rounded-full"></div>
            <div className="w-1 h-1 bg-[#F5C518]/20 rounded-full"></div>
          </div>
          <span className="text-[7px] text-zinc-800 font-black uppercase tracking-[0.4em]">v2.7.4-stable</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
