
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

  useEffect(() => {
    if (user) {
      db.getNotes(user.id).then(res => {
        setNotes(res);
        setLoading(false);
      });
    }
  }, [user]);

  const addNote = async () => {
    if (!inputText.trim() || !user) return;
    const tempText = inputText;
    setInputText('');
    await db.addNote(user.id, tempText);
    const updated = await db.getNotes(user.id);
    setNotes(updated);
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    await db.deleteNote(id);
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">МОИ ЗАМЕТКИ</h2>
      </header>

      <div className="glass p-2 rounded-[32px] border border-white/10 flex items-center gap-2 mb-8 shadow-2xl">
         <input 
           type="text" 
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && addNote()}
           placeholder="Запиши важное..."
           className="flex-1 bg-transparent px-4 text-white text-sm outline-none font-bold"
         />
         <button 
           onClick={addNote}
           className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${inputText.trim() ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'bg-zinc-800 text-zinc-600'}`}
         >
            ➕
         </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center opacity-20 font-black uppercase italic animate-pulse">Синхронизация с базой...</div>
        ) : notes.length === 0 ? (
          <div className="py-20 text-center opacity-10 font-black uppercase italic">Заметок пока нет</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-[#121212] p-5 rounded-[28px] border border-white/5 relative group animate-slide-up">
               <button onClick={() => deleteNote(note.id)} className="absolute top-4 right-4 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">✕</button>
               <p className="text-zinc-300 text-sm italic pr-6 text-left whitespace-pre-wrap">{note.text}</p>
               <div className="mt-4 flex justify-start">
                  <span className="text-[7px] text-zinc-700 font-black uppercase tracking-widest">
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;
