import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

type Guest = {
  slug: string;
  displayName: string;
  seats?: number;
};

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const rootDir = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");
const guestsPath = path.join(rootDir, "src/data/guests.json");

function loadTemplate(): string {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Cannot find ${templatePath}. Run "npm run build" before generating invites.`);
  }
  return fs.readFileSync(templatePath, "utf-8");
}

function loadGuests(): Guest[] {
  const raw = fs.readFileSync(guestsPath, "utf-8");
  const guests = JSON.parse(raw) as Guest[];

  const seenSlugs = new Set<string>();
  for (const guest of guests) {
    if (!guest.slug || !guest.displayName) {
      throw new Error(`Guest entry missing required fields: ${JSON.stringify(guest)}`);
    }
    if (!slugPattern.test(guest.slug)) {
      throw new Error(`Invalid slug "${guest.slug}". Slugs must be lowercase, hyphen-separated (e.g. "chantha-family").`);
    }
    if (seenSlugs.has(guest.slug)) {
      throw new Error(`Duplicate guest slug "${guest.slug}".`);
    }
    seenSlugs.add(guest.slug);
  }

  return guests;
}

function renderGuestPage(template: string, guest: Guest): string {
  const clientGuest: Guest = {
    slug: guest.slug,
    displayName: guest.displayName,
    ...(guest.seats !== undefined ? { seats: guest.seats } : {}),
  };

  const title = `សូមគោរពអញ្ជើញ ${guest.displayName}`;
  const description = `សិរីសួស្តីអាពាហ៍ពិពាហ៍ សូមគោរពអញ្ជើញ ${guest.displayName}`;

  let html = template;

  html = html.replace(/<title>.*<\/title>/, `<title>${escapeHtml(title)}</title>`);

  html = html.replace(
    "</title>",
    `</title>\n    <meta property="og:title" content="${escapeHtml(title)}" />\n    <meta name="description" content="${escapeHtml(description)}" />\n    <meta property="og:description" content="${escapeHtml(description)}" />`,
  );

  html = html.replace(
    /<script type="module"/,
    `<script>window.__GUEST__ = ${JSON.stringify(clientGuest)};</script>\n    <script type="module"`,
  );

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n    <noscript>សូមគោរពអញ្ជើញ ${escapeHtml(guest.displayName)}</noscript>`,
  );

  return html;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  const template = loadTemplate();
  const guests = loadGuests();

  for (const guest of guests) {
    const outDir = path.join(distDir, "invite", guest.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), renderGuestPage(template, guest));
  }

  console.log(`Generated ${guests.length} invite page(s):`);
  for (const guest of guests) {
    console.log(`  /invite/${guest.slug} -> ${guest.displayName}`);
  }
}

main();
