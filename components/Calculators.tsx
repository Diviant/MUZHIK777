
import React, { useState, useMemo } from 'react';
import { Screen } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

type CalcType = 'CONCRETE' | 'METAL' | 'TILE' | 'ROOF' | 'CONVERTER';

const Calculators: React.FC<Props> = ({ navigate }) => {
  const [calcType, setCalcType] = useState<CalcType>('CONCRETE');
  
  // States
  const [inputs, setInputs] = useState<Record<string, string>>({
    l: '', w: '', h: '', // Common
    tileL: '300', tileW: '300', gap: '2', // Tile
    slope: '30', // Roof
    diameter: '12', len: '1', // Metal
    area: '', depth: '' // Converter
  });

  const updateInput = (key: string, val: string) => setInputs(prev => ({ ...prev, [key]: val }));

  const result = useMemo(() => {
    switch (calcType) {
      case 'CONCRETE':
        return (Number(inputs.l || 0) * Number(inputs.w || 0) * Number(inputs.h || 0)).toFixed(2);
      
      case 'METAL':
        const metalWeights: Record<string, number> = { '6': 0.222, '8': 0.395, '10': 0.617, '12': 0.888, '14': 1.21, '16': 1.58, '18': 2.0, '20': 2.47 };
        return (metalWeights[inputs.diameter] * Number(inputs.len || 0)).toFixed(2);
      
      case 'TILE':
        const area = Number(inputs.l || 0) * Number(inputs.w || 0);
        const tileArea = (Number(inputs.tileL) + Number(inputs.gap)) * (Number(inputs.tileW) + Number(inputs.gap)) / 1000000;
        return tileArea > 0 ? Math.ceil(area / tileArea).toString() : '0';

      case 'ROOF':
        const floorArea = Number(inputs.l || 0) * Number(inputs.w || 0);
        const cosAngle = Math.cos(Number(inputs.slope || 0) * (Math.PI / 180));
        return cosAngle > 0 ? (floorArea / cosAngle).toFixed(2) : '0';

      case 'CONVERTER':
        return (Number(inputs.area || 0) * (Number(inputs.depth || 0) / 100)).toFixed(2);
      
      default: return '0';
    }
  }, [calcType, inputs]);

  // Fix: Added 'м²' for ROOF calculation and removed the early return for 'ROOF' that caused type narrowing errors in the JSX below
  const resultUnit = calcType === 'TILE' ? 'шт.' : calcType === 'METAL' ? 'кг' : calcType === 'ROOF' ? 'м²' : 'м³';

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6 sticky top-0 bg-[#080808]/80 backdrop-blur-md z-50">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#D4AF37]">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ИНСТРУМЕНТАРИЙ</h2>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5">
        {[
          { id: 'CONCRETE', label: 'БЕТОН' },
          { id: 'METAL', label: 'МЕТАЛЛ' },
          { id: 'TILE', label: 'ПЛИТКА' },
          { id: 'ROOF', label: 'КРОВЛЯ' },
          { id: 'CONVERTER', label: 'М² → М³' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setCalcType(t.id as CalcType)} 
            className={`flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${calcType === t.id ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#121212] p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="bg-black/80 rounded-2xl p-6 mb-8 border border-white/5 flex flex-col items-center">
           <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-2">РЕЗУЛЬТАТ РАСЧЕТА</span>
           <div className="text-5xl font-mono text-[#00FF41] drop-shadow-[0_0_10px_rgba(0,255,65,0.4)]">
             {result}
             <span className="text-sm ml-2">{resultUnit}</span>
           </div>
        </div>

        <div className="space-y-4">
          {calcType === 'CONCRETE' && (
            <>
              <InputRow label="Длина (м)" val={inputs.l} onChange={v => updateInput('l', v)} />
              <InputRow label="Ширина (м)" val={inputs.w} onChange={v => updateInput('w', v)} />
              <InputRow label="Высота (м)" val={inputs.h} onChange={v => updateInput('h', v)} />
            </>
          )}
          {calcType === 'METAL' && (
            <>
              <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">Диаметр (мм)</label>
                <select value={inputs.diameter} onChange={e => updateInput('diameter', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none appearance-none">
                   {['6','8','10','12','14','16','18','20'].map(d => <option key={d} value={d}>{d} мм</option>)}
                </select>
              </div>
              <InputRow label="Длина проката (м)" val={inputs.len} onChange={v => updateInput('len', v)} />
            </>
          )}
          {calcType === 'TILE' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Длина пола (м)" val={inputs.l} onChange={v => updateInput('l', v)} />
                <InputRow label="Ширина пола (м)" val={inputs.w} onChange={v => updateInput('w', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Плитка L (мм)" val={inputs.tileL} onChange={v => updateInput('tileL', v)} />
                <InputRow label="Плитка W (мм)" val={inputs.tileW} onChange={v => updateInput('tileW', v)} />
              </div>
              <InputRow label="Шов (мм)" val={inputs.gap} onChange={v => updateInput('gap', v)} />
            </>
          )}
          {calcType === 'ROOF' && (
            <>
              <InputRow label="Длина основания (м)" val={inputs.l} onChange={v => updateInput('l', v)} />
              <InputRow label="Ширина основания (м)" val={inputs.w} onChange={v => updateInput('w', v)} />
              <InputRow label="Угол наклона (°)" val={inputs.slope} onChange={v => updateInput('slope', v)} />
            </>
          )}
          {calcType === 'CONVERTER' && (
            <>
              <InputRow label="Площадь (м²)" val={inputs.area} onChange={v => updateInput('area', v)} />
              <InputRow label="Толщина слоя (см)" val={inputs.depth} onChange={v => updateInput('depth', v)} />
            </>
          )}
        </div>
      </div>

      <div className="mt-8 bg-[#121212] p-5 rounded-2xl border border-white/5 italic">
        <p className="text-[9px] text-zinc-500 uppercase font-bold leading-tight">
          * Всегда бери с запасом 10% на подрезку и брак. Бугор плохого не посоветует.
        </p>
      </div>
    </div>
  );
};

const InputRow: React.FC<{ label: string, val: string, onChange: (v: string) => void }> = ({ label, val, onChange }) => (
  <div className="space-y-1 text-left">
    <label className="text-[8px] text-zinc-600 font-black uppercase ml-1">{label}</label>
    <input type="number" value={val} onChange={e => onChange(e.target.value)} placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/30" />
  </div>
);

export default Calculators;
