
export enum Tool {
  MOVE = 'MOVE',
  PENCIL = 'PENCIL',
  LINE = 'LINE',
  RECTANGLE = 'RECTANGLE',
  TEXT = 'TEXT'
}

export interface Point {
  x: number;
  y: number;
}

interface BaseAnnotation {
  id: number;
  color: string;
  lineWidth: number;
}

export interface PencilAnnotation extends BaseAnnotation {
  type: Tool.PENCIL;
  points: Point[];
}

export interface LineAnnotation extends BaseAnnotation {
  type: Tool.LINE;
  start: Point;
  end: Point;
}

export interface RectangleAnnotation extends BaseAnnotation {
  type: Tool.RECTANGLE;
  start: Point;
  width: number;
  height: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: Tool.TEXT;
  position: Point;
  text: string;
  fontSize: number;
  rotation: number;
}

export type Annotation = PencilAnnotation | LineAnnotation | RectangleAnnotation | TextAnnotation;