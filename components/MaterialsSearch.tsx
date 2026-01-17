import React, { useState } from 'react';
import { Screen, Location } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  navigate: (screen: Screen) => void;
  location: Location | null;
}

const MaterialsSearch: React.FC<Props> = ({ navigate, location }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Найди актуальные цены и места продажи: ${query} в регионе ${location?.name || 'Россия'}. ОБЯЗАТЕЛЬНО укажи адреса складов или магазинов и их контактные номера телефонов. Дай краткую сводку по ценам и надежным поставщикам.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setResult(response.text);
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err) {
      setResult('Связь со складом прервалась. Попробуй еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <header className="flex items-center gap-4 py-6 mb-6 border-b border-white/5 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-30">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">←</button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">СНАБЖЕНЕЦ</h2>
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic mono opacity-60">SUPPLY_SCAN_v1.1</span>
        </div>
      </header>

      {/* FIXED INPUT CONTAINER */}
      <div className="bg-[#121212] p-2 rounded-[35px] border border-white/10 flex items-center gap-2 mb-10 shadow-2xl relative">
         <div className="absolute -top-[1px] left-10 right-10 h-[1px] bg-[#D4AF37]/30"></div>
         <input 
           type="text" 
           value={query}
           onChange={e => setQuery(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && handleSearch()}
           placeholder="Что ищем? (Арматура, кирпич...)"
           className="flex-1 bg-transparent px-6 text-white text-sm outline-none font-bold placeholder:text-zinc-700 h-14"
         />
         <button 
           onClick={handleSearch}
           disabled={loading}
           className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${query.trim() ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 scale-100' : 'bg-zinc-800 text-zinc-600 scale-90'}`}
         >
            {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="text-xl">🔍</span>}
         </button>
      </div>

      {result && (
        <div className="space-y-6 animate-slide-up">
           <div className="bg-[#0f0f0f] p-8 rounded-[40px] border border-white/5 text-left shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-[#D4AF37]/10"></div>
              <h4 className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-6 italic mono">МАРКЕТ_АНАЛИЗ:</h4>
              <div className="text-zinc-300 text-[14px] leading-relaxed whitespace-pre-wrap italic">
                {result}
              </div>
           </div>

           {sources.length > 0 && (
             <div className="space-y-3">
                <h4 className="text-[10px] text-zinc-700 font-black uppercase tracking-widest ml-4 mb-2 italic">ПРОВЕРЕННЫЕ_БАЗЫ:</h4>
                {sources.map((s, i) => (
                  s.web && (
                    <a key={i} href={s.web.uri} target="_blank" className="block bg-[#121212] p-6 rounded-[30px] border border-white/5 text-left active-press shadow-xl transition-all">
                       <span className="text-white text-[12px] font-black uppercase italic block truncate mb-1">{s.web.title}</span>
                       <span className="text-zinc-700 text-[8px] truncate block mono uppercase tracking-tight">{s.web.uri}</span>
                    </a>
                  )
                ))}
             </div>
           )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 opacity-10 border-2 border-dashed border-white/5 rounded-[45px]">
           <span className="text-7xl mb-6">🏗️</span>
           <p className="font-black italic uppercase tracking-widest text-center text-white">ГОТОВ К ПОИСКУ</p>
           <p className="text-[9px] mt-2 font-bold italic">Найду лучшие цены и КОНТАКТЫ</p>
        </div>
      )}
    </div>
  );
};

export default MaterialsSearch;