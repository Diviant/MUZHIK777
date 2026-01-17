
import React, { useState } from 'react';
import { Screen } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

const Calculators: React.FC<Props> = ({ navigate }) => {
  const [calcType, setCalcType] = useState<'CONCRETE' | 'METAL'>('CONCRETE');
  
  // Concrete State
  const [l, setL] = useState('');
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  
  // Metal State
  const [diameter, setDiameter] = useState('12');
  const [length, setLength] = useState('1');

  const concreteVolume = (Number(l) * Number(w) * Number(h)).toFixed(2);
  
  // Вес арматуры (примерные коэф. кг/м)
  const metalWeights: Record<string, number> = {
    '6': 0.222, '8': 0.395, '10': 0.617, '12': 0.888, '14': 1.21, '16': 1.58, '18': 2.0, '20': 2.47
  };
  const metalResult = (metalWeights[diameter] * Number(length)).toFixed(2);

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6 sticky top-0 bg-[#080808]/80 backdrop-blur-md z-50">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ИНСТРУМЕНТАРИЙ</h2>
      </header>

      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5">
        <button onClick={() => setCalcType('CONCRETE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${calcType === 'CONCRETE' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}>БЕТОН (КУБЫ)</button>
        <button onClick={() => setCalcType('METAL')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${calcType === 'METAL' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}>ВЕС МЕТАЛЛА</button>
      </div>

      <div className="bg-[#121212] p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C518] opacity-[0.02] -translate-y-10 translate-x-10 rotate-45"></div>
        
        {/* Экран результата в стиле ретро-прибора */}
        <div className="bg-black/80 rounded-2xl p-6 mb-8 border border-white/5 flex flex-col items-center">
           <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-2">РЕЗУЛЬТАТ РАСЧЕТА</span>
           <div className="text-5xl font-mono text-[#00FF41] drop-shadow-[0_0_10px_rgba(0,255,65,0.4)]">
             {calcType === 'CONCRETE' ? concreteVolume : metalResult}
             <span className="text-sm ml-2">{calcType === 'CONCRETE' ? 'м³' : 'кг'}</span>
           </div>
        </div>

        {calcType === 'CONCRETE' ? (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                   <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">Длина (м)</label>
                   <input type="number" value={l} onChange={e => setL(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/30" />
                </div>
                <div className="space-y-1 text-left">
                   <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">Ширина (м)</label>
                   <input type="number" value={w} onChange={e => setW(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/30" />
                </div>
             </div>
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">Глубина / Высота (м)</label>
                <input type="number" value={h} onChange={e => setH(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/30" />
             </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">Диаметр арматуры (мм)</label>
                <select value={diameter} onChange={e => setDiameter(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none appearance-none">
                   {Object.keys(metalWeights).map(d => <option key={d} value={d}>{d} мм</option>)}
                </select>
             </div>
             <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">Длина проката (м)</label>
                <input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/30" />
             </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-[#121212] p-5 rounded-2xl border border-white/5 italic">
        <p className="text-[9px] text-zinc-500 uppercase font-bold leading-tight">
          * Расчеты носят справочный характер. Всегда заказывай на 5-10% больше с учетом усадки и обрезков.
        </p>
      </div>
    </div>
  );
};

export default Calculators;
