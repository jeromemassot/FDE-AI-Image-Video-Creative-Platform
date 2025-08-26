import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tool, Annotation, Point, PencilAnnotation, LineAnnotation, RectangleAnnotation, TextAnnotation } from '../types';
import Toolbox from './Toolbox';
import UploadIcon from './icons/UploadIcon';
import { handleGenerateImage } from '../lib/api';
import { handleImageUpload } from '../lib/imageUtils';
import { drawCanvas } from '../lib/canvasUtils';
import { 
    commitAndClearTextInput, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleClear, 
    handleUndo, 
    handlePrepareForVideo, 
    handleTextInputChange, 
    handleTextAreaBlur, 
    handleTextInputKeyDown 
} from '../lib/imageEditorUtils';

const anglesOfView = [
  { title: "Eye-Level", description: "This is the most common angle. You hold the camera at the same height as your subject's eyes. It creates a natural and direct connection, making the viewer feel like they are right there with the subject." },
  { title: "High Angle", description: "The camera is positioned above the subject, looking down. This angle can make the subject seem smaller, younger, or more vulnerable. It's also great for showing the layout of a scene from above." },
  { title: "Low Angle", description: "The camera is placed below the subject, looking up. This angle makes the subject look powerful, tall, and important. It can make buildings look massive or people seem heroic." },
  { title: "Bird's-Eye View", description: "This is an extreme high angle, taken from directly overhead, as if you were a bird looking straight down. It’s great for showing patterns, shapes, and the relationship between objects on the ground." },
  { title: "Worm's-Eye View", description: "This is an extreme low angle, taken from ground level (or even lower!) looking straight up. It creates a dramatic and often distorted perspective, making the world seem huge and overwhelming." },
  { title: "Head-On Shot", description: "You face your subject directly, with the camera pointed straight at their front. This angle feels very direct, honest, and sometimes confrontational. It works well for portraits and showing symmetry." },
  { title: "Profile Shot", description: "You position the camera directly to the side of your subject, capturing their silhouette or side view. This angle is great for highlighting a person's features or the shape of an object, creating a more pensive or observational mood." },
  { title: "Over-the-Shoulder", description: "The photo is taken from behind a person, looking over their shoulder at the main subject. This draws the viewer into the scene, making them feel like they are part of a conversation or a participant in the action." },
  { title: "Tilted Horizon", description: "The camera is physically tilted to one side, so the horizon line in the picture is slanted. This creates a sense of unease, motion, or excitement. It’s often used to make a scene feel more dynamic or confusing." },
  { title: "Frame Within a Frame", description: "This is when you use an element in the scene—like a doorway, window, or archway—to create a natural frame around your main subject. This angle adds depth to the picture and helps to draw the viewer's eye exactly where you want it to go." }
];

const lensTypes = [
  { title: "Wide-Angle Lens (24mm)", description: "This lens captures a very broad field of view, making it perfect for sweeping landscapes, cityscapes, and architectural shots. It creates a sense of grand scale and depth. Be aware that it can cause **perspective distortion**, where objects near the edges of the frame appear stretched or curved, adding a dynamic and sometimes dramatic feel to the image." },
  { title: "Telephoto Lens (200mm)", description: "A telephoto lens makes distant subjects appear much closer. Its signature effect is **perspective compression**, which makes the background seem closer to the subject than it is. This lens creates a very shallow depth of field, resulting in a sharp subject against a beautifully blurred background, an effect known as **bokeh**. It's ideal for portraits, wildlife, and sports photography." },
  { title: "Macro Lens", description: "This lens is used for extreme close-up photography. It magnifies tiny subjects to reveal intricate, fascinating details that are not visible to the naked eye. The key visual trait is an **extremely shallow depth of field**, where only a tiny slice of the subject is in sharp focus, while the rest melts away into a soft blur. Use this for images of insects, flowers, water droplets, or textures." },
  { title: "Fisheye Lens", description: "An extreme type of wide-angle lens that produces a strong visual distortion, creating a circular or hemispherical image. Straight lines in the scene, especially near the edges, will appear dramatically curved. This creates a surreal, immersive, and highly stylized **spherical perspective**, as if looking through a peephole or at a reflection in a crystal ball." },
  { title: "Tilt-Shift Lens", description: "This specialized lens allows the artist to manipulate the plane of focus. The most popular creative use in image generation is to create the 'miniature faking' or diorama effect. By selectively blurring the top and bottom of the frame, a life-sized scene (like a city street or a landscape) is made to look like a tiny, artificial model. It gives the image a whimsical, toy-like appearance." }
];

