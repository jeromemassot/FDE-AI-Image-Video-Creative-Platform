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

export const savePromptToFile = async (
  sessionDirectory: FileSystemDirectoryHandle | null,
  sessionId: string,
  prompt: string,
  type: 'image' | 'video'
) => {
  if (!sessionDirectory || !sessionId) {
    return;
  }

  try {
    const fileName = `session-${sessionId}.txt`;
    const fileHandle = await sessionDirectory.getFileHandle(fileName, { create: true });
    const file = await fileHandle.getFile();
    const writable = await fileHandle.createWritable({ keepExistingData: true });
    await writable.seek(file.size);
    const timestamp = new Date().toISOString();
    await writable.write(`[${timestamp}] [${type}]\n${prompt}\n\n`);
    await writable.close();
  } catch (error) {
    console.error('Failed to save prompt to file:', error);
  }
};

export const saveImageUploadToFile = async (
  sessionDirectory: FileSystemDirectoryHandle | null,
  sessionId: string,
  fileName: string,
  description: string
) => {
  if (!sessionDirectory || !sessionId) {
    return;
  }

  try {
    const sessionFileName = `session-${sessionId}.txt`;
    const fileHandle = await sessionDirectory.getFileHandle(sessionFileName, { create: true });
    const file = await fileHandle.getFile();
    const writable = await fileHandle.createWritable({ keepExistingData: true });
    await writable.seek(file.size);
    const timestamp = new Date().toISOString();
    await writable.write(`[${timestamp}] [image-upload]\nFile: ${fileName}\nDescription: ${description}\n\n`);
    await writable.close();
  } catch (error) {
    console.error('Failed to save image upload info to file:', error);
  }
};

export const createNewSessionFile = async (
  sessionDirectory: FileSystemDirectoryHandle | null,
  sessionId: string
) => {
  if (!sessionDirectory || !sessionId) {
    return;
  }

  try {
    const fileName = `session-${sessionId}.txt`;
    const fileHandle = await sessionDirectory.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable({ keepExistingData: false });
    const timestamp = new Date().toISOString();
    await writable.write(`[${timestamp}] [session-start]\nNew session created.\n\n`);
    await writable.close();
  } catch (error) {
    console.error('Failed to create new session file:', error);
  }
};
