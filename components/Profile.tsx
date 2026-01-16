
import React, { useState, useRef } from 'react';
import { Screen, User } from '../types';
import { ECONOMY } from '../constants';
import { supabase } from '../lib/supabase';

interface Props {
  user: User | null;
  navigate: (screen: Screen) => void;
  onUpdate: (fields: Partial<User>) => void;
  dbConnected?: boolean | null;
}

const Profile: React.FC<Props> = ({ user, navigate, onUpdate, dbConnected }) => {
  const [tapCount, setTapCount] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!user) return null;

  const handleTogglePro = () => {
    if (user.isPro) return;
    if (user.points >= ECONOMY.PRO_STATUS_COST) {
      onUpdate({ points: user.points - ECONOMY.PRO_STATUS_COST, isPro: true });
    } else {
      alert(`Недостаточно баллов для PRO. Нужно ${ECONOMY.PRO_STATUS_COST} 🪙`);
    }
  };

  const handleAvatarTap = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      try { tg.HapticFeedback.impactOccurred('light'); } catch (e) {}
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    
    const nextCount = tapCount + 1;
    if (nextCount >= 5) {
      setTapCount(0);
      navigate(Screen.ADMIN_LOGIN);
    } else {
      setTapCount(nextCount);
      timerRef.current = setTimeout(() => setTapCount(0), 1000);
    }
  };

  const handleLogout = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.showConfirm) {
      tg.showConfirm("Уверен, что хочешь выйти из Цеха?", async (confirmed: boolean) => {
        if (confirmed) {
          await supabase.auth.signOut();
          navigate(Screen.WELCOME);
          setTimeout(() => window.location.reload(), 100);
        }
      });
    } else {
      if (confirm("Выйти из системы?")) {
        supabase.auth.signOut().then(() => {
          navigate(Screen.WELCOME);
          window.location.reload();
        });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar bg-[#0E0E0E]">
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">ЛИЧНЫЙ КАБИНЕТ</span>
            {dbConnected === true && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_green]"></div>}
          </div>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ПРОФИЛЬ</h2>
        </div>
        <button 
          onClick={() => navigate(Screen.HOME)}
          className="w-10 h-10 bg-[#161616] card-border rounded-xl flex items-center justify-center text-[#F5C518] active-scale"
        >
          ✕
        </button>
      </header>

      {/* КАРТОЧКА ПРОФИЛЯ */}
      <div className="bg-[#161616] card-border rounded-[32px] p-6 mb-6 shadow-2xl border border-white/5 relative">
        <div className="flex items-center gap-6 mb-6">
          <div 
            onClick={handleAvatarTap}
            className="w-20 h-20 bg-zinc-900 rounded-[28px] overflow-hidden border border-white/5 relative shadow-inner flex items-center justify-center active:scale-95 transition-transform"
          >
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-lg border-2 border-[#161616]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            )}
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">{user.firstName}</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none mb-2">@{user.username}</p>
            <div className="flex items-center gap-2">
              <span className="bg-[#F5C518]/10 text-[#F5C518] text-[8px] font-black px-2 py-0.5 rounded italic border border-[#F5C518]/20">
                {user.level}
              </span>
              {user.isPro && <span className="bg-[#F5C518] text-black text-[8px] font-black px-2 py-0.5 rounded italic">PRO</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0E0E0E] p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-[8px] text-zinc-600 font-black uppercase block mb-1">БАЛЛЫ</span>
            <span className="text-lg font-black text-[#F5C518] italic leading-none">{user.points} 🪙</span>
          </div>
          <div className="bg-[#0E0E0E] p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-[8px] text-zinc-600 font-black uppercase block mb-1">РЕЙТИНГ</span>
            <span className="text-lg font-black text-white italic leading-none">{user.rating} ⭐</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <button 
          onClick={() => navigate(Screen.MY_ADS)}
          className="w-full bg-[#161616] card-border p-5 rounded-2xl flex items-center justify-between active-scale group"
        >
          <div className="flex items-center gap-4">
            <span className="text-xl">📋</span>
            <span className="text-xs font-black text-white uppercase italic tracking-tight">Мои объявления</span>
          </div>
          <span className="text-zinc-700 text-xs">→</span>
        </button>

        <button 
          onClick={handleTogglePro}
          className={`w-full card-border p-5 rounded-2xl flex items-center justify-between active-scale ${user.isPro ? 'bg-zinc-800 opacity-50' : 'bg-[#F5C518]/10 border-[#F5C518]/30'}`}
        >
          <div className="flex items-center gap-4">
            <span className="text-xl">👑</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-white uppercase italic tracking-tight">PRO Статус</span>
              {!user.isPro && <span className="text-[8px] text-[#F5C518] font-black uppercase tracking-widest">{ECONOMY.PRO_STATUS_COST} 🪙</span>}
            </div>
          </div>
          <span className="text-zinc-700 text-xs">{user.isPro ? 'АКТИВЕН' : 'КУПИТЬ'}</span>
        </button>

        <button 
          onClick={() => navigate(Screen.REFERRAL)}
          className="w-full bg-[#161616] card-border p-5 rounded-2xl flex items-center justify-between active-scale"
        >
          <div className="flex items-center gap-4">
            <span className="text-xl">🤝</span>
            <span className="text-xs font-black text-white uppercase italic tracking-tight">Пригласить друзей</span>
          </div>
          <span className="text-zinc-700 text-xs">→</span>
        </button>

        {/* НОВЫЙ РАЗДЕЛ: УСТАВ ЦЕХА */}
        <div className={`w-full bg-[#161616] card-border rounded-2xl overflow-hidden transition-all duration-300 ${showRules ? 'max-h-[500px]' : 'max-h-[64px]'}`}>
          <button 
            onClick={() => setShowRules(!showRules)}
            className="w-full p-5 flex items-center justify-between active:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">📜</span>
              <span className="text-xs font-black text-white uppercase italic tracking-tight">Устав и лимиты</span>
            </div>
            <span className={`text-zinc-700 text-xs transition-transform duration-300 ${showRules ? 'rotate-90' : ''}`}>→</span>
          </button>
          
          <div className="p-5 pt-0 space-y-4">
            <div className="h-px bg-white/5 w-full"></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Объявление</span>
                <span className="text-[10px] text-[#F5C518] font-black italic">{ECONOMY.AD_POST_COST} 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">PRO Статус</span>
                <span className="text-[10px] text-[#F5C518] font-black italic">{ECONOMY.PRO_STATUS_COST} 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Бонус за друга</span>
                <span className="text-[10px] text-green-500 font-black italic">+{ECONOMY.REFERRAL_BONUS} 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Лимит друзей</span>
                <span className="text-[10px] text-white font-black italic">{ECONOMY.DAILY_REF_LIMIT} / сутки</span>
              </div>
            </div>
            <p className="text-[8px] text-zinc-600 font-bold uppercase italic leading-tight bg-black/40 p-3 rounded-xl border border-white/5">
              Внимание: Система анти-фрода мониторит активность. Накрутка баллов ведет к блокировке в Цехе.
            </p>
          </div>
        </div>
      </div>

      {dbConnected === false && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-4 text-center">
          <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">База данных недоступна</p>
          <p className="text-[8px] text-zinc-500 uppercase mt-1">Проверьте переменные окружения на Vercel</p>
        </div>
      )}

      <button 
        onClick={handleLogout}
        className="mt-auto active-scale bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] italic"
      >
        ВЫЙТИ ИЗ ЦЕХА
      </button>
    </div>
  );
};

export default Profile;
