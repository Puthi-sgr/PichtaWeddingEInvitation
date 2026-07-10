# Pichta Wedding E-Invitation

An elegant wedding invitation built with React, Vite, Tailwind CSS, GSAP, and Cloudinary-ready image utilities.

## Run Locally

Prerequisite: Node.js

1. Install dependencies:
   `npm install`
2. Optional: copy `.env.example` to `.env.local` and set `VITE_CLOUDINARY_CLOUD_NAME` to enable Cloudinary fetch URLs.
3. Start the dev server:
   `npm run dev`

## Cloudinary Utilities

Reusable Cloudinary helpers live in `src/shared/utils/cld`.

Use `getCldFetchUrl` for remote image URLs and `getCldImage` or `getRegisteredCldImage` for Cloudinary public IDs.
