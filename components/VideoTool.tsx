
import React, { useState } from 'react';
import { geminiService } from '../geminiService';
import { blobToBase64 } from '../utils/audio';

const VideoTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [baseImage, setBaseImage] = useState<{data: string, type: string} | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if ((!prompt.trim() && !baseImage) || isLoading) return;
    
    // Check key selection for Veo models
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      alert("Veo video generation requires a paid API key from Google AI Studio. Please select your key.");
      await window.aistudio.openSelectKey();
    }

    setIsLoading(true);
    setStatus("Initializing Veo generation engine...");
    
    try {
      const url = await geminiService.generateVideo({
        prompt,
        imageBytes: baseImage?.data,
        mimeType: baseImage?.type,
        aspectRatio
      });
      setVideoUrl(url);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        alert("API Key error. Please re-select your AI Studio key.");
        await window.aistudio.openSelectKey();
      } else {
        alert("Failed to generate video. This can take some time or requires specific project permissions.");
      }
    } finally {
      setIsLoading(false);
      setStatus("");
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await blobToBase64(file);
      setBaseImage({ data: b64, type: file.type });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 h-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        <div className="w-full md:w-80 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-300">Prompt (Optional if using image)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Cinematic drone shot of a futuristic city..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-300">Start Frame (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={onFileChange}
              className="hidden" 
              id="video-frame-upload" 
            />
            <label 
              htmlFor="video-frame-upload"
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-6 cursor-pointer hover:border-blue-500/50 transition-all"
            >
              {baseImage ? (
                <img src={`data:${baseImage.type};base64,${baseImage.data}`} className="max-h-24 rounded shadow-md" alt="Preview" />
              ) : (
                <>
                  <i className="fa-solid fa-image text-xl text-gray-600 mb-2"></i>
                  <span className="text-xs text-gray-500">Upload starting image</span>
                </>
              )}
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-300">Aspect Ratio</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-2 text-xs border rounded-lg transition-all ${
                  aspectRatio === '16:9' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'
                }`}
              >
                16:9 Landscape
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-2 text-xs border rounded-lg transition-all ${
                  aspectRatio === '9:16' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && !baseImage)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2">
              {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-clapperboard"></i>}
              <span>Generate Video</span>
            </div>
            <span className="text-[10px] font-normal opacity-70">Powered by Veo 3.1</span>
          </button>
          
          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            Note: Video generation may take several minutes. Please do not close this tab while the operation is in progress.
          </p>
        </div>

        <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-center overflow-hidden min-h-[500px] relative">
          {isLoading ? (
            <div className="text-center px-10">
              <div className="w-20 h-20 relative mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-film text-blue-500 text-2xl animate-pulse"></i>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">Cinematography in progress...</h3>
              <p className="text-sm text-gray-500 animate-pulse">{status || "Stitching frames together"}</p>
            </div>
          ) : videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="max-h-full max-w-full rounded-xl"
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-700">
                <i className="fa-solid fa-play text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-600">No Video Generated</h3>
                <p className="text-gray-700 text-sm max-w-xs mx-auto">Upload an image or type a prompt to create cinematic video content with Veo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTool;
