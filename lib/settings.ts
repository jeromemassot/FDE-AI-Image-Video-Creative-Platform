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