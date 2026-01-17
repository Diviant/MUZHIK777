
import React, { useState } from 'react';
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
  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(Screen.WELCOME);
  };

  const menuItems = [
    { icon: '📊', title: 'Журнал Вахты', desc: 'Смета и доходы', screen: Screen.VAKHTA_JOURNAL },
    { icon: '🔍', title: 'Поиск Материалов', desc: 'Где купить выгодно', screen: Screen.MATERIALS_SEARCH },
    { icon: '📝', title: 'Мои Заметки', desc: 'Черновики и расчеты', screen: Screen.NOTES },
    { icon: '📋', title: 'Мои объявления', desc: 'Управление публикациями', screen: Screen.MY_ADS },
    { icon: '🤝', title: 'Пригласить друзей', desc: 'Бонусы за своих', screen: Screen.REFERRAL },
  ];

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#0E0E0E]">
      <header className="flex items-center justify-between py-4 mb-6">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ПРОФИЛЬ</h2>
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center text-[#F5C518]">✕</button>
      </header>

      <div className="bg-[#161616] rounded-[32px] p-6 mb-6 border border-white/5">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-[28px] overflow-hidden border border-white/5 flex items-center justify-center">
            {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-black text-white uppercase italic leading-none mb-1">{user.firstName}</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none mb-2">@{user.username}</p>
            <div className="flex gap-2">
              <span className="bg-[#F5C518] text-black text-[8px] font-black px-2 py-0.5 rounded italic">{user.level}</span>
              {user.isPro && <span className="bg-white text-black text-[8px] font-black px-2 py-0.5 rounded italic">PRO</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0E0E0E] p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-[8px] text-zinc-600 font-black uppercase block mb-1">БАЛЛЫ</span>
            <span className="text-lg font-black text-[#F5C518] italic">{user.points} 🪙</span>
          </div>
          <div className="bg-[#0E0E0E] p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-[8px] text-zinc-600 font-black uppercase block mb-1">РЕЙТИНГ</span>
            <span className="text-lg font-black text-white italic">{user.rating} ⭐</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(item.screen)}
            className="w-full bg-[#161616] p-5 rounded-2xl flex items-center justify-between border border-white/5 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">{item.icon}</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white uppercase italic tracking-tight">{item.title}</span>
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{item.desc}</span>
              </div>
            </div>
            <span className="text-zinc-800 text-xs">→</span>
          </button>
        ))}
      </div>

      <button onClick={handleLogout} className="mt-auto bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest">
        ВЫЙТИ ИЗ ЦЕХА
      </button>
    </div>
  );
};

export default Profile;
