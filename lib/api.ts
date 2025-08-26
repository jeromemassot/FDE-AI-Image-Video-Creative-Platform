import { GoogleGenAI, Video } from '@google/genai';

export const fetchApiKey = async (setApiKey: (key: string) => void) => {
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setApiKey('Copy API Key here'); // Replace with your actual API key
  };

export const handleGenerateImage = async (
  apiKey: string,
  generationPrompt: string,
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

      console.log(`apiKey: ${apiKey}`)

      const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
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
      'Veo 3.0': "veo-3.0-generate-001",
      'Veo 3.0 Preview': "veo-3.0-generate-preview",
      'Veo 3.0 Fast': "veo-3.0-fast-generate-001",
      'Veo 3.0 Fast Preview': "veo-3.0-fast-generate-preview"
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