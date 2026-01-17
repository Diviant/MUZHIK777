
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { db } from '../database';

interface Props {
  user: User;
  navigate: (screen: Screen) => void;
  onUpdate: (fields: Partial<User>) => void;
}

const Gallery: React.FC<Props> = ({ user, navigate, onUpdate }) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addPortfolio = async () => {
    if (!newImageUrl.trim()) return;
    await db.addPortfolioImage(user.id, newImageUrl);
    onUpdate({ portfolioImages: [...(user.portfolioImages || []), newImageUrl] });
    setNewImageUrl('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#050505] relative z-10 pt-safe h-full">
      <header className="flex items-center justify-between py-6 mb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(Screen.PROFILE)} 
            className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press"
          >
            ←
          </button>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ПОРТФОЛИО</h2>
            <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mono mt-1 italic">STORAGE_01_PRO</span>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#D4AF37] text-black w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black active-press shadow-lg shadow-[#D4AF37]/10"
        >
          +
        </button>
      </header>

      {/* GALLERY GRID */}
      {user.portfolioImages && user.portfolioImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {user.portfolioImages.map((img, i) => (
            <div key={i} className="aspect-square bg-zinc-900 rounded-[30px] overflow-hidden border border-white/5 shadow-2xl relative group">
              <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={`Project ${i}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-4 left-4 text-[7px] text-white font-black uppercase tracking-[0.2em] mono opacity-0 group-hover:opacity-100 transition-opacity">
                IMG_REF_{i.toString().padStart(3, '0')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-[40px] mb-10">
          <span className="text-7xl mb-6">📸</span>
          <p className="font-black italic uppercase tracking-[0.2em] text-white">АРХИВ ПУСТ</p>
          <p className="text-[10px] mt-2 font-bold italic">Добавь фото своих объектов</p>
        </div>
      )}

      {/* ADD MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/10 w-full max-w-sm text-center shadow-2xl relative">
            <h3 className="text-xl font-black text-white uppercase italic mb-6 tracking-tighter leading-none gold-text">ДОБАВИТЬ В АРХИВ</h3>
            <div className="space-y-4 mb-8">
              <div className="space-y-1 text-left">
                <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">URL изображения</label>
                <input 
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="ВСТАВИТЬ_ССЫЛКУ..."
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-[11px] text-white font-bold outline-none focus:border-[#D4AF37]/30 transition-colors placeholder:text-zinc-800"
                />
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={addPortfolio} 
                className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-[20px] uppercase italic shadow-xl active:scale-95 transition-transform"
              >
                ЗАГРУЗИТЬ
              </button>
              <button 
                onClick={() => setIsAdding(false)} 
                className="w-full text-zinc-600 font-black py-4 rounded-[20px] uppercase italic text-[10px] tracking-widest active-press"
              >
                ОТМЕНА
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
