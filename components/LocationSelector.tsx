
import React, { useState, useMemo } from 'react';
import { Screen, Location } from '../types';
import { REGIONS, CITIES } from '../constants';

interface Props {
  onSelect: (loc: Location | null) => void;
  navigate: (screen: Screen) => void;
}

const LocationSelector: React.FC<Props> = ({ onSelect, navigate }) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegions = useMemo(() => {
    return REGIONS.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const filteredCities = useMemo(() => {
    if (!selectedRegionId) return [];
    return CITIES.filter(c => c.parentId === selectedRegionId && c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedRegionId, searchQuery]);

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button 
          onClick={() => selectedRegionId ? setSelectedRegionId(null) : navigate(Screen.HOME)} 
          className="w-10 h-10 bg-[#161616] card-border rounded-xl flex items-center justify-center text-[#F5C518] active-scale"
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">
            {selectedRegionId ? 'ВЫБЕРИ ГОРОД' : 'ВЫБЕРИ РЕГИОН'}
          </h2>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">
            {selectedRegionId ? REGIONS.find(r => r.id === selectedRegionId)?.name : 'По всей России'}
          </span>
        </div>
      </header>

      <div className="relative mb-6">
        <input 
          type="text"
          placeholder="Поиск населенного пункта..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#161616] card-border rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-[#F5C518] transition-colors shadow-lg"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
      </div>

      {!selectedRegionId && !searchQuery && (
        <button 
          onClick={() => onSelect(null)}
          className="bg-gradient-to-br from-[#F5C518] to-[#9A7D0A] p-6 rounded-[28px] mb-6 active-scale text-left shadow-xl group"
        >
          <h3 className="text-xl font-black text-black uppercase italic leading-none mb-1">ВСЯ РОССИЯ</h3>
          <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Показывать объявления везде</p>
        </button>
      )}

      <div className="grid grid-cols-1 gap-3">
        {selectedRegionId ? (
          filteredCities.map(city => (
            <button 
              key={city.id}
              onClick={() => onSelect(city)}
              className="bg-[#161616] card-border p-5 rounded-2xl flex items-center justify-between active-scale group"
            >
              <span className="text-white font-black uppercase italic tracking-tight">{city.name}</span>
              <span className="text-[10px] text-[#F5C518] font-black">{city.count} объявл.</span>
            </button>
          ))
        ) : (
          filteredRegions.map(region => (
            <button 
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className="bg-[#161616] card-border p-6 rounded-2xl flex items-center justify-between active-scale hover:bg-[#1e1e1e] group"
            >
              <div className="flex flex-col items-start">
                <span className="text-white font-black text-lg uppercase italic tracking-tighter leading-none mb-1 group-hover:text-[#F5C518] transition-colors">{region.name}</span>
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{region.id.split('-')[1]} РЕГИОН</span>
              </div>
              <div className="text-right">
                 <span className="text-[#F5C518] text-xs font-black italic">{region.count}</span>
                 <p className="text-[8px] text-zinc-700 font-black uppercase tracking-tighter">ОБЪЯВЛЕНИЙ</p>
              </div>
            </button>
          ))
        )}
      </div>

      {searchQuery && filteredRegions.length === 0 && filteredCities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-20"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
           <span className="text-[10px] font-black uppercase tracking-widest italic">Ничего не найдено, мужик</span>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
