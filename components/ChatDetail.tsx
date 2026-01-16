
import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, Conversation, ChatMessage } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage, Blob as GenAIBlob } from '@google/genai';

// Audio decoding helper - Raw PCM to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Base64 decoding helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Base64 encoding helper
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// PCM Blob creation helper
function createGenAIBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface Props {
  chat: Conversation | null;
  user: User;
  navigate: (screen: Screen) => void;
}

const ChatDetail: React.FC<Props> = ({ chat, user, navigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveCall, setIsLiveCall] = useState(false);
  const [callStatus, setCallStatus] = useState('СОЕДИНЕНИЕ...');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Gemini Live Refs
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (!chat) return;
    setMessages([
      { id: '1', senderId: chat.participant.id || '0', text: 'Здорово! Есть вопросы по работе?', timestamp: Date.now() - 600000 },
    ]);
  }, [chat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, selectedImage, isRecording]);

  // --- Voice Messaging ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const voiceUrl = reader.result as string;
          sendVoiceMessage(voiceUrl);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) { alert('Дай доступ к мику, мужик!'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = (url: string) => {
    const msg: ChatMessage = { id: Date.now().toString(), senderId: user.id, voiceUrl: url, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
  };

  // --- Gemini Live Call (Звонок Бугру) ---
  const startLiveCall = async () => {
    setIsLiveCall(true);
    setCallStatus('СОЕДИНЕНИЕ...');
    
    try {
      // Use process.env.API_KEY directly as required
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setCallStatus('БУГОР НА СВЯЗИ');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createGenAIBlob(inputData);
              // CRITICAL: initiate sendRealtimeInput after live.connect call resolves
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              const outCtx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outCtx.currentTime,
              );
              
              // Decode PCM using the manually implemented decode functions
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outCtx,
                24000,
                1,
              );
              
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              
              source.addEventListener('ended', () => {
                activeSourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              activeSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of activeSourcesRef.current.values()) {
                source.stop();
                activeSourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => endLiveCall(),
          onerror: (e: any) => {
            console.error('Live Call Error:', e);
            setCallStatus('ОШИБКА СЕТИ');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Ты - опытный Бугор (прораб) в строительном Цехе. Твоя задача - давать краткие, четкие и профессиональные советы мужикам по техническим вопросам. Говори по-делу, как настоящий спец.'
        }
      });
      
      const session = await sessionPromise;
      liveSessionRef.current = session;
    } catch (err) {
      console.error(err);
      setCallStatus('СБОЙ');
    }
  };

  const endLiveCall = () => {
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch (e) {}
    }
    activeSourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    activeSourcesRef.current.clear();
    setIsLiveCall(false);
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;
    const msg: ChatMessage = { id: Date.now().toString(), senderId: user.id, text: inputText, image: selectedImage || undefined, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
    setInputText('');
    setSelectedImage(null);
  };

  if (!chat) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0E0E0E] screen-fade overflow-hidden">
      {/* Call UI Overlay */}
      {isLiveCall && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-32 h-32 bg-[#F5C518]/10 rounded-full flex items-center justify-center relative mb-8">
            <div className="absolute inset-0 bg-[#F5C518]/20 rounded-full animate-ping"></div>
            <span className="text-5xl">👷‍♂️</span>
          </div>
          <h2 className="text-[#F5C518] text-xs font-black uppercase tracking-[0.4em] mb-2">{callStatus}</h2>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">СОВЕТ БУГРА</h3>
          
          <div className="mt-20 flex gap-8">
            <button onClick={endLiveCall} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center active-scale shadow-2xl shadow-red-900/40">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#161616] border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.CHATS)} className="w-8 h-8 flex items-center justify-center text-[#F5C518]">←</button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-900 rounded-xl overflow-hidden border border-white/5">
               {chat.participant.photoUrl ? <img src={chat.participant.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600 font-black italic">{chat.participant.firstName?.[0]}</div>}
             </div>
             <div className="flex flex-col items-start">
                <span className="text-sm font-black text-white uppercase italic leading-none">{chat.participant.firstName}</span>
                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mt-1">На связи</span>
             </div>
          </div>
        </div>
        <button onClick={startLiveCall} className="w-10 h-10 bg-[#F5C518]/10 text-[#F5C518] rounded-xl flex items-center justify-center active-scale border border-[#F5C518]/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                 <div className={`p-3 rounded-2xl shadow-lg border border-white/5 ${isMe ? 'bg-[#F5C518] text-black rounded-tr-none' : 'bg-[#1e1e1e] text-white rounded-tl-none'}`}>
                    {msg.voiceUrl ? (
                      <div className="flex items-center gap-3 px-2 py-1">
                        <button className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">▶️</button>
                        <div className="flex gap-0.5 items-center">
                          {[1,2,3,4,5,4,3,2,1].map((h, i) => <div key={i} className="w-1 bg-black/20 rounded-full" style={{height: h*3}}></div>)}
                        </div>
                        <span className="text-[10px] font-black opacity-40">0:04</span>
                      </div>
                    ) : (
                      <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>
                    )}
                    {msg.image && <img src={msg.image} className="mt-2 rounded-lg max-h-40 object-cover" />}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-6 left-5 right-5 flex flex-col gap-3">
        <div className="glass p-2 rounded-[32px] border border-white/10 flex items-center gap-2">
           <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-[#F5C518] shadow-inner">
              📷
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
             const f = e.target.files?.[0];
             if(f){ const r = new FileReader(); r.onload=()=>setSelectedImage(r.result as string); r.readAsDataURL(f); }
           }} />
           
           <input 
             type="text" 
             value={inputText}
             onChange={e => setInputText(e.target.value)}
             placeholder={isRecording ? "ЗАПИСЬ..." : "Напиши мужику..."}
             className="flex-1 bg-transparent px-2 text-white text-sm outline-none"
             disabled={isRecording}
           />
           
           <button 
             onMouseDown={startRecording}
             onMouseUp={stopRecording}
             onTouchStart={startRecording}
             onTouchEnd={stopRecording}
             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-125 ${isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-zinc-800 text-zinc-500'}`}
           >
             🎙️
           </button>

           <button 
             onClick={handleSend}
             className={`w-12 h-12 rounded-full flex items-center justify-center ${inputText.trim() || selectedImage ? 'bg-[#F5C518] text-black' : 'bg-zinc-800 text-zinc-600'}`}
           >
              ➤
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
