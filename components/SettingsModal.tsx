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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  sessionDirectory: FileSystemDirectoryHandle | null;
  setSessionDirectory: (directory: FileSystemDirectoryHandle) => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, setApiKey, sessionDirectory, setSessionDirectory, onSave }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">API Token</h2>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
            Enter Your GenAI API Key
          </label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Session Folder
          </label>
          <button
            onClick={async () => {
              try {
                const handle = await window.showDirectoryPicker();
                setSessionDirectory(handle);
              } catch (error) {
                console.error('Error selecting directory:', error);
              }
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold py-2 px-4 rounded-md"
          >
            {sessionDirectory ? `Selected: ${sessionDirectory.name}` : 'Select Directory'}
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mr-2"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
