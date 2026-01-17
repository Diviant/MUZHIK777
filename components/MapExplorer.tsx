
import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
  user: User;
}

const MapExplorer: React.FC<Props> = ({ navigate, user }) => {
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setUserPos({ lat: 55.7558, lng: 37.6173 }); // Москва дефолт
        setLoading(false);
      }
    );
  }, []);

  const mockEntities = [
    { id: 1, type: 'TECH', label: '🚜 Экскаватор JCB', dist: '1.2 км', lat: 55.76, lng: 37.62 },
    { id: 2, type: 'TEAM', label: '👥 Бригада Монолит', dist: '0.8 км', lat: 55.75, lng: 37.61 },
    { id: 3, type: 'OBJECT', label: '🏗️ ЖК "Мастер"', dist: '3.4 км', lat: 55.74, lng: 37.63 },
  ];

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col relative h-full">
      {/* Search Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-50 flex gap-3">
        <button 
          onClick={() => navigate(Screen.HOME)}
          className="w-12 h-12 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#D4AF37] border border-white/10 shadow-2xl active:scale-95 transition-all"
        >
          ←
        </button>
        <div className="flex-1 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex items-center gap-3 shadow-2xl">
          <span className="text-xl">🔍</span>
          <input 
            placeholder="Что ищем рядом?" 
            className="bg-transparent border-none text-white text-xs font-black uppercase italic outline-none flex-1 placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Map Mock Content (Industrial Style) */}
      <div className="flex-1 flex items-center justify-center relative blueprint overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest animate-pulse">ОПРЕДЕЛЕНИЕ_КООРДИНАТ...</span>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Grid and Ambient Map elements */}
            <div className="absolute inset-0 blueprint opacity-20"></div>
            
            {/* Mock Markers */}
            {mockEntities.map(ent => (
              <button 
                key={ent.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 p-3 bg-black/90 border border-[#D4AF37]/50 rounded-2xl shadow-2xl active:scale-110 transition-all group"
                style={{ top: '45%', left: '55%' }} // Random mapping for mock
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{ent.label.split(' ')[0]}</span>
                  <div className="hidden group-focus:flex absolute bottom-full mb-3 bg-[#D4AF37] text-black px-3 py-1.5 rounded-xl font-black text-[9px] uppercase italic whitespace-nowrap shadow-2xl animate-in fade-in slide-in-from-bottom-1">
                    {ent.label.split(' ').slice(1).join(' ')} • {ent.dist}
                  </div>
                </div>
              </button>
            ))}

            {/* User Pointer */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-full animate-ping absolute -inset-2"></div>
               <div className="w-4 h-4 bg-[#D4AF37] rounded-full border-4 border-black shadow-2xl"></div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Footer Overlay */}
      <div className="absolute bottom-10 left-6 right-6 z-50 flex gap-2 overflow-x-auto no-scrollbar">
        {['ТЕХНИКА', 'БРИГАДЫ', 'МАТЕРИАЛЫ', 'ОБЪЕКТЫ'].map(cat => (
          <button 
            key={cat}
            className="bg-black/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap hover:text-[#D4AF37] transition-colors shadow-2xl active-press"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapExplorer;
