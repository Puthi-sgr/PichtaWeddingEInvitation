# Local React App Architecture (Atomic + Feature Folders)

## 0. Agent Operating Rules

* Do not start, restart, or stop the local dev server unless the user explicitly asks for it.
* Prefer static verification such as `npm run lint`, `npm run build`, targeted file inspection, and code review.
* If rendered/browser verification would be useful, tell the user what to run locally instead of launching it yourself.
* For wedding invitation media loading, read `.agents/wedding-experience-orchestrator.md` before changing entry video, scroll video, lazy loading, or section animation lifecycle behavior.
* For wedding invitation text colors/readability over forward scrub vs reverse cover backgrounds, read `.agents/scroll-aware-text-color-architecture.md` before changing section text color classes.
* For wedding invitation text surface effects and GSAP reveal behavior, read both `.agents/scroll-aware-text-color-architecture.md` and `.agents/GSAPAnimationPreset.md` before changing `wedding-text-*`, `gold-text`, `antique-cream-text`, `.guest-letter`, `.hero-detail`, or `useWeddingAnimations`.
* Do not put clipped-gradient text effects (`background-clip: text`, `color: transparent`, text-stroke) on broad wrapper classes such as `wedding-text-primary` or `wedding-text-secondary`. Put dimensional text effects directly on the text/span that animates, otherwise GSAP opacity reveals can show ghost text before the real gradient surface appears.
* For the photo gallery (`FramedGallery` slot-based engine, `PhotoMosaic` explorer, the lightbox, and Cloudinary slot cropping), read `.agents/photo-gallery-engine.md` before changing gallery layout, slot templates, or image insertion.

## 1. Folder Structure

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  shared/
    hooks/
      useDebounce.ts
      useLocalStorage.ts
    ui/
      atoms/
        Button/
        Input/
        Badge/
      molecules/
        FormField/
        ModalDialog/
      organisms/
        Navbar/
        Sidebar/
      templates/
        DashboardLayout/
        AuthLayout/
    types/
      global.ts

  features/
    counter/
      hooks/
        useCounter.ts
      components/
        CounterDisplay.tsx
        CounterControls.tsx
      pages/
        CounterPage.tsx
      types.ts

    auth/
      hooks/
        useAuth.ts
      components/
        LoginForm.tsx
      pages/
        LoginPage.tsx
      types.ts

  assets/
  main.tsx
```

---

## 2. Component & Data Flow

```txt
Page (route)
  -> feature hook (local state, events)
    -> returns state + handlers
  -> passes props down to feature components
    -> components emit events back to hook
```

* **Props down, events up**
* **Single source of truth** in feature hook or shared context
* No API calls needed, all data is local

---

## 3. Atomic Design Guidelines

| Level    | Meaning                      | Examples                           |
| -------- | ---------------------------- | ---------------------------------- |
| Atom     | Smallest reusable UI element | Button, Input, Badge               |
| Molecule | Group of atoms               | FormField, SearchBox, ToggleSwitch |
| Organism | Bigger UI section            | Navbar, Sidebar, DataTable         |
| Template | Layout skeleton              | DashboardLayout, AuthLayout        |
| Page     | Route-level component        | LoginPage, CounterPage             |

**Rule:** Only put **purely reusable components** into `shared/ui`. Feature-specific components belong in their feature folder.

---

## 4. Hooks Organization

```txt
Shared generic hooks       -> shared/hooks
Feature-specific hooks     -> features/<feature>/hooks
```

Example:

```ts
// features/counter/hooks/useCounter.ts
import { useState } from "react";

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  return {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
    reset: () => setCount(initial)
  };
}
```

---

## 5. State Management Guidelines

| Type                 | Recommended Tool      |
| -------------------- | --------------------- |
| Component-only state | useState              |
| Complex local state  | useReducer            |
| Shared app state     | Context / Zustand     |
| Form state           | React Hook Form + Zod |

---

## 6. Pages and Feature Example

**Counter Page Flow:**

```tsx
// features/counter/pages/CounterPage.tsx
import { useCounter } from "../hooks/useCounter";
import { CounterDisplay, CounterControls } from "../components";

