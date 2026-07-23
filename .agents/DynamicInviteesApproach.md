# DynamicInviteesApproach

## Role

You are an implementation agent helping build a mobile-first static wedding invitation website in React.

The website must support personalized invitee names without using a backend.

The preferred approach is **build-time static generation**: generate one finished static invitation page per guest before deployment.

Do not implement a runtime guest-list lookup in the browser unless explicitly requested.

---

## Project goal

Build a personalized wedding invitation website where each guest receives a unique link such as:

```txt
/invite/chantha-family
/invite/sopheak
/invite/dara-family
```

Each generated page should already contain the guest name in the HTML:

```html
<h1>Dear Chantha Family</h1>
```

The guest's phone should not need to download a full guest list and search for their name at runtime.

---

## Core architecture

Use this model:

```txt
guest data
   +
React invitation template
   +
static generation script
   ↓
one static HTML page per guest
```

Mental model:

```txt
One invitation design
+
Guest list
=
Many personalized invitation pages
```

This is similar to mail merge, but for web pages.

---

## Recommended folder structure

```txt
src/
  data/
    guests.json

  pages/
    InvitePage.jsx

  components/
    GuestName.jsx
    HeroSection.jsx
    VenueSection.jsx
    RSVPButton.jsx
    WeddingDetails.jsx

scripts/
  generate-invites.js

public/
  // only small static assets if needed

static-output or dist/
  invite/
    chantha-family/
      index.html
    sopheak/
      index.html
    dara-family/
      index.html
```

The exact output folder may depend on the build tool.

---

## Guest data shape

Use a simple JSON file as the source of truth.

Example:

```json
[
  {
    "slug": "chantha-family",
    "displayName": "Chantha Family",
    "seats": 4,
    "rsvpUrl": "https://forms.gle/example"
  },
  {
    "slug": "sopheak",
    "displayName": "Sopheak",
    "seats": 1,
    "rsvpUrl": "https://forms.gle/example"
  }
]
```

### Field meanings

| Field | Purpose |
|---|---|
| `slug` | URL-safe guest identifier, used in `/invite/{slug}` |
| `displayName` | Name shown on the invitation |
| `seats` | Number of reserved seats, optional |
| `rsvpUrl` | Google Form or external RSVP link, optional |

### Slug rules

Use lowercase, hyphen-separated slugs.

Good:

```txt
chantha-family
sopheak
mr-dara-and-family
```

Avoid:

```txt
Chantha Family
chantha family
chantha_family!!!
```

---

## React invitation template

The React template should receive a single `guest` object.

Example:

```jsx
export default function InvitePage({ guest }) {
  return (
    <main>
      <section className="hero-section">
        <p>Wedding Invitation</p>
        <h1>Dara & Soriya</h1>
      </section>

      <section className="guest-card">
        <p>Dear</p>
        <h2 className="guest-name">{guest.displayName}</h2>
      </section>

      <section className="message-section">
        <p>
          We joyfully invite you to celebrate our wedding day with us.
        </p>
      </section>

      {guest.seats && (
        <section className="seat-section">
          <p>Reserved seats: {guest.seats}</p>
        </section>
      )}

      {guest.rsvpUrl && (
        <a href={guest.rsvpUrl} className="rsvp-button">
          Confirm Attendance
        </a>
      )}
    </main>
  );
}
```

Important: the guest name should be rendered into the final HTML at build time.

---

## Generation script concept

The generation script should:

1. Read `src/data/guests.json`.
2. Loop through every guest.
3. Render the React invitation page with that guest's data.
4. Output one static page per guest.

Conceptual pseudo-code:

```js
for (const guest of guests) {
  const html = renderInvitePage({ guest });

  writeFile(
    `dist/invite/${guest.slug}/index.html`,
    html
  );
}
```

Expected output:

```txt
dist/
  invite/
    chantha-family/
      index.html
    sopheak/
      index.html
    dara-family/
      index.html
```

---

## Runtime behavior

When a guest opens:

```txt
yourwedding.com/invite/chantha-family
```

The hosting provider returns:

```txt
/invite/chantha-family/index.html
```

The page already contains:

```html
<h2>Chantha Family</h2>
```

No database is required.
No backend is required.
No browser-side guest lookup is required.

---

## What not to do by default

Avoid this approach unless requested:

```txt
One React page loads guests.json in the browser
↓
Reads ?guest=chantha-family from URL
↓
Searches the full guest list on the phone
↓
Updates the page after JavaScript runs
```

This is less ideal because:

- the guest list becomes easier to inspect;
- the phone does extra runtime work;
- the name may appear only after JavaScript executes;
- the browser may need to download and parse unnecessary guest data.

---

## Privacy model

This static generation approach is more private than exposing a full public guest JSON file, but it is not true security.

Anyone with a guest link can open that guest page.

Do not include highly sensitive information in generated pages.

