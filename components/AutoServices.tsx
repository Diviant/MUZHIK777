
import React, { useState } from 'react';
import { Screen, AutoService, Location } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  autoServices: AutoService[];
  navigate: (screen: Screen) => void;
  onAddService: (as: AutoService) => void;
  location: Location | null;
}

const AutoServices: React.FC<Props> = ({ autoServices, navigate, onAddService, location }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Малярка', address: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddService({ ...formData, id: Date.now().toString(), rating: 5.0, cityId: location?.id, contact: 'https://t.me/car_master', features: [] });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="ДОБАВИТЬ СТО" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Название сервиса" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input placeholder="Адрес" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, address: e.target.value})} required />
          <textarea placeholder="Какие услуги оказываете?" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl">Разместить</button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="АВТОЦЕХ" onBack={() => navigate(Screen.HOME)} subtitle={location?.name}>
      <button onClick={() => setIsCreating(true)} className="active-scale w-full border border-dashed border-[#F5C518]/30 bg-[#F5C518]/5 text-white font-black py-4 rounded-2xl uppercase italic mb-6 shadow-sm">
        Добавить свой сервис
      </button>

      <div className="space-y-4">
        {autoServices.map((as) => (
          <WorkshopCard
            key={as.id}
            badge={as.category}
            title={as.name}
            price={`${as.rating} ⭐`}
            details={as.address}
            description={as.description}
            footerRight={
              <a href={as.contact} target="_blank" className="bg-[#F5C518] text-black text-[10px] font-black px-6 py-2.5 rounded-xl uppercase italic shadow-lg">
                СВЯЗАТЬСЯ
              </a>
            }
          />
        ))}
      </div>
    </Layout>
  );
};

export default AutoServices;
