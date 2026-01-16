
import React from 'react';
import { Screen, User, Location } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
  location: Location | null;
  dbConnected?: boolean | null;
}

const Home: React.FC<Props> = ({ navigate, user, location, dbConnected }) => {
  const tg = (window as any).Telegram?.WebApp;

  const handleMenuClick = (item: any) => {
    if (item.screen === Screen.BUGOR_CHAT && !user?.isPro) {
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
    navigate(item.screen);
  };

  const menuItems = [
    { 
      screen: Screen.BUGOR_CHAT, 
      title: 'НЕЙРО-БУГОР', 
      desc: user?.isPro ? 'Консультации по ГОСТ и СНиП' : 'Доступно только для PRO', 
      badge: user?.isPro ? 'ВЫСШИЙ ДОПУСК' : '🔒 ЗАБЛОКИРОВАНО',
      icon: <span className="text-2xl">{user?.isPro ? '👷‍♂️' : '🔐'}</span>,
      color: user?.isPro ? 'from-[#F5C518] to-[#9A7D0A]' : 'from-[#1a1a1a] to-[#0a0a0a]',
      accent: user?.isPro ? '#000000' : '#444',
      isSpecial: true,
      locked: !user?.isPro
    },
    { 
      screen: Screen.MARKETPLACE, 
      title: 'БАРАХОЛКА', 
      desc: 'Инструмент и остатки', 
      badge: 'БЫСТРЫЙ ТОРГ',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14M20,4H4V6H20V4Z"/></svg>,
      color: 'from-[#141414] to-[#080808]',
      accent: '#F5C518'
    },
    { 
      screen: Screen.HEAVY_MACHINERY, 
      title: 'СПЕЦТЕХНИКА', 
      desc: 'Аренда и услуги', 
      badge: 'ТЯЖЕЛЫЙ ВЕС',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22,17V15H20V12A3,3 0 0,0 17,9H14V7H16V5H14V2H12V5H10V7H12V9H9A3,3 0 0,0 6,12V15H4V17H2V19H22V17H20V17M10,12H14V15H10V12Z"/></svg>,
      color: 'from-[#141414] to-[#080808]',
      accent: '#FFFFFF'
    },
    { 
      screen: Screen.CARGO, 
      title: 'ПОПУТНЫЙ ГРУЗ', 
      desc: 'Перевозки и логистика', 
      badge: 'В ПУТИ',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20,8H17V4H3C1.9,4 1,4.9 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M17,8L19.06,11H17V8M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5Z"/></svg>,
      color: 'from-[#141414] to-[#080808]',
      accent: '#F5C518'
    },
    { 
      screen: Screen.JOBS, 
      title: 'РАБОТА / ВАХТА', 
      desc: 'Прямые вакансии', 
      badge: 'КОНТРАКТЫ',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20,6C21.11,6 22,6.89 22,8V19C22,20.11 21.11,21 20,21H4C2.9,21 2,20.11 2,19V8C2,6.89 2.9,6 4,6H8V4C8,2.89 8.89,2 10,2H14C15.11,2 16,2.89 16,4V6H20M10,4V6H14V4H10M4,8V19H20V8H4M11,10H13V13H16V15H13V18H11V15H8V13H11V10Z"/></svg>,
      color: 'from-[#141414] to-[#080808]',
      accent: '#FFFFFF'
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      {/* Шапка */}
      <header className="flex flex-col gap-4 py-4 mb-6 sticky top-0 bg-[#080808]/80 backdrop-blur-md z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#121212] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden group active:scale-95 transition-transform"
                 onClick={() => navigate(Screen.PROFILE)}>
              {user?.photoUrl ? (
                <img src={user.photoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <span className="text-xl">👤</span>
              )}
              {user?.isPro && <div className="absolute top-0 right-0 w-2 h-2 bg-[#F5C518] rounded-full"></div>}
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">ЦЕХ / {location?.name || 'РФ'}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">{dbConnected ? 'Network Connected' : 'Offline Mode'}</span>
              </div>
            </div>
          </div>
          <div 
            onClick={() => navigate(Screen.PROFILE)}
            className="bg-[#121212] px-4 py-2.5 rounded-2xl flex items-center gap-2 active-scale border border-white/5 shadow-lg shadow-black/20"
          >
            <span className="text-[#F5C518] text-[11px] font-black italic tracking-widest">{user?.points || 0} 🪙</span>
          </div>
        </div>
      </header>

      {/* Меню */}
      <div className="flex flex-col gap-3.5">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => handleMenuClick(item)}
            className={`active-scale bg-gradient-to-br ${item.color} ${item.isSpecial ? 'p-6' : 'p-5'} rounded-[30px] flex items-center justify-between relative overflow-hidden group border border-white/5 shadow-2xl stagger-item ${item.locked ? 'opacity-80' : ''}`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Текстура сетки на фоне карточки */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
            
            <div className="relative z-10 text-left flex items-center gap-4">
              <div className={`w-12 h-12 ${item.isSpecial ? (item.locked ? 'bg-zinc-800' : 'bg-black/40') : 'bg-zinc-900/60'} rounded-2xl flex items-center justify-center border border-white/5 shadow-inner`} style={{color: item.accent}}>
                {item.icon}
              </div>
              <div className="flex flex-col">
                <div className={`inline-block text-[7px] font-black uppercase tracking-widest italic mb-1 ${item.isSpecial ? (item.locked ? 'text-[#F5C518]' : 'text-black/60') : 'text-zinc-500'}`} style={{color: (item.isSpecial && !item.locked) ? undefined : (item.locked ? '#F5C518' : item.accent)}}>{item.badge}</div>
                <h3 className={`text-[17px] font-black uppercase italic leading-none tracking-tighter mb-1.5 ${item.isSpecial ? (item.locked ? 'text-zinc-500' : 'text-black') : 'text-white'}`}>{item.title}</h3>
                <p className={`text-[8px] font-bold uppercase tracking-[0.15em] italic ${item.isSpecial ? (item.locked ? 'text-zinc-700' : 'text-black/40') : 'text-zinc-600'}`}>{item.desc}</p>
              </div>
            </div>
            
            <div className={`${item.isSpecial ? (item.locked ? 'text-zinc-800' : 'text-black/20') : 'text-zinc-800'} relative z-10`}>
               {item.locked ? (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.11,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/></svg>
               ) : (
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="opacity-40 group-hover:translate-x-1 transition-transform"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>
               )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Нижний декор */}
      <div className="mt-8 flex items-center justify-between opacity-10 px-2">
        <div className="h-[1px] flex-1 bg-white"></div>
        <span className="text-[6px] font-black uppercase tracking-[0.5em] px-4">Monolith System</span>
        <div className="h-[1px] flex-1 bg-white"></div>
      </div>
    </div>
  );
};

export default Home;
