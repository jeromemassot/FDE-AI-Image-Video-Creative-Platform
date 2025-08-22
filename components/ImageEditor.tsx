
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentAnnotation = useRef<Annotation | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isCancellingWithEscape = useRef(false);
  const dragStartPoint = useRef<Point | null>(null);
  const initialAnnotationState = useRef<Annotation | null>(null);

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
                            onClick={() => handleGenerateImage(apiKey, generationPrompt, setIsGeneratingImage, setGenerationError, setImage, setAnnotations, setTextInput, setSelectedAnnotationId)} 
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
                onClick={() => handleGenerateImage(apiKey, generationPrompt, setIsGeneratingImage, setGenerationError, setImage, setAnnotations, setTextInput, setSelectedAnnotationId)} 
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
