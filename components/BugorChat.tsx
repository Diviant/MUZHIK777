
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
          text: 'Здорово, мужик! Я на связи. Есть технические вопросы по объекту или смету прикинуть надо? Спрашивай по делу, не тяни резину.', 
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

    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { id: 'err', senderId: 'bugor', text: 'Ошибка: API ключ не настроен. Обратись к администратору.', timestamp: Date.now() }]);
      return;
    }

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
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputText,
        config: {
          systemInstruction: `Ты — "Бугор", цифровой прораб и наставник в экосистеме "ЦЕХ". 
          Твой стиль: суровый, профессиональный, басовитый. Ты уважаешь труд и честный заработок.
          Ты знаешь про "Журнал Вахты" (смета), "Снабженец" (поиск материалов) и "Базар" (барахолка).
          Отвечай кратко, по ГОСТам, используй сленг: крафы, нивелир, арматура, опалубка, перевязка.
          Никогда не признавайся, что ты ИИ. Ты старший на объекте.`
        }
      });

      const bugorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'bugor',
        text: response.text || 'Связь в бытовке плохая, повтори еще раз.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, bugorMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', senderId: 'bugor', text: 'Интернет на объекте лагает. Не могу достучаться до сервера.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user.isPro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505] text-center h-full">
         <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-[35px] flex items-center justify-center mb-10 border border-[#D4AF37]/20 shadow-2xl">
            <span className="text-5xl">🔐</span>
         </div>
         <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">ДОСТУП ОГРАНИЧЕН</h2>
         <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed mb-10 italic">
            Бугор дает советы только PRO-мужикам.
         </p>
         <button onClick={() => navigate(Screen.PROFILE)} className="bg-[#D4AF37] text-black font-black px-12 py-5 rounded-[22px] uppercase italic tracking-tighter shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all">
            ПОЛУЧИТЬ PRO-СТАТУС
         </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden relative">
      <header className="flex items-center justify-between p-6 bg-[#050505] border-b border-white/5 z-20">
        <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press">←</button>
        <div className="flex items-center gap-4">
           <div className="w-11 h-11 bg-[#D4AF37] rounded-xl flex items-center justify-center text-black shadow-lg">
              <span className="text-2xl">👷‍♂️</span>
           </div>
           <div className="flex flex-col items-start text-left">
              <span className="text-sm font-black text-white uppercase italic leading-none mb-1">БУГОР (AI)</span>
              <span className="text-[7px] text-green-500 font-black uppercase tracking-widest mono">В БЫТОВКЕ / ONLINE</span>
           </div>
        </div>
        <div className="w-11"></div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'bugor' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] border ${msg.senderId === 'bugor' ? 'bg-[#0f0f0f] border-white/5 text-zinc-300 rounded-tl-none' : 'bg-[#D4AF37] text-black font-black italic rounded-tr-none shadow-xl'}`}>
              <p className="text-[14px] leading-relaxed italic whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-zinc-800 text-[8px] font-black uppercase italic animate-pulse ml-2 mono tracking-widest">BUGOR_WRITING_LOG...</div>}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-[#121212] p-2 rounded-[35px] border border-white/10 flex items-center gap-2 shadow-2xl relative">
           <input 
             type="text" 
             value={inputText}
             onChange={e => setInputText(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleSend()}
             placeholder="Спроси по делу..."
             className="flex-1 bg-transparent px-6 text-white text-sm outline-none font-bold placeholder:text-zinc-800 h-14"
           />
           <button 
            onClick={handleSend} 
            disabled={loading} 
            className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${inputText.trim() ? 'bg-[#D4AF37] text-black shadow-lg' : 'bg-zinc-800 text-zinc-600'}`}
           >
              <span className="text-lg">➤</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default BugorChat;
