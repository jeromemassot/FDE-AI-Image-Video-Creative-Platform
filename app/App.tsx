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

import React, { useState, useEffect } from 'react';
import ResizablePanels from './components/ResizablePanels';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import SettingsIcon from './components/icons/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import { saveSettings, loadSettings } from './lib/settings';
import logo from './assets/logos/logo-gc.png';
import ChecklistIcon from './components/icons/ChecklistIcon';
import ChecklistSidebar from './components/ChecklistSidebar';
import PlusIcon from './components/icons/PlusIcon';
import { createNewSessionFile } from './lib/session';

const App: React.FC = () => {
  const [annotatedImageForVideo, setAnnotatedImageForVideo] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [sessionDirectory, setSessionDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);

  useEffect(() => {
    loadSettings(setApiKey, setSessionDirectory);
    setSessionId(Date.now().toString());
  }, []);

  const handleNewSession = async () => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    await createNewSessionFile(sessionDirectory, newSessionId);
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="App Logo" className="h-7 w-21" />
          <h1 className="text-xl font-bold tracking-tight">AI Video Scene Creator CI/CD Pipeline</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleNewSession}
            className="text-gray-400 hover:text-white">
            <PlusIcon />
          </button>
          <button onClick={() => setIsChecklistOpen(!isChecklistOpen)} className="text-gray-400 hover:text-white">
            <ChecklistIcon />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white">
            <SettingsIcon />
          </button>
        </div>
      </header>
      <main className="flex-grow min-h-0 flex">
        <div className={`flex-grow h-full transition-all duration-300 ${isChecklistOpen ? 'w-[calc(100%-24rem)]' : 'w-full'}`}>
          <ResizablePanels
            leftPanel={<ImageEditor key={sessionId} onPrepareForVideo={setAnnotatedImageForVideo} apiKey={apiKey} sessionDirectory={sessionDirectory} sessionId={sessionId} />}
            rightPanel={<VideoGenerator key={sessionId} baseImage={annotatedImageForVideo} apiKey={apiKey} sessionDirectory={sessionDirectory} sessionId={sessionId} />}
          />
        </div>
        <ChecklistSidebar isOpen={isChecklistOpen} />
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        sessionDirectory={sessionDirectory}
        setSessionDirectory={setSessionDirectory}
        onSave={() => saveSettings(apiKey, sessionDirectory, setIsSettingsOpen)}
      />
    </div>
  );
};

export default App;