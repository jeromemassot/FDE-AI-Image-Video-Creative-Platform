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

import { openDB } from 'idb';

const dbPromise = openDB('settings-db', 1, {
  upgrade(db) {
    db.createObjectStore('settings');
  },
});

export const saveSettings = async (
  apiKey: string,
  sessionDirectory: FileSystemDirectoryHandle | null,
  setIsSettingsOpen: (isOpen: boolean) => void
) => {
  try {
    const db = await dbPromise;
    await db.put('settings', apiKey, 'apiKey');
    if (sessionDirectory) {
      await db.put('settings', sessionDirectory, 'sessionDirectory');
    }
    setIsSettingsOpen(false);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = async (
  setApiKey: (apiKey: string) => void,
  setSessionDirectory: (directory: FileSystemDirectoryHandle | null) => void
) => {
  try {
    const db = await dbPromise;
    const apiKey = await db.get('settings', 'apiKey');
    const sessionDirectory = await db.get('settings', 'sessionDirectory');
    if (apiKey) {
      setApiKey(apiKey);
    }
    if (sessionDirectory) {
      setSessionDirectory(sessionDirectory);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};