import React, { useState, useRef, useEffect } from 'react';
import { Screen, User, Location } from '../types';
import SOSOverlay from './SOSOverlay';

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
  location: Location | null;
  dbConnected?: boolean | null;
}

const Home: React.FC<Props> = ({ navigate, user, location, dbConnected }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSOSOverlay, setShowSOSOverlay] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
  const sosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const tg = (window as any).Telegram?.WebApp;

  const handleSOSStart = () => {
    setSosProgress(0);
    sosTimerRef.current = setInterval(() => {
      setSosProgress(prev => {
        if (prev >= 100) {
          handleSOSActivate();
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const handleSOSActivate = () => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    setSosProgress(0);
    setShowSOSOverlay(true);
  };

  const handleSOSEnd = () => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    if (sosProgress < 100) setSosProgress(0);
  };

  const handleMenuClick = (item: { screen: Screen; proRequired?: boolean }) => {
    if (item.proRequired && !user?.isPro) {
      if (tg?.showConfirm) {
        tg.showConfirm(
          "Бугор дает советы только PRO-мужикам. Хочешь зайти в профиль и активировать статус?",
          (confirmed: boolean) => {
            if (confirmed) navigate(Screen.PROFILE);
          }
        );
      } else {
        alert("Бугор консультирует только PRO-аккаунты. Зайди в профиль!");
      }
      return;
    }
    setIsMenuOpen(false);
    navigate(item.screen);
  };

  const modules = [
    { icon: '📡', title: 'Эфир', desc: 'ОБЩИЙ ЧАТ', screen: Screen.FEED },
    { icon: '🎫', title: 'Логистика', desc: 'ПОИСК БИЛЕТОВ', screen: Screen.LOGISTICS },
    { icon: '🏗️', title: 'Мини-CRM', desc: 'УПРАВЛЕНИЕ', screen: Screen.CRM_DASHBOARD },
    { icon: '🚗', title: 'Попутчики', desc: 'ЕХАТЬ ВМЕСТЕ', screen: Screen.HITCHHIKERS },
    { icon: '📏', title: 'Инструменты', desc: 'КАЛЬКУЛЯТОРЫ', screen: Screen.CALCULATORS },
    { icon: '🧖‍♂️', title: 'Отдых', desc: 'БАНЯ И ПИВО', screen: Screen.REST },
    { icon: '🚜', title: 'Техника', desc: 'АРЕНДА', screen: Screen.HEAVY_MACHINERY },
    { icon: '🔍', title: 'Снабженец', desc: 'МАТЕРИАЛЫ', screen: Screen.MATERIALS_SEARCH },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 overflow-y-auto no-scrollbar z-10 relative pt-safe h-full bg-[#050505]">
      {showSOSOverlay && user && <SOSOverlay user={user} onClose={() => setShowSOSOverlay(false)} />}
      
      {/* COMPACT HEADER */}
      <header className="flex items-center justify-between py-3 mb-4 sticky top-0 bg-[#050505]/95 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 active-press"
          >
            <div className="w-4 h-[1.5px] bg-[#D4AF37] rounded-full"></div>
            <div className="w-4 h-[1.5px] bg-[#D4AF37] rounded-full"></div>
            <div className="w-2 h-[1.5px] bg-[#D4AF37] rounded-full self-start ml-3"></div>
          </button>

          <div className="flex flex-col">
            <h2 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">
              ЦЕХ <span className="text-[#D4AF37]">/</span> {location?.name || 'РФ'}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-1 h-1 rounded-full ${dbConnected ? 'bg-[#D4AF37]' : 'bg-red-600 animate-pulse'}`}></div>
              <span className="text-[6px] text-zinc-600 font-black uppercase tracking-widest mono">{dbConnected ? 'SECURE_LINK' : 'OFFLINE'}</span>
              <span className="text-[6px] text-[#D4AF37]/40 font-black uppercase tracking-widest mono ml-2">REV_4.6.1_HOT</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(Screen.PROFILE)} 
          className="bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 active-press"
        >
          <div className="flex flex-col items-end">
            <span className="gold-text text-sm font-black italic leading-none">{user?.points || 0}</span>
            <span className="text-[5px] text-zinc-700 font-black uppercase tracking-widest mt-1">CREDITS</span>
          </div>
          <div className="w-6 h-6 bg-[#D4AF37] rounded-lg flex items-center justify-center text-[10px] text-black font-black">D</div>
        </button>
      </header>

      {/* DASHBOARD */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate(Screen.VAKHTA_CENTER)}
          className="col-span-2 relative h-32 bg-zinc-900/40 border border-[#D4AF37]/20 rounded-[30px] overflow-hidden active-press p-6 text-left stagger-item shadow-xl backdrop-blur-sm"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-black text-5xl italic mono">ROTA</div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_10px_gold]"></div>
             <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mono">VAKHTA_CENTER</span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">ВАХТА-ЦЕНТР</h3>
          <p className="text-[8px] gold-text font-bold uppercase tracking-widest italic opacity-70">ПРОВЕРЕННЫЕ ОБЪЕКТЫ / ЖИЛЬЕ / ЕДА</p>
        </button>

        {/* SOS BUTTON */}
        <div className="col-span-2 relative h-24 mt-2">
           <button 
            onMouseDown={handleSOSStart}
            onMouseUp={handleSOSEnd}
            onTouchStart={handleSOSStart}
            onTouchEnd={handleSOSEnd}
            className="w-full h-full bg-red-950/20 border border-red-600/30 rounded-[30px] flex items-center justify-center gap-4 relative overflow-hidden active:scale-[0.98] transition-all"
           >
             <div className="absolute left-0 top-0 h-full bg-red-600/20 transition-all duration-100 ease-linear" style={{ width: `${sosProgress}%` }}></div>
             <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] relative z-10">
                <span className="text-2xl animate-pulse">🆘</span>
             </div>
             <div className="text-left relative z-10">
                <h3 className="text-xl font-black text-red-500 uppercase italic tracking-tighter leading-none">SOS ПОМОЩЬ</h3>
                <p className="text-[8px] text-red-700 font-bold uppercase tracking-widest italic mt-1">УДЕРЖИВАЙ 3 СЕК ДЛЯ АКТИВАЦИИ</p>
             </div>
           </button>
        </div>

        {/* Grid Modules */}
        {modules.map((mod, i) => (
          <button 
            key={i}
            onClick={() => handleMenuClick({ screen: mod.screen })}
            className="h-36 bg-zinc-900/40 rounded-[30px] border border-white/5 p-6 flex flex-col text-left active-press stagger-item shadow-lg"
            style={{ animationDelay: `${100 + i * 50}ms` }}
          >
            <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-xl mb-auto">{mod.icon}</div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none mb-1">{mod.title}</h3>
              <p className="text-[7px] text-zinc-700 font-bold uppercase tracking-widest mono italic">{mod.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* SIDE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)}></div>
           <div className="relative w-72 h-full bg-[#050505] border-r border-white/10 flex flex-col animate-in slide-in-from-left duration-500 shadow-2xl">
              <div className="p-8 border-b border-white/5">
                 <h2 className="text-2xl font-black italic gold-text uppercase tracking-tighter leading-none mb-1">МЕНЮ ЦЕХА</h2>
                 <p className="text-[6px] text-zinc-700 font-black uppercase tracking-[0.4em] mono">v4.6.1_SECURE_CHANNEL</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                 {[
                   { icon: '👷‍♂️', title: 'Совет Бугра', desc: 'AI ПОМОЩНИК', screen: Screen.BUGOR_CHAT, proRequired: true },
                   { icon: '📊', title: 'Журнал Вахты', desc: 'СМЕТА И ДОХОДЫ', screen: Screen.VAKHTA_JOURNAL },
                   { icon: '📝', title: 'Заметки', desc: 'ЛИЧНЫЕ ЗАПИСИ', screen: Screen.NOTES },
                   { icon: '🏷️', title: 'Мои объявления', desc: 'УПРАВЛЕНИЕ', screen: Screen.MY_ADS },
                   { icon: '🏆', title: 'Зал Славы', desc: 'РЕЙТИНГ', screen: Screen.RANKING },
                   { icon: '🛠️', title: 'Мастерская', desc: 'ДИАГНОСТИКА', screen: Screen.DIAGNOSTIC },
                 ].map((item, i) => (
                   <button 
                    key={i} 
                    onClick={() => handleMenuClick(item)}
                    className="w-full p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-4 active-press text-left group"
                   >
                     <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-xl group-hover:scale-110 transition-transform">
                       {item.icon}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-white italic group-hover:text-[#D4AF37] transition-colors">{item.title}</span>
                        <span className="text-[6px] text-zinc-700 font-black uppercase tracking-widest mono">{item.desc}</span>
                     </div>
                     {item.proRequired && !user?.isPro && (
                       <span className="ml-auto text-[8px]">🔒</span>
                     )}
                   </button>
                 ))}
              </div>
              <div className="p-6 border-t border-white/5">
                 <button 
                   onClick={() => setIsMenuOpen(false)}
                   className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em] italic"
                 >
                   ЗАКРЫТЬ ТЕРМИНАЛ
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;