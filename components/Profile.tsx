
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
    { icon: '🖼️', title: 'Портфолио Объектов', desc: 'Мои работы и фото', screen: Screen.GALLERY, highlight: true },
    { icon: '🆘', title: 'SOS Настройки', desc: 'Экстренная связь', action: () => setShowSOSSettings(true), alert: true },
    { icon: '✅', title: 'Чек-листы', desc: 'Ничего не забудь', screen: Screen.CHECKLISTS },
    { icon: '📏', title: 'Инструментарий', desc: 'Калькуляторы расчетов', screen: Screen.CALCULATORS },
    { icon: '📊', title: 'Журнал Вахты', desc: 'Смета и доходы', screen: Screen.VAKHTA_JOURNAL },
    { icon: '🔍', title: 'Поиск Материалов', desc: 'Где купить выгодно', screen: Screen.MATERIALS_SEARCH },
    { icon: '📝', title: 'Мои Заметки', desc: 'Черновики и расчеты', screen: Screen.NOTES },
    { icon: '🤝', title: 'Пригласить друзей', desc: 'Бонусы за своих', screen: Screen.REFERRAL },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] relative z-10">
      <header className="flex items-center justify-between py-4 mb-2 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-30 px-2 border-b border-white/5">
        <div className="flex flex-col items-start">
           <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ПРОФИЛЬ</h2>
           <div className="flex items-center gap-2 mt-1">
             <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
             <span className="text-[6px] text-zinc-600 font-black uppercase tracking-[0.4em] mono">CORE_SYSTEM_v4.5.2</span>
           </div>
        </div>
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">✕</button>
      </header>

      {/* USER CARD */}
      <div 
        className="rounded-[35px] p-6 mb-5 border border-white/10 shadow-2xl relative"
        style={{ 
          background: 'radial-gradient(circle at 50% -20%, rgba(212, 175, 55, 0.12) 0%, #121212 60%)' 
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-zinc-800 rounded-[25px] p-[2px] shadow-2xl border border-white/10">
              <div className="w-full h-full rounded-[23px] overflow-hidden bg-black flex items-center justify-center">
                {user.photoUrl ? (
                  <img src={user.photoUrl} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl opacity-20">👤</span>
                )}
              </div>
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] w-6 h-6 rounded-lg flex items-center justify-center text-black font-black border-[3px] border-[#121212] shadow-lg text-[8px]">
                ✓
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mb-4">
            <h3 className="text-xl font-black text-white uppercase italic leading-none mb-1 tracking-tighter">
              {user.firstName}
            </h3>
            <span className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mono italic leading-none">
              @{user.username}
            </span>
          </div>
          
          <div className="flex gap-2 mb-6">
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[7px] font-black px-3 py-1 rounded-md italic uppercase border border-[#D4AF37]/20">
              {user.level}
            </span>
            {user.isPro && (
              <span className="bg-white text-black text-[7px] font-black px-3 py-1 rounded-md italic uppercase">
                PRO
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-[6px] text-zinc-700 font-black uppercase block mb-1 tracking-widest">БАЛЛЫ</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg font-black text-[#D4AF37] italic">{user.points}</span>
                <span className="text-[7px] text-zinc-600 font-black italic">D</span>
              </div>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-[6px] text-zinc-700 font-black uppercase block mb-1 tracking-widest">РЕЙТИНГ</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg font-black text-white italic">{user.rating}</span>
                <span className="text-[7px] text-zinc-600 font-black italic">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!user.isVerified && (
        <button 
          onClick={() => setIsVerifying(true)}
          className="w-full bg-zinc-900 border border-white/5 text-zinc-500 text-[8px] font-black py-3 rounded-xl uppercase tracking-[0.4em] active:bg-zinc-800 transition-all italic mb-5"
        >
          VERIFY_SYSTEM_ID
        </button>
      )}

      {/* MENU SECTION */}
      <div className="space-y-2.5 mb-10">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action || (() => navigate(item.screen as Screen))}
            className={`w-full p-4 rounded-[25px] flex items-center justify-between border active-press transition-all group shadow-lg ${item.alert ? 'border-red-600/30 bg-red-900/10' : item.highlight ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' : 'bg-zinc-900/40 border-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border ${item.alert ? 'bg-red-600 text-white' : item.highlight ? 'bg-[#D4AF37] text-black border-none' : 'bg-black/40 border-white/5'}`}>
                {item.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-[11px] font-black uppercase italic tracking-tight leading-none mb-1 ${item.alert ? 'text-red-500' : item.highlight ? 'gold-text' : 'text-white'}`}>
                  {item.title}
                </span>
                <span className="text-[6px] text-zinc-700 font-black uppercase tracking-widest mono italic leading-none">{item.desc}</span>
              </div>
            </div>
            <div className={`text-[10px] transition-all ${item.alert ? 'text-red-900' : item.highlight ? 'text-[#D4AF37]' : 'text-zinc-800'}`}>→</div>
          </button>
        ))}
      </div>

      <button onClick={handleLogout} className="mt-auto text-zinc-800 font-black py-5 rounded-xl uppercase text-[8px] tracking-[0.5em] border border-white/5 active:text-red-900 transition-all italic mb-6">
        KILL_SESSION_SIGNAL
      </button>

      {/* SOS SETTINGS MODAL */}
      {showSOSSettings && (
        <div className="fixed inset-0 z-[200] bg-[#050505]/98 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-zinc-900 p-8 rounded-[40px] border border-red-600/20 w-full max-w-sm shadow-2xl relative">
              <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-600/20">
                 <span className="text-3xl">🆘</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter text-center">ЭКСТРЕННАЯ СВЯЗЬ</h3>
              <p className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest leading-relaxed mb-8 italic text-center">
                Укажи номера доверенных лиц (через запятую). Им уйдет сигнал при активации SOS.
              </p>
              
              <div className="space-y-4 mb-10">
                 <div className="space-y-1">
                    <label className="text-[7px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">ТЕЛЕФОНЫ_ДЛЯ_СВЯЗИ</label>
                    <textarea 
                      value={trustedContacts}
                      onChange={e => setTrustedContacts(e.target.value)}
                      placeholder="+79991234567, +79998887766"
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-[11px] font-bold outline-none focus:border-red-600/30 min-h-[100px]"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <button onClick={handleSaveSOS} className="w-full bg-red-600 text-white font-black py-5 rounded-xl uppercase italic shadow-xl shadow-red-900/20">
                    СОХРАНИТЬ
                 </button>
                 <button onClick={() => setShowSOSSettings(false)} className="w-full text-zinc-700 font-black py-4 rounded-xl uppercase italic text-[9px] tracking-widest">
                    ОТМЕНА
                 </button>
              </div>
              
              <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-white/5 opacity-40">
                 <p className="text-[7px] text-zinc-700 font-black uppercase italic leading-tight text-center">
                   ФУНКЦИЯ SOS НЕ ЗАМЕНЯЕТ 112. <br/> ЦЕХ — ЭТО МУЖИКИ РЯДОМ, А НЕ ПОЛИЦИЯ.
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* VERIFICATION MODAL */}
      {isVerifying && (
        <div className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-zinc-900 p-8 rounded-[40px] border border-[#D4AF37]/20 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
                 <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic mb-3 tracking-tighter">ВЕРИФИКАЦИЯ</h3>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 italic">
                Твой профиль будет проверен Бугром лично. Мастера со статусом доверия получают доступ к прямым контрактам.
              </p>
              <div className="space-y-3">
                 <button onClick={handleVerification} className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl uppercase italic shadow-xl">
                    ЗАПУСТИТЬ
                 </button>
                 <button onClick={() => setIsVerifying(false)} className="w-full text-zinc-700 font-black py-4 rounded-xl uppercase italic text-[9px] tracking-widest">
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
