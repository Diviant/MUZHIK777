
import React, { useState } from 'react';
import { Screen } from '../types';
import Layout from './Layout';

interface Props {
  navigate: (screen: Screen) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

const CHECKLISTS_DATA = {
  ACCEPTANCE: [
    { id: 'a1', text: 'Геометрия стен (отклонения)', done: false },
    { id: 'a2', text: 'Работоспособность всех розеток', done: false },
    { id: 'a3', text: 'Трассы сантехники (протечки)', done: false },
    { id: 'a4', text: 'Целостность стеклопакетов', done: false },
    { id: 'a5', text: 'Работа вытяжки / вентиляции', done: false },
    { id: 'a6', text: 'Радиаторы (крепление, нагрев)', done: false },
    { id: 'a7', text: 'Входная дверь (замки, зазоры)', done: false },
  ],
  VAKHTA: [
    { id: 'v1', text: 'Паспорт, СНИЛС, ИНН, Трудовая', done: false },
    { id: 'v2', text: 'Билеты (распечатка/телефон)', done: false },
    { id: 'v3', text: 'Спецодежда (если не выдают)', done: false },
    { id: 'v4', text: 'Средства гигиены (мыло, щетка)', done: false },
    { id: 'v5', text: 'Аптечка (обезбол, пластырь)', done: false },
    { id: 'v6', text: 'Зарядка + PowerBank', done: false },
    { id: 'v7', text: 'Наличка на первое время', done: false },
  ]
};

const Checklists: React.FC<Props> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'ACCEPTANCE' | 'VAKHTA'>('VAKHTA');
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLISTS_DATA.VAKHTA);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const switchTab = (tab: 'ACCEPTANCE' | 'VAKHTA') => {
    setActiveTab(tab);
    setItems(CHECKLISTS_DATA[tab]);
  };

  const completedCount = items.filter(i => i.done).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <Layout title="ЧЕК-ЛИСТЫ" onBack={() => navigate(Screen.HOME)}>
      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5">
        <button 
          onClick={() => switchTab('VAKHTA')} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'VAKHTA' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-600'}`}
        >
          НА ВАХТУ
        </button>
        <button 
          onClick={() => switchTab('ACCEPTANCE')} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'ACCEPTANCE' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-600'}`}
        >
          ПРИЕМКА
        </button>
      </div>

      {/* PROGRESS CARD - CLEAN GRADIENT BACKGROUND */}
      <div 
        className="border border-[#D4AF37]/20 p-8 rounded-[40px] mb-8 relative shadow-2xl"
        style={{ 
          background: 'radial-gradient(circle at 50% -10%, rgba(212, 175, 55, 0.08) 0%, #121212 60%)' 
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
             <div className="text-left">
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic opacity-60">Готовность</span>
                <div className="text-5xl font-black text-white italic leading-none mt-1 drop-shadow-lg">{progress}%</div>
             </div>
             <div className="text-right text-[10px] text-zinc-500 font-black uppercase italic opacity-60">
                {completedCount} / {items.length} ПУНКТОВ
             </div>
          </div>
          <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
             <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <button 
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-4 p-5 rounded-[25px] border transition-all active-press ${item.done ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20 opacity-60' : 'bg-[#111] border-white/5 shadow-md'}`}
          >
             <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${item.done ? 'bg-[#D4AF37] border-none text-black' : 'bg-black/40 border-white/10 text-transparent'}`}>
                {item.done ? '✓' : ''}
             </div>
             <span className={`flex-1 text-left text-xs font-bold uppercase italic tracking-tight ${item.done ? 'text-zinc-500 line-through' : 'text-white'}`}>
                {item.text}
             </span>
          </button>
        ))}
      </div>

      <div className="mt-10 p-6 bg-zinc-900/10 border border-white/5 rounded-[30px] opacity-40">
         <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic leading-relaxed text-center">
            ПРОВЕРЬ КАЖДЫЙ ПУНКТ ПЕРЕД НАЧАЛОМ. <br/> ПУСТЯКОВ В НАШЕМ ДЕЛЕ НЕ БЫВАЕТ.
         </p>
      </div>
    </Layout>
  );
};

export default Checklists;
