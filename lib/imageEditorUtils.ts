
import { Tool, Annotation, Point, TextAnnotation, PencilAnnotation, LineAnnotation, RectangleAnnotation } from '../types';
import { getCanvasCoordinates, getTextBoundingBox, getActionForPointOnText } from './canvasUtils';

export const commitAndClearTextInput = (
    setTextInput: (value: React.SetStateAction<{ position: Point; value: string; } | null>) => void,
    color: string,
    lineWidth: number,
    setAnnotations: (value: React.SetStateAction<Annotation[]>) => void,
    setSelectedAnnotationId: (value: React.SetStateAction<number | null>) => void,
    setTool: (value: React.SetStateAction<Tool>) => void
  ) => {
    setTextInput(currentTextInput => {
      if (currentTextInput && currentTextInput.value.trim()) {
        const newAnnotation: TextAnnotation = {
          id: Date.now(),
          color,
          lineWidth,
          type: Tool.TEXT,
          position: currentTextInput.position,
          text: currentTextInput.value,
          fontSize: lineWidth * 3,
          rotation: 0,
        };
        setAnnotations(prev => [...prev, newAnnotation]);
        setSelectedAnnotationId(newAnnotation.id);
        setTool(Tool.MOVE);
      }
      return null;
    });
  };

export const handleMouseDown = (
    event: React.MouseEvent,
    image: string | null,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    textAreaRef: React.RefObject<HTMLTextAreaElement>,
    textInput: { position: Point; value: string; } | null,
    commitAndClearTextInput: () => void,
    tool: Tool,
    annotations: Annotation[],
    selectedAnnotationId: number | null,
    setAction: (value: React.SetStateAction<string>) => void,
    initialAnnotationState: React.MutableRefObject<Annotation | null>,
    setSelectedAnnotationId: (value: React.SetStateAction<number | null>) => void,
    setTextInput: (value: React.SetStateAction<{ position: Point; value: string; } | null>) => void,
    currentAnnotation: React.MutableRefObject<Annotation | null>,
    color: string,
    lineWidth: number,
    dragStartPoint: React.MutableRefObject<Point | null>
) => {
    if (!image) return;
    const point = getCanvasCoordinates(event, canvasRef);
    dragStartPoint.current = point;
    
    if (textAreaRef.current?.contains(event.target as Node)) return;
    if (textInput) commitAndClearTextInput();

    if (tool === Tool.MOVE) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      
      const selectedAnno = annotations.find(a => a.id === selectedAnnotationId);
      if(selectedAnno && selectedAnno.type === Tool.TEXT) {
          const detectedAction = getActionForPointOnText(point, selectedAnno as TextAnnotation, ctx);
          if (detectedAction !== 'none') {
              setAction(detectedAction);
              initialAnnotationState.current = JSON.parse(JSON.stringify(selectedAnno));
              return;
          }
      }

      let clickedOnSomething = false;
      [...annotations].reverse().forEach(anno => {
          if (anno.type === Tool.TEXT) {
              if (getActionForPointOnText(point, anno as TextAnnotation, ctx) !== 'none') {
                  setSelectedAnnotationId(anno.id);
                  setAction('moving');
                  initialAnnotationState.current = JSON.parse(JSON.stringify(anno));
                  clickedOnSomething = true;
                  return;
              }
          }
      });

      if (!clickedOnSomething) setSelectedAnnotationId(null);
      return;
    }
    
    if (tool === Tool.TEXT) {
      setTimeout(() => setTextInput({ position: point, value: '' }), 0);
      return;
    }

    setAction('drawing');

    const newAnnotation: Partial<Annotation> = {
        id: Date.now(),
        color: color,
        lineWidth: lineWidth,
    };
    
    switch (tool) {
      case Tool.PENCIL:
        currentAnnotation.current = { ...newAnnotation, type: tool, points: [point] } as PencilAnnotation;
        break;
      case Tool.LINE:
        currentAnnotation.current = { ...newAnnotation, type: Tool.LINE, start: point, end: point } as LineAnnotation;
        break;
      case Tool.RECTANGLE:
        currentAnnotation.current = { ...newAnnotation, type: Tool.RECTANGLE, start: point, width: 0, height: 0 } as RectangleAnnotation;
        break;
    }
};

