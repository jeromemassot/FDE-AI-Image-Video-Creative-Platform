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

import { GoogleGenAI, Video } from '@google/genai';

export const fetchApiKey = async (setApiKey: (key: string) => void) => {
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setApiKey('Copy API Key here'); // Replace with your actual API key
  };

export const handleGenerateImage = async (
  apiKey: string,
  generationPrompt: string,
  model: string,
  setIsGeneratingImage: (isGenerating: boolean) => void,
  setGenerationError: (error: string | null) => void,
  setImage: (image: string | null) => void,
  setAnnotations: (annotations: any[]) => void,
  setTextInput: (textInput: any) => void,
  setSelectedAnnotationId: (id: number | null) => void
) => {
  setIsGeneratingImage(true);
  setGenerationError(null);
  try {
      const ai = new GoogleGenAI({
          vertexai: false,
          apiKey: apiKey
      });

      console.log(`apiKey: ${apiKey}`);
      console.log(`Using model for image generation: ${model}`);

      if (model.startsWith('imagen')) {
          const response = await ai.models.generateImages({
              model: model,
              prompt: generationPrompt,
              config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '1:1',
              },
          });
          const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
          const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          setImage(imageUrl);
      } else if (model.startsWith('gemini')) {
          const response = await ai.models.generateContent({
            model: model,
            contents: generationPrompt
          });
          
          let imageUrl: string | undefined;
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
              break;
            }
          }

          if (imageUrl) {
            setImage(imageUrl);
          } else {
            throw new Error("No image data returned from Gemini model.");
          }
      } else {
        throw new Error(`Unsupported model for image generation: ${model}`);
      }
      
      setAnnotations([]);
      setTextInput(null);
      setSelectedAnnotationId(null);
  } catch (error) {
      console.error("Error generating image:", error);
      setGenerationError("Failed to generate image. Please check your prompt and try again.");
  } finally {
      setIsGeneratingImage(false);
  }
};