export function CounterPage() {
  const counter = useCounter();

  return (
    <div>
      <h1>Counter</h1>
      <CounterDisplay value={counter.count} />
      <CounterControls
        increment={counter.increment}
        decrement={counter.decrement}
        reset={counter.reset}
      />
    </div>
  );
}
```

---

## 7. External Libraries (Optional)

Even for local apps, these can improve UX:

* Routing: `react-router-dom`
* State: React Context / Zustand
* Forms & validation: `react-hook-form` + `zod`
* UI: Tailwind CSS, `clsx` or `tailwind-merge`
* Memoization: `useMemo`, `useCallback`

---

## 8. Cloudinary Utilities

Cloudinary helpers live in:

```txt
src/shared/utils/cld/
  cld.ts
  cldAssets.ts
  cldVideos.ts
  getCldFetchUrl.ts
  getCldImage.ts
  getCldVideo.ts
  index.ts
```

Environment:

```txt
VITE_CLOUDINARY_CLOUD_NAME
```

If `VITE_CLOUDINARY_CLOUD_NAME` is empty, helpers should fall back gracefully instead of breaking the page.

### Images

Use `getCldFetchUrl` for remote image URLs that should be delivered through Cloudinary fetch:

```ts
import { getCldFetchUrl } from "../../../shared/utils/cld";

const imageUrl = getCldFetchUrl("https://example.com/image.jpg", {
  width: 1200,
});
```

Like `getCldImage`, it defaults to `crop: "scale"`; pass `crop: "fill"` to crop
a remote URL to an exact `width`×`height` box with smart gravity
(`c_fill,g_auto`). The photo gallery's `remoteSlotResolver` uses this so the
invite's plain remote photo URLs fill fixed-ratio slots without distortion.

Use `getCldImage` for direct Cloudinary public IDs:

```ts
import { getCldImage } from "../../../shared/utils/cld";

const image = getCldImage("wedding/couple-main", {
  width: 1200,
  height: 1600,
});
```

`getCldImage` defaults to `crop: "scale"` (resize, keep source aspect ratio).
Pass `crop: "fill"` to crop to an exact `width`×`height` box with smart gravity
(`c_fill,g_auto`) — used by the photo gallery so an image fills a fixed-ratio
slot without distortion. See `.agents/photo-gallery-engine.md`.

```ts
const tile = getCldImage("wedding/gallery-01", {
  width: 800,
  height: 1067,
  crop: "fill",
});
```

Use `cldAssets.ts` only for reusable registered image assets. Do not put old-project asset keys or unrelated business/domain data there.

### Videos

Use `getCldVideo` for Cloudinary-hosted videos:

```ts
import { getCldVideo } from "../../../shared/utils/cld";

const heroVideo = getCldVideo(
  {
    publicId: "wedding/hero-main",
    fallbackUrl: "https://example.com/fallback.mp4",
  },
  {
    width: 1920,
    height: 1080,
    crop: "fill",
    gravity: "auto",
    startOffset: 4,
    duration: 12,
    speed: 20,
    quality: "auto",
    format: "mp4",
  },
);
```

Then wire it into video markup:

```tsx
<video autoPlay muted loop playsInline poster={heroVideo.posterUrl}>
  <source {...heroVideo.sourceProps} />
</video>
```

Supported video options include resize/crop, gravity, format, quality, start/end/duration trimming, speed, volume/mute, and poster frame offset.

Use `cldVideos.ts` only for reusable registered video assets. Keep video assets separate from image assets.

### Cloudinary Rules

* Keep image and video helpers separate (`image/upload` or image fetch vs `video/upload`).
* Prefer typed helper options over handwritten Cloudinary URLs inside components.
* Components may use fallback URLs while Cloudinary assets are not uploaded yet.
* Do not reintroduce unrelated project asset registries.

---

## 9. Guidelines & Best Practices

* **Do not** put feature-specific components in `shared/ui`.
* **Do not** fetch data in atoms or molecules.
* **Use feature hooks** to encapsulate all logic/state.
* Keep **page-level components** responsible for wiring hooks → components → layout.
* Clean up side effects in `useEffect` (or `onUnmounted` if Vue) to avoid memory leaks.
