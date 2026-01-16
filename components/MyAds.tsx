
import React, { useMemo } from 'react';
import { Screen, User, Job, ServiceRequest, Team, AutoService, HeavyMachinery, HitchhikingCargo, MarketItem } from '../types';

interface Props {
  user: User;
  navigate: (screen: Screen) => void;
  jobs: Job[];
  services: ServiceRequest[];
  cargo?: HitchhikingCargo[];
  teams: Team[];
  autoServices: AutoService[];
  machinery: HeavyMachinery[];
  marketItems?: MarketItem[];
  onDeleteJob: (id: string) => void;
  onDeleteService: (id: string) => void;
  onDeleteCargo: (id: string) => void;
  onDeleteTeam: (id: string) => void;
  onDeleteAutoService: (id: string) => void;
  onDeleteMachinery: (id: string) => void;
  onDeleteMarketItem: (id: string) => void;
}

const MyAds: React.FC<Props> = ({ 
  user, navigate, jobs, services, cargo = [], teams, autoServices, machinery, marketItems = [],
  onDeleteJob, onDeleteService, onDeleteCargo, onDeleteTeam, onDeleteAutoService, onDeleteMachinery, onDeleteMarketItem
}) => {
  const myJobs = useMemo(() => jobs.filter(j => j.authorId === user.id), [jobs, user.id]);
  const myServices = useMemo(() => services.filter(s => s.authorId === user.id), [services, user.id]);
  const myCargo = useMemo(() => cargo.filter(c => c.authorId === user.id), [cargo, user.id]);
  const myTeams = useMemo(() => teams.filter(t => t.authorId === user.id), [teams, user.id]);
  const myAutoServices = useMemo(() => autoServices.filter(as => as.authorId === user.id), [autoServices, user.id]);
  const myMachinery = useMemo(() => machinery.filter(m => m.authorId === user.id), [machinery, user.id]);
  const myMarket = useMemo(() => marketItems.filter(m => m.authorId === user.id), [marketItems, user.id]);

  const tg = (window as any).Telegram?.WebApp;

  const safeConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (tg && tg.showConfirm) {
      tg.showConfirm(message, callback);
    } else {
      callback(window.confirm(message));
    }
  };

  const allMyAds = useMemo(() => [
    ...myJobs.map(j => ({ ...j, type: 'Вакансия' })),
    ...myServices.map(s => ({ ...s, type: 'Услуга' })),
    ...myCargo.map(c => ({ ...c, type: 'Груз' })),
    ...myTeams.map(t => ({ ...t, type: 'Бригада' })),
    ...myAutoServices.map(as => ({ ...as, type: 'Автосервис' })),
    ...myMachinery.map(m => ({ ...m, type: 'Техника' })),
    ...myMarket.map(m => ({ ...m, type: 'Барахолка' })),
  ], [myJobs, myServices, myCargo, myTeams, myAutoServices, myMachinery, myMarket]);

  const handleDelete = (ad: any) => {
    safeConfirm(`Удалить объявление "${ad.title || ad.name || ad.model}"?`, (confirmed) => {
      if (confirmed) {
        switch (ad.type) {
          case 'Вакансия': onDeleteJob(ad.id); break;
          case 'Услуга': onDeleteService(ad.id); break;
          case 'Груз': onDeleteCargo(ad.id); break;
          case 'Бригада': onDeleteTeam(ad.id); break;
          case 'Автосервис': onDeleteAutoService(ad.id); break;
          case 'Техника': onDeleteMachinery(ad.id); break;
          case 'Барахолка': onDeleteMarketItem(ad.id); break;
        }
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar bg-[#0E0E0E]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-[#161616] card-border rounded-xl flex items-center justify-center text-[#F5C518] shadow-lg">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">МОИ ОБЪЯВЛЕНИЯ</h2>
      </header>

      {allMyAds.length === 0 ? (
        <div className="py-20 text-center opacity-20 font-black uppercase italic">Пусто, мужик</div>
      ) : (
        <div className="space-y-4">
          {allMyAds.map((ad: any) => (
            <div key={`${ad.type}-${ad.id}`} className="bg-[#161616] card-border p-5 rounded-[24px] border border-white/5 relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <span className="text-[7px] bg-[#F5C518] text-black px-1.5 py-0.5 rounded font-black italic mr-2 uppercase">{ad.type}</span>
                   <h3 className="text-sm font-black text-white uppercase italic mt-1">{ad.title || ad.name || ad.model}</h3>
                </div>
                <button onClick={() => handleDelete(ad)} className="text-zinc-600 hover:text-red-500 transition-colors">✕</button>
              </div>
              <p className="text-[#F5C518] text-xs font-black italic">{ad.salary || ad.price || ad.rate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAds;