export const handleGenerateVideo = async (
    baseImage: string | null,
    prompt: string,
    apiKey: string,
    selectedModel: string,
    setIsGeneratingVideo: (isGenerating: boolean) => void,
    setVideo: (video: Video | null | undefined) => void
  ) => {
    if (!baseImage && !prompt.trim()) {
      console.log('No base image or prompt provided');
      setIsGeneratingVideo(false);
      return;
    }

    setIsGeneratingVideo(true);
    
    const modelMapping = {
      'Veo 3.1': "veo-3.1-generate-preview",
      'Veo 3.1 Fast': "veo-3.1-fast-generate-preview"
    };

    const modelToUse = modelMapping[selectedModel as keyof typeof modelMapping];
    console.log(`Using model: ${modelToUse}`);

    const generationConfig = {};
    console.log(`generationConfig: ${JSON.stringify(generationConfig)}`);

    const ai = new GoogleGenAI({
      vertexai: false,
      apiKey: apiKey
    });

    let operation;
    let imagePart;
    let fullPrompt;

    const systemPrompt = `Look at the entire image and capture the global scene, characters, objects, situation.
  Create a video following the annotations on the image, respect carefully these annotations, in particular the direction of arrays if present.
  But also respect the original content, and use the original content to create a realistic scene.
  Remove the annotations from the generated video. The created video should mask any annotations (white and colored text, white and colored lines, white and colored arrows).
  The annotations are seen at the first frame and removed on all the following frames of the video.`;

    if (baseImage) {
      imagePart = {
        imageBytes: baseImage.split(',')[1],
        mimeType: "image/jpeg"
      }
      fullPrompt = !prompt.trim() ? systemPrompt : prompt.trim();
    } else {
      fullPrompt = prompt.trim();
    }

  console.log(`fullPrompt: ${fullPrompt}`);
  console.log(`imagePart: ${JSON.stringify(imagePart)}`);
  console.log(`modelToUse: ${modelToUse}`);

    operation = await ai.models.generateVideos({
      model: modelToUse,
      prompt: fullPrompt,
      image: imagePart,
      config: generationConfig,
    });

    while (!operation.done) {
      console.log("Waiting for video generation to complete...");
      await new Promise((resolve) => setTimeout(resolve, 50000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    setIsGeneratingVideo(false);

    setVideo(operation.response?.generatedVideos?.[0].video);
    console.log(`Generated video retrieved`);
  };

  export const updatePromptWithOptions = async (
    apiKey: string,
    originalPrompt: string,
    selectedAngle: string,
    selectedLens: string,
    selectedPaperGrain: string
  ): Promise<string> => {
    // if no options selected, return original prompt
    if (!selectedAngle && !selectedLens && !selectedPaperGrain) {
      return originalPrompt;
    }
  
    try {
      const ai = new GoogleGenAI({
        vertexai: false,
        apiKey: apiKey
      });
  
      const systemPrompt = `You are an expert in image generation prompts. Your task is to update a user's prompt with the specified photographic effects.
  - The user will provide an original prompt and a set of effects (Angle of View, Lens Type, Paper Grain).
  - If an effect has a value of 'None' or is an empty string, you must ignore it.
  - You must integrate the selected effects naturally into the original prompt. Do not just list them.
  - The output must be ONLY the new, updated prompt string. Do not add any other text, labels, or explanations.
  
  Example:
  Original prompt: "A knight in shining armor"
  Angle of View: "Low Angle"
  Lens Type: "None"
  Paper Grain: "Fine Grain"
  Output: "A low-angle shot of a knight in shining armor, with a fine grain texture."
  `;
  
      const userMessage = `
        Original prompt: "${originalPrompt}"
        Angle of View: ${selectedAngle || 'None'}
        Lens Type: ${selectedLens || 'None'}
        Paper Grain: ${selectedPaperGrain || 'None'}
      `;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [systemPrompt, userMessage]
      });
      const newPrompt = response.text;
      
      console.log(`Original prompt: ${originalPrompt}`);
      console.log(`Updated prompt: ${newPrompt}`);
  
      // Basic validation to ensure the model didn't return something weird
      if (newPrompt && newPrompt.length > 10) {
          return newPrompt;
      }
      // Fallback if the model returns empty or very short string
      const options = [selectedAngle, selectedLens, selectedPaperGrain].filter(Boolean).join(', ');
      return options ? `${options}, ${originalPrompt}` : originalPrompt;
  
    } catch (error) {
      console.error("Error updating prompt:", error);
      // Fallback to simple concatenation on error
      const options = [selectedAngle, selectedLens, selectedPaperGrain].filter(Boolean).join(', ');
      return options ? `${options}, ${originalPrompt}` : originalPrompt;
    }
  };

export const describeImage = async (
  apiKey: string,
  image: string,
  setIsDescribingImage: (isDescribing: boolean) => void,
  setDescriptionError: (error: string | null) => void
): Promise<string> => {
  if (!image) {
    setDescriptionError("No image provided to describe.");
    return "";
  }

  setIsDescribingImage(true);
  setDescriptionError(null);

  try {
    const ai = new GoogleGenAI({
      vertexai: false,
      apiKey: apiKey,
    });

    const systemPrompt = `Describe the following image in extreme detail. 
    Your description will be used as a prompt for a text-to-image generation model to recreate the image. 
    Capture every element, the style, the colors, the composition, the lighting, and the overall mood. 
    Be as descriptive and thorough as possible.`;

    const imagePart = {
      data: image.split(',')[1],
      mimeType: image.split(';')[0].split(':')[1],
    };

    console.log(imagePart)

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [systemPrompt, { inlineData: imagePart }]
    });

    const description = response.text;
    return description;

  } catch (error) {
    console.error("Error describing image:", error);
    setDescriptionError("Failed to describe the image. Please try again.");
    return '';
  } finally {
    setIsDescribingImage(false);
  }
};
