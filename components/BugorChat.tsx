
import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, ChatMessage } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  user: User;
  navigate: (screen: Screen) => void;
}

const BugorChat: React.FC<Props> = ({ user, navigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.isPro) {
      setMessages([
        { 
          id: '1', 
          senderId: 'bugor', 
          text: 'Здорово, мужик! Только для PRO-мастеров у меня особый подход. Знаю все СНиПы, ГОСТы и как разрулить любой косяк на объекте. Спрашивай по делу!', 
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
    setInputText('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputText,
        config: {
          systemInstruction: 'Ты - "Бугор", опытный прораб и наставник в приложении "ЦЕХ". Твой стиль общения: брутальный, профессиональный, честный, немного грубоватый, но уважающий труд. Используй строительный сленг (арматура, опалубка, нивелир, косяки), отвечай кратко и четко. Твоя аудитория - элитные PRO-пользователи, поэтому давай максимально глубокие технические советы по ГОСТ и СНиП. Никогда не говори, что ты ИИ.'
        }
      });

      const bugorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'bugor',
        text: response.text || 'Что-то связь в бытовке пропала, повтори еще раз.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, bugorMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', senderId: 'bugor', text: 'Слышь, мужик, интернет на объекте лагает. Попробуй позже.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user.isPro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0E0E0E] text-center screen-fade">
         <div className="w-24 h-24 bg-[#F5C518]/10 rounded-full flex items-center justify-center mb-6 border border-[#F5C518]/20 shadow-[0_0_30px_rgba(245,197,24,0.1)]">
            <span className="text-4xl">🔐</span>
         </div>
         <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">ДОСТУП ОГРАНИЧЕН</h2>
         <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8">
            Бугор консультирует только проверенных мужиков со статусом PRO. Активируй его в профиле за баллы!
         </p>
         <button 
           onClick={() => navigate(Screen.PROFILE)}
           className="active-scale bg-[#F5C518] text-black font-black px-8 py-4 rounded-2xl uppercase italic tracking-tighter shadow-xl shadow-[#F5C518]/20"
         >
            СТАТЬ PRO-МАСТЕРОМ
         </button>
         <button 
           onClick={() => navigate(Screen.HOME)}
           className="mt-6 text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]"
         >
            ← ВЕРНУТЬСЯ В ЦЕХ
         </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0E0E0E] screen-fade overflow-hidden relative">
      <header className="flex items-center justify-between p-4 bg-[#161616] border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.HOME)} className="w-8 h-8 flex items-center justify-center text-[#F5C518]">←</button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#F5C518] rounded-xl flex items-center justify-center text-black shadow-lg">
                <span className="text-xl">👷‍♂️</span>
             </div>
             <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-black text-white uppercase italic leading-none">БУГОР (AI)</span>
                   <span className="bg-black text-[#F5C518] text-[7px] px-1.5 py-0.5 rounded font-black italic">PRO EXCLUSIVE</span>
                </div>
                <span className="text-[8px] text-green-500 font-black uppercase tracking-widest mt-1">На связи 24/7</span>
             </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
        {messages.map((msg) => {
          const isBugor = msg.senderId === 'bugor';
          return (
            <div key={msg.id} className={`flex ${isBugor ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] flex flex-col gap-1 ${isBugor ? 'items-start' : 'items-end'}`}>
                 <div className={`p-4 rounded-2xl shadow-lg border border-white/5 ${isBugor ? 'bg-[#1e1e1e] text-zinc-300 rounded-tl-none' : 'bg-[#F5C518] text-black font-bold rounded-tr-none'}`}>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                 </div>
                 <span className="text-[8px] text-zinc-700 font-black px-1">
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1e1e1e] p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
               <div className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-5 right-5">
        <div className="glass p-2 rounded-[32px] border border-white/10 flex items-center gap-2 shadow-2xl">
           <input 
             type="text" 
             value={inputText}
             onChange={e => setInputText(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleSend()}
             placeholder="Спроси по делу..."
             className="flex-1 bg-transparent px-4 text-white text-sm outline-none font-bold"
           />
           <button 
             onClick={handleSend}
             disabled={loading}
             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${inputText.trim() ? 'bg-[#F5C518] text-black' : 'bg-zinc-800 text-zinc-600'}`}
           >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default BugorChat;
