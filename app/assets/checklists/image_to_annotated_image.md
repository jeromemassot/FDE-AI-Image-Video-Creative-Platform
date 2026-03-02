# Annotation of an image
This is a short checklist of tasks to complete for annotating an image:

## 1. Image Import or Generation
Description: Import an existing image, or generate a new image with a text prompt.

## 2. Image Annotation
Description: Use the Annotation toolbox to annotate the image.
From the toolbox, select the straight line, curved line, bounding box, text annotation you want.
Use the Undo button to erase the latest annotation created. Use the size selector to 
increase the visibility of the annotations if needed.
You can use the color palette to organize the annotations in a color-based way that
helps the image-to-video model generation.

## 3. Finalize & Export
Description: Download the annotated image on your local computer for future usage.

## Remark about Video generation
With an annotated image, no text prompt is needed to create a video from the image. 
However, if a text promtp is provided for the video generation, the model will try to 
fit both the image annotations and the text prompt. Also, the annotations are visible
on the first frames of the generated video, and disappear.
