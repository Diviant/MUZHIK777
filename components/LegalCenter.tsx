
import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, ChatMessage } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  user: User;
  navigate: (screen: Screen) => void;
}

const LegalCenter: React.FC<Props> = ({ user, navigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.isPro) {
      setMessages([
        { 
          id: '1', 
          senderId: 'lawyer', 
          text: 'Здорово, мужик. Я твой Юридический Щит в Цехе. Если заказчик "мутит", не платит по договору или хочешь проверить контракт — выкладывай всё как есть. Разберем по закону, чтоб тебя не кинули.', 
          timestamp: Date.now() 
        }
      ]);
    }
  }, [user.isPro]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!inputText.trim() || loading || !user.isPro) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      senderId: user.id, 
      text: inputText, 
      timestamp: Date.now() 
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: currentInput,
        config: {
          systemInstruction: `Ты — "Юрист Цеха", цифровой адвокат для мастеров и строителей.
          Твой стиль: серьезный, четкий, защищающий интересы рабочего человека. 
          Твоя задача: 
          1. Давать конкретные советы по трудовому праву РФ (ГК РФ, ТК РФ).
          2. Помогать разруливать конфликты с неплатежами (досудебные претензии, доказательства работ).
          3. Консультировать по самозанятости и ИП.
          4. Использовать юридические термины, но объяснять их "по-мужски", чтоб было понятно.
          5. Если ситуация требует реального суда — советуй собирать акты и переписки.
          Твой девиз: "Закон — это инструмент, а не преграда для мужика".`
        }
      });

      const lawyerMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'lawyer',
        text: response.text || 'Связь с сервером Минюста барахлит, мужик. Повтори запрос.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, lawyerMsg]);
    } catch (err: any) {
      console.error("LEGAL_API_ERROR:", err);
      setMessages(prev => [...prev, { id: 'err', senderId: 'lawyer', text: 'Сбой юридического канала. Попробуй позже.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user.isPro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505] text-center h-full relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-red-900/10 opacity-40"></div>
         <div className="w-24 h-24 bg-blue-600/10 rounded-[35px] flex items-center justify-center mb-10 border border-blue-500/20 shadow-2xl relative z-10">
            <span className="text-5xl">⚖️</span>
         </div>
         <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none relative z-10">ЮРИДИЧЕСКИЙ ЩИТ</h2>
         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed mb-10 italic relative z-10">
            Правовая защита доступна только PRO-мужикам. <br/> Не дай системе тебя сломать.
         </p>
         <button onClick={() => navigate(Screen.PROFILE)} className="bg-blue-600 text-white font-black px-12 py-5 rounded-[22px] uppercase italic tracking-tighter shadow-xl shadow-blue-900/40 active:scale-95 transition-all relative z-10">
            АКТИВИРОВАТЬ ЗАЩИТУ
         </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none opacity-40"></div>
      
      <header className="flex items-center justify-between p-6 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 z-20">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 active-press">←</button>
        <div className="flex items-center gap-4">
           <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="text-2xl">⚖️</span>
           </div>
           <div className="flex flex-col items-start text-left">
              <span className="text-sm font-black text-white uppercase italic leading-none mb-1">ЮРИСТ (PRO)</span>
              <span className="text-[7px] text-blue-400 font-black uppercase tracking-widest mono">LEGAL_SHIELD_ACTIVE</span>
           </div>
        </div>
        <div className="w-11"></div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'lawyer' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] border ${msg.senderId === 'lawyer' ? 'bg-[#0f0f0f] border-blue-900/20 text-zinc-300 rounded-tl-none shadow-xl' : 'bg-blue-600 text-white font-black italic rounded-tr-none shadow-lg'}`}>
              <p className="text-[14px] leading-relaxed italic whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-blue-900 text-[8px] font-black uppercase italic animate-pulse ml-2 mono tracking-widest">ANALYZING_LAW_DATABASE...</div>}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-[#121212] p-2 rounded-[35px] border border-blue-900/20 flex items-center gap-2 shadow-2xl relative">
           <input 
             type="text" 
             value={inputText}
             onChange={e => setInputText(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleSend()}
             placeholder="В чем твоя беда, мужик?"
             className="flex-1 bg-transparent px-6 text-white text-sm outline-none font-bold placeholder:text-zinc-800 h-14"
           />
           <button 
            onClick={handleSend} 
            disabled={loading} 
            className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${inputText.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-zinc-800 text-zinc-600'}`}
           >
              <span className="text-lg">➤</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default LegalCenter;
