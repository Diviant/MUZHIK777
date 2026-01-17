
import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';
import { db } from '../database';

interface Props {
  user: User | null;
  navigate: (screen: Screen) => void;
  onBonusClaim?: (points: number) => void;
}

const Referral: React.FC<Props> = ({ user, navigate, onBonusClaim }) => {
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (user && user.id !== 'guest') {
      db.getReferralsCount(user.id).then(setReferralCount);
    }
  }, [user]);

  if (!user) return null;

  const tg = (window as any).Telegram?.WebApp;
  const referralLink = `https://t.me/chmuzhikbot?start=${user.referralCode || 'PROMO'}`;

  const copyToClipboard = () => {
    if (tg?.HapticFeedback?.notificationOccurred) {
      try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
    }
    
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    const text = encodeURIComponent(`Залетай в ЦЕХ! Прямая работа без посредников. По моей ссылке получишь +50 🪙 бонусом!`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`);
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe">
      <header className="flex items-center gap-4 py-6 mb-6 border-b border-white/5">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">
          ←
        </button>
        <div className="flex flex-col text-left">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ПРИГЛАСИ СВОИХ</h2>
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mono mt-1 italic">PROTOCOL_NODE_SHARING</span>
        </div>
      </header>

      {/* Stats Card - CLEAN GRADIENT BACKGROUND */}
      <div 
        className="border border-[#D4AF37]/20 p-8 rounded-[40px] mb-8 text-center relative shadow-2xl"
        style={{ 
          background: 'radial-gradient(circle at 50% -10%, rgba(212, 175, 55, 0.1) 0%, #121212 60%)' 
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-[#D4AF37]/40"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-[20px] flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20 shadow-inner">
             <span className="text-3xl drop-shadow-2xl">👑</span>
          </div>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2 leading-tight">
            Твои рефералы: <span className="gold-text text-3xl ml-2">{referralCount}</span>
          </h3>
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed px-4 italic opacity-80">
            За каждого друга в Цехе начислим 50 🪙. Трать их на поднятие объявлений.
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3 mb-8">
        {[
          { label: 'Друг зашел по ссылке', sub: 'РЕГИСТРАЦИЯ', val: '+50 🪙', active: true },
          { label: 'Друг заполнил профиль', sub: 'ВЕРИФИКАЦИЯ', val: '+10 🪙', active: false },
          { label: 'Друг нашел работу', success: true, sub: 'УСПЕШНАЯ СДЕЛКА', val: '+25 🪙', active: false }
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between p-5 bg-zinc-900/40 rounded-[25px] border transition-all active-press ${item.active ? 'border-[#D4AF37]/30' : 'border-white/5 opacity-60'}`}>
            <div className="text-left">
              <h4 className={`font-black text-[10px] uppercase italic tracking-tight mb-1 ${item.active ? 'text-white' : 'text-zinc-600'}`}>{item.label}</h4>
              <p className="text-[7px] text-zinc-700 font-black uppercase tracking-[0.2em] leading-none mono">{item.sub}</p>
            </div>
            <span className={`font-black italic text-sm leading-none ${item.active ? 'gold-text' : 'text-zinc-800'}`}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Link Card */}
      <div className="mt-auto bg-zinc-900/60 border border-white/5 p-8 rounded-[40px] shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between px-2">
            <p className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.3em] mono italic">ПЕРСОНАЛЬНЫЙ_КАНАЛ</p>
            {copied && <span className="text-[8px] text-green-500 font-black uppercase animate-pulse">ССЫЛКА СКОПИРОВАНА!</span>}
          </div>
          <div 
            onClick={copyToClipboard}
            className="bg-black/60 p-5 rounded-[20px] border border-white/10 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group"
          >
            <code className="text-[10px] text-zinc-400 truncate pr-6 font-mono leading-none tracking-tight group-hover:text-white transition-colors">{referralLink}</code>
            <div className="w-8 h-8 flex items-center justify-center bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] font-black text-[10px]">❐</div>
          </div>
        </div>
        
        <button 
          onClick={shareLink}
          className="active-press w-full bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] text-black font-black py-5 rounded-[22px] uppercase italic tracking-tighter transition-all shadow-xl shadow-[#D4AF37]/10 flex items-center justify-center gap-3"
        >
          <span className="text-lg">⚓</span>
          ОТПРАВИТЬ СВОИМ В TG
        </button>
      </div>
    </div>
  );
};

export default Referral;
