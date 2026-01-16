
import React from 'react';
import { Screen, User } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
  currentUser: User | null;
}

// Added missing required properties (isAdmin) to mock data
// Fix: Added isAdmin: false to each mock user to match the User interface in types.ts
const MOCK_MASTERS: User[] = [
  { id: '1', firstName: 'Александр', username: 'alex_svarka', rating: 5.0, points: 2450, isPro: true, isAdmin: false, isVerified: true, isReliable: true, referralCode: 'R1', dealsCount: 124, isDonor: true, level: 'Легенда', specialization: ['Сварка', 'Трубопровод'] },
  { id: '2', firstName: 'Дмитрий', username: 'dima_electro', rating: 4.9, points: 1820, isPro: true, isAdmin: false, isVerified: true, isReliable: true, referralCode: 'R2', dealsCount: 89, isDonor: false, level: 'Опытный', specialization: ['Электрика', 'Автоматика'] },
  { id: '3', firstName: 'Сергей', username: 'serg_master', rating: 4.9, points: 1560, isPro: false, isAdmin: false, isVerified: true, isReliable: true, referralCode: 'R3', dealsCount: 67, isDonor: false, level: 'Мужик', specialization: ['Сантехника', 'Отопление'] },
  { id: '4', firstName: 'Николай', username: 'kolya_voda', rating: 4.8, points: 1200, isPro: true, isAdmin: false, isVerified: true, isReliable: false, referralCode: 'R4', dealsCount: 45, isDonor: false, level: 'Мастер', specialization: ['Бурение', 'Насосы'] },
  { id: '5', firstName: 'Михаил', username: 'misha_stroy', rating: 4.7, points: 980, isPro: false, isAdmin: false, isVerified: true, isReliable: true, referralCode: 'R5', dealsCount: 32, isDonor: false, level: 'Мужик', specialization: ['Бетон', 'Кровля'] },
  { id: '6', firstName: 'Артем', username: 'art_fix', rating: 4.7, points: 850, isPro: false, isAdmin: false, isVerified: false, isReliable: true, referralCode: 'R6', dealsCount: 15, isDonor: false, level: 'Новичок', specialization: ['Ремонт', 'Отделка'] },
  { id: '7', firstName: 'Павел', username: 'pasha_truck', rating: 4.6, points: 720, isPro: false, isAdmin: false, isVerified: true, isReliable: false, referralCode: 'R7', dealsCount: 22, isDonor: false, level: 'Мастер', specialization: ['Грузоперевозки'] },
];

const Ranking: React.FC<Props> = ({ navigate, currentUser }) => {
  const allUsers = [...MOCK_MASTERS];
  if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
    allUsers.push(currentUser);
  }
  
  const sortedUsers = allUsers.sort((a, b) => b.rating !== a.rating ? b.rating - a.rating : b.points - a.points);

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-4 mb-8">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#161616] card-border rounded-xl flex items-center justify-center text-[#F5C518] active-scale">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ЗАЛ СЛАВЫ</h2>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Лучшие из лучших</span>
        </div>
      </header>

      {/* Podium Section */}
      <div className="grid grid-cols-3 gap-4 mb-10 items-end px-2 pt-6">
        {/* Rank 2 */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 bg-zinc-800 rounded-3xl border border-zinc-700 flex items-center justify-center overflow-hidden">
               <span className="text-zinc-500 font-black text-xl">{sortedUsers[1]?.firstName[0]}</span>
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-600 rounded-xl flex items-center justify-center border-4 border-[#0E0E0E] text-[10px] font-black">2</div>
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase italic truncate w-full text-center tracking-tighter">{sortedUsers[1]?.firstName}</span>
        </div>
        
        {/* Rank 1 */}
        <div className="flex flex-col items-center scale-125 transform -translate-y-4">
          <div className="relative mb-3">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F5C518] to-[#9A7D0A] rounded-[32px] p-0.5 shadow-[0_0_30px_rgba(245,197,24,0.3)]">
              <div className="w-full h-full bg-[#0E0E0E] rounded-[30px] flex items-center justify-center overflow-hidden border border-white/10">
                 <span className="text-[#F5C518] font-black text-3xl italic">{sortedUsers[0]?.firstName[0]}</span>
              </div>
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#F5C518] rounded-2xl flex items-center justify-center border-4 border-[#0E0E0E] shadow-lg">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#F5C518] uppercase italic truncate w-full text-center tracking-tighter shadow-sm">{sortedUsers[0]?.firstName}</span>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 bg-zinc-800 rounded-3xl border border-zinc-700 flex items-center justify-center overflow-hidden">
               <span className="text-zinc-500 font-black text-xl">{sortedUsers[2]?.firstName[0]}</span>
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#CD7F32] rounded-xl flex items-center justify-center border-4 border-[#0E0E0E] text-[10px] font-black">3</div>
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase italic truncate w-full text-center tracking-tighter">{sortedUsers[2]?.firstName}</span>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-3">
        {sortedUsers.map((u, index) => {
          const isMe = currentUser?.id === u.id;
          const isTop3 = index < 3;
          return (
            <div 
              key={u.id} 
              className={`flex items-center gap-4 p-4 rounded-[24px] card-border transition-all active:scale-[0.98] ${isMe ? 'bg-[#F5C518]/10 border-[#F5C518]/30' : 'bg-[#161616]'}`}
            >
              <div className="w-6 text-center">
                <span className={`text-[10px] font-black italic tracking-tighter ${isTop3 ? 'text-[#F5C518]' : 'text-zinc-700'}`}>
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
              </div>
              
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 relative group">
                {u.photoUrl ? (
                   <img src={u.photoUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                   <span className="text-zinc-600 font-black text-lg">{u.firstName[0]}</span>
                )}
                {u.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 w-4 h-4 rounded-tl-lg border-t border-l border-[#161616] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-start min-w-0">
                <div className="flex items-center gap-2 w-full">
                  <span className={`text-[12px] font-black uppercase italic tracking-tight truncate ${isMe ? 'text-white' : 'text-zinc-300'}`}>
                    {u.firstName}
                  </span>
                  {u.isPro && (
                    <span className="bg-[#F5C518] text-black text-[7px] font-black px-1.5 py-0.5 rounded italic">PRO</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= u.rating ? 'bg-[#F5C518]' : 'bg-zinc-800'}`}></div>
                    ))}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">{u.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className={`text-[13px] font-black italic ${isMe ? 'text-[#F5C518]' : 'text-white'}`}>{u.points}</span>
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">БАЛЛОВ</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-[#161616] card-border rounded-3xl p-6 text-center border-dashed">
         <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-4">Твоя позиция на этой неделе</p>
         <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col">
               <span className="text-zinc-700 text-[8px] font-black uppercase">МЕСТО</span>
               <span className="text-white text-xl font-black italic">#{sortedUsers.findIndex(u => u.id === currentUser?.id) + 1}</span>
            </div>
            <div className="w-px h-8 bg-zinc-800"></div>
            <div className="flex flex-col">
               <span className="text-zinc-700 text-[8px] font-black uppercase">ДО ТОП-3</span>
               <span className="text-[#F5C518] text-xl font-black italic">+{Math.max(0, (sortedUsers[2]?.points || 0) - (currentUser?.points || 0))} 🪙</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Ranking;
