
import React from 'react';
import { Video } from "@google/genai";

export const renderContent = (generatedVideo: Video | null | undefined, apiKey: string) => {
    if (generatedVideo) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
            <video 
                src={`${generatedVideo.uri}&key=${apiKey}`}
                controls 
                className="max-w-full max-h-full rounded-md object-contain"
            >
              Your browser does not support the video tag.
            </video>
        </div>
      );
    }

    return (
      <div className="text-left text-gray-500">
        <p>1. Two options for generating the video:</p>
        <p>- if you use an image with annotations from the left panel: prompt not needed</p>
        <p>- if neiter annotation nor image is provided, you can generate video from a prompt: prompt needed.</p>
        <br></br>
        <p>2. Click "Generate Video" to begin.</p>
      </div>
    );
  };
