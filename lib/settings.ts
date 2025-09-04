
export const handleSaveSettings = (apiKey: string, setIsSettingsOpen: (isOpen: boolean) => void) => {
    // In a real app, you might want to encrypt and store the API key securely  
    console.log('API Key saved (not really, just in state)');
    setIsSettingsOpen(false);
  };
