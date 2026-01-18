
import React, { useState, useRef, useEffect } from 'react';
import { Screen, User, Location, SOSSignal } from '../types';
import { db } from '../database';
import SOSOverlay from './SOSOverlay';
import IncomingSOSAlert from './IncomingSOSAlert';

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
  const [incomingSignals, setIncomingSignals] = useState<SOSSignal[]>([]);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const sosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    if (!user || user.id === 'guest') return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
    const pollSOS = async () => {
      const active = await db.getActiveSOSSignals();
      setIncomingSignals(active.filter(s => s.userId !== user.id));
    };
    pollSOS();
    pollIntervalRef.current = setInterval(pollSOS, 20000);
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [user]);

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
          (confirmed: boolean) => { if (confirmed) navigate(Screen.PROFILE); }
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
    { icon: '📡', title: 'Эфир', desc: 'ОБЩИЙ ЧАТ', screen: Screen.FEED, color: 'rgba(212, 175, 55, 0.12)', code: 'NET' },
    { icon: '🚜', title: 'Агроцех', desc: 'КФХ / ПОЛЕ', screen: Screen.AGRO_CENTER, color: 'rgba(34, 197, 94, 0.12)', code: 'AGR' },
    { icon: '🎫', title: 'Логистика', desc: 'ПОИСК БИЛЕТОВ', screen: Screen.LOGISTICS, color: 'rgba(59, 130, 246, 0.12)', code: 'LOG' },
    { icon: '🪖', title: 'Служба', desc: 'СВО / СОВЕТЫ', screen: Screen.SVO_CENTER, color: 'rgba(163, 230, 53, 0.08)', code: 'MIL' },
    { icon: '🚗', title: 'Попутчики', desc: 'ЕХАТЬ ВМЕСТЕ', screen: Screen.HITCHHIKERS, color: 'rgba(249, 115, 22, 0.1)', code: 'WAY' },
    { icon: '📏', title: 'Инструменты', desc: 'КАЛЬКУЛЯТОРЫ', screen: Screen.CALCULATORS, color: 'rgba(161, 161, 170, 0.1)', code: 'CALC' },
    { icon: '🧖‍♂️', title: 'Отдых', desc: 'БАНЯ И ПИВО', screen: Screen.REST, color: 'rgba(245, 158, 11, 0.1)', code: 'RLX' },
    { icon: '⚙️', title: 'Техника', desc: 'АРЕНДА', screen: Screen.HEAVY_MACHINERY, color: 'rgba(239, 68, 68, 0.1)', code: 'EQU' },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 overflow-y-auto no-scrollbar z-10 relative pt-safe h-full bg-[#050505]">
      {showSOSOverlay && user && <SOSOverlay user={user} onClose={() => setShowSOSOverlay(false)} />}
      
      <header className="flex items-center justify-between py-3 mb-4 sticky top-0 bg-[#050505]/95 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 active-press">
            <div className="w-4 h-[1.5px] bg-[#D4AF37] rounded-full"></div>
            <div className="w-4 h-[1.5px] bg-[#D4AF37] rounded-full"></div>
            <div className="w-2 h-[1.5px] bg-[#D4AF37] rounded-full self-start ml-3"></div>
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">ЦЕХ <span className="text-[#D4AF37]">/</span> {location?.name || 'РФ'}</h2>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-1 h-1 rounded-full ${dbConnected ? 'bg-[#D4AF37]' : 'bg-red-600 animate-pulse'}`}></div>
              <span className="text-[6px] text-zinc-600 font-black uppercase tracking-widest mono">{dbConnected ? 'SECURE_LINK' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(Screen.PROFILE)} className="bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 active-press">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white uppercase italic leading-none">{user?.firstName || 'Мужик'}</span>
            <span className="text-[7px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">LEVEL_{user?.level || 'Новичок'}</span>
          </div>
          <div className="w-8 h-8 bg-zinc-800 rounded-lg overflow-hidden border border-white/5">
            {user?.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" alt="" /> : <span className="flex items-center justify-center h-full text-xs">👤</span>}
          </div>
        </button>
      </header>

      {/* SOS SECTION */}
      <div className="mb-6">
        <button 
          onMouseDown={handleSOSStart}
          onMouseUp={handleSOSEnd}
          onTouchStart={handleSOSStart}
          onTouchEnd={handleSOSEnd}
          className="w-full h-24 bg-red-900/10 border border-red-600/30 rounded-[30px] flex items-center justify-between px-8 relative overflow-hidden active:scale-[0.98] transition-all"
        >
          <div className="absolute left-0 top-0 bottom-0 bg-red-600/20 transition-all duration-75" style={{ width: `${sosProgress}%` }}></div>
          <div className="flex flex-col items-start relative z-10">
            <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">EMERGENCY_LINK</span>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">КНОПКА SOS</h3>
          </div>
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)] relative z-10">
             <span className="text-2xl">🚨</span>
          </div>
        </button>
        <div className="flex flex-col items-center mt-3 gap-1">
           <p className="text-[7px] text-zinc-700 font-black uppercase tracking-widest italic opacity-40">УДЕРЖИВАЙ ДЛЯ АКТИВАЦИИ СИГНАЛА ТРЕВОГИ</p>
           <button 
             onClick={() => navigate(Screen.SOS_RULES)}
             className="text-[6px] text-red-900 font-black uppercase tracking-[0.2em] border-b border-red-900/20 pb-0.5"
           >
             ПРИНИМАЮ УСТАВ КНОПКИ SOS
           </button>
        </div>
      </div>

      {/* INCOMING SOS ALERTS */}
      {incomingSignals.length > 0 && (
        <div className="space-y-3 mb-6">
          {incomingSignals.map(s => (
            <IncomingSOSAlert key={s.id} signal={s} userLat={userCoords?.lat || 0} userLng={userCoords?.lng || 0} onResolve={() => setIncomingSignals(prev => prev.filter(ps => ps.id !== s.id))} />
          ))}
        </div>
      )}

      {/* GRID MODULES */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {modules.map((mod, i) => (
          <button 
            key={i}
            onClick={() => handleMenuClick(mod)}
            className="group relative h-40 rounded-[35px] border border-white/5 overflow-hidden active-press transition-all text-left shadow-xl"
            style={{ 
              background: `radial-gradient(circle at 0% 0%, ${mod.color} 0%, #0c0c0c 80%)` 
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-4xl font-black italic mono uppercase">{mod.code}</div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/[0.02] rounded-full blur-xl group-hover:bg-white/[0.05] transition-all"></div>
            
            <div className="p-6 flex flex-col h-full relative z-10">
              <div className="w-12 h-12 bg-zinc-900/80 border border-white/5 rounded-2xl flex items-center justify-center mb-auto group-hover:scale-110 transition-transform group-hover:border-white/10 group-hover:shadow-lg shadow-black/40">
                <span className="text-2xl drop-shadow-md">{mod.icon}</span>
              </div>
              
              <div className="mt-4">
                <h3 className="text-white font-black text-[13px] uppercase italic tracking-tighter mb-1 leading-none group-hover:text-[#D4AF37] transition-colors">{mod.title}</h3>
                <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest mono italic">{mod.desc}</p>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] text-[#D4AF37] mono">>></span>
            </div>
          </button>
        ))}
      </div>

      {/* MASSIVE HOT VAKHTA BANNER - REDESIGNED */}
      <button 
        onClick={() => navigate(Screen.VAKHTA_CENTER)}
        className="group relative h-36 w-full rounded-[45px] border border-green-500/20 overflow-hidden active-press transition-all text-left shadow-[0_25px_50px_-12px_rgba(34,197,94,0.15)] mb-10"
        style={{ 
          background: `linear-gradient(135deg, #050505 0%, #0a2e0a 50%, #050505 100%)` 
        }}
      >
        {/* Deep Industrial Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-[100px] font-black italic mono uppercase leading-none select-none">VAKHTA</div>
        
        {/* Dynamic Glow Line */}
        <div className="absolute top-0 left-[-100%] w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent group-hover:left-[100%] transition-all duration-[1500ms] ease-in-out"></div>
        <div className="absolute bottom-0 right-[-100%] w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent group-hover:right-[100%] transition-all duration-[1500ms] ease-in-out"></div>

        <div className="relative z-10 h-full flex items-center justify-between px-10">
           <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-2">
                 <div className="relative flex items-center justify-center">
                    <span className="absolute w-4 h-4 rounded-full bg-green-500/30 animate-ping"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,1)]"></span>
                 </div>
                 <h4 className="text-white font-black text-2xl italic uppercase tracking-tighter leading-none group-hover:text-green-400 transition-colors drop-shadow-2xl">ГОРЯЧАЯ ВАХТА</h4>
              </div>
              <div className="flex items-center gap-4 ml-6">
                 <p className="text-green-500/60 text-[9px] font-black uppercase tracking-[0.25em] italic">DIRECT_ACCESS</p>
                 <span className="w-1 h-1 rounded-full bg-white/20"></span>
                 <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.25em] italic">VERIFIED_ONLY</p>
              </div>
           </div>
           
           <div className="w-16 h-16 bg-green-950/30 border border-green-500/20 rounded-[24px] flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-green-500/50 shadow-2xl backdrop-blur-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
           </div>
        </div>
        
        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-10 right-10 h-1 bg-green-500/10 rounded-full blur-md group-hover:bg-green-500/30 transition-all"></div>
      </button>

      {/* SIDEBAR MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="p-8 flex flex-col h-full pt-safe overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10 sticky top-0 bg-black/5 pb-4 backdrop-blur-sm z-10">
                 <div className="flex flex-col">
                   <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter gold-text leading-none">МЕНЮ_ЦЕХА</h2>
                   <span className="text-[7px] text-zinc-700 font-black uppercase tracking-[0.4em] mt-1 italic">CORE_NAVIGATION_LINK</span>
                 </div>
                 <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">✕</button>
              </div>
              
              <div className="space-y-3 pb-20">
                 {[
                   { icon: '👷‍♂️', label: 'КАБИНЕТ МУЖИКА', desc: 'ПРОФИЛЬ, БАЛЛЫ И ПОРТФОЛИО', screen: Screen.PROFILE, color: 'rgba(212, 175, 55, 0.08)' },
                   { icon: '💼', label: 'ПРЯМАЯ РАБОТА', desc: 'ВАКАНСИИ БЕЗ ПОСРЕДНИКОВ', screen: Screen.JOBS, color: 'rgba(59, 130, 246, 0.08)' },
                   { icon: '💰', label: 'БАРАХОЛКА', desc: 'КУПЛЯ / ПРОДАЖА ИНСТРУМЕНТА', screen: Screen.MARKETPLACE, color: 'rgba(34, 197, 94, 0.08)' },
                   { icon: '🛡️', label: 'ЗАЛ СЛАВЫ', desc: 'РЕЙТИНГ ЛУЧШИХ МАСТЕРОВ', screen: Screen.RANKING, color: 'rgba(168, 85, 247, 0.08)' },
                   { icon: '⚓', label: 'ПРИГЛАСИТЬ СВОИХ', desc: 'БОНУСЫ ЗА КАЖДОГО ДРУГА', screen: Screen.REFERRAL, color: 'rgba(236, 72, 153, 0.08)' },
                   { icon: '🤖', label: 'СОВЕТ БУГРА (PRO)', desc: 'ПОМОЩЬ ИИ В СТРОЙКЕ И СМЕТАХ', screen: Screen.BUGOR_CHAT, proRequired: true, color: 'rgba(249, 115, 22, 0.1)' },
                   { icon: '⚙️', label: 'ПУЛЬТ УПРАВЛЕНИЯ', desc: 'ДИАГНОСТИКА И СТАТУС СЕТИ', screen: Screen.DIAGNOSTIC, color: 'rgba(113, 113, 122, 0.08)' },
                   { icon: '🔐', label: 'АДМИН-ЦЕНТР', desc: 'МОДЕРАЦИЯ И УПРАВЛЕНИЕ БАЗОЙ', screen: Screen.ADMIN_LOGIN, color: 'rgba(220, 38, 38, 0.08)' },
                 ].map((item, idx) => (
                   <button 
                    key={idx} 
                    onClick={() => handleMenuClick(item)}
                    className="w-full p-5 rounded-[30px] border border-white/5 flex items-center gap-5 active-press group text-left transition-all shadow-lg"
                    style={{ background: `radial-gradient(circle at 0% 50%, ${item.color} 0%, #0d0d0d 100%)` }}
                   >
                     <div className="w-12 h-12 bg-zinc-900/80 border border-white/5 rounded-2xl flex items-center justify-center flex-none group-hover:scale-110 transition-transform">
                       <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                     </div>
                     <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-black text-white uppercase italic tracking-tighter leading-none mb-1.5 group-hover:text-[#D4AF37] transition-colors">{item.label}</span>
                        <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest leading-none truncate italic">{item.desc}</p>
                     </div>
                     <div className="flex-none opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                     </div>
                   </button>
                 ))}
              </div>
              
              <div className="mt-auto text-center py-6 opacity-20">
                 <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[1em] mono">CORE_TERMINAL_v4.5</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
