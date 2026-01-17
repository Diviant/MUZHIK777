
import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
}

interface SavedLogistic {
  id: string;
  route: string;
  content: string;
  timestamp: number;
}

const Logistics: React.FC<Props> = ({ navigate, user }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transport, setTransport] = useState<'FLIGHT' | 'TRAIN'>('TRAIN');
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [copyStatus, setCopyStatus] = useState(false);

  const handleSearch = async () => {
    if (!from || !to || loading) return;
    setLoading(true);
    setRawResult(null);
    setSources([]);

    try {
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Найди актуальные билеты на ${transport === 'FLIGHT' ? 'самолет' : 'поезд'} из "${from}" в "${to}" на ${date}. 
      Укажи цены, время в пути и номера рейсов/поездов. Дай ссылки на покупку или сайты агрегаторов. 
      Напиши краткий совет от Бугра про дорогу.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });

      setRawResult(response.text || 'Маршрутов не найдено.');
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err: any) {
      console.error("LOGISTICS_API_ERROR:", err);
      setRawResult(`Сбой связи. Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rawResult) return;
    navigator.clipboard.writeText(rawResult);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <header className="flex items-center justify-between py-4 mb-4 sticky top-0 bg-[#050505] z-[100] border-b border-white/10 px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">←</button>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ЛОГИСТИКА</h2>
        </div>
      </header>

      <div className="bg-[#121212] p-6 rounded-[35px] border border-[#D4AF37]/30 mb-8 shadow-2xl relative z-50">
         <div className="grid grid-cols-2 gap-2 p-1.5 bg-black rounded-2xl mb-6">
            <button onClick={() => setTransport('TRAIN')} className={`py-4 rounded-xl text-[10px] font-black uppercase italic transition-all ${transport === 'TRAIN' ? 'bg-[#D4AF37] text-black' : 'text-zinc-600'}`}>🚂 ПОЕЗД</button>
            <button onClick={() => setTransport('FLIGHT')} className={`py-4 rounded-xl text-[10px] font-black uppercase italic transition-all ${transport === 'FLIGHT' ? 'bg-[#D4AF37] text-black' : 'text-zinc-600'}`}>✈️ САМОЛЕТ</button>
         </div>

         <div className="space-y-4">
            <input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="ОТКУДА?" className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl px-5 text-white text-xs font-black outline-none focus:border-[#D4AF37] uppercase italic" />
            <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="КУДА?" className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl px-5 text-white text-xs font-black outline-none focus:border-[#D4AF37] uppercase italic" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl px-5 text-[#D4AF37] text-xs font-black outline-none" />
            <button onClick={handleSearch} disabled={loading || !from || !to} className={`w-full h-16 rounded-[22px] flex items-center justify-center gap-4 transition-all active:scale-[0.97] shadow-2xl ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-[#D4AF37] text-black font-black uppercase italic text-xs'}`}>
               {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'ПОИСК БИЛЕТОВ'}
            </button>
         </div>
      </div>

      <div className="space-y-6">
        {rawResult && (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="bg-[#1a1a1a] p-6 rounded-[35px] border-l-4 border-[#D4AF37] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🎫</div>
               <span className="bg-[#D4AF37] text-black text-[8px] font-black px-4 py-1 rounded-full uppercase italic mb-4 inline-block">ОТЧЕТ</span>
               <div className="text-white text-[13px] leading-relaxed italic whitespace-pre-wrap mb-6">{rawResult}</div>
               
               <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button onClick={handleCopy} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${copyStatus ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{copyStatus ? 'ГОТОВО' : 'КОПИРОВАТЬ'}</button>
               </div>
            </div>

            {sources.length > 0 && (
              <div className="space-y-3">
                 {sources.map((s, i) => (
                   s.web && (
                     <a key={i} href={s.web.uri} target="_blank" className="block bg-[#121212] p-5 rounded-[25px] border border-white/5 text-left active-press">
                        <span className="text-white text-[11px] font-black uppercase italic block truncate mb-1">{s.web.title}</span>
                        <span className="text-zinc-700 text-[8px] truncate block mono uppercase tracking-tight">{s.web.uri}</span>
                     </a>
                   )
                 ))}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="py-32 text-center flex flex-col items-center">
             <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_30px_rgba(212,175,55,0.2)]"></div>
             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mono animate-pulse">CONNECTING_AI_AGENT...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logistics;
