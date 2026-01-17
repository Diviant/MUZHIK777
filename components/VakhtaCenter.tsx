
import React, { useState, useMemo } from 'react';
import { Screen, Job, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  jobs: Job[];
  user: User;
  navigate: (screen: Screen) => void;
  onStartChat: (p: Partial<User>) => void;
}

const VakhtaCenter: React.FC<Props> = ({ jobs, user, navigate, onStartChat }) => {
  const [activeCycle, setActiveCycle] = useState<string>('Все');
  const [filters, setFilters] = useState({ housing: false, food: false, travel: false });

  const cycles = ['Все', '15/15', '30/30', '60/30', '90/30'];

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      if (!j.isVahta) return false;
      if (activeCycle !== 'Все' && j.vakhtaDuration !== activeCycle) return false;
      if (filters.housing && !j.housing) return false;
      if (filters.food && !j.food) return false;
      if (filters.travel && !j.travel) return false;
      return true;
    });
  }, [jobs, activeCycle, filters]);

  return (
    <Layout title="ВАХТА-ЦЕНТР" subtitle="Проверенные объекты">
      <div className="mb-6 space-y-4">
        {/* Cycle Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {cycles.map(c => (
            <button 
              key={c} 
              onClick={() => setActiveCycle(c)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCycle === c ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Amenity Filters */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'housing', label: '🏠 Жилье', active: filters.housing },
            { id: 'food', label: '🥘 Еда', active: filters.food },
            { id: 'travel', label: '✈️ Проезд', active: filters.travel }
          ].map(f => (
            <button 
              key={f.id}
              onClick={() => setFilters(prev => ({ ...prev, [f.id]: !f.active }))}
              className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${f.active ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="py-20 text-center opacity-20 font-black uppercase italic">Таких вахт сейчас нет</div>
        ) : (
          filteredJobs.map(job => (
            <WorkshopCard
              key={job.id}
              badge={job.isVerifiedVakhta ? "🔥 РЕАЛЬНАЯ ВАХТА" : `${job.vakhtaDuration || 'ВАХТА'}`}
              title={job.title}
              price={job.salary}
              details={job.region}
              description={job.description}
              footerLeft={
                <div className="flex gap-2">
                  {job.housing && <span title="Жилье">🏠</span>}
                  {job.food && <span title="Питание">🥘</span>}
                  {job.travel && <span title="Проезд">✈️</span>}
                </div>
              }
              footerRight={
                <div className="flex gap-2">
                  <button 
                    onClick={() => onStartChat({ id: job.authorId, firstName: 'Работодатель' })} 
                    className="bg-[#D4AF37] text-black text-[10px] font-black px-6 py-2.5 rounded-xl uppercase italic shadow-lg"
                  >
                    ОТКЛИКНУТЬСЯ
                  </button>
                </div>
              }
            />
          ))
        )}
      </div>

      <div className="mt-8 p-6 bg-zinc-900/40 border border-[#D4AF37]/20 rounded-[30px] text-left">
         <h4 className="text-[10px] gold-text font-black uppercase mb-2">ПОДСКАЗКА БУГРА</h4>
         <p className="text-[10px] text-zinc-500 italic font-bold leading-relaxed uppercase">
           Мужики, всегда уточняйте условия в чате. Отметка "Реальная вахта" означает, что объект проверен нашими модераторами лично.
         </p>
      </div>
    </Layout>
  );
};

export default VakhtaCenter;
