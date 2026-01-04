
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AspectRatio, ImageSize } from "./types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const geminiService = {
  // 1. Chat with various features
  async chat({
    message,
    model = 'gemini-3-flash-preview',
    systemInstruction,
    useSearch = false,
    useMaps = false,
    thinking = false,
    location,
  }: {
    message: string;
    model?: string;
    systemInstruction?: string;
    useSearch?: boolean;
    useMaps?: boolean;
    thinking?: boolean;
    location?: { latitude: number; longitude: number };
  }) {
    const ai = getAIClient();
    const config: any = {
      systemInstruction,
    };

    if (thinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
      // Thinking budget requires Pro model
      model = 'gemini-3-pro-preview';
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (useMaps) {
      model = 'gemini-2.5-flash'; // Maps grounding requires 2.5
      config.tools = [{ googleMaps: {} }];
      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }
    }

    const response = await ai.models.generateContent({
      model,
      contents: message,
      config,
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  },

  // 2. Image Generation (Pro)
  async generateImage({
    prompt,
    aspectRatio = AspectRatio.SQUARE,
    imageSize = ImageSize.K1
  }: {
    prompt: string;
    aspectRatio?: AspectRatio;
    imageSize?: ImageSize;
  }) {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  },

  // 3. Image Editing (Nano Banana)
  async editImage({
    base64Image,
    mimeType,
    prompt
  }: {
    base64Image: string;
    mimeType: string;
    prompt: string;
  }) {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  },

  // 4. Video Generation (Veo)
  async generateVideo({
    prompt,
    imageBytes,
    mimeType,
    aspectRatio = '16:9'
  }: {
    prompt: string;
    imageBytes?: string;
    mimeType?: string;
    aspectRatio?: '16:9' | '9:16';
  }) {
    const ai = getAIClient();
    const videoConfig: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio
      }
    };

    if (imageBytes && mimeType) {
      videoConfig.image = { imageBytes, mimeType };
    }

    let operation = await ai.models.generateVideos(videoConfig);
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // 5. Analysis (Multimodal)
  async analyze({
    prompt,
    fileData,
    mimeType
  }: {
    prompt: string;
    fileData: string;
    mimeType: string;
  }) {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: fileData, mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  },

  // 6. TTS
  async textToSpeech(text: string, voice: string = 'Kore') {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
};
