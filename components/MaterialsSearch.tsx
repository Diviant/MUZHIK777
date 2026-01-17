
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
        contents: `Найди актуальные цены и места продажи: ${query} в регионе ${location?.name || 'Россия'}. Дай краткую сводку по ценам и надежным поставщикам.`,
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
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">СНАБЖЕНЕЦ</h2>
      </header>

      <div className="glass p-2 rounded-[32px] border border-white/10 flex items-center gap-2 mb-6 shadow-2xl">
         <input 
           type="text" 
           value={query}
           onChange={e => setQuery(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && handleSearch()}
           placeholder="Что ищем? (Арматура, кирпич...)"
           className="flex-1 bg-transparent px-4 text-white text-sm outline-none font-bold"
         />
         <button 
           onClick={handleSearch}
           disabled={loading}
           className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${query.trim() ? 'bg-[#F5C518] text-black' : 'bg-zinc-800 text-zinc-600'}`}
         >
            {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : '🔍'}
         </button>
      </div>

      {result && (
        <div className="space-y-6 animate-slide-up">
           <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 text-left">
              <h4 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest mb-4">Сводка по рынку:</h4>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                {result}
              </div>
           </div>

           {sources.length > 0 && (
             <div className="space-y-2">
                <h4 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest ml-2">Источники / Базы:</h4>
                {sources.map((s, i) => (
                  s.web && (
                    <a key={i} href={s.web.uri} target="_blank" className="block bg-[#161616] p-4 rounded-2xl border border-white/5 text-left active:scale-98 transition-all">
                       <span className="text-white text-[11px] font-black uppercase italic block truncate">{s.web.title}</span>
                       <span className="text-zinc-600 text-[9px] truncate block">{s.web.uri}</span>
                    </a>
                  )
                ))}
             </div>
           )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-10">
           <span className="text-6xl mb-4">🏗️</span>
           <p className="font-black italic uppercase tracking-widest">Введите запрос для поиска материалов</p>
        </div>
      )}
    </div>
  );
};

export default MaterialsSearch;
