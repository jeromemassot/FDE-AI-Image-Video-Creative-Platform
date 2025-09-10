import React, { useState } from 'react';
import { Video } from "@google/genai";
import { handleGenerateVideo } from '../lib/api';
import { savePromptToFile } from '../lib/session';
import { renderContent } from '../lib/videoUtils.tsx';

interface VideoGeneratorProps {
  baseImage: string | null;
  apiKey: string;
  sessionDirectory: FileSystemDirectoryHandle | null;
  sessionId: string;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ baseImage, apiKey, sessionDirectory, sessionId }) => {
  const [prompt, setPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setVideo] = useState<Video | null | undefined>(null);
  const [selectedModel, setSelectedModel] = useState('Veo 3.0 Preview');

  const modelMapping = {
    'Veo 3.0': "veo-3.0-generate-001",
    'Veo 3.0 Preview': "veo-3.0-generate-preview",
    'Veo 3.0 Fast': "veo-3.0-fast-generate-001",
    'Veo 3.0 Fast Preview': "veo-3.0-fast-generate-preview"
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Video Generation</h2>
      <div className="flex-grow flex flex-col space-y-6 overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Generation Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Model Selector"
          >
            {Object.keys(modelMapping).map(key => (
                <option key={key} value={key} className="bg-gray-700 text-white">{key}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Animation Prompt (optional if annotated image)
          </label>
          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'A gentle breeze makes the wildflowers sway.'"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-lg h-full">
          {renderContent(generatedVideo, apiKey)}
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          onClick={() => {
            savePromptToFile(sessionDirectory, sessionId, prompt, 'video');
            handleGenerateVideo(baseImage, prompt, apiKey, selectedModel, setIsGeneratingVideo, setVideo)
          }}
          disabled={(!baseImage && !prompt.trim()) || isGeneratingVideo}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGeneratingVideo ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
              'Generate Video'
          )}
        </button>
      </div>
      </div>
  );
};

export default VideoGenerator;