/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Creates a batch of Features in a given EntityType.
 * See https://cloud.google.com/vertex-ai/docs/featurestore/setup before running
 * the code snippet
 */

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
