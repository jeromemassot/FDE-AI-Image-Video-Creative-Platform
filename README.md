# AI VIDEO SCENE CREATOR

## Project Overview

This project is a web-based AI Video Scene Creator that allows users to generate images and videos using Google's Generative AI models. The application is built with React, TypeScript, and Vite. It features an image editor for annotating images and a video generator that uses the annotated images to create video scenes.

The core functionalities are:
- **Image Generation:** Users can generate an image from a text prompt using the `imagen-3.0-generate-002` model.
- **Image Annotation:** Users can annotate the generated or uploaded images with various tools like pencil, shapes, and text.
- **Video Generation:** The annotated image can be used as a base to generate a video with different `veo-3.0` models.

The application is structured with a main `App.tsx` component that orchestrates the `ImageEditor` and `VideoGenerator` components. The API calls to the Google Generative AI are handled in `lib/api.ts`.

## Building and Running

To build and run the project, use the following commands:

- **Install dependencies:**
  ```bash
  npm install
  ```

- **Run the development server:**
  ```bash
  npm run dev
  ```

- **Build for production:**
  ```bash
  npm run build
  ```

- **Preview the production build:**
  ```bash
  npm run preview
  ```

- **Start the production server:**
  ```bash
  npm run start
  ```

## Development Conventions

- **API Key:** The application requires a Google Generative AI API key. The current implementation has a placeholder in `lib/api.ts`. For development, you should replace the placeholder with your actual API key.
- **Styling:** The project uses Tailwind CSS for styling.
- **Component-based architecture:** The UI is built with React components, which are located in the `components` directory.
- **Utility functions:** Helper functions for API calls, image manipulation, and other utilities are located in the `lib` directory.
- **Typing:** The project uses TypeScript for static typing. Type definitions are in the `types.ts` file.
