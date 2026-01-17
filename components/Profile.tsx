
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { ECONOMY } from '../constants';
import { supabase } from '../lib/supabase';
import { db } from '../database';

interface Props {
  user: User | null;
  navigate: (screen: Screen) => void;
  onUpdate: (fields: Partial<User>) => void;
  dbConnected?: boolean | null;
}

const Profile: React.FC<Props> = ({ user, navigate, onUpdate, dbConnected }) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(Screen.WELCOME);
  };

  const addPortfolio = async () => {
    if (!newImageUrl.trim()) return;
    await db.addPortfolioImage(user.id, newImageUrl);
    onUpdate({ portfolioImages: [...(user.portfolioImages || []), newImageUrl] });
    setNewImageUrl('');
  };

  const handleVerification = async () => {
    await db.requestVerification(user.id, user.firstName, user.specialization.join(', '));
    alert('Заявка на проверку отправлена Бугру!');
    setIsVerifying(false);
  };

  const menuItems = [
    { icon: '📏', title: 'Инструментарий', desc: 'Калькуляторы расчетов', screen: Screen.CALCULATORS },
    { icon: '📊', title: 'Журнал Вахты', desc: 'Смета и доходы', screen: Screen.VAKHTA_JOURNAL },
    { icon: '🔍', title: 'Поиск Материалов', desc: 'Где купить выгодно', screen: Screen.MATERIALS_SEARCH },
    { icon: '📝', title: 'Мои Заметки', desc: 'Черновики и расчеты', screen: Screen.NOTES },
    { icon: '🤝', title: 'Пригласить друзей', desc: 'Бонусы за своих', screen: Screen.REFERRAL },
  ];

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#0E0E0E]">
      <header className="flex items-center justify-between py-4 mb-6 sticky top-0 bg-[#0E0E0E]/80 backdrop-blur-md z-30">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ПРОФИЛЬ</h2>
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center text-[#F5C518]">✕</button>
      </header>

      {/* Основная карточка */}
      <div className="bg-[#161616] rounded-[32px] p-6 mb-6 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C518] opacity-5 blur-[50px] rounded-full -translate-y-10 translate-x-10"></div>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-[28px] overflow-hidden border border-white/5 flex items-center justify-center shadow-inner relative">
            {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
            {user.isVerified && <div className="absolute bottom-0 right-0 bg-[#F5C518] w-6 h-6 rounded-tl-xl flex items-center justify-center text-[10px] text-black">✓</div>}
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-black text-white uppercase italic leading-none mb-1 flex items-center gap-2">
              {user.firstName}
              {user.isVerified && <span className="text-blue-400 text-xs">🛡️</span>}
            </h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none mb-2">@{user.username}</p>
            <div className="flex gap-2">
              <span className="bg-[#F5C518] text-black text-[8px] font-black px-2 py-0.5 rounded italic">{user.level}</span>
              {user.isPro && <span className="bg-white text-black text-[8px] font-black px-2 py-0.5 rounded italic">PRO</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0E0E0E] p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-[8px] text-zinc-600 font-black uppercase block mb-1">БАЛЛЫ</span>
            <span className="text-lg font-black text-[#F5C518] italic">{user.points} 🪙</span>
          </div>
          <div className="bg-[#0E0E0E] p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-[8px] text-zinc-600 font-black uppercase block mb-1">РЕЙТИНГ</span>
            <span className="text-lg font-black text-white italic">{user.rating} ⭐</span>
          </div>
        </div>

        {!user.isVerified && (
          <button 
            onClick={() => setIsVerifying(true)}
            className="w-full bg-white/5 text-zinc-400 text-[10px] font-black py-3 rounded-xl uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors"
          >
            Получить статус Проверенного Мастера
          </button>
        )}
      </div>

      {/* Портфолио */}
      <div className="bg-[#161616] rounded-[32px] p-6 mb-6 border border-white/5">
         <h4 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest italic mb-4 text-left">ПОРТФОЛИО ОБЪЕКТОВ:</h4>
         
         <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 min-h-[100px]">
            {user.portfolioImages?.length ? user.portfolioImages.map((img, i) => (
              <div key={i} className="min-w-[120px] h-[120px] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
                 <img src={img} className="w-full h-full object-cover" />
              </div>
            )) : (
              <div className="w-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl py-10">
                 <span className="text-zinc-700 text-[10px] font-black uppercase italic">Нет загруженных фото</span>
              </div>
            )}
         </div>

         <div className="flex gap-2">
            <input 
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="Ссылка на фото работы..."
              className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none"
            />
            <button 
              onClick={addPortfolio}
              className="bg-[#F5C518] text-black font-black px-4 py-3 rounded-xl uppercase italic text-[10px] active:scale-95"
            >
              ДОБАВИТЬ
            </button>
         </div>
      </div>

      {/* Меню */}
      <div className="space-y-3 mb-6">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(item.screen)}
            className="w-full bg-[#161616] p-5 rounded-2xl flex items-center justify-between border border-white/5 active:scale-98 transition-all shadow-md group"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">{item.icon}</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white uppercase italic tracking-tight group-hover:text-[#F5C518] transition-colors">{item.title}</span>
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{item.desc}</span>
              </div>
            </div>
            <span className="text-zinc-800 text-xs group-hover:translate-x-1 transition-transform">→</span>
          </button>
        ))}
      </div>

      <button onClick={handleLogout} className="mt-auto bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest">
        ВЫЙТИ ИЗ ЦЕХА
      </button>

      {/* Модалка верификации */}
      {isVerifying && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-[#161616] p-8 rounded-[40px] border border-[#F5C518]/20 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-500">
              <span className="text-4xl mb-4 block">🛡️</span>
              <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter">ВЕРИФИКАЦИЯ</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">
                Бугор лично проверит твои данные. Проверенные мастера получают в 3 раза больше заказов и синюю метку.
              </p>
              <div className="space-y-3">
                 <button onClick={handleVerification} className="w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic shadow-xl shadow-[#F5C518]/10">ПОДТВЕРДИТЬ ЛИЧНОСТЬ</button>
                 <button onClick={() => setIsVerifying(false)} className="w-full bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl uppercase italic text-[10px]">ОТМЕНА</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
