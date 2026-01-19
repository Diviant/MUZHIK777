
import React, { useState, useEffect, useRef } from 'react';
import { Screen, User } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
  user: User;
}

const L_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const L_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

const MapExplorer: React.FC<Props> = ({ navigate, user }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ВСЕ');
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = L_CSS;
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = L_JS; script.async = true;
    script.onload = () => {
      // Запрашиваем геолокацию СРАЗУ
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLoc(coords);
          initMap(coords);
        },
        () => initMap([55.7558, 37.6173]) // Дефолт Москва
      );
    };
    document.body.appendChild(script);

    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, []);

  const initMap = (center: [number, number]) => {
    const L = (window as any).L;
    if (!L || !mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(center, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance.current);

    // Маркер игрока (Синий пульсирующий)
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="relative w-10 h-10">
          <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>
          <div class="absolute inset-2 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
            <span class="text-[8px] font-black text-white">Я</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(center, { icon: userIcon }).addTo(mapInstance.current)
      .bindPopup('<div class="font-black p-2 text-black uppercase italic text-[10px]">Ты здесь, мужик</div>');

    // Фейковые объекты рядом
    const mocks = [
      { lat: center[0] + 0.003, lng: center[1] + 0.004, icon: '🚜', label: 'JCB 3CX', sub: '3000 ₽/ч' },
      { lat: center[0] - 0.002, lng: center[1] - 0.005, icon: '👥', label: 'БРИГАДА', sub: '8 чел.' },
      { lat: center[0] + 0.006, lng: center[1] - 0.002, icon: '🏗️', label: 'ОБЪЕКТ', sub: 'Срочно!' },
    ];

    mocks.forEach(m => {
      const icon = L.divIcon({
        className: 'muz-marker',
        html: `<div class="bg-black border border-[#D4AF37] p-2 rounded-xl shadow-xl flex items-center justify-center text-xl">${m.icon}</div>`,
        iconSize: [40, 40]
      });
      L.marker([m.lat, m.lng], { icon }).addTo(mapInstance.current)
        .bindPopup(`
          <div class="p-3 bg-[#0a0a0a] rounded-xl border border-[#D4AF37]/20 text-left min-w-[120px]">
            <h4 class="text-white font-black uppercase italic text-[10px] mb-1">${m.label}</h4>
            <p class="text-[#D4AF37] text-[9px] font-black">${m.sub}</p>
          </div>
        `);
    });

    setLoading(false);
  };

  return (
    <div className="flex-1 bg-[#050505] flex flex-col relative h-full overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0 bg-zinc-900" style={{ filter: 'invert(100%) hue-rotate(180deg) brightness(0.6) contrast(1.2)' }}></div>

      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col p-6 pt-safe">
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={() => navigate(Screen.HOME)} className="w-14 h-14 bg-black/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-[#D4AF37] border border-white/10 shadow-2xl active-press">←</button>
          <div className="flex-1 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 px-6 flex items-center gap-4">
            <span className="text-xl">🔍</span>
            <input placeholder="ЧТО ИЩЕМ РЯДОМ?" className="bg-transparent border-none text-white text-[10px] font-black uppercase italic outline-none flex-1 placeholder:text-zinc-700" />
          </div>
        </div>

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6"></div>
             <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.5em] animate-pulse">ПОИСК_СПУТНИКОВ...</span>
          </div>
        )}

        <div className="mt-auto pointer-events-auto">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
              {['ВСЕ', 'ТЕХНИКА', 'БРИГАДЫ', 'ОБЪЕКТЫ'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-4 rounded-2xl border transition-all whitespace-nowrap font-black text-[9px] uppercase italic tracking-widest ${activeCategory === cat ? 'bg-[#D4AF37] border-[#D4AF37] text-black scale-105' : 'bg-black/90 border-white/10 text-zinc-500'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #050505 !important; }
        .leaflet-popup-content-wrapper { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  );
};

export default MapExplorer;
