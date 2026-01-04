
import React, { useState } from 'react';
import { geminiService } from '../geminiService';
import { AspectRatio, ImageSize } from '../types';
import { blobToBase64 } from '../utils/audio';

const ImageTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.K1);
  const [baseImage, setBaseImage] = useState<{data: string, type: string} | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const url = await geminiService.generateImage({ prompt, aspectRatio, imageSize });
      setGeneratedImage(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Ensure your model supports this action.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !baseImage || isLoading) return;
    setIsLoading(true);
    try {
      const url = await geminiService.editImage({
        base64Image: baseImage.data,
        mimeType: baseImage.type,
        prompt
      });
      setGeneratedImage(url);
    } catch (e) {
      console.error(e);
      alert("Failed to edit image.");
    } finally {
      setIsLoading(false);
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
      <div className="flex bg-gray-900 p-1 rounded-xl w-fit border border-gray-800">
        <button 
          onClick={() => setMode('generate')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'generate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Generate New
        </button>
        <button 
          onClick={() => setMode('edit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Edit Existing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-300">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'generate' ? "A majestic landscape with glowing waterfalls..." : "Add a retro filter to this photo..."}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {mode === 'edit' && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-300">Reference Image</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onFileChange}
                  className="hidden" 
                  id="image-upload" 
                />
                <label 
                  htmlFor="image-upload"
                  className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                >
                  {baseImage ? (
                    <img src={`data:${baseImage.type};base64,${baseImage.data}`} className="max-h-32 rounded-lg shadow-md" alt="Preview" />
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-500 mb-2"></i>
                      <span className="text-xs text-gray-400">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {mode === 'generate' && (
            <>
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-300">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(AspectRatio).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`py-2 text-[10px] border rounded-lg transition-all ${
                        aspectRatio === ar ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-300">Image Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ImageSize).map((size) => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`py-2 text-xs border rounded-lg transition-all ${
                        imageSize === size ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={mode === 'generate' ? handleGenerate : handleEdit}
            disabled={isLoading || !prompt.trim() || (mode === 'edit' && !baseImage)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            )}
            {mode === 'generate' ? 'Generate Image' : 'Apply Edit'}
          </button>
        </div>

        {/* Display */}
        <div className="lg:col-span-8 flex items-center justify-center bg-gray-900/50 rounded-2xl border border-gray-800 min-h-[400px]">
          {isLoading ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-medium animate-pulse">Painting your imagination...</p>
            </div>
          ) : generatedImage ? (
            <div className="relative group p-4 w-full h-full flex items-center justify-center">
              <img 
                src={generatedImage} 
                className="max-h-full max-w-full rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]" 
                alt="Generated output" 
              />
              <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={generatedImage} 
                  download="vedviarn-ai.png"
                  className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-white/20 text-white"
                >
                  <i className="fa-solid fa-download"></i>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 px-6">
              <i className="fa-solid fa-palette text-5xl text-gray-800"></i>
              <div>
                <h3 className="text-lg font-bold text-gray-700">Art Studio Ready</h3>
                <p className="text-gray-600 text-sm max-w-xs">Enter a prompt on the left to start generating or editing visual masterpieces.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTool;
