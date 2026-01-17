
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
          text: 'Здорово, мужик! Я тут, в бытовке, Журнал Вахты твой просмотрел. Хорошо идем. Есть технические вопросы или по смете что подсказать? Помни: арматура должна быть связана намертво, а бабло — посчитано до рубля. Спрашивай по делу!', 
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
          systemInstruction: `Ты — "Бугор", цифровой прораб и наставник в экосистеме "ЦЕХ". 
          Твой стиль: суровый, басовитый, профессиональный. Ты не любишь лишних слов, уважаешь тех, кто работает руками и умеет считать деньги.
          Ты знаешь, что в приложении есть "Журнал Вахты" (смета), "Снабженец" (поиск материалов) и "Базар" (барахолка).
          Если мужик спрашивает про деньги — напоминай ему заполнять Журнал Вахты в профиле. 
          Если про материалы — отправляй в раздел "Снабженец".
          Если про технологию (бетон, сварка, СНиП) — отвечай максимально точно по ГОСТам, но простым языком.
          Используй сленг: крафы (авансы), нивелир, арматура, опалубка, перевязка, вахта.
          Никогда не говори, что ты ИИ. Ты — Бугор. Ты старший на этом объекте.`
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
      setMessages(prev => [...prev, { id: 'err', senderId: 'bugor', text: 'Слышь, мужик, интернет на объекте лагает. Попробуй позже.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user.isPro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0E0E0E] text-center">
         <div className="w-24 h-24 bg-[#F5C518]/10 rounded-full flex items-center justify-center mb-6 border border-[#F5C518]/20">
            <span className="text-4xl">🔐</span>
         </div>
         <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">ДОСТУП ОГРАНИЧЕН</h2>
         <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8">
            Бугор консультирует только PRO-мужиков. Активируй статус в профиле!
         </p>
         <button onClick={() => navigate(Screen.PROFILE)} className="bg-[#F5C518] text-black font-black px-8 py-4 rounded-2xl uppercase italic tracking-tighter shadow-xl shadow-[#F5C518]/20">
            СТАТЬ PRO-МАСТЕРОМ
         </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0E0E0E] overflow-hidden relative">
      <header className="flex items-center justify-between p-4 bg-[#161616] border-b border-white/5 z-20">
        <button onClick={() => navigate(Screen.HOME)} className="w-8 h-8 flex items-center justify-center text-[#F5C518]">←</button>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#F5C518] rounded-xl flex items-center justify-center text-black">
              <span className="text-xl">👷‍♂️</span>
           </div>
           <div className="flex flex-col items-start">
              <span className="text-sm font-black text-white uppercase italic leading-none">БУГОР (AI)</span>
              <span className="text-[8px] text-green-500 font-black uppercase tracking-widest mt-1">В бытовке, на связи</span>
           </div>
        </div>
        <div className="w-8"></div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'bugor' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl border border-white/5 ${msg.senderId === 'bugor' ? 'bg-[#1e1e1e] text-zinc-300 rounded-tl-none' : 'bg-[#F5C518] text-black font-bold rounded-tr-none'}`}>
              <p className="text-[13px] leading-relaxed italic whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-zinc-600 text-[10px] font-black uppercase italic animate-pulse ml-2">Бугор что-то пишет...</div>}
      </div>

      <div className="absolute bottom-6 left-5 right-5">
        <div className="glass p-2 rounded-[32px] border border-white/10 flex items-center gap-2">
           <input 
             type="text" 
             value={inputText}
             onChange={e => setInputText(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleSend()}
             placeholder="Спроси по делу..."
             className="flex-1 bg-transparent px-4 text-white text-sm outline-none font-bold"
           />
           <button onClick={handleSend} disabled={loading} className={`w-12 h-12 rounded-full flex items-center justify-center ${inputText.trim() ? 'bg-[#F5C518] text-black' : 'bg-zinc-800 text-zinc-600'}`}>
              ➤
           </button>
        </div>
      </div>
    </div>
  );
};

export default BugorChat;
