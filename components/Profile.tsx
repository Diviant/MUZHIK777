
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { supabase } from '../lib/supabase';
import { db } from '../database';

interface Props {
  user: User | null;
  navigate: (screen: Screen) => void;
  onUpdate: (fields: Partial<User>) => void;
  dbConnected?: boolean | null;
  isGuest: boolean;
}

const Profile: React.FC<Props> = ({ user, navigate, onUpdate, dbConnected, isGuest }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSOSSettings, setShowSOSSettings] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState(user?.trustedContacts?.join(', ') || '');

  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(Screen.WELCOME);
  };

  const handleVerification = async () => {
    await db.requestVerification(user.id, user.firstName, user.specialization.join(', '));
    alert('Заявка на проверку отправлена Бугру!');
    setIsVerifying(false);
  };

  const handleSaveSOS = async () => {
    const contacts = trustedContacts.split(',').map(c => c.trim()).filter(c => c);
    await db.updateTrustedContacts(user.id, contacts);
    onUpdate({ trustedContacts: contacts });
    setShowSOSSettings(false);
    alert('Экстренные контакты обновлены!');
  };

  const menuItems = [
    { icon: '🖼️', title: 'ПОРТФОЛИО ОБЪЕКТОВ', desc: 'МОИ РАБОТЫ И ФОТО', screen: Screen.GALLERY, color: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(0,0,0,0) 100%)' },
    { icon: '🆘', title: 'SOS НАСТРОЙКИ', desc: 'ЭКСТРЕННАЯ СВЯЗЬ', action: () => setShowSOSSettings(true), alert: true, color: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(0,0,0,0) 100%)' },
    { icon: '⚖️', title: 'ЮРИДИЧЕСКИЙ ЩИТ', desc: 'ПРАВОВАЯ ЗАЩИТА', screen: Screen.LEGAL_CENTER, color: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)' },
    { icon: '✅', title: 'ЧЕК-ЛИСТЫ', desc: 'НИЧЕГО НЕ ЗАБУДЬ', screen: Screen.CHECKLISTS, color: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(0,0,0,0) 100%)' },
    { icon: '📊', title: 'ЖУРНАЛ ВАХТЫ', desc: 'СМЕТА И ДОХОДЫ', screen: Screen.VAKHTA_JOURNAL, color: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 100%)' },
    { icon: '📝', title: 'МОИ ЗАМЕТКИ', desc: 'ЧЕРНОВИКИ И РАСЧЕТЫ', screen: Screen.NOTES, color: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(0,0,0,0) 100%)' },
    { icon: '🤝', title: 'ПРИГЛАСИТЬ СВОИХ', desc: 'БОНУСЫ ЗА ДРУЗЕЙ', screen: Screen.REFERRAL, color: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(0,0,0,0) 100%)' },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] relative z-10">
      <header className="flex items-center justify-between py-4 mb-2 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-40 px-2 border-b border-white/5">
        <div className="flex flex-col items-start">
           <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none pr-2">ПРОФИЛЬ</h2>
           <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
             <span className="text-[6px] text-zinc-500 font-black uppercase tracking-[0.4em] mono italic">CORE_SYSTEM_v4.5.2</span>
           </div>
        </div>
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">✕</button>
      </header>

      {/* USER ID CARD - REFINED (NO DARK PLATE) */}
      <div 
        className="rounded-[50px] p-10 mb-8 border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
        style={{ 
          background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15) 0%, #080808 100%)' 
        }}
      >
        <div className="absolute top-0 right-0 w-full h-full blueprint opacity-10 pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          {/* AVATAR WITHOUT PLATE */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#D4AF37] opacity-20 blur-2xl rounded-full scale-110"></div>
            <div className="w-32 h-32 rounded-[45px] overflow-hidden border-2 border-[#D4AF37]/30 shadow-2xl relative bg-black/40 backdrop-blur-sm group active-press transition-transform">
                {user.photoUrl ? (
                  <img src={user.photoUrl} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">👤</span>
                  </div>
                )}
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-9 h-9 rounded-2xl flex items-center justify-center text-black font-black border-4 border-black shadow-xl text-sm z-20 animate-in zoom-in duration-500">
                ✓
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mb-8">
            <h3 className="text-3xl font-black text-white uppercase italic leading-none mb-3 tracking-tighter gold-text drop-shadow-2xl">
              {user.firstName}
            </h3>
            <div className="px-5 py-2 bg-black/60 rounded-full border border-white/5 backdrop-blur-md">
              <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mono italic leading-none">
                NODE_ADDRESS: @{user.username}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 mb-10">
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black px-6 py-2 rounded-2xl italic uppercase border border-[#D4AF37]/20 tracking-widest shadow-inner">
              RANK_{user.level || 'НОВИЧОК'}
            </span>
            {user.isPro && (
              <span className="bg-white text-black text-[9px] font-black px-6 py-2 rounded-2xl italic uppercase tracking-widest shadow-xl">
                PRO_ACCESS
              </span>
            )}
          </div>

          {/* STATS WITH GLASS EFFECT */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/[0.03] backdrop-blur-md p-6 rounded-[35px] border border-white/5 shadow-2xl relative group active-press overflow-hidden transition-all">
              <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[7px] text-zinc-600 font-black uppercase block mb-2 tracking-[0.3em] italic">ВЛИЯНИЕ</span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl font-black text-white italic leading-none">{user.points}</span>
                <span className="text-[10px] text-[#D4AF37] font-black italic mono opacity-60">D</span>
              </div>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-md p-6 rounded-[35px] border border-white/5 shadow-2xl relative group active-press overflow-hidden transition-all">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[7px] text-zinc-600 font-black uppercase block mb-2 tracking-[0.3em] italic">ДОВЕРИЕ</span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl font-black text-white italic leading-none">{user.rating}</span>
                <span className="text-[12px] text-[#D4AF37] font-black italic opacity-60">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!user.isVerified && (
        <button 
          onClick={() => setIsVerifying(true)}
          className="w-full relative h-16 rounded-[30px] border border-[#D4AF37]/20 overflow-hidden active-press transition-all mb-8 shadow-2xl"
          style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #151505 50%, #0a0a0a 100%)' }}
        >
          <div className="absolute top-0 left-[-100%] w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent animate-shimmer"></div>
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em] italic relative z-10">INITIALIZE_VERIFICATION</span>
        </button>
      )}

      {/* MENU SECTION - HIGH END GRADIENTS */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-4 px-2 mb-6 opacity-30">
           <div className="h-[1px] bg-white/10 flex-1"></div>
           <span className="text-[8px] text-white font-black uppercase tracking-[0.5em] italic">SYSTEM_MODULES</span>
           <div className="h-[1px] bg-white/10 flex-1"></div>
        </div>

        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action || (() => navigate(item.screen as Screen))}
            className="w-full p-6 rounded-[40px] border border-white/5 flex items-center gap-6 active-press transition-all group shadow-2xl text-left overflow-hidden relative"
            style={{ background: item.color }}
          >
            {/* Background noise/pattern for texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

            <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-[28px] flex items-center justify-center flex-none group-hover:scale-110 transition-transform shadow-2xl relative overflow-hidden z-10">
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`text-3xl drop-shadow-2xl ${item.alert ? 'animate-pulse' : 'grayscale group-hover:grayscale-0 transition-all'}`}>
                {item.icon}
              </span>
            </div>
            
            <div className="flex flex-col min-w-0 flex-1 relative z-10">
              <span className={`text-[15px] font-black uppercase italic tracking-tighter leading-none mb-2 group-hover:text-[#D4AF37] transition-colors ${item.alert ? 'text-red-500' : 'text-white'}`}>
                {item.title}
              </span>
              <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest italic leading-none truncate opacity-80">
                {item.desc}
              </p>
            </div>
            
            <div className={`flex-none transition-all group-hover:translate-x-1 relative z-10 ${item.alert ? 'text-red-900' : 'text-zinc-800 group-hover:text-[#D4AF37]'}`}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={handleLogout} 
        className="mt-auto group relative h-16 w-full rounded-[30px] border border-red-900/10 overflow-hidden active-press transition-all text-center mb-10"
        style={{ background: 'linear-gradient(90deg, #050505 0%, #1a0505 50%, #050505 100%)' }}
      >
        <span className="text-zinc-800 group-hover:text-red-700 transition-colors font-black uppercase text-[10px] tracking-[0.5em] italic relative z-10">
          DISCONNECT_SESSION_LINK
        </span>
      </button>

      {/* MODALS RENDERED WITH BLUR BACKDROP */}
      {showSOSSettings && (
        <div className="fixed inset-0 z-[200] bg-[#000]/95 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-[#0a0a0a] p-10 rounded-[60px] border border-red-600/30 w-full max-w-sm shadow-[0_0_100px_rgba(220,38,38,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic text-red-600 pointer-events-none">SOS</div>
              <div className="w-24 h-24 bg-red-600/10 rounded-[35px] flex items-center justify-center mx-auto mb-10 border border-red-600/30 shadow-inner">
                 <span className="text-5xl">🆘</span>
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic mb-4 tracking-tighter text-center leading-none">ЭКСТРЕННАЯ СВЯЗЬ</h3>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-10 italic text-center px-4">
                Укажи номера доверенных лиц. Им уйдет сигнал тревоги при нажатии кнопки SOS.
              </p>
              
              <div className="space-y-6 mb-12">
                 <div className="space-y-3">
                    <label className="text-[8px] text-red-900 font-black uppercase tracking-widest ml-2 italic mono">TRUST_NODES_CONFIG</label>
                    <textarea 
                      value={trustedContacts}
                      onChange={e => setTrustedContacts(e.target.value)}
                      placeholder="+79991234567, ..."
                      className="w-full bg-black border border-white/10 rounded-[35px] p-8 text-white text-[14px] font-bold outline-none focus:border-red-600/40 min-h-[160px] shadow-inner placeholder:text-zinc-900"
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <button onClick={handleSaveSOS} className="w-full bg-red-600 text-white font-black py-7 rounded-[28px] uppercase italic shadow-2xl shadow-red-900/60 active-press text-xl">
                    СОХРАНИТЬ
                 </button>
                 <button onClick={() => setShowSOSSettings(false)} className="w-full text-zinc-800 font-black py-4 rounded-xl uppercase italic text-[11px] tracking-[0.4em]">
                    ОТМЕНА
                 </button>
              </div>
           </div>
        </div>
      )}

      {isVerifying && (
        <div className="fixed inset-0 z-[200] bg-[#000]/95 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-[#0a0a0a] p-10 rounded-[60px] border border-[#D4AF37]/30 w-full max-w-sm text-center shadow-[0_0_100px_rgba(212,175,55,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full blueprint opacity-10 pointer-events-none"></div>
              <div className="w-28 h-28 bg-[#D4AF37]/10 rounded-[40px] flex items-center justify-center mx-auto mb-12 border border-[#D4AF37]/20 shadow-inner">
                 <span className="text-6xl drop-shadow-2xl">🛡️</span>
              </div>
              <h3 className="text-4xl font-black text-white uppercase italic mb-6 tracking-tighter leading-none gold-text">ВЕРИФИКАЦИЯ</h3>
              <p className="text-zinc-500 text-[12px] font-bold uppercase tracking-widest leading-relaxed mb-12 italic px-4">
                Проверка личности Бугром. Доверенные мастера получают прямой доступ к крупным объектам и спец-предложениям Цеха.
              </p>
              <div className="space-y-4">
                 <button onClick={handleVerification} className="w-full bg-[#D4AF37] text-black font-black py-7 rounded-[28px] uppercase italic tracking-tighter shadow-2xl shadow-[#D4AF37]/30 active-press text-xl">
                    ПОДАТЬ ЗАЯВКУ
                 </button>
                 <button onClick={() => setIsVerifying(false)} className="w-full text-zinc-800 font-black py-4 rounded-xl uppercase italic text-[11px] tracking-[0.4em]">
                    ОТМЕНА
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
