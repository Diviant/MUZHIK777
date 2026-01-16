
import React, { useState } from 'react';
import { Screen, ServiceRequest, Location, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  services: ServiceRequest[];
  navigate: (screen: Screen) => void;
  onAddService: (s: ServiceRequest) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const Services: React.FC<Props> = ({ services, navigate, onAddService, location, onStartChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ category: 'Сантехника', title: '', description: '', price: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddService({ 
      ...formData, 
      id: Date.now().toString(), 
      author: 'Мастер', 
      contact: 'https://t.me/your_tg', 
      cityId: location?.id 
    });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="СОЗДАТЬ ЗАКАЗ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Что нужно сделать?" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, title: e.target.value})} required />
          <input placeholder="Бюджет (₽)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-[#F5C518] font-black outline-none" onChange={e => setFormData({...formData, price: e.target.value})} required />
          <textarea placeholder="Описание деталей" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[120px]" onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl">Разместить</button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="УСЛУГИ" onBack={() => navigate(Screen.HOME)} subtitle={location ? `Город: ${location.name}` : "По всей России"}>
      <button onClick={() => setIsCreating(true)} className="active-scale w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-6">
        Нужна помощь мужика
      </button>

      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black italic uppercase">Заказов пока нет</div>
        ) : (
          services.map((s) => (
            <WorkshopCard
              key={s.id}
              badge={s.category}
              title={s.title}
              price={s.price}
              description={s.description}
              footerLeft={
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-zinc-800 rounded-md flex items-center justify-center text-[10px] text-zinc-500">👤</div>
                  <span className="text-[10px] text-white font-black uppercase italic">{s.author}</span>
                </div>
              }
              footerRight={
                <div className="flex gap-2">
                  <button onClick={() => onStartChat({ id: s.authorId || 'sys', firstName: s.author })} className="bg-[#F5C518] text-black text-[10px] font-black px-4 py-2 rounded-lg uppercase">ЧАТ</button>
                  <a href={s.contact} target="_blank" className="bg-zinc-800 text-zinc-500 text-[10px] font-black px-3 py-2 rounded-lg">TG</a>
                </div>
              }
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Services;
