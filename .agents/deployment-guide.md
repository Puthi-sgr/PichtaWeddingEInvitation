# Deployment Guide: React Static Wedding Invitation on GitHub Pages

## 1. Deployment goal

The project is a mobile-first wedding invitation website.

The site should use:

- React for building the invitation UI.
- Static generation for personalized invitee pages.
- GitHub Pages for hosting.
- A custom bought domain.
- Cloudinary/CDN-hosted images.
- GSAP animations as enhancement only.
- No backend.

The final deployment should produce static files like this:

```txt
dist/
  index.html
  invite/
    chantha-family/
      index.html
    sopheak/
      index.html
    dara-family/
      index.html
  assets/
    main-HASH.js
    style-HASH.css
```

Each invitee URL should map to a real static HTML file:

```txt
https://yourdomain.com/invite/chantha-family
        ↓
dist/invite/chantha-family/index.html
```

The guest name should already exist inside the generated HTML.

---

## 2. Core deployment model

### Normal React SPA deployment

A normal React SPA usually deploys one `index.html`:

```txt
dist/
  index.html
  assets/
    main.js
```

Every route returns the same `index.html`, and React decides what to show in the browser.

That is not the ideal model for this wedding invite project.

### Preferred generated static-page deployment

This project should generate many static invite pages:

```txt
dist/
  invite/
    chantha-family/
      index.html
    sopheak/
      index.html
```

Each generated file contains the personalized invitee name:

```html
<h1>Dear Chantha Family</h1>
```

This means the browser does not need to download a full guest list and search for the correct name.

---

## 3. Required project structure

Recommended source structure:

```txt
src/
  components/
    GuestName.jsx
    HeroSection.jsx
    VenueSection.jsx
    RSVPButton.jsx

  pages/
    InvitePage.jsx

  data/
    guests.json

scripts/
  generate-invites.js

public/
  CNAME
```

Recommended output structure:

```txt
dist/
  CNAME
  index.html
  invite/
    guest-slug/
      index.html
  assets/
    main-HASH.js
    style-HASH.css
```

---

## 4. Guest data structure

Example `src/data/guests.json`:

```json
[
  {
    "slug": "chantha-family",
    "displayName": "Chantha Family",
    "seats": 4,
    "rsvpUrl": "https://forms.gle/example1"
  },
  {
    "slug": "sopheak",
    "displayName": "Sopheak",
    "seats": 1,
    "rsvpUrl": "https://forms.gle/example2"
  }
]
```

Rules:

- `slug` becomes the URL path.
- `displayName` becomes the visible invitee name.
- Avoid storing sensitive private data in the generated pages.
- Do not expose phone numbers, personal notes, home addresses, or private relationship notes.
- Use short, clean, URL-safe slugs.

Good slugs:

```txt
chantha-family
sopheak
dara-and-family
```

Bad slugs:

```txt
Chantha Family!!!
guest number 1
012345678
```

---

## 5. Static generation mechanism

The generation script should:

1. Read `guests.json`.
2. Loop through each guest.
3. Render the React invitation template with that guest object.
4. Save the result to `dist/invite/[slug]/index.html`.

Conceptual logic:

```js
for (const guest of guests) {
  const html = renderInvitePage(guest);

  saveFile(
    `dist/invite/${guest.slug}/index.html`,
    html
  );
}
```

Result:

```txt
dist/invite/chantha-family/index.html
dist/invite/sopheak/index.html
dist/invite/dara-family/index.html
```

---

## 6. GitHub Pages compatibility

GitHub Pages can serve this structure because it serves static files.

When a user opens:

```txt
https://yourdomain.com/invite/chantha-family
```

GitHub Pages can return:

```txt
/invite/chantha-family/index.html
```

This works because static hosts commonly resolve folder paths to that folder's `index.html`.

---

## 7. Custom domain setup

### In GitHub

Go to:

```txt
Repository → Settings → Pages
```

Then:

```txt
Build and deployment → Source → GitHub Actions
Custom domain → yourdomain.com
```

After setting the custom domain, GitHub Pages will run a DNS check and later allow HTTPS enforcement after the certificate is ready.

### DNS records

For an apex/root domain like:

```txt
yourdomain.com
```

you usually configure A records pointing to GitHub Pages IPs.

For a subdomain like:

```txt
www.yourdomain.com
```

you usually configure a CNAME record pointing to:

```txt
YOUR_USERNAME.github.io
```

Always follow GitHub's latest custom-domain DNS instructions from the GitHub Pages documentation because DNS requirements can change.

---

## 8. CNAME file consideration

If using a branch-based Pages deployment, GitHub may create a `CNAME` file.

If using GitHub Actions deployment, configure the custom domain in GitHub Pages settings. A manually committed `CNAME` file alone is not enough to configure the custom domain.

Still, keeping this file in your deployed output is useful for clarity:

```txt
dist/CNAME
```

Inside:

```txt
yourdomain.com
```

Make sure the build process does not accidentally delete it.

Recommended:

```txt
public/CNAME → copied into dist/CNAME during build
```

---

## 9. Vite base path consideration

If deploying to a custom root domain:

```txt
https://yourdomain.com
```

the Vite base can usually be:

```js
base: "/"
```

If deploying to the default GitHub Pages project URL:

```txt
https://username.github.io/repo-name/
```

then Vite usually needs:

```js
base: "/repo-name/"
```

Since this project uses a custom domain, prefer:

```js
export default defineConfig({
  base: "/"
});
```

This avoids broken asset paths like:

```txt
/assets/main.js
```

