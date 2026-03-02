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

export interface PhotographicOption {
  title: string;
  description: string;
}

export const anglesOfView: PhotographicOption[] = [
  { title: "Eye-Level", description: "This is the most common angle. You hold the camera at the same height as your subject's eyes. It creates a natural and direct connection, making the viewer feel like they are right there with the subject." },
  { title: "High Angle", description: "The camera is positioned above the subject, looking down. This angle can make the subject seem smaller, younger, or more vulnerable. It's also great for showing the layout of a scene from above." },
  { title: "Low Angle", description: "The camera is placed below the subject, looking up. This angle makes the subject look powerful, tall, and important. It can make buildings look massive or people seem heroic." },
  { title: "Bird's-Eye View", description: "This is an extreme high angle, taken from directly overhead, as if you were a bird looking straight down. It’s great for showing patterns, shapes, and the relationship between objects on the ground." },
  { title: "Worm's-Eye View", description: "This is an extreme low angle, taken from ground level (or even lower!) looking straight up. It creates a dramatic and often distorted perspective, making the world seem huge and overwhelming." },
  { title: "Head-On Shot", description: "You face your subject directly, with the camera pointed straight at their front. This angle feels very direct, honest, and sometimes confrontational. It works well for portraits and showing symmetry." },
  { title: "Profile Shot", description: "You position the camera directly to the side of your subject, capturing their silhouette or side view. This angle is great for highlighting a person's features or the shape of an object, creating a more pensive or observational mood." },
  { title: "Over-the-Shoulder", description: "The photo is taken from behind a person, looking over their shoulder at the main subject. This draws the viewer into the scene, making them feel like they are part of a conversation or a participant in the action." },
  { title: "Tilted Horizon", description: "The camera is physically tilted to one side, so the horizon line in the picture is slanted. This creates a sense of unease, motion, or excitement. It’s often used to make a scene feel more dynamic or confusing." },
  { title: "Frame Within a Frame", description: "This is when you use an element in the scene—like a doorway, window, or archway—to create a natural frame around your main subject. This angle adds depth to the picture and helps to draw the viewer's eye exactly where you want it to go." }
];

export const lensTypes: PhotographicOption[] = [
  { title: "Wide-Angle Lens", description: "This lens captures a very broad field of view, making it perfect for sweeping landscapes, cityscapes, and architectural shots. It creates a sense of grand scale and depth. Be aware that it can cause **perspective distortion**, where objects near the edges of the frame appear stretched or curved, adding a dynamic and sometimes dramatic feel to the image." },
  { title: "Telephoto Lens", description: "A telephoto lens makes distant subjects appear much closer. Its signature effect is **perspective compression**, which makes the background seem closer to the subject than it is. This lens creates a very shallow depth of field, resulting in a sharp subject against a beautifully blurred background, an effect known as **bokeh**. It's ideal for portraits, wildlife, and sports photography." },
  { title: "Macro Lens", description: "This lens is used for extreme close-up photography. It magnifies tiny subjects to reveal intricate, fascinating details that are not visible to the naked eye. The key visual trait is an **extremely shallow depth of field**, where only a tiny slice of the subject is in sharp focus, while the rest melts away into a soft blur. Use this for images of insects, flowers, water droplets, or textures." },
  { title: "Fisheye Lens", description: "An extreme type of wide-angle lens that produces a strong visual distortion, creating a circular or hemispherical image. Straight lines in the scene, especially near the edges, will appear dramatically curved. This creates a surreal, immersive, and highly stylized **spherical perspective**, as if looking through a peephole or at a reflection in a crystal ball." },
  { title: "Tilt-Shift Lens", description: "This specialized lens allows the artist to manipulate the plane of focus. The most popular creative use in image generation is to create the 'miniature faking' or diorama effect. By selectively blurring the top and bottom of the frame, a life-sized scene (like a city street or a landscape) is made to look like a tiny, artificial model. It gives the image a whimsical, toy-like appearance." }
];

export const paperGrains: PhotographicOption[] = [
  { title: "Fine Grain", description: "This adds a very subtle, almost imperceptible texture to the image. It mimics high-quality, professional film, resulting in a very clean, sharp, and smooth picture. Use this prompt when you want just a hint of analog character and authenticity without sacrificing any fine detail." },
  { title: "Medium Grain", description: "This is the classic \"film look\" that most people think of. The grain is clearly visible but not distracting, adding a pleasant texture that breaks up the digital perfection of the image. It evokes a feeling of nostalgia and authenticity, and it's a versatile choice for portraits, street photography, and everyday scenes." },
  { title: "Coarse Grain", description: "This creates a very prominent, gritty, and sandy texture across the entire image. Fine details are softened and sometimes obscured by the strong grain pattern. This effect adds a raw, moody, and atmospheric quality, perfect for emulating low-light photography, vintage photojournalism, or creating edgy and emotional artistic images." },
  { title: "Matte Paper", description: "This prompt simulates the physical surface of the paper rather than the film. A matte finish is non-reflective and has a soft, sometimes slightly fibrous appearance. This texture tends to lift the black levels, reducing deep contrast and giving the image a gentle, artistic, and sometimes painterly feel." },
  { title: "Silver Halide", description: "Evoking the classic black-and-white darkroom printing process, this prompt creates an image with rich tonal depth and a characteristic grain structure. It's especially effective for monochrome images, lending them a timeless, archival quality with deep blacks, crisp whites, and a beautiful, natural-looking grain pattern." }
];
