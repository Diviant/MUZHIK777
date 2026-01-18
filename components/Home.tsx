
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
    { icon: '📡', title: 'Эфир', desc: 'ОБЩИЙ ЧАТ', screen: Screen.FEED },
    { icon: '🚜', title: 'Агроцех', desc: 'КФХ / ПОЛЕ', screen: Screen.AGRO_CENTER },
    { icon: '🎫', title: 'Логистика', desc: 'ПОИСК БИЛЕТОВ', screen: Screen.LOGISTICS },
    { icon: '🪖', title: 'Служба', desc: 'СВО / СОВЕТЫ', screen: Screen.SVO_CENTER },
    { icon: '🚗', title: 'Попутчики', desc: 'ЕХАТЬ ВМЕСТЕ', screen: Screen.HITCHHIKERS },
    { icon: '📏', title: 'Инструменты', desc: 'КАЛЬКУЛЯТОРЫ', screen: Screen.CALCULATORS },
    { icon: '🧖‍♂️', title: 'Отдых', desc: 'БАНЯ И ПИВО', screen: Screen.REST },
    { icon: '⚙️', title: 'Техника', desc: 'АРЕНДА', screen: Screen.HEAVY_MACHINERY },
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
        <p className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mt-3 text-center italic opacity-40">УДЕРЖИВАЙ ДЛЯ АКТИВАЦИИ СИГНАЛА ТРЕВОГИ</p>
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
            className="bg-zinc-900/40 border border-white/5 p-6 rounded-[30px] flex flex-col items-start active-press transition-all group text-left"
          >
            <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{mod.icon}</div>
            <h3 className="text-white font-black text-[11px] uppercase italic tracking-tight mb-1">{mod.title}</h3>
            <p className="text-zinc-600 text-[7px] font-black uppercase tracking-widest mono">{mod.desc}</p>
          </button>
        ))}
      </div>

      {/* BANNER */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] p-6 rounded-[35px] flex items-center justify-between mb-8 shadow-xl active-press" onClick={() => navigate(Screen.VAKHTA_CENTER)}>
         <div className="flex flex-col items-start">
            <h4 className="text-black font-black text-xl italic uppercase tracking-tighter leading-none mb-1">ГОРЯЧАЯ ВАХТА</h4>
            <p className="text-black/60 text-[8px] font-black uppercase tracking-widest italic">ПРОВЕРЕННЫЕ ОБЪЕКТЫ</p>
         </div>
         <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
         </div>
      </div>

      {/* SIDEBAR MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="p-8 flex flex-col h-full pt-safe">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter gold-text">МЕНЮ_ЦЕХА</h2>
                 <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-[#D4AF37]">✕</button>
              </div>
              
              <div className="space-y-4 overflow-y-auto no-scrollbar pb-10">
                 {[
                   { icon: '👷‍♂️', label: 'КАБИНЕТ МУЖИКА', screen: Screen.PROFILE },
                   { icon: '💼', label: 'ПРЯМАЯ РАБОТА', screen: Screen.JOBS },
                   { icon: '💰', label: 'БАРАХОЛКА', screen: Screen.MARKETPLACE },
                   { icon: '🛡️', label: 'ЗАЛ СЛАВЫ', screen: Screen.RANKING },
                   { icon: '⚓', label: 'ПРИГЛАСИТЬ СВОИХ', screen: Screen.REFERRAL },
                   { icon: '🤖', label: 'СОВЕТ БУГРА (PRO)', screen: Screen.BUGOR_CHAT, proRequired: true },
                   { icon: '⚙️', label: 'ПУЛЬТ УПРАВЛЕНИЯ', screen: Screen.DIAGNOSTIC },
                   { icon: '🔐', label: 'АДМИН-ЦЕНТР', screen: Screen.ADMIN_LOGIN },
                 ].map((item, idx) => (
                   <button 
                    key={idx} 
                    onClick={() => handleMenuClick(item)}
                    className="w-full p-5 bg-zinc-900/50 border border-white/5 rounded-[25px] flex items-center gap-4 active-press group text-left"
                   >
                     <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                     <span className="text-xs font-black text-white uppercase italic tracking-tighter">{item.label}</span>
                   </button>
                 ))}
              </div>
              
              <div className="mt-auto text-center opacity-20">
                 <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[1em] mono">CORE_TERMINAL_v4.5</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
