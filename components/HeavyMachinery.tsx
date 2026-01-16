
import React, { useState } from 'react';
import { Screen, HeavyMachinery, Location } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  machinery: HeavyMachinery[];
  navigate: (screen: Screen) => void;
  onAddMachinery: (item: HeavyMachinery) => void;
  location: Location | null;
}

const HeavyMachineryScreen: React.FC<Props> = ({ machinery, navigate, onAddMachinery, location }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ type: 'Экскаватор', model: '', rate: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMachinery({ ...formData, id: Date.now().toString(), cityId: location?.id, contact: 'https://t.me/tech_boss', includesOperator: true, includesFuel: true, specs: [] });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="АРЕНДА ТЕХНИКИ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Тип (Экскаватор, Кран...)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, type: e.target.value})} required />
          <input placeholder="Модель" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, model: e.target.value})} required />
          <input placeholder="Цена (₽ / час)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-[#F5C518] font-black outline-none" onChange={e => setFormData({...formData, rate: e.target.value})} required />
          <textarea placeholder="Описание тех. состояния" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl">Добавить в базу</button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="СПЕЦТЕХНИКА" onBack={() => navigate(Screen.HOME)} subtitle={location?.name}>
      <button onClick={() => setIsCreating(true)} className="active-scale w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-6">
        Сдать технику в аренду
      </button>

      <div className="space-y-4">
        {machinery.map((m) => (
          <WorkshopCard
            key={m.id}
            badge={m.type}
            title={m.model}
            price={m.rate}
            description={m.description}
            footerLeft={
              <div className="flex gap-2">
                 <span className="text-[7px] bg-green-900/20 text-green-400 px-1.5 py-0.5 rounded border border-green-900/20 font-black">С ОПЕРАТОРОМ</span>
              </div>
            }
            footerRight={
              <a href={m.contact} target="_blank" className="bg-white text-black text-[10px] font-black px-5 py-2 rounded-lg uppercase italic">ЗАКАЗАТЬ</a>
            }
          />
        ))}
      </div>
    </Layout>
  );
};

export default HeavyMachineryScreen;
