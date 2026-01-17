
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  navigate: (screen: Screen) => void;
  user: User;
}

const ContractGen: React.FC<Props> = ({ navigate, user }) => {
  const [who, setWho] = useState('');
  const [what, setWhat] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<string | null>(null);

  const generateContract = async () => {
    if (!who || !what || !price) return alert('Заполни все поля, мужик!');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Составь простой "Мужицкий договор" на словах между "${user.firstName}" и "${who}". Предмет: "${what}". Цена/оплата: "${price}".
        Стиль: Строгий, по-делу, как в строительном Цехе. Добавь пункты про: 
        1. Качество (не косячить). 
        2. Срок. 
        3. Ответственность (слово мужика). 
        Сделай текст коротким, чтобы его можно было скинуть в WhatsApp или Telegram как подтверждение договоренности.`,
      });

      setContract(response.text);
    } catch (err) {
      alert('Бугор занят, попробуй позже.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!contract) return;
    navigator.clipboard.writeText(contract);
    alert('Текст договора скопирован!');
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">БЕЗОПАСНАЯ СДЕЛКА</h2>
      </header>

      {!contract ? (
        <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 space-y-5 shadow-2xl animate-slide-up">
           <div className="text-left">
              <span className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest italic mb-2 block">ПАРАМЕТРЫ СДЕЛКИ:</span>
              <p className="text-[9px] text-zinc-600 uppercase font-black mb-6">Бугор накидает текст, который закрепит твое слово.</p>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1 text-left block">С кем договариваешься?</label>
                 <input placeholder="Имя заказчика или мастера" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/30" value={who} onChange={e => setWho(e.target.value)} />
              </div>

              <div className="space-y-1">
                 <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1 text-left block">Что нужно сделать?</label>
                 <textarea placeholder="Напр: Заливка фундамента 10х10, срок 2 недели" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-[#F5C518]/30 min-h-[100px]" value={what} onChange={e => setWhat(e.target.value)} />
              </div>

              <div className="space-y-1">
                 <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1 text-left block">За какие бабки?</label>
                 <input placeholder="Напр: 150к, 30к аванс, остальное по факту" className="w-full bg-black border border-white/10 rounded-xl p-4 text-[#F5C518] font-black outline-none focus:border-[#F5C518]/30" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
           </div>

           <button 
             onClick={generateContract}
             disabled={loading}
             className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl shadow-[#F5C518]/10 active:scale-95 transition-transform"
           >
             {loading ? 'БУГОР ПИШЕТ...' : 'СФОРМИРОВАТЬ ДОГОВОР'}
           </button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
           <div className="bg-[#121212] p-6 rounded-[32px] border border-[#F5C518]/20 text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#F5C518] opacity-[0.03] rotate-45 translate-x-10 -translate-y-10"></div>
              <h4 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest mb-4 italic">ВАШЕ СОГЛАШЕНИЕ:</h4>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap italic bg-black/40 p-5 rounded-2xl border border-white/5">
                {contract}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setContract(null)} className="bg-zinc-800 text-zinc-400 font-black py-4 rounded-xl uppercase italic text-[10px]">ПЕРЕДЕЛАТЬ</button>
              <button onClick={copyToClipboard} className="bg-white text-black font-black py-4 rounded-xl uppercase italic text-[10px] shadow-lg">КОПИРОВАТЬ ТЕКСТ</button>
           </div>

           <p className="text-[8px] text-zinc-700 uppercase font-black italic text-center px-4 leading-tight">
             Перешли этот текст второй стороне. Это ваше обоюдное подтверждение. В Цехе всё строится на доверии и четких правилах.
           </p>
        </div>
      )}
    </div>
  );
};

export default ContractGen;
