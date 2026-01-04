
import React, { useState } from 'react';
import { geminiService } from '../geminiService';
import { blobToBase64 } from '../utils/audio';

const AnalyzerTool: React.FC = () => {
  const [file, setFile] = useState<{data: string, type: string, name: string} | null>(null);
  const [prompt, setPrompt] = useState('Analyze this content in detail.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const b64 = await blobToBase64(selected);
      setFile({ data: b64, type: selected.type, name: selected.name });
    }
  };

  const handleAnalyze = async () => {
    if (!file || isLoading) return;
    setIsLoading(true);
    setResult('');
    try {
      const response = await geminiService.analyze({
        prompt,
        fileData: file.data,
        mimeType: file.type
      });
      setResult(response);
    } catch (e) {
      console.error(e);
      setResult("Error during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-300">Upload Media</label>
            <input type="file" onChange={onFileChange} className="hidden" id="analyze-file" accept="image/*,video/*,audio/*" />
            <label 
              htmlFor="analyze-file"
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:bg-blue-600/5 hover:border-blue-500/50 transition-all"
            >
              {file ? (
                <div className="text-center px-4">
                  <i className={`fa-solid ${file.type.startsWith('image') ? 'fa-image' : file.type.startsWith('video') ? 'fa-film' : 'fa-microphone'} text-3xl text-blue-500 mb-3`}></i>
                  <p className="text-sm font-medium text-gray-200 truncate max-w-xs">{file.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">{(file.type)}</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 text-gray-600 mb-4">
                    <i className="fa-solid fa-image"></i>
                    <i className="fa-solid fa-film"></i>
                    <i className="fa-solid fa-microphone"></i>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Click to upload image, video, or audio</p>
                </>
              )}
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-300">Analysis Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Describe this image... or What is happening in this video?"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch animate-spin mr-2"></i> : <i className="fa-solid fa-bolt mr-2"></i>}
            Analyze with Gemini Pro
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 min-h-[400px]">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-blue-500"></i> Analysis Result
          </h3>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3"></div>
            </div>
          ) : result ? (
            <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed overflow-y-auto max-h-[500px] whitespace-pre-wrap">
              {result}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-700 italic text-sm text-center">
              Insights will appear here after analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzerTool;