versus:

```txt
/repo-name/assets/main.js
```

---

## 10. GitHub Actions deployment flow

Recommended deployment flow:

```txt
push to main
    ↓
install dependencies
    ↓
build React app
    ↓
generate invite pages
    ↓
verify dist output
    ↓
deploy dist to GitHub Pages
```

Example conceptual commands:

```bash
npm ci
npm run build
npm run generate:invites
```

Possible `package.json` scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "generate:invites": "node scripts/generate-invites.js",
    "deploy:build": "npm run build && npm run generate:invites"
  }
}
```

Important:

- The invite generator must run after or during the build process.
- The final deployed folder must contain the generated invite pages.
- The final deployed folder must contain shared assets.
- The final deployed folder should contain `CNAME` if you keep one.

---

## 11. Sample GitHub Actions workflow

Example `.github/workflows/deploy.yml`:

```yml
name: Deploy Wedding Invite

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build and generate static invite pages
        run: npm run deploy:build

      - name: Verify generated invite pages
        run: |
          test -f dist/index.html
          test -d dist/invite
          find dist/invite -name index.html | head

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 12. Pre-deployment checklist

Before deploying:

- [ ] Guest list has final display names.
- [ ] Guest slugs are clean and URL-safe.
- [ ] No duplicate slugs exist.
- [ ] No sensitive private data is stored in generated HTML.
- [ ] RSVP links work.
- [ ] Cloudinary image URLs work.
- [ ] Images use optimized sizes and formats.
- [ ] GSAP animations are not required for content visibility.
- [ ] ScrollTrigger uses `once: true`.
- [ ] No `scrub` or `pin` animations are used.
- [ ] Reduced motion is supported.
- [ ] `dist/invite/[slug]/index.html` pages are generated.
- [ ] Custom domain is configured in GitHub Pages settings.
- [ ] DNS records point to GitHub Pages correctly.
- [ ] HTTPS is enabled after GitHub finishes certificate setup.

---

## 13. Post-deployment test checklist

Test these URLs:

```txt
https://yourdomain.com
https://yourdomain.com/invite/chantha-family
https://yourdomain.com/invite/sopheak
```

Check:

- [ ] Main homepage loads.
- [ ] Invitee page loads directly from a shared link.
- [ ] Refreshing an invitee page does not cause a 404.
- [ ] Guest name is visible before animation.
- [ ] Cloudinary image loads quickly.
- [ ] RSVP button opens the correct form.
- [ ] Mobile layout works.
- [ ] GSAP animations feel smooth.
- [ ] Reduced motion mode does not break content.
- [ ] HTTPS is active.
- [ ] `www` and non-`www` behavior is intentional.

---

## 14. Common deployment problems

### Problem: `/invite/chantha-family` gives 404

Possible causes:

- `dist/invite/chantha-family/index.html` was not generated.
- The generation script did not run.
- The workflow deployed the wrong folder.
- The slug in the URL does not match the generated folder name.

Fix:

```txt
Check dist output before deployment.
Verify the exact folder exists.
```

---

### Problem: CSS or JS files are broken

Possible causes:

- Wrong Vite `base` setting.
- Assets are referenced relative to the wrong root.
- Custom domain uses `/`, but project was built for `/repo-name/`.

Fix:

```js
export default defineConfig({
  base: "/"
});
```

for custom root domain deployment.

---

### Problem: Custom domain disappears after deployment

Possible causes:

- Custom domain was not configured in GitHub Pages settings.
- Deployment flow changed the Pages configuration.
- `CNAME` was expected but not copied into output.

Fix:

- Configure custom domain in GitHub Pages settings.
- Keep `public/CNAME` and copy it to `dist/CNAME`.
- Verify the Pages settings after deployment.

---

### Problem: HTTPS cannot be enabled

Possible causes:

- DNS records are not correct.
- DNS has not propagated.
- GitHub has not finished issuing the certificate.

Fix:

- Recheck DNS records.
- Wait for DNS propagation.
- Re-run GitHub Pages DNS check.
- Enable HTTPS once available.

---

### Problem: Page is slow on phone

Possible causes:

- Image is too large.
- Too much blur/filter animation.
- Too many animations trigger at once.
- Heavy background video/audio.
- GSAP ScrollTrigger uses scrub/pin.

Fix:

- Use Cloudinary `f_auto,q_auto,w_...`.
- Use one hero reveal only.
- Use ScrollTrigger `once: true`.
- Reduce Vow Whisper blur to `2px` or remove blur.
- Avoid heavy particle systems.

---

## 15. Privacy considerations

This static approach is more private than exposing one public `guests.json`, but it is not secure like a login system.

Anyone with the invite URL can open that invite page.

Do not include:

```txt
phone numbers
private family notes
home addresses
payment information
private guest relationships
sensitive comments
```

Safe to include:

```txt
display name
seat count
table name/number, if acceptable
RSVP link
venue
date
schedule
```

---

## 16. Final deployment recommendation

Use this production setup:

```txt
React + Vite
Static invite generation
GitHub Actions
GitHub Pages
Custom domain
Cloudinary images
GSAP ScrollTrigger with once: true
```

The final site should behave like this:

```txt
Guest opens unique link
    ↓
GitHub Pages serves pre-generated static HTML
    ↓
Guest name is already visible
    ↓
Images load from Cloudinary
    ↓
GSAP enhances the page with lightweight animations
```

The deployment is successful when each invite link loads directly, refreshes without 404, displays the correct guest name before JavaScript animation, and works smoothly on a real phone.