export const handleMouseMove = (
    event: React.MouseEvent,
    action: string,
    dragStartPoint: React.MutableRefObject<Point | null>,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    currentAnnotation: React.MutableRefObject<Annotation | null>,
    drawCanvas: () => void,
    initialAnnotationState: React.MutableRefObject<Annotation | null>,
    setAnnotations: (value: React.SetStateAction<Annotation[]>) => void
) => {
    if (action === 'none' || !dragStartPoint.current) return;
    const point = getCanvasCoordinates(event, canvasRef);
    
    if (action === 'drawing') {
      if (!currentAnnotation.current) return;
      
      const annotation = currentAnnotation.current;
      switch (annotation.type) {
        case Tool.PENCIL:
          if ('points' in annotation) {
            (annotation as PencilAnnotation).points.push(point);
          }
          break;
        case Tool.LINE:
          if ('end' in annotation) {
            (annotation as LineAnnotation).end = point;
          }
          break;
        case Tool.RECTANGLE:
          if ('width' in annotation && 'height' in annotation && 'start' in annotation) {
            (annotation as RectangleAnnotation).width = point.x - (annotation as RectangleAnnotation).start.x;
            (annotation as RectangleAnnotation).height = point.y - (annotation as RectangleAnnotation).start.y;
          }
          break;
      }
      drawCanvas();
    } else if (action === 'moving' || action === 'resizing' || action === 'rotating') {
        const initial = initialAnnotationState.current;
        if (!initial || initial.type !== Tool.TEXT) return;

        const updateAnnotation = (updatedProps: Partial<TextAnnotation>) => {
            setAnnotations(prev => prev.map(a => {
                if (a.id === initial.id && a.type === Tool.TEXT) {
                    return { ...a, ...updatedProps };
                }
                return a;
            }));
        };
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if(!ctx) return;
        const initialBox = getTextBoundingBox(initial as TextAnnotation, ctx);

        switch(action) {
            case 'moving':
                const dx = point.x - dragStartPoint.current.x;
                const dy = point.y - dragStartPoint.current.y;
                updateAnnotation({ position: { x: (initial as TextAnnotation).position.x + dx, y: (initial as TextAnnotation).position.y + dy } });
                break;
            case 'rotating':
                const startAngle = Math.atan2(dragStartPoint.current.y - initialBox.center.y, dragStartPoint.current.x - initialBox.center.x);
                const currentAngle = Math.atan2(point.y - initialBox.center.y, point.x - initialBox.center.x);
                updateAnnotation({ rotation: (initial as TextAnnotation).rotation + (currentAngle - startAngle) });
                break;
            case 'resizing':
                const startDist = Math.hypot(dragStartPoint.current.x - initialBox.center.x, dragStartPoint.current.y - initialBox.center.y);
                const currentDist = Math.hypot(point.x - initialBox.center.x, point.y - initialBox.center.y);
                if (startDist > 0) {
                    const scale = currentDist / startDist;
                    updateAnnotation({ fontSize: Math.max(5, (initial as TextAnnotation).fontSize * scale) });
                }
                break;
        }
    }
};

export const handleMouseUp = (
    action: string,
    currentAnnotation: React.MutableRefObject<Annotation | null>,
    setAnnotations: (value: React.SetStateAction<Annotation[]>) => void,
    setAction: (value: React.SetStateAction<string>) => void,
    initialAnnotationState: React.MutableRefObject<Annotation | null>,
    dragStartPoint: React.MutableRefObject<Point | null>
) => {
    if (action === 'drawing' && currentAnnotation.current) {
        const finishedAnnotation = currentAnnotation.current;
        setAnnotations(prev => [...prev, finishedAnnotation]);
    }

    setAction('none');
    currentAnnotation.current = null;
    initialAnnotationState.current = null;
    dragStartPoint.current = null;
};

export const handleClear = (
    setImage: (value: React.SetStateAction<string | null>) => void,
    setAnnotations: (value: React.SetStateAction<Annotation[]>) => void,
    setGenerationError: (value: React.SetStateAction<string | null>) => void,
    setTextInput: (value: React.SetStateAction<{ position: Point; value: string; } | null>) => void,
    setSelectedAnnotationId: (value: React.SetStateAction<number | null>) => void
) => {
    setImage(null);
    setAnnotations([]);
    setGenerationError(null);
    setTextInput(null);
    setSelectedAnnotationId(null);
};

export const handleUndo = (
    selectedAnnotationId: number | null,
    setSelectedAnnotationId: (value: React.SetStateAction<number | null>) => void,
    setAnnotations: (value: React.SetStateAction<Annotation[]>) => void
) => {
    if(selectedAnnotationId) {
        setSelectedAnnotationId(null);
    }
    setAnnotations(prev => prev.slice(0, -1));
};

export const handlePrepareForVideo = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    onPrepareForVideo: (dataUrl: string) => void,
    setShowVideoPreparedMessage: (value: React.SetStateAction<boolean>) => void
) => {
    const canvas = canvasRef.current;
    if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        onPrepareForVideo(dataUrl);
        setShowVideoPreparedMessage(true);
        setTimeout(() => setShowVideoPreparedMessage(false), 3000);
    }
};

export const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, setTextInput: (value: React.SetStateAction<{ position: Point; value: string; } | null>) => void) => {
    setTextInput(prev => prev ? { ...prev, value: e.target.value } : null);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
};

export const handleTextAreaBlur = (
    isCancellingWithEscape: React.MutableRefObject<boolean>,
    commitAndClearTextInput: () => void,
    setTextInput: (value: React.SetStateAction<{ position: Point; value: string; } | null>) => void
) => {
    if (isCancellingWithEscape.current) {
        isCancellingWithEscape.current = false;
        setTextInput(null);
    } else {
        commitAndClearTextInput();
    }
};

export const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, commitAndClearTextInput: () => void, isCancellingWithEscape: React.MutableRefObject<boolean>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitAndClearTextInput();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      isCancellingWithEscape.current = true;
      e.currentTarget.blur();
    }
};
