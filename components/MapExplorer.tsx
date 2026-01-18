
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

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = L_CSS;
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = L_JS;
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setupMap(L, [latitude, longitude]);
      },
      () => {
        setupMap(L, [55.7558, 37.6173]); // Москва дефолт
      }
    );
  };

  const setupMap = (L: any, center: [number, number]) => {
    if (mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(center, 13);

    // Dark Industrial Map Theme (using CSS filter on standard tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Marker styling for user
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="relative w-8 h-8">
          <div class="absolute inset-0 bg-[#D4AF37] rounded-full animate-ping opacity-30"></div>
          <div class="absolute inset-2 bg-[#D4AF37] rounded-full border-4 border-black shadow-xl"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker(center, { icon: userIcon }).addTo(mapInstance.current);

    // Mock markers around user
    const mocks = [
      { id: 1, lat: center[0] + 0.005, lng: center[1] + 0.01, type: 'TECH', label: '🚜 JCB 3CX', detail: '3000 ₽/час' },
      { id: 2, lat: center[0] - 0.008, lng: center[1] - 0.005, type: 'TEAM', label: '👥 БРИГАДА МОНОЛИТ', detail: '8 человек' },
      { id: 3, lat: center[0] + 0.012, lng: center[1] - 0.008, type: 'OBJECT', label: '🏗️ ОБЪЕКТ: ЖК СЕВЕР', detail: 'Ищут сварщиков' },
      { id: 4, lat: center[0] - 0.015, lng: center[1] + 0.015, type: 'TECH', label: '🚚 КАМАЗ 65115', detail: '2500 ₽/рейс' },
    ];

    mocks.forEach(m => {
      const customIcon = L.divIcon({
        className: 'muz-marker',
        html: `
          <div class="bg-black/90 border border-[#D4AF37]/40 p-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-125 transition-transform">
            <span class="text-2xl">${m.label.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [45, 45],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(mapInstance.current);
      
      marker.bindPopup(`
        <div class="p-4 bg-[#0a0a0a] rounded-2xl text-left min-w-[160px] border border-[#D4AF37]/20">
          <span class="text-[8px] text-[#D4AF37] font-black uppercase tracking-widest block mb-1">${m.type}</span>
          <h4 class="text-white font-black uppercase italic text-xs mb-2">${m.label.split(' ').slice(1).join(' ')}</h4>
          <p class="text-zinc-500 text-[10px] font-bold uppercase italic">${m.detail}</p>
          <button onclick="window.location.hash='chat'" class="w-full mt-4 bg-[#D4AF37] text-black font-black py-2 rounded-xl text-[9px] uppercase italic">СВЯЗАТЬСЯ</button>
        </div>
      `, {
        className: 'muz-popup',
        closeButton: false
      });
    });

    setLoading(false);
  };

  const categories = [
    { id: 'ВСЕ', label: 'ВСЕ' },
    { id: 'TECH', label: 'ТЕХНИКА' },
    { id: 'TEAM', label: 'БРИГАДЫ' },
    { id: 'OBJECT', label: 'ОБЪЕКТЫ' },
    { id: 'SERVICES', label: 'СТО' }
  ];

  return (
    <div className="flex-1 bg-[#050505] flex flex-col relative h-full overflow-hidden">
      {/* MAP LAYER */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0 bg-zinc-900"
        style={{ 
          filter: 'invert(100%) hue-rotate(180deg) brightness(0.6) contrast(1.2) saturate(0.5)' 
        }}
      ></div>

      {/* OVERLAY UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col p-6 pt-safe">
        {/* Search Header */}
        <div className="flex gap-3 pointer-events-auto">
          <button 
            onClick={() => navigate(Screen.HOME)}
            className="w-14 h-14 bg-black/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-[#D4AF37] border border-white/10 shadow-2xl active-press"
          >
            ←
          </button>
          <div className="flex-1 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 px-6 flex items-center gap-4 shadow-2xl">
            <span className="text-xl">🔍</span>
            <input 
              placeholder="ПОИСК РЯДОМ С ТОБОЙ..." 
              className="bg-transparent border-none text-white text-[11px] font-black uppercase italic outline-none flex-1 placeholder:text-zinc-700 tracking-widest"
            />
          </div>
        </div>

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6"></div>
             <div className="px-6 py-2 bg-black/80 backdrop-blur-md border border-[#D4AF37]/20 rounded-full">
               <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.5em] animate-pulse">SCANNING_REGION...</span>
             </div>
          </div>
        )}

        <div className="mt-auto">
           {/* Category Filters */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto pb-4">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-7 py-4 rounded-2xl border transition-all whitespace-nowrap active-press shadow-2xl font-black text-[10px] uppercase italic tracking-widest ${
                    activeCategory === cat.id 
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-black scale-105' 
                    : 'bg-black/90 backdrop-blur-xl border-white/10 text-zinc-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* MAP STYLES OVERRIDE */}
      <style>{`
        .leaflet-container { background: #050505 !important; }
        .muz-marker { overflow: visible !important; }
        .leaflet-popup-content-wrapper { 
          background: transparent !important; 
          padding: 0 !important;
          box-shadow: none !important;
        }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .muz-popup { pointer-events: auto; }
      `}</style>
    </div>
  );
};

export default MapExplorer;
