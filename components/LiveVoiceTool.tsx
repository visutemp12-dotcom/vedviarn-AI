
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, encode, decodeAudioData, createPcmBlob } from '../utils/audio';

const LiveVoiceTool: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  const [status, setStatus] = useState('Standby');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setStatus('Connecting...');

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Listening...');
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
               const text = message.serverContent.outputTranscription.text;
               setTranscriptions(prev => [...prev, { role: 'Assistant', text }]);
            } else if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               setTranscriptions(prev => [...prev, { role: 'You', text }]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(ctx.destination);
              sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session error', e);
            setStatus('Error');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('Session Closed');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a helpful and charismatic AI assistant named Vedviarn. Keep your responses conversational and brief.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to Start');
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(s => s.close());
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setStatus('Standby');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="relative mb-12">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ${
          isActive ? 'bg-blue-600/10 shadow-[0_0_80px_rgba(37,99,235,0.3)] border-blue-500' : 'bg-gray-800/50 border-gray-700'
        } border-2`}>
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isActive ? 'bg-blue-600 animate-pulse' : 'bg-gray-700'
          }`}>
            <i className={`fa-solid ${isActive ? 'fa-waveform-lines' : 'fa-microphone'} text-4xl text-white`}></i>
          </div>
        </div>
        {isActive && (
          <div className="absolute inset-0 border-2 border-blue-400/50 rounded-full animate-ping"></div>
        )}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Gemini Live</h2>
        <p className={`text-sm font-medium ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
          {status}
        </p>
      </div>

      <div className="w-full max-w-md bg-gray-900/50 border border-gray-800 rounded-2xl p-4 h-48 overflow-y-auto mb-8 space-y-2">
        {transcriptions.length === 0 ? (
          <p className="text-gray-600 text-xs text-center mt-16 italic">Transcription history will appear here...</p>
        ) : (
          transcriptions.map((t, i) => (
            <p key={i} className="text-xs">
              <span className={`font-bold uppercase tracking-wider ${t.role === 'You' ? 'text-blue-400' : 'text-purple-400'}`}>{t.role}: </span>
              <span className="text-gray-300">{t.text}</span>
            </p>
          ))
        )}
      </div>

      <button
        onClick={isActive ? stopSession : startSession}
        className={`px-12 py-4 rounded-full font-bold text-lg transition-all shadow-xl ${
          isActive 
            ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' 
            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
        }`}
      >
        {isActive ? 'End Conversation' : 'Start Talking'}
      </button>

      <p className="mt-8 text-xs text-gray-600 max-w-sm text-center">
        Real-time audio session uses Gemini 2.5 Flash Native Audio. 
        Ensure your microphone is enabled.
      </p>
    </div>
  );
};

export default LiveVoiceTool;
