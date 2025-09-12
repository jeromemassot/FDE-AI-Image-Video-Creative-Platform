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

export interface ChecklistItem {
  name: string;
  description: string;
  completed: boolean;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | FileSystemHandle;
    }): Promise<FileSystemDirectoryHandle>;
  }
}
