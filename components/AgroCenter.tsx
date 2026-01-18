
import React, { useState, useEffect } from 'react';
import { Screen, User, Location, Note } from '../types';
import { GoogleGenAI } from "@google/genai";
import { db } from '../database';

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
  location: Location | null;
}

const AgroCenter: React.FC<Props> = ({ navigate, user, location }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<'RADAR' | 'JOURNAL'>('RADAR');

  useEffect(() => {
    if (user) {
      const loadAgroNotes = async () => {
        const all = await db.getNotes(user.id);
        setNotes(all.filter(n => n.text.includes('[AGRO]')));
      };
      loadAgroNotes();
    }
  }, [user]);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Ты — "Агроном", эксперт КФХ в системе "ЦЕХ". Мужик спрашивает: "${query}" (Регион: ${location?.name || 'РФ'}).
        Дай четкий расклад:
        1. [ДИАГНОЗ / РЕШЕНИЕ] — если про скотину или урожай. Конкретные меры.
        2. [РЫНОК КОРМОВ/УДОБРЕНИЙ] — ориентировочные цены и где искать подвох.
        3. [СОВЕТ БЫВАЛОГО] — секреты экономии или лайфхаки для поля.
        Стиль: Практичный, деревенский, без лишней воды.`,
        config: { tools: [{ googleSearch: {} }] }
      });

      setResult(response.text || 'Связь с полем плохая, повтори.');
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err: any) {
      setResult('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAgroNote = async () => {
    if (!query.trim() || !user) return;
    const note = await db.addNote(user.id, `[AGRO] ${query}`);
    if (note) setNotes([note, ...notes]);
    setQuery('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#0D1108] pt-safe h-full relative">
      <div className="absolute inset-0 blueprint opacity-5 pointer-events-none"></div>
      
      <header className="flex items-center justify-between py-4 mb-4 sticky top-0 bg-[#0D1108]/95 backdrop-blur-md z-40 border-b border-green-900/30 px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#1A1F14] border border-green-900/20 rounded-xl flex items-center justify-center text-green-500 active-press">←</button>
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">АГРОЦЕХ</h2>
            <span className="text-[7px] text-green-700 font-black uppercase tracking-widest mt-1 mono">AGRO_SYSTEM_v1.0</span>
          </div>
        </div>
      </header>

      <div className="flex gap-1 p-1 bg-black/40 rounded-2xl mb-8 border border-green-950">
        <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'RADAR' ? 'bg-green-700 text-white shadow-lg' : 'text-zinc-600'}`}>РАДАР ПОЛЯ</button>
        <button onClick={() => setActiveTab('JOURNAL')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'JOURNAL' ? 'bg-green-700 text-white shadow-lg' : 'text-zinc-600'}`}>ЖУРНАЛ КФХ</button>
      </div>

      {activeTab === 'RADAR' ? (
        <div className="space-y-6">
           <div className="bg-[#1A1F14] p-2 rounded-[35px] border border-green-900/30 flex items-center gap-2 shadow-2xl group focus-within:border-green-500/30 transition-all">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="Корма, лечение скота, запчасти..."
                className="flex-1 bg-transparent px-6 text-white text-[15px] outline-none font-bold h-14 placeholder:text-zinc-800"
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${query.trim() ? 'bg-green-600 text-white shadow-lg' : 'bg-[#0D1108] text-zinc-800'}`}
              >
                 {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '🌾'}
              </button>
           </div>

           {result && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#1A1F14] border-l-4 border-green-600 p-7 rounded-r-[35px] shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl italic font-black">AGRO</div>
                   <div className="text-[#E0E0E0] text-[14px] leading-relaxed italic font-medium whitespace-pre-wrap mb-8">
                      {result}
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(result); alert('В буфере!'); }} className="flex-1 bg-zinc-900 border border-green-900/20 text-green-500 py-4 rounded-xl text-[9px] font-black uppercase italic">КОПИРОВАТЬ</button>
                      <button onClick={addAgroNote} className="flex-1 bg-green-700 text-white py-4 rounded-xl text-[9px] font-black uppercase italic shadow-lg shadow-green-900/20">В ЖУРНАЛ КФХ</button>
                   </div>
                </div>

                {sources.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="text-[10px] text-green-800 font-black uppercase tracking-widest ml-4 mb-2">ПОИСКОВЫЕ УЗЛЫ:</h4>
                    {sources.map((s, i) => s.web && (
                      <a key={i} href={s.web.uri} target="_blank" className="block bg-[#1A1F14] p-5 rounded-[25px] border border-green-900/10 text-left active-press transition-all">
                        <span className="text-white text-[11px] font-black uppercase italic block truncate mb-1">{s.web.title}</span>
                        <span className="text-green-900 text-[8px] truncate block mono uppercase tracking-tight">{s.web.uri}</span>
                      </a>
                    ))}
                  </div>
                )}
             </div>
           )}

           {!result && !loading && (
             <div className="py-20 text-center opacity-10 border-2 border-dashed border-green-900/30 rounded-[45px] flex flex-col items-center">
                <span className="text-7xl mb-6">🚜</span>
                <p className="font-black italic uppercase tracking-[0.3em] text-white">ПОЛЕ ПУСТО</p>
                <p className="text-[9px] mt-2 font-bold px-10 leading-relaxed uppercase">
                  Пробей цены на сено, <br/> узнай как лечить корову <br/> или где запчасти на МТЗ.
                </p>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-4">
           {notes.length === 0 ? (
             <div className="py-20 text-center opacity-10 border-2 border-dashed border-green-900/30 rounded-[45px]">
                <p className="font-black italic uppercase">Нет записей</p>
             </div>
           ) : (
             notes.map((n, i) => (
               <div key={n.id} className="bg-[#1A1F14] p-6 rounded-[30px] border border-green-900/10 relative shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[7px] text-green-700 font-black mono uppercase">{new Date(n.timestamp).toLocaleDateString()}</span>
                    <button onClick={() => db.deleteNote(n.id).then(() => setNotes(notes.filter(x => x.id !== n.id)))} className="text-zinc-800 text-xs">✕</button>
                  </div>
                  <p className="text-zinc-300 text-sm italic font-medium leading-relaxed">{n.text.replace('[AGRO] ', '')}</p>
               </div>
             ))
           )}
        </div>
      )}
    </div>
  );
};

export default AgroCenter;
