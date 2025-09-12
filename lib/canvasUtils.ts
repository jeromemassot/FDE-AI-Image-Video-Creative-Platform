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
import { Tool, Annotation, Point, TextAnnotation } from '../types';

export const getCanvasCoordinates = (event: React.MouseEvent | MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };
  
export const getTextBoundingBox = (anno: TextAnnotation, ctx: CanvasRenderingContext2D) => {
      ctx.font = `${anno.fontSize}px sans-serif`;
      const lines = anno.text.split('\n');
      const lineHeight = anno.fontSize * 1.2;
      const width = Math.max(...lines.map(l => ctx.measureText(l).width), 10);
      const height = lines.length * lineHeight;

      const tl = { x: anno.position.x, y: anno.position.y };
      const tr = { x: anno.position.x + width, y: anno.position.y };
      const bl = { x: anno.position.x, y: anno.position.y + height };
      const br = { x: anno.position.x + width, y: anno.position.y + height };
      const center = { x: anno.position.x + width / 2, y: anno.position.y + height / 2 };
      
      const rotatePoint = (p: Point, c: Point, angle: number) => {
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);
          const translatedX = p.x - c.x;
          const translatedY = p.y - c.y;
          return {
              x: translatedX * cos - translatedY * sin + c.x,
              y: translatedX * sin + translatedY * cos + c.y
          };
      };
      
      const rotationHandle = rotatePoint({x: center.x, y: anno.position.y - 20}, center, anno.rotation);

      return {
          tl: rotatePoint(tl, center, anno.rotation),
          tr: rotatePoint(tr, center, anno.rotation),
          bl: rotatePoint(bl, center, anno.rotation),
          br: rotatePoint(br, center, anno.rotation),
          rotationHandle: rotationHandle,
          center
      };
  };

export const getActionForPointOnText = (point: Point, anno: TextAnnotation, ctx: CanvasRenderingContext2D): 'moving' | 'rotating' | 'resizing' | 'none' => {
      const box = getTextBoundingBox(anno, ctx);
      const handleSize = 10;
      const isNear = (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y) < handleSize;

      if (isNear(point, box.rotationHandle)) return 'rotating';
      if ([box.tl, box.tr, box.bl, box.br].some(h => isNear(point, h))) return 'resizing';

      const vertices = [box.tl, box.tr, box.br, box.bl];
      let isInside = false;
      for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
          const intersect = ((vertices[i].y > point.y) !== (vertices[j].y > point.y)) && (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x);
          if (intersect) isInside = !isInside;
      }
      return isInside ? 'moving' : 'none';
  };

export const drawAnnotation = (ctx: CanvasRenderingContext2D, anno: Annotation) => {
    ctx.strokeStyle = anno.color;
    ctx.lineWidth = anno.lineWidth;
    ctx.fillStyle = anno.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.globalCompositeOperation = 'source-over';

    switch (anno.type) {
      case Tool.PENCIL:
        ctx.beginPath();
        if (anno.points.length > 0) {
            ctx.moveTo(anno.points[0].x, anno.points[0].y);
            for (let i = 1; i < anno.points.length; i++) {
                ctx.lineTo(anno.points[i].x, anno.points[i].y);
            }
        }
        ctx.stroke();
        break;
      case Tool.LINE:
        ctx.beginPath();
        ctx.moveTo(anno.start.x, anno.start.y);
        ctx.lineTo(anno.end.x, anno.end.y);
        ctx.stroke();
        break;
      case Tool.RECTANGLE:
        ctx.strokeRect(anno.start.x, anno.start.y, anno.width, anno.height);
        break;
      case Tool.TEXT:
        ctx.save();
        const lines = anno.text.split('\n');
        const lineHeight = anno.fontSize * 1.2;
        ctx.font = `${anno.fontSize}px sans-serif`;
        const textWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
        const textHeight = lines.length * lineHeight;
        const centerX = anno.position.x + textWidth / 2;
        const centerY = anno.position.y + textHeight / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(anno.rotation);
        ctx.translate(-centerX, -centerY);

        ctx.textBaseline = 'top';
        lines.forEach((line, index) => {
            ctx.fillText(line, anno.position.x, anno.position.y + (index * lineHeight));
        });
        ctx.restore();
        break;
    }
    ctx.globalCompositeOperation = 'source-over';
  };

export const drawTextSelectionHandles = (ctx: CanvasRenderingContext2D, anno: TextAnnotation) => {
      const box = getTextBoundingBox(anno, ctx);
      ctx.strokeStyle = '#00a8ff';
      ctx.lineWidth = 1;

      // Dashed bounding box
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(box.tl.x, box.tl.y);
      ctx.lineTo(box.tr.x, box.tr.y);
      ctx.lineTo(box.br.x, box.br.y);
      ctx.lineTo(box.bl.x, box.bl.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotation handle line and circle
      ctx.beginPath();
      ctx.moveTo(box.center.x, box.center.y);
      ctx.lineTo(box.rotationHandle.x, box.rotationHandle.y);
      ctx.stroke();

      const handleSize = 8;
      const handles = [box.tl, box.tr, box.bl, box.br, box.rotationHandle];
      ctx.fillStyle = '#00a8ff';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      handles.forEach(h => {
          ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      });
  };

export const drawCanvas = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    containerRef: React.RefObject<HTMLDivElement>,
    loadedImage: HTMLImageElement | null,
    annotations: Annotation[],
    action: string,
    currentAnnotation: Annotation | null,
    selectedAnnotationId: number | null
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !containerRef.current) return;

    const availableWidth = containerRef.current.clientWidth;
    const availableHeight = containerRef.current.clientHeight;

    canvas.width = availableWidth;
    canvas.height = availableHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (loadedImage) {
      const imgAspectRatio = loadedImage.width / loadedImage.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (imgAspectRatio > canvasAspectRatio) {
        drawHeight = canvas.width / imgAspectRatio;
        y = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgAspectRatio;
        x = (canvas.width - drawWidth) / 2;
      }
      ctx.drawImage(loadedImage, x, y, drawWidth, drawHeight);
    }
    
    annotations.forEach(anno => {
      if (anno) { // Guard against null annotations
        drawAnnotation(ctx, anno)
      }
    });
    
    if (action === 'drawing' && currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }

    const selectedAnno = annotations.find(a => a.id === selectedAnnotationId);
    if(selectedAnno && selectedAnno.type === Tool.TEXT) {
      drawTextSelectionHandles(ctx, selectedAnno as TextAnnotation);
    }
  };
