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
