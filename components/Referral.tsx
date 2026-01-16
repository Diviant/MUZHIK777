
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
    if (user) {
      db.getReferralsCount(user.id).then(setReferralCount);
    }
  }, [user]);

  if (!user) return null;

  const tg = (window as any).Telegram?.WebApp;
  const referralLink = `https://t.me/chmuzhikbot?start=${user.referralCode}`;

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
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#161616] card-border rounded-xl flex items-center justify-center text-[#F5C518] active-scale">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ПРИГЛАСИ СВОИХ</h2>
      </header>

      <div className="bg-gradient-to-br from-[#161616] to-[#0E0E0E] card-border p-6 rounded-3xl mb-6 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#F5C518] opacity-5 blur-[40px] rounded-full"></div>
        <div className="relative z-10">
          <span className="text-5xl mb-4 block drop-shadow-2xl">💰</span>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2 leading-tight">Твои рефералы: <span className="text-[#F5C518]">{referralCount}</span></h3>
          <p className="text-zinc-500 text-[10px] italic leading-relaxed px-4">
            За каждого друга, который зайдет в ЦЕХ по твоей ссылке, начислим 50 🪙. Трать их на продвижение объявлений.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {[
          { label: 'Друг перешел по ссылке', sub: 'Регистрация в боте', val: '+50 🪙' },
          { label: 'Друг заполнил профиль', sub: 'Бонус за активность', val: '+10 🪙' },
          { label: 'Друг нашел работу', sub: 'После подтверждения', val: '+25 🪙' }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-[#161616] card-border rounded-2xl group transition-all active:bg-[#1e1e1e] shadow-md border border-white/5">
            <div className="text-left">
              <h4 className="text-white font-black text-[10px] uppercase italic tracking-tight">{item.label}</h4>
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none">{item.sub}</p>
            </div>
            <span className="text-[#F5C518] font-black italic text-xs leading-none">{item.val}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto bg-[#161616] card-border p-6 rounded-3xl shadow-2xl border border-white/5">
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em] ml-1 text-left leading-none">Твоя ссылка</p>
          <div className="bg-[#0E0E0E] p-4 rounded-xl border border-white/5 flex items-center justify-between group overflow-hidden">
            <code className="text-[11px] text-zinc-400 truncate pr-4 font-mono leading-none">{referralLink}</code>
            <button onClick={copyToClipboard} className="text-[#F5C518] font-black uppercase text-[10px]">{copied ? 'OK' : 'COPY'}</button>
          </div>
        </div>
        
        <button 
          onClick={shareLink}
          className="active-scale w-full font-black py-5 rounded-2xl uppercase italic tracking-tighter transition-all shadow-xl shadow-black/30 bg-[#F5C518] text-black"
        >
          Отправить друзьям в TG
        </button>
      </div>
    </div>
  );
};

export default Referral;