Allowed light personalization:

```txt
guest display name
reserved seat count
general table label
RSVP link
```

Avoid:

```txt
phone numbers
private addresses
private family notes
payment information
sensitive relationship notes
internal planning comments
```

---

## Performance rules

The website is mobile-first. Guests will open it on phone browsers.

### Main performance strategy

```txt
Pre-render the invite content.
Keep JavaScript minimal.
Use Cloudinary/CDN images.
Use GSAP only as enhancement.
```

### Do not bundle large images into JavaScript

Images should be served as separate optimized resources, preferably from Cloudinary or another CDN.

Recommended Cloudinary-style image usage:

```html
<img
  src="https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_768/wedding-main.jpg"
  srcset="
    https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_480/wedding-main.jpg 480w,
    https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_768/wedding-main.jpg 768w,
    https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_1200/wedding-main.jpg 1200w
  "
  sizes="100vw"
  alt="Wedding couple"
/>
```

### Avoid heavy mobile costs

Avoid:

```txt
large unoptimized photos
background video
large particle systems
many custom fonts
scroll-scrubbed animations
pinning multiple sections
continuous blur/filter animations
```

---

## Animation integration note

The personalized content must exist before the GSAP timeline starts. For Khmer, `displayName` must remain one uninterrupted shaping run; animate the wrapper, never the code points.

Correct:

```tsx
<span className="guest-crown-reveal wedding-animated opacity-0" data-guest-name-reveal>
  <span aria-hidden="true" className="royal-crown-inlay-underlay">{guest.displayName}</span>
  <span aria-hidden="true" className="royal-crown-inlay-gold">{guest.displayName}</span>
  <span className="royal-crown-inlay-text">{guest.displayName}</span>
  <span aria-hidden="true" className="royal-crown-inlay-glint" data-crown-glint>
    {guest.displayName}
  </span>
</span>
```

Only `.royal-crown-inlay-text` is semantic. Every decorative copy contains the complete name and is `aria-hidden`.

Incorrect:

```tsx
{Array.from(guest.displayName).map((codePoint) => (
  <span className="guest-letter">{codePoint}</span>
))}
```

Do not use `split("")`, `Array.from()`, `Intl.Segmenter`, or per-code-point spans for Khmer. The current `opacity-0` pre-animation guards provide reduced-motion and feature fallbacks through `useWeddingAnimations`, but they are not a complete no-JavaScript fallback.

---

## Locked animation list

Use `.agents/GSAPAnimationPreset.md` for the full animation and Crown Inlay details.

Locked approved animation bucket:

```txt
Photo Curtain
Crown Inlay Reveal (production Khmer guest name)
Letter Bloom (lab/Latin or shaping-safe scripts only)
Venue Wave
Vow Whisper
Golden Sweep
Location Pin
Iris Reveal / Iris Sweep
Ring Lock
```

Use ScrollTrigger only with:

```js
scrollTrigger: {
  trigger: ".section",
  start: "top 80%",
  once: true
}
```

Avoid:

```js
scrub: true
pin: true
```

---

## RSVP approach

For no-backend version, use an external RSVP provider such as Google Forms.

The generated page can link to a form:

```jsx
<a href={guest.rsvpUrl}>Confirm Attendance</a>
```

If using Google Forms, optionally pre-fill the guest name through a prefilled form URL.

Do not build custom RSVP storage unless a backend or third-party database service is approved.

---

## Build/deploy flow

Recommended flow:

```txt
1. Update guests.json
2. Run static generation script
3. Build React/static assets
4. Output generated invite pages
5. Deploy dist/ to hosting provider
6. Send each guest their unique link
```

Possible hosting providers:

```txt
Netlify
Vercel
Cloudflare Pages
GitHub Pages
Static VPS hosting
```

---

## Testing checklist

Before final delivery, verify:

- Each guest slug generates a page.
- Each page displays the correct guest name.
- Unknown slugs are not generated or return a fallback page.
- The guest name exists as one semantic `.royal-crown-inlay-text` run before the GSAP timeline starts.
- Representative Khmer names render without detached marks, broken conjuncts, or dotted-circle artifacts.
- The page works on mobile width.
- Cloudinary images are responsive and not too large.
- GSAP animations do not block content.
- Toggling reduced motion while the invite is mounted reveals static content, suppresses the glint, and cleans up the previous animation context.
- ScrollTrigger animations use `once: true`.
- No full guest list is exposed to the browser by default.
- No sensitive guest information is included in static pages.

---

## Final implementation preference

Preferred production approach:

```txt
React template
+
guests.json
+
static generation script
+
Cloudinary optimized images
+
GSAP progressive enhancement
+
external RSVP form
```

Avoid a backend unless the project later requires:

```txt
secure RSVP tracking
admin dashboard
private guest management
real-time updates
editing guests after deployment without rebuild
authentication
```
