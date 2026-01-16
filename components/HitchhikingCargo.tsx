
import React, { useState } from 'react';
import { Screen, HitchhikingCargo, Location, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  cargo: HitchhikingCargo[];
  navigate: (screen: Screen) => void;
  onAddCargo: (c: HitchhikingCargo) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const HitchhikingCargoScreen: React.FC<Props> = ({ cargo, navigate, onAddCargo, location, onStartChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', routeFrom: '', routeTo: '', cargoType: 'Запчасти', weight: '', price: '', departureDate: '', description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCargo({ ...formData, id: Date.now().toString(), contact: 'https://t.me/your_tg' });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="ДОБАВИТЬ ГРУЗ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Что везем?" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, title: e.target.value})} required />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Откуда" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, routeFrom: e.target.value})} required />
            <input placeholder="Куда" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, routeTo: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Вес (кг)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, weight: e.target.value})} />
            <input placeholder="Цена (₽)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-[#F5C518] font-black outline-none" onChange={e => setFormData({...formData, price: e.target.value})} required />
          </div>
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl">Опубликовать</button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="ПОПУТНЫЙ ГРУЗ" onBack={() => navigate(Screen.HOME)}>
      <button 
        onClick={() => setIsCreating(true)} 
        className="active-scale w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-6"
      >
        Передать груз
      </button>

      <div className="space-y-4">
        {cargo.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black italic uppercase">Грузов нет</div>
        ) : (
          cargo.map((item) => (
            <WorkshopCard
              key={item.id}
              badge={`${item.cargoType} • ${item.weight}`}
              title={item.title}
              price={item.price}
              description={item.description}
              footerLeft={
                <div className="flex flex-col">
                  <span className="text-[7px] text-zinc-600 font-black uppercase leading-none mb-1">МАРШРУТ</span>
                  <span className="text-[10px] text-white font-black uppercase italic truncate">{item.routeFrom} → {item.routeTo}</span>
                </div>
              }
              footerRight={
                <div className="flex gap-2">
                  <button onClick={() => onStartChat({ id: item.authorId || 'sys', firstName: 'Мужик' })} className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-lg uppercase">ЧАТ</button>
                  <a href={item.contact} target="_blank" className="bg-zinc-800 text-zinc-500 text-[10px] font-black px-3 py-2 rounded-lg">TG</a>
                </div>
              }
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default HitchhikingCargoScreen;