const paperGrains = [
  { title: "Fine Grain", description: "This adds a very subtle, almost imperceptible texture to the image. It mimics high-quality, professional film, resulting in a very clean, sharp, and smooth picture. Use this prompt when you want just a hint of analog character and authenticity without sacrificing any fine detail." },
  { title: "Medium Grain", description: "This is the classic 'film look' that most people think of. The grain is clearly visible but not distracting, adding a pleasant texture that breaks up the digital perfection of the image. It evokes a feeling of nostalgia and authenticity, and it's a versatile choice for portraits, street photography, and everyday scenes." },
  { title: "Coarse Grain", description: "This creates a very prominent, gritty, and sandy texture across the entire image. Fine details are softened and sometimes obscured by the strong grain pattern. This effect adds a raw, moody, and atmospheric quality, perfect for emulating low-light photography, vintage photojournalism, or creating edgy and emotional artistic images." },
  { title: "Matte Paper Texture", description: "This effect simulates the physical surface of the paper rather than the film. A matte finish is non-reflective and has a soft, sometimes slightly fibrous appearance. This texture tends to lift the black levels, reducing deep contrast and giving the image a gentle, artistic, and sometimes painterly feel." },
  { title: "Silver Halide", description: "Evoking the classic black-and-white darkroom printing process, this prompt creates an image with rich tonal depth and a characteristic grain structure. It's especially effective for monochrome images, lending them a timeless, archival quality with deep blacks, crisp whites, and a beautiful, natural-looking grain pattern." }
];

