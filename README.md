# Pichta Wedding E-Invitation

An elegant Khmer wedding invitation built with React, Vite, Tailwind CSS, GSAP, and Cloudinary-ready image utilities.

## Invitation Typography

The invitation hero uses a layered gold text system:

- the auspicious title (`សិរីសួស្តីអាពាហ៍ពិពាហ៍`) uses the hammered gold-leaf treatment (`.crown-gold-leaf-text`);
- the invitation prefix line and the guest name both use the **champagne** treatment (`.champagne-text .crown-invitation-line`) — a clean vertical champagne-gold gradient. The gold hue is tuned via the `--prestige-text-*` variables on `.champagne-text`;
- the guest name keeps a center-out GSAP clip-path reveal (`[data-guest-name-reveal]`) that never splits Khmer characters or combining marks;
- `background-clip`, `clip-path`, and forced-colors fallbacks, plus reactive `prefers-reduced-motion` handling.

Every second body paragraph across the invite sections also carries `.crown-gold-leaf-text` for an alternating gold rhythm.

The original ornate **Royal Khmer Crown Inlay** guest-name treatment (emerald relief + gold rim + pearl/guilloche face + light-sweep glint) is **archived in place** — commented out in `InvitationBody.tsx`, with its `.royal-crown-inlay-*` styles kept in `index.css` — so it can be restored later.

Notes:

- `.crown-invitation-line` supplies its own champagne fallbacks, but pair it with a palette class (e.g. `.champagne-text`) to retune the hue; without any palette its gradient falls back to champagne rather than clipping to transparent.
- Do not animate Khmer guest names by using `split("")`, `Array.from()`, `Intl.Segmenter`, or one span per code point. Keep each visible name as one uninterrupted shaping run and animate its wrapper instead.

The production markup lives in [InvitationBody.tsx](src/features/wedding/components/InvitationBody.tsx), the material system in [index.css](src/index.css), and the reveal choreography in [useWeddingAnimations.ts](src/features/wedding/hooks/useWeddingAnimations.ts).

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
