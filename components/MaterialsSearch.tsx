
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
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error('API_KEY_MISSING');

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Найди цены и поставщиков: ${query} в регионе ${location?.name || 'Россия'}. Укажи адреса и контакты складов. Дай краткий анализ цен.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setResult(response.text || 'Ничего не найдено.');
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err: any) {
      console.error("SUPPLY_API_ERROR:", err);
      const msg = err.message === 'API_KEY_MISSING' 
        ? 'Ошибка: Ключ API не обнаружен в системе.' 
        : `Ошибка: ${err.message || 'Сбой связи'}`;
      setResult(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <header className="flex items-center gap-4 py-6 mb-6 border-b border-white/5 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-30">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press">←</button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">СНАБЖЕНЕЦ</h2>
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic mono">SUPPLY_LOGIC_v2.0</span>
        </div>
      </header>

      <div className="bg-[#121212] p-2 rounded-[35px] border border-white/10 flex items-center gap-2 mb-10 shadow-2xl relative">
         <input 
           type="text" 
           value={query}
           onChange={e => setQuery(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && handleSearch()}
           placeholder="Что ищем? (Арматура, бетон...)"
           className="flex-1 bg-transparent px-6 text-white text-sm outline-none font-bold h-14"
         />
         <button 
           onClick={handleSearch}
           disabled={loading}
           className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${query.trim() ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-600'}`}
         >
            {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="text-xl">🔍</span>}
         </button>
      </div>

      {result && (
        <div className="space-y-6 animate-slide-up">
           <div className="bg-[#0f0f0f] p-8 rounded-[40px] border border-white/5 text-left shadow-2xl">
              <h4 className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-4 italic">РЕЗУЛЬТАТ ПОИСКА:</h4>
              <div className="text-zinc-300 text-[14px] leading-relaxed whitespace-pre-wrap italic font-medium">
                {result}
              </div>
           </div>

           {sources.length > 0 && (
             <div className="space-y-3">
                <h4 className="text-[10px] text-zinc-700 font-black uppercase tracking-widest ml-4">ИСТОЧНИКИ:</h4>
                {sources.map((s, i) => (
                  s.web && (
                    <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-[#121212] p-6 rounded-[30px] border border-white/5 text-left active-press">
                       <span className="text-white text-[12px] font-black uppercase italic block truncate mb-1">{s.web.title}</span>
                       <span className="text-[#D4AF37] text-[8px] truncate block mono uppercase">{s.web.uri}</span>
                    </a>
                  )
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default MaterialsSearch;
