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
