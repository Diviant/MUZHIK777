
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
    endDate: new Date().toISOString().split('T')[0],
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

  if (loading) return <div className="flex-1 bg-black flex items-center justify-center text-[#D4AF37] font-black italic text-xs tracking-widest animate-pulse uppercase">ЦЕХ / ЗАГРУЗКА СМЕТЫ...</div>;

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full">
      <header className="flex items-center justify-between py-4 mb-2 px-2 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">←</button>
          <h2 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">ЖУРНАЛ ВАХТЫ</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase italic shadow-2xl transition-all ${saving ? 'bg-zinc-800 text-zinc-500' : 'bg-[#D4AF37] text-black shadow-[#D4AF37]/20'}`}
        >
          {saving ? '...' : 'СОХРАНИТЬ'}
        </button>
      </header>

      {/* SUMMARY CARD */}
      <div 
        className="p-6 rounded-[35px] border border-[#D4AF37]/20 mb-5 relative shadow-2xl"
        style={{ 
          background: 'radial-gradient(circle at 50% -10%, rgba(212, 175, 55, 0.1) 0%, #121212 60%)' 
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-[#D4AF37]/30"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
           <div className="text-left">
              <span className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.2em] italic mb-1 block mono">ЧИСТЫМИ</span>
              <div className="text-3xl font-black gold-text italic leading-none drop-shadow-md">{netProfit.toLocaleString()} ₽</div>
           </div>
           <div className="text-right">
              <span className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.2em] italic mb-1 block mono">РАСХОДЫ</span>
              <div className="text-sm font-black text-red-500 italic">-{totalExpenses.toLocaleString()} ₽</div>
           </div>
        </div>

        <div className="space-y-4 relative z-10">
          {/* DATES GRID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[7px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">НАЧАЛО</label>
              <input 
                type="date" 
                value={entry.startDate} 
                className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-3 text-white text-[11px] font-bold outline-none focus:border-[#D4AF37]/30" 
                onChange={e => setEntry({...entry, startDate: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[7px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">ОКОНЧАНИЕ</label>
              <input 
                type="date" 
                value={entry.endDate} 
                className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-3 text-white text-[11px] font-bold outline-none focus:border-[#D4AF37]/30" 
                onChange={e => setEntry({...entry, endDate: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[7px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">ОЖИДАЕМАЯ_ЗП</label>
            <input 
              type="number" 
              value={entry.expectedSalary || ''} 
              placeholder="0"
              className="w-full h-14 bg-black/40 border border-white/5 rounded-xl px-4 gold-text text-xl font-black outline-none appearance-none" 
              onChange={e => setEntry({...entry, expectedSalary: Number(e.target.value)})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1 text-left">
                <label className="text-[7px] text-zinc-800 font-black uppercase tracking-widest ml-1 italic mono">АВАНСЫ</label>
                <input 
                  type="number" 
                  value={entry.advances || ''} 
                  placeholder="0"
                  className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-3 text-white text-xs font-bold outline-none appearance-none" 
                  onChange={e => setEntry({...entry, advances: Number(e.target.value)})} 
                />
             </div>
             <div className="space-y-1 text-left">
                <label className="text-[7px] text-zinc-800 font-black uppercase tracking-widest ml-1 italic mono">ДОРОГА</label>
                <input 
                  type="number" 
                  value={entry.travelExpenses || ''} 
                  placeholder="0"
                  className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-3 text-white text-xs font-bold outline-none appearance-none" 
                  onChange={e => setEntry({...entry, travelExpenses: Number(e.target.value)})} 
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1 text-left">
                <label className="text-[7px] text-zinc-800 font-black uppercase tracking-widest ml-1 italic mono">ПИТАНИЕ</label>
                <input 
                  type="number" 
                  value={entry.foodExpenses || ''} 
                  placeholder="0"
                  className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-3 text-white text-xs font-bold outline-none appearance-none" 
                  onChange={e => setEntry({...entry, foodExpenses: Number(e.target.value)})} 
                />
             </div>
             <div className="space-y-1 text-left">
                <label className="text-[7px] text-zinc-800 font-black uppercase tracking-widest ml-1 italic mono">СЕМЬЕ</label>
                <input 
                  type="number" 
                  value={entry.sentHome || ''} 
                  placeholder="0"
                  className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-3 text-white text-xs font-bold outline-none appearance-none" 
                  onChange={e => setEntry({...entry, sentHome: Number(e.target.value)})} 
                />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/10 border border-white/5 p-5 rounded-[30px] opacity-40">
         <p className="text-[8px] text-zinc-700 font-black uppercase italic leading-relaxed text-center tracking-[0.2em]">
           МУЖИК, СЧИТАЙ КОПЕЙКУ. ДЕНЬГИ ДОЛЖНЫ РАБОТАТЬ НА СЕМЬЮ, А НЕ УЛЕТАТЬ В ТРУБУ.
         </p>
      </div>
    </div>
  );
};

export default VakhtaJournal;
