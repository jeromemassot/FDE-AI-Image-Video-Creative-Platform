
export const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (image: string | null) => void,
    setAnnotations: (annotations: any[]) => void,
    setGenerationPrompt: (prompt: string) => void,
    setGenerationError: (error: string | null) => void,
    setTextInput: (textInput: any) => void,
    setSelectedAnnotationId: (id: number | null) => void
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setAnnotations([]);
        setGenerationPrompt('');
        setGenerationError(null);
        setTextInput(null);
        setSelectedAnnotationId(null);
      };
      reader.readAsDataURL(file);
    }
  };
