
import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';
import { db } from '../database';

interface Props {
  user: User | null;
  navigate: (screen: Screen) => void;
  onDonate: () => void;
}

const Support: React.FC<Props> = ({ user, navigate, onDonate }) => {
  const [selectedBeer, setSelectedBeer] = useState<number>(1);
  const [fillLevel, setFillLevel] = useState<number>(20);
  const [recentDonors, setRecentDonors] = useState<any[]>([]);

  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    // Загружаем список меценатов из базы
    db.getDonations().then(setRecentDonors);
  }, []);

  const beerPacks = [
    { id: 1, name: '0.5 Светлого', stars: 50, level: 30 },
    { id: 2, name: 'Полторашка', stars: 150, level: 55 },
    { id: 3, name: 'Ящик пенного', stars: 500, level: 80 },
    { id: 4, name: 'Кега для цеха', stars: 2500, level: 100 },
  ];

  const handleDonate = async () => {
    if (!user) return;
    const pack = beerPacks.find(p => p.id === selectedBeer);
    
    // 1. В реальности здесь вызывается tg.openInvoice или платеж через Stars
    // 2. После успеха записываем в базу
    await db.addDonation(user.id, pack);
    
    onDonate();
    if (tg?.showAlert) tg.showAlert(`Респект принят! Твой вклад (${pack?.name}) в истории Цеха.`);
    navigate(Screen.HOME);
  };

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar bg-[#0E0E0E]">
      <header className="flex items-center gap-4 py-4 mb-4">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#161616] card-border rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase">РЕСПЕКТ БУГРУ</h2>
      </header>

      <div className="flex flex-col items-center py-6">
        <div className="relative w-32 h-44 bg-white/5 border-4 border-white/10 rounded-b-3xl overflow-hidden">
          <div className="absolute bottom-0 w-full bg-[#F5C518] transition-all duration-1000" style={{ height: `${fillLevel}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {beerPacks.map((pack) => (
          <button 
            key={pack.id}
            onClick={() => { setSelectedBeer(pack.id); setFillLevel(pack.level); }}
            className={`p-4 rounded-2xl border-2 ${selectedBeer === pack.id ? 'border-[#F5C518] bg-[#F5C518]/10' : 'border-white/5 bg-[#161616]'}`}
          >
            <div className="text-white font-black uppercase text-[10px] mb-1">{pack.name}</div>
            <div className="text-[#F5C518] font-black">{pack.stars} ⭐</div>
          </button>
        ))}
      </div>

      <div className="bg-[#161616] p-5 rounded-3xl mb-6">
        <h4 className="text-[10px] text-zinc-500 font-black uppercase mb-4">ЗАЛ УВАЖЕНИЯ</h4>
        <div className="space-y-3">
          {recentDonors.map((d, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="text-white font-bold italic">{d.profiles?.first_name || 'Аноним'}</span>
              <span className="text-[#F5C518] font-black uppercase">{d.pack_name}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleDonate} className="w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic">ОТПРАВИТЬ РЕСПЕКТ</button>
    </div>
  );
};

export default Support;
