
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
      // Check for API key selection
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setStatus('API Key Required');
        await window.aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputContextRef.current) {
        outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
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
              // Use sessionPromise to prevent race conditions
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => {
                console.warn("Input streaming error", err);
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
               const text = message.serverContent.outputTranscription.text;
               setTranscriptions(prev => [...prev, { role: 'Assistant', text }]);
            } else if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               setTranscriptions(prev => [...prev, { role: 'You', text }]);
            }

            // Handle audio output
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              const base64Audio = part.inlineData?.data;
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
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Session error', e);
            const errorMsg = e.message || 'Network error';
            setStatus(`Error: ${errorMsg}`);
            
            if (errorMsg.includes("Requested entity was not found")) {
              window.aistudio?.openSelectKey();
            }
            
            setIsActive(false);
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
    } catch (err: any) {
      console.error(err);
      setStatus(`Failed: ${err.message || 'Unknown error'}`);
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(s => s.close()).catch(() => {});
      sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setStatus('Standby');
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

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
        <h2 className="text-3xl font-bold mb-2">Vedviarn Live</h2>
        <p className={`text-sm font-medium ${isActive ? 'text-blue-400' : status.includes('Error') ? 'text-red-400' : 'text-gray-500'}`}>
          {status}
        </p>
      </div>

      <div className="w-full max-w-md bg-gray-900/50 border border-gray-800 rounded-2xl p-4 h-48 overflow-y-auto mb-8 space-y-2 custom-scrollbar">
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

      <div className="flex gap-4">
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
      </div>

      <p className="mt-8 text-xs text-gray-600 max-w-sm text-center">
        Real-time audio session powered by Gemini 2.5 Flash. 
        Ensure your microphone is enabled and an API key is selected.
      </p>
    </div>
  );
};

export default LiveVoiceTool;
