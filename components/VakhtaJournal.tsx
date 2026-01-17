
import React, { useState, useEffect } from 'react';
import { Screen, VakhtaEntry, User } from '../types';
import { db } from '../database';

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
}

const VakhtaJournal: React.FC<Props> = ({ navigate, user }) => {
  const [entry, setEntry] = useState<VakhtaEntry>({
    startDate: new Date().toISOString().split('T')[0],
    expectedSalary: 0,
    advances: 0,
    travelExpenses: 0,
    foodExpenses: 0,
    sentHome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      db.getLatestVakhtaEntry(user.id).then(res => {
        if (res) setEntry(res);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await db.saveVakhtaEntry(user.id, entry);
    setSaving(false);
    alert('Смета сохранена в Цехе!');
  };

  const totalExpenses = entry.advances + entry.travelExpenses + entry.foodExpenses + entry.sentHome;
  const netProfit = entry.expectedSalary - totalExpenses;

  if (loading) return <div className="flex-1 bg-black flex items-center justify-center text-[#F5C518] font-black italic">ЦЕХ / ЗАГРУЗКА СМЕТЫ...</div>;

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ЖУРНАЛ ВАХТЫ</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg transition-all ${saving ? 'bg-zinc-800 text-zinc-500' : 'bg-[#F5C518] text-black shadow-[#F5C518]/20'}`}
        >
          {saving ? 'СОХРАНЯЮ...' : 'СОХРАНИТЬ'}
        </button>
      </header>

      <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 mb-6">
        <div className="flex justify-between items-center mb-6">
           <div className="text-left">
              <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Чистая прибыль</span>
              <div className="text-3xl font-black text-[#F5C518] italic">{netProfit.toLocaleString()} ₽</div>
           </div>
           <div className="text-right">
              <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Расходы</span>
              <div className="text-lg font-black text-red-500 italic">-{totalExpenses.toLocaleString()} ₽</div>
           </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Дата начала</label>
            <input type="date" value={entry.startDate} className="w-full bg-black border border-white/5 rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/20" onChange={e => setEntry({...entry, startDate: e.target.value})} />
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">План по ЗП (всего)</label>
            <input type="number" value={entry.expectedSalary} className="w-full bg-black border border-white/5 rounded-xl p-4 text-[#F5C518] font-black outline-none" onChange={e => setEntry({...entry, expectedSalary: Number(e.target.value)})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Авансы (крафы)</label>
                <input type="number" value={entry.advances} className="w-full bg-black border border-white/5 rounded-xl p-4 text-white font-bold outline-none" onChange={e => setEntry({...entry, advances: Number(e.target.value)})} />
             </div>
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Дорога</label>
                <input type="number" value={entry.travelExpenses} className="w-full bg-black border border-white/5 rounded-xl p-4 text-white font-bold outline-none" onChange={e => setEntry({...entry, travelExpenses: Number(e.target.value)})} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Еда/Быт</label>
                <input type="number" value={entry.foodExpenses} className="w-full bg-black border border-white/5 rounded-xl p-4 text-white font-bold outline-none" onChange={e => setEntry({...entry, foodExpenses: Number(e.target.value)})} />
             </div>
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Отправил домой</label>
                <input type="number" value={entry.sentHome} className="w-full bg-black border border-white/5 rounded-xl p-4 text-white font-bold outline-none" onChange={e => setEntry({...entry, sentHome: Number(e.target.value)})} />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-red-900/10 border border-red-900/20 p-4 rounded-2xl">
         <p className="text-[8px] text-zinc-500 uppercase font-black italic leading-tight">
           Мужик, считай копейку. Работа тяжелая, деньги должны работать на семью, а не улетать в трубу.
         </p>
      </div>
    </div>
  );
};

export default VakhtaJournal;
