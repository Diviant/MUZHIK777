
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, Note, User } from '../types';
import { db } from '../database';

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
}

const Notes: React.FC<Props> = ({ navigate, user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const isGuest = !user || user.id === 'guest';

  const loadNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    if (isGuest) {
      const local = localStorage.getItem('muzhik_local_notes');
      setNotes(local ? JSON.parse(local) : []);
    } else {
      const res = await db.getNotes(user.id);
      setNotes(res);
    }
    setLoading(false);
  }, [user, isGuest]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAddNote = async () => {
    if (!inputText.trim() || !user) return;
    
    const textToSave = inputText.trim();
    setInputText('');
    setIsSyncing(true);

    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const tempNote: Note = { id: tempId, text: textToSave, timestamp: Date.now() };
    setNotes(prev => [tempNote, ...prev]);

    if (isGuest) {
      const updated = [tempNote, ...notes];
      localStorage.setItem('muzhik_local_notes', JSON.stringify(updated));
      setIsSyncing(false);
    } else {
      const savedNote = await db.addNote(user.id, textToSave);
      if (savedNote) {
        setNotes(prev => prev.map(n => n.id === tempId ? savedNote : n));
      } else {
        // Rollback if failed
        setNotes(prev => prev.filter(n => n.id !== tempId));
        alert('Ошибка синхронизации с базой!');
      }
      setIsSyncing(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user) return;
    
    // Optimistic Remove
    setNotes(prev => prev.filter(n => n.id !== id));

    if (isGuest) {
      const local = localStorage.getItem('muzhik_local_notes');
      if (local) {
        const updated = JSON.parse(local).filter((n: Note) => n.id !== id);
        localStorage.setItem('muzhik_local_notes', JSON.stringify(updated));
      }
    } else {
      await db.deleteNote(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full">
      {/* HEADER */}
      <header className="flex items-center justify-between py-4 mb-6 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">←</button>
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">БОРТОВОЙ ЖУРНАЛ</h2>
            <div className="flex items-center gap-1.5 mt-1">
               <div className={`w-1 h-1 rounded-full ${isGuest ? 'bg-blue-500 animate-pulse' : 'bg-[#D4AF37]'}`}></div>
               <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest italic mono">
                 {isGuest ? 'LOCAL_BUFFER' : 'CLOUD_STORAGE_CONNECTED'}
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {isSyncing && <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>}
           <button onClick={loadNotes} className="text-zinc-700 text-xs">↻</button>
        </div>
      </header>

      {/* INPUT BAR */}
      <div className="bg-[#0f0f0f] p-2 rounded-[30px] border border-white/10 flex items-center gap-2 mb-8 shadow-2xl relative group focus-within:border-[#D4AF37]/40 transition-colors">
         <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"></div>
         <input 
           type="text" 
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && handleAddNote()}
           placeholder="Добавить запись в журнал..."
           className="flex-1 bg-transparent px-5 text-white text-sm outline-none font-bold placeholder:text-zinc-800 h-14"
         />
         <button 
           onClick={handleAddNote}
           disabled={!inputText.trim()}
           className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${inputText.trim() ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-zinc-900 text-zinc-800'}`}
         >
            <span className="text-xl">✍️</span>
         </button>
      </div>

      {/* NOTES LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
             <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em] mono">READING_DATA_SECTORS...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[45px] opacity-10 flex flex-col items-center">
             <span className="text-6xl mb-6">📝</span>
             <p className="font-black italic uppercase tracking-[0.3em] text-white">ЖУРНАЛ ПУСТ</p>
             <p className="text-[8px] mt-2 font-bold opacity-50 uppercase tracking-tighter">Все записи будут сохранены здесь</p>
          </div>
        ) : (
          notes.map((note, i) => (
            <div 
              key={note.id} 
              className="bg-[#0f0f0f] p-6 rounded-[35px] border border-white/5 relative group animate-slide-up shadow-xl overflow-hidden"
              style={{ animationDelay: `${i * 40}ms` }}
            >
               <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/10"></div>
               <button 
                onClick={() => handleDeleteNote(note.id)} 
                className="absolute top-5 right-5 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-zinc-800 active:text-red-500 transition-all border border-white/5 z-10"
               >
                 ✕
               </button>
               
               <p className="text-zinc-200 text-[15px] italic pr-10 text-left whitespace-pre-wrap leading-relaxed font-medium">
                 {note.text}
               </p>
               
               <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mono">
                      {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[7px] text-zinc-800 font-black uppercase tracking-widest mono">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#D4AF37]/20 rounded-full"></div>
               </div>
            </div>
          ))
        )}
      </div>

      {isGuest && notes.length > 0 && (
        <div className="mt-8 p-6 bg-blue-900/5 border border-blue-500/10 rounded-[30px] text-center">
           <p className="text-[9px] text-blue-400 font-black uppercase italic leading-tight tracking-widest">
             ВНИМАНИЕ: ЗАПИСИ ХРАНЯТСЯ ЛОКАЛЬНО. <br/> ВОЙДИ В АККАУНТ ДЛЯ ОБЛАЧНОЙ СИНХРОНИЗАЦИИ.
           </p>
        </div>
      )}
    </div>
  );
};

export default Notes;
