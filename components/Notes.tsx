
import React, { useState, useEffect } from 'react';
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
  const isGuest = user?.id === 'guest';

  const loadNotes = async () => {
    setLoading(true);
    if (isGuest) {
      const local = localStorage.getItem('muzhik_local_notes');
      setNotes(local ? JSON.parse(local) : []);
    } else if (user) {
      const res = await db.getNotes(user.id);
      setNotes(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const addNote = async () => {
    if (!inputText.trim() || !user) return;
    const tempText = inputText;
    setInputText('');

    if (isGuest) {
      const newNote: Note = { id: Date.now().toString(), text: tempText, timestamp: Date.now() };
      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem('muzhik_local_notes', JSON.stringify(updated));
    } else {
      await db.addNote(user.id, tempText);
      await loadNotes();
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    if (isGuest) {
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      localStorage.setItem('muzhik_local_notes', JSON.stringify(updated));
    } else {
      setNotes(prev => prev.filter(n => n.id !== id));
      await db.deleteNote(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe relative h-full">
      <header className="flex items-center justify-between py-6 mb-8 border-b border-white/5 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-30 px-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.PROFILE)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">←</button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">МОИ ЗАМЕТКИ</h2>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1 h-1 rounded-full ${isGuest ? 'bg-blue-500' : 'bg-green-500'}`}></div>
               <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest italic mono leading-none">
                 {isGuest ? 'LOCAL_STORAGE_ACTIVE' : 'CLOUD_SYNC_ENABLED'}
               </span>
            </div>
          </div>
        </div>
      </header>

      {/* INPUT CONTAINER */}
      <div className="bg-[#121212] p-2 rounded-[35px] border border-white/10 flex items-center gap-2 mb-10 shadow-2xl relative">
         <div className="absolute -top-[1px] left-10 right-10 h-[1px] bg-[#D4AF37]/30"></div>
         <input 
           type="text" 
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && addNote()}
           placeholder="Запиши важное..."
           className="flex-1 bg-transparent px-6 text-white text-sm outline-none font-bold placeholder:text-zinc-800 h-14"
         />
         <button 
           onClick={addNote}
           className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${inputText.trim() ? 'bg-[#D4AF37] text-black shadow-lg' : 'bg-zinc-800 text-zinc-600'}`}
         >
            <span className="text-xl leading-none">➕</span>
         </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center opacity-20 font-black uppercase italic animate-pulse mono text-[10px] tracking-widest">SCANNING_LOG_FILES...</div>
        ) : notes.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[45px] opacity-10 flex flex-col items-center">
             <span className="text-6xl block mb-6">📝</span>
             <p className="font-black italic uppercase tracking-widest text-white">АРХИВ ПУСТ</p>
             <p className="text-[8px] mt-2 font-bold opacity-50 uppercase tracking-tighter">Начни вводить текст выше</p>
          </div>
        ) : (
          notes.map((note, i) => (
            <div 
              key={note.id} 
              className="bg-[#0f0f0f] p-7 rounded-[35px] border border-white/5 relative group animate-slide-up shadow-xl"
              style={{ animationDelay: `${i * 50}ms` }}
            >
               <button 
                onClick={() => deleteNote(note.id)} 
                className="absolute top-6 right-6 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-zinc-800 active:text-red-500 transition-all border border-white/5"
               >
                 ✕
               </button>
               <p className="text-zinc-300 text-[15px] italic pr-10 text-left whitespace-pre-wrap leading-relaxed font-medium">
                 {note.text}
               </p>
               <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mono">
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[6px] text-zinc-800 font-black uppercase tracking-widest mono">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-10"></div>
               </div>
            </div>
          ))
        )}
      </div>
      
      {isGuest && notes.length > 0 && (
        <div className="mt-8 p-6 bg-blue-900/10 border border-blue-500/20 rounded-[30px] animate-pulse">
           <p className="text-[9px] text-blue-400 font-black uppercase italic leading-tight text-center tracking-widest">
             ВНИМАНИЕ: ТЫ В РЕЖИМЕ ГОСТЯ. ЗАМЕТКИ ХРАНЯТСЯ ТОЛЬКО НА ЭТОМ ТЕЛЕФОНЕ.
           </p>
        </div>
      )}

      <div className="mt-12 p-8 bg-zinc-900/10 border border-white/5 rounded-[40px] opacity-20">
         <p className="text-[9px] text-zinc-700 font-black uppercase italic leading-relaxed text-center tracking-[0.3em]">
           БОРТОВОЙ ЖУРНАЛ МАСТЕРА. <br/> ВСЕ МЫСЛИ В ОДНОМ ЦЕХЕ.
         </p>
      </div>
    </div>
  );
};

export default Notes;
