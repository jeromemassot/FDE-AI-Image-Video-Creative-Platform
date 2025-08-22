import React, { useState, useEffect } from 'react';
import ResizablePanels from './components/ResizablePanels';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import SettingsIcon from './components/icons/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import { fetchApiKey } from './lib/api';
import { handleSaveSettings } from './lib/settings';
import logo from './assets/logos/logo.png';

const App: React.FC = () => {
  const [annotatedImageForVideo, setAnnotatedImageForVideo] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchApiKey(setApiKey);
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="App Logo" className="h-10 w-30" />
          <h1 className="text-xl font-bold tracking-tight">AI Video Scene Creator</h1>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white">
          <SettingsIcon />
        </button>
      </header>
      <main className="flex-grow min-h-0">
        <ResizablePanels
          leftPanel={<ImageEditor onPrepareForVideo={setAnnotatedImageForVideo} apiKey={apiKey} />}
          rightPanel={<VideoGenerator baseImage={annotatedImageForVideo} apiKey={apiKey} />}
        />
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        onSave={() => handleSaveSettings(apiKey, setIsSettingsOpen)}
      />
    </div>
  );
};

export default App;