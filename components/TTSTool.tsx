
import React, { useState, useRef } from 'react';
import { geminiService } from '../geminiService';
import { decode, decodeAudioData } from '../utils/audio';

const TTSTool: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const voices = [
    { name: 'Kore', label: 'Male - Deep' },
    { name: 'Puck', label: 'Female - Soft' },
    { name: 'Charon', label: 'Male - Authoritative' },
    { name: 'Fenrir', label: 'Male - Gruff' },
    { name: 'Zephyr', label: 'Neutral - Balanced' },
  ];

  const handleSpeak = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const base64 = await geminiService.textToSpeech(text, voice);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error(e);
      alert("TTS generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center">
      <div className="w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-300">Enter Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something you want the AI to say..."
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[160px] resize-none"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-300">Select Voice</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {voices.map((v) => (
              <button
                key={v.name}
                onClick={() => setVoice(v.name)}
                className={`px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
                  voice === v.name ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSpeak}
          disabled={!text.trim() || isLoading}
          className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="fa-solid fa-volume-high text-xl"></i>
          )}
          Generate Speech
        </button>
      </div>

      <p className="mt-8 text-xs text-gray-600 italic">
        Powered by Gemini 2.5 Flash Preview TTS Engine. High-fidelity raw PCM output.
      </p>
    </div>
  );
};

export default TTSTool;