interface ImageEditorProps {
  onPrepareForVideo: (dataUrl: string) => void;
  apiKey: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({onPrepareForVideo, apiKey}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>(Tool.PENCIL);
  const [color, setColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(5);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<{ position: Point; value: string } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<number | null>(null);
  const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'rotating'>('none');
  const [showVideoPreparedMessage, setShowVideoPreparedMessage] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState('');
  const [selectedLens, setSelectedLens] = useState('');
  const [selectedPaperGrain, setSelectedPaperGrain] = useState('');

  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentAnnotation = useRef<Annotation | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isCancellingWithEscape = useRef(false);
  const dragStartPoint = useRef<Point | null>(null);
  const initialAnnotationState = useRef<Annotation | null>(null);

  const handleGenerateImageWithOptions = () => {
    const options = [selectedAngle, selectedLens, selectedPaperGrain].filter(Boolean).join(', ');
    const fullPrompt = options ? `${options}, ${generationPrompt}` : generationPrompt;
    handleGenerateImage(apiKey, fullPrompt, setIsGeneratingImage, setGenerationError, setImage, setAnnotations, setTextInput, setSelectedAnnotationId);
  };

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => setLoadedImage(img);
      img.onerror = () => setLoadedImage(null);
    } else {
      setLoadedImage(null);
    }
  }, [image]);

  useEffect(() => {
    if (textInput && textAreaRef.current) {
        textAreaRef.current.focus();
    }
  }, [textInput]);
  
  useEffect(() => {
    // Deselect annotation if tool changes from MOVE
    if(tool !== Tool.MOVE) {
      setSelectedAnnotationId(null);
    }
  }, [tool]);

  const memoizedDrawCanvas = useCallback(() => {
    drawCanvas(
      canvasRef,
      containerRef,
      loadedImage,
      annotations,
      action,
      currentAnnotation.current,
      selectedAnnotationId
    );
  }, [annotations, loadedImage, action, selectedAnnotationId]);

  useEffect(() => {
    memoizedDrawCanvas();
  }, [memoizedDrawCanvas]);
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => memoizedDrawCanvas());
    if(containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [memoizedDrawCanvas]);

  const memoizedCommitAndClearTextInput = useCallback(() => {
    commitAndClearTextInput(setTextInput, color, lineWidth, setAnnotations, setSelectedAnnotationId, setTool);
  }, [color, lineWidth]);

  useEffect(() => {
    if (tool !== Tool.TEXT && textInput) {
      memoizedCommitAndClearTextInput();
    }
  }, [tool, textInput, memoizedCommitAndClearTextInput]);

  const cursorClass = !image ? 'cursor-default' : 
    tool === Tool.MOVE ? 'cursor-grab' : 
    tool === Tool.TEXT ? 'cursor-text' : 
    'cursor-crosshair';

  return (
    <div className="flex flex-col h-full bg-gray-900 p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Image Generation and Annotation</h2>
      <Toolbox 
        tool={tool} 
        setTool={setTool}
        color={color}
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        onClear={() => handleClear(setImage, setAnnotations, setGenerationError, setTextInput, setSelectedAnnotationId)}
        onUndo={() => handleUndo(selectedAnnotationId, setSelectedAnnotationId, setAnnotations)}
        onImageUpload={(e) => handleImageUpload(e, setImage, setAnnotations, setGenerationPrompt, setGenerationError, setTextInput, setSelectedAnnotationId)}
        imageLoaded={!!image}
      />
      <div className="bg-gray-800 border-y border-gray-700 -mx-6 px-6 py-2 flex items-center space-x-4">
        <label htmlFor="angle-of-view" className="text-sm font-medium text-white">Angle of View:</label>
        <select
          id="angle-of-view"
          value={selectedAngle}
          onChange={(e) => setSelectedAngle(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select --</option>
          {anglesOfView.map(angle => (
            <option key={angle.title} value={angle.title} title={angle.description}>
              {angle.title}
            </option>
          ))}
        </select>
        <label htmlFor="lens-type" className="text-sm font-medium text-white">Lens Type:</label>
        <select
          id="lens-type"
          value={selectedLens}
          onChange={(e) => setSelectedLens(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select --</option>
          {lensTypes.map(lens => (
            <option key={lens.title} value={lens.title} title={lens.description}>
              {lens.title}
            </option>
          ))}
        </select>
        <label htmlFor="paper-grain" className="text-sm font-medium text-white">Paper Grain:</label>
        <select
          id="paper-grain"
          value={selectedPaperGrain}
          onChange={(e) => setSelectedPaperGrain(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select --</option>
          {paperGrains.map(grain => (
            <option key={grain.title} value={grain.title} title={grain.description}>
              {grain.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-grow min-h-0">
        <div ref={containerRef} className="flex-grow w-full h-full relative flex items-center justify-center">
            {!image ? (
                <div className="text-center text-gray-400 max-w-2xl w-full p-4">
                    <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 mb-6">
                        <h3 className="text-lg font-medium text-white">Upload an Image</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-4">Select a file from your computer to start annotating.</p>
                        <label htmlFor="imageUploadToolbox" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors">
                            <UploadIcon />
                            <span>Upload Image</span>
                        </label>
                    </div>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-900 px-2 text-sm text-gray-500">OR</span>
                        </div>
                    </div>

                    <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50">
                        <h3 className="text-lg font-medium text-white">Generate with AI</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-4">Describe the image you want to create.</p>
                        <textarea 
                            value={generationPrompt}
                            onChange={e => {
                              setGenerationPrompt(e.target.value)
                              setGenerationError(null);
                            }}
                            placeholder="e.g., A robot holding a red skateboard."
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[80px]"
                            disabled={isGeneratingImage}
                        />
                        {generationError && (
                            <p className="mt-2 text-sm text-red-500 text-left">{generationError}</p>
                        )}
                        <button 
                            onClick={handleGenerateImageWithOptions} 
                            disabled={isGeneratingImage || !generationPrompt.trim()}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isGeneratingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                              'Generate Image'
                          )}
                        </button>
                    </div>
                </div>
            ) : (
              <>
                {tool === Tool.TEXT && !textInput && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white px-4 py-2 rounded-md pointer-events-none z-10 animate-pulse">
                        Click anywhere on the image to add text.
                    </div>
                )}
                <canvas
                  ref={canvasRef}
                  onMouseDown={(e) => handleMouseDown(e, image, canvasRef, textAreaRef, textInput, memoizedCommitAndClearTextInput, tool, annotations, selectedAnnotationId, setAction, initialAnnotationState, setSelectedAnnotationId, setTextInput, currentAnnotation, color, lineWidth, dragStartPoint)}
                  onMouseMove={(e) => handleMouseMove(e, action, dragStartPoint, canvasRef, currentAnnotation, memoizedDrawCanvas, initialAnnotationState, setAnnotations)}
                  onMouseUp={() => handleMouseUp(action, currentAnnotation, setAnnotations, setAction, initialAnnotationState, dragStartPoint)}
                  onMouseLeave={() => handleMouseUp(action, currentAnnotation, setAnnotations, setAction, initialAnnotationState, dragStartPoint)}
                  className={`absolute top-0 left-0 ${action === 'moving' ? 'cursor-grabbing' : cursorClass}`}
                />
                {textInput && (
                    <textarea
                        ref={textAreaRef}
                        value={textInput.value}
                        onChange={(e) => handleTextInputChange(e, setTextInput)}
                        onBlur={() => handleTextAreaBlur(isCancellingWithEscape, memoizedCommitAndClearTextInput, setTextInput)}
                        onKeyDown={(e) => handleTextInputKeyDown(e, memoizedCommitAndClearTextInput, isCancellingWithEscape)}
                        style={{
                            position: 'absolute',
                            left: textInput.position.x,
                            top: textInput.position.y,
                            fontSize: `${lineWidth * 3}px`,
                            lineHeight: 1.2,
                            color: color,
                            backgroundColor: 'rgba(17, 24, 39, 0.8)',
                            border: `1px solid ${color}`,
                            borderRadius: '4px',
                            padding: '4px',
                            fontFamily: 'sans-serif',
                            resize: 'none',
                            outline: 'none',
                            zIndex: 10,
                            minWidth: '50px',
                            overflowY: 'hidden',
                        }}
                        rows={1}
                        placeholder="Type..."
                    />
                )}
              </>
            )}
        </div>

        {image && (
          <aside className="w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 p-6 flex flex-col space-y-4 overflow-y-auto">
            <h3 className="text-lg font-medium text-white">Regenerate Image</h3>
            <p className="text-sm text-gray-400">Modify your prompt to create a new version of the image.</p>
            <textarea 
                value={generationPrompt}
                onChange={e => {
                  setGenerationPrompt(e.target.value)
                  setGenerationError(null);
                }}
                placeholder="e.g., A robot holding a red skateboard."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px]"
                disabled={isGeneratingImage}
            />
            {generationError && (
                <p className="text-sm text-red-500 text-left">{generationError}</p>
            )}
            <button 
                onClick={handleGenerateImageWithOptions} 
                disabled={isGeneratingImage || !generationPrompt.trim()}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isGeneratingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                    'Regenerate Image'
                )}
            </button>

            <div className="border-t border-gray-600 my-4" />

            <h3 className="text-lg font-medium text-white">Generate Video</h3>
            <p className="text-sm text-gray-400">Send the final annotated image to the video generation panel.</p>
            <button 
                onClick={() => handlePrepareForVideo(canvasRef, onPrepareForVideo, setShowVideoPreparedMessage)} 
                className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
                Prepare for Video
            </button>
            {showVideoPreparedMessage && (
                <p className="mt-2 text-sm text-green-400 text-center">Image sent to video panel!</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
