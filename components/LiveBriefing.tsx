
import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Radio, Loader2, Volume2, ShieldAlert, Zap } from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const LiveBriefing: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
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
  };

  const startBriefing = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                text: "Sou o Diretor Estratégico. Forneça um briefing tático de 20 segundos em português do Brasil sobre o status industrial atual da arena. Use um tom profissional e futurista."
              });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              
              const startAt = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(startAt);
              nextStartTimeRef.current = startAt + audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setError("Link tático interrompido.");
            stopBriefing();
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'Você é o Oráculo Strategos. Forneça briefings executivos curtos, táticos e realistas para uma arena de simulação de negócios.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Falha na inicialização do Oráculo.");
      setIsConnecting(false);
    }
  };

  const stopBriefing = () => {
    sessionRef.current?.close();
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="flex items-center gap-4">
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
            <ShieldAlert size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={isActive ? stopBriefing : startBriefing}
        disabled={isConnecting}
        className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
          isActive ? 'bg-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        {isConnecting ? <Loader2 size={16} className="animate-spin" /> : isActive ? <Radio size={16} className="animate-pulse" /> : <Volume2 size={16} />}
        {isActive ? 'Link Ativo' : 'Strategos Audio Brief'}
        
        {isActive && (
          <div className="flex gap-1 ml-2">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-white rounded-full"
              />
            ))}
          </div>
        )}
      </button>
    </div>
  );
};

export default LiveBriefing;
