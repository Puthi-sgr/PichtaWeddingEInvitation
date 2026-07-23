import { useId, type CSSProperties } from "react";

export const WEDDING_DIVIDER_PRESETS = [
  "cursive-bloom",
  "cursive-ribbon",
  "cursive-floral",
  "cursive-crest",
  "tapered-rule",
  "radiant",
  "radiant-lotus",
  "radiant-rings",
  "radiant-kbach",
  "radiant-flame",
  "double",
  "beaded",
  "deco",
  "laurel",
  "wave",
  "filigree",
  "frame",
] as const;

export type WeddingDividerPreset = (typeof WEDDING_DIVIDER_PRESETS)[number];
/** Positive multiplier for the divider artwork's visual weight. `1` is the default. */
export type WeddingDividerSize = number;
/** A CSS length, or a number interpreted as rem, for the divider's final span. */
export type WeddingDividerLength = string | number;

type WeddingSectionDividerProps = {
  /** A named treatment from WEDDING_DIVIDER_PRESETS. */
  preset?: WeddingDividerPreset;
  /** Scales the artwork's height and stroke weight while preserving its requested length. */
  size?: WeddingDividerSize;
  /** Final horizontal span. CSS lengths are accepted; numeric values are interpreted as rem. */
  length?: WeddingDividerLength;
  /** Optional semantic label. Omit it for a purely decorative divider. */
  label?: string;
  className?: string;
};

export function WeddingSectionDivider({
  className,
  label,
  preset = "cursive-bloom",
  size = 1,
  length = "28rem",
}: WeddingSectionDividerProps) {
  const resolvedSize = Number.isFinite(size) && size > 0 ? size : 1;
  const goldGradientId = `wedding-divider-gold-${useId().replace(/:/g, "")}`;
  const goldPaint = `url(#${goldGradientId})`;
  const classes = [
    "wedding-section-divider",
    `wedding-section-divider--${preset}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const style = {
    "--wedding-divider-length": toCssLength(length),
    "--wedding-divider-scale": resolvedSize,
    "--wedding-divider-aspect-ratio": `400 / ${42 * resolvedSize}`,
  } as CSSProperties;

  return (
    <div
      className={classes}
      style={style}
      {...(label ? { role: "separator", "aria-label": label } : { "aria-hidden": true })}
    >
      <svg viewBox="0 0 400 42" fill="none" aria-hidden="true" className="wedding-section-divider__artwork">
        <defs>
          <linearGradient id={goldGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--text-gold-highlight)" />
            <stop offset="30%" stopColor="var(--text-gold-bright)" />
            <stop offset="54%" stopColor="var(--text-gold-mid)" />
            <stop offset="72%" stopColor="var(--text-gold-deep)" />
            <stop offset="100%" stopColor="var(--text-gold-bright)" />
          </linearGradient>
        </defs>
        <DividerArtwork preset={preset} paint={goldPaint} />
      </svg>
    </div>
  );
}

function toCssLength(value: WeddingDividerLength) {
  return typeof value === "number" ? `${value}rem` : value;
}

function DividerArtwork({ preset, paint }: { preset: WeddingDividerPreset; paint: string }) {
  const stroke = { stroke: paint, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (preset) {
    case "tapered-rule":
      return <TaperedRule paint={paint} />;
    case "radiant-lotus":
      return (
        <g {...stroke}>
          <RadiantLines paint={paint} />
          <RadiantLotus />
        </g>
      );
    case "radiant-rings":
      return (
        <g {...stroke}>
          <RadiantLines paint={paint} />
          <circle cx="194" cy="21" r="7.5" strokeWidth="1.05" />
          <circle cx="206" cy="21" r="7.5" strokeWidth="1.05" />
          <path d="M188 21H212" strokeWidth="0.55" opacity="0.66" />
          <circle cx="200" cy="12.5" r="1.35" fill={paint} strokeWidth="0" />
        </g>
      );
    case "radiant-kbach":
      return (
        <g {...stroke}>
          <RadiantLines paint={paint} />
          <RadiantKbach paint={paint} />
        </g>
      );
    case "radiant-flame":
      return (
        <g {...stroke}>
          <RadiantLines paint={paint} />
          <path d="M200 34C191 29 189 23 193 17C195 14 198 12 198 7C204 11 209 16 208 22C208 28 204 32 200 34Z" strokeWidth="1" />
          <path d="M200 29C197 26 197 22 200 18C203 22 204 25 200 29Z" fill={paint} strokeWidth="0.4" />
          <path d="M187 29C191 27 193 27 195 29M205 29C207 27 209 27 213 29" strokeWidth="0.7" opacity="0.78" />
        </g>
      );
    case "cursive-bloom":
      return (
        <g {...stroke} strokeWidth="1.05">
          <CursiveBloomHalf />
          <g transform="translate(400 0) scale(-1 1)"><CursiveBloomHalf /></g>
          <path d="M184 22C190 13 196 13 200 22C204 13 210 13 216 22M190 27C195 31 198 30 200 26C202 30 205 31 210 27" />
        </g>
      );
    case "cursive-ribbon":
      return (
        <g {...stroke}>
          <CursiveRibbonHalf />
          <g transform="translate(400 0) scale(-1 1)"><CursiveRibbonHalf /></g>
          <path d="M184 21C190 7 197 9 200 21C203 9 210 7 216 21C210 35 205 35 200 25C195 35 190 35 184 21Z" strokeWidth="1" />
        </g>
      );
    case "cursive-floral":
      return (
        <g {...stroke}>
          <CursiveFloralHalf />
          <g transform="translate(400 0) scale(-1 1)"><CursiveFloralHalf /></g>
          <path d="M190 21C190 15 196 14 200 21C204 14 210 15 210 21C210 27 204 28 200 23C196 28 190 27 190 21Z" strokeWidth="0.95" />
          <circle cx="200" cy="21" r="1.25" fill={paint} />
        </g>
      );
    case "cursive-crest":
      return (
        <g {...stroke}>
          <CursiveCrestHalf />
          <g transform="translate(400 0) scale(-1 1)"><CursiveCrestHalf /></g>
          <path d="M186 25C189 12 196 10 200 19C204 10 211 12 214 25M190 29C194 35 198 32 200 27C202 32 206 35 210 29M193 20C196 16 198 16 200 20C202 16 204 16 207 20" strokeWidth="1.1" />
        </g>
      );
    case "double":
      return (
        <g {...stroke}>
          <path d="M24 17H171M229 17H376" strokeWidth="0.8" opacity="0.46" />
          <path d="M44 24H181M219 24H356" strokeWidth="1.15" />
          <path d="M187 20L200 13L213 20L200 29Z" strokeWidth="0.8" />
          <circle cx="200" cy="21" r="2" strokeWidth="0.9" />
        </g>
      );
    case "beaded":
      return (
        <g {...stroke}>
          <path d="M24 21H155M245 21H376" strokeWidth="0.8" opacity="0.72" />
          {[58, 83, 108, 133, 267, 292, 317, 342].map((cx) => <circle key={cx} cx={cx} cy="21" r="1.65" fill={paint} />)}
          <circle cx="194" cy="21" r="1.3" fill={paint} />
          <circle cx="200" cy="21" r="2.7" strokeWidth="0.85" />
          <circle cx="206" cy="21" r="1.3" fill={paint} />
        </g>
      );
    case "deco":
      return (
        <g {...stroke}>
          <path d="M24 21H122L142 11H172M228 11H258L278 21H376" strokeWidth="1.1" />
          <path d="M43 27H130L149 17H181M219 17H251L270 27H357" strokeWidth="0.65" opacity="0.72" />
          <path d="M190 21L200 10L210 21L200 32Z" strokeWidth="0.9" />
          <path d="M196 21H204" strokeWidth="1.1" />
        </g>
      );
    case "laurel":
      return (
        <g {...stroke}>
          <path d="M24 21H93C125 21 145 12 174 12M226 12C255 12 275 21 307 21H376" strokeWidth="0.95" />
          <path d="M102 20C106 13 111 12 116 11M116 19C121 13 126 12 131 12M131 17C136 11 141 10 146 11M298 20C294 13 289 12 284 11M284 19C279 13 274 12 269 12M269 17C264 11 259 10 254 11" strokeWidth="0.75" />
          <path d="M195 21H205M200 16V26" strokeWidth="0.8" />
        </g>
      );
    case "wave":
      return (
        <g {...stroke}>
          <path d="M24 21C42 9 60 9 78 21S114 33 132 21S168 9 181 19M219 19C232 9 250 9 268 21S304 33 322 21S358 9 376 21" strokeWidth="0.95" />
          <path d="M32 28C48 19 64 19 80 28M320 28C336 19 352 19 368 28" strokeWidth="0.65" opacity="0.65" />
          <circle cx="200" cy="21" r="3.25" strokeWidth="0.8" />
        </g>
      );
    case "filigree":
      return (
        <g {...stroke}>
          <path d="M24 21H102C119 21 117 10 132 10C147 10 146 31 162 31C173 31 173 21 183 21M217 21C227 21 227 31 238 31C254 31 253 10 268 10C283 10 281 21 298 21H376" strokeWidth="0.85" />
          <path d="M118 17C111 8 100 13 105 18C109 22 116 20 118 17M282 17C289 8 300 13 295 18C291 22 284 20 282 17" strokeWidth="0.7" />
          <path d="M195 21C195 14 205 14 205 21C205 28 195 28 195 21Z" strokeWidth="0.8" />
        </g>
      );
    case "frame":
      return (
        <g {...stroke}>
          <path d="M24 29V14H34M24 21H166M234 21H376M376 14V29H366" strokeWidth="0.9" />
          <path d="M44 25H172M228 25H356" strokeWidth="0.6" opacity="0.7" />
          <path d="M192 21L200 13L208 21L200 29Z" fill={paint} strokeWidth="0.6" />
        </g>
      );
    case "radiant":
    default:
      return (
        <g {...stroke}>
          <RadiantLines paint={paint} />
          <RadiantFlower paint={paint} />
        </g>
      );
  }
}

function RadiantLines({ paint }: { paint: string }) {
  return (
    <>
      <path d="M177 18.7C126 18.8 75 19.4 24 21C75 22.6 126 23.2 177 23.3Z" fill={paint} strokeWidth="0" />
      <path d="M223 18.7C274 18.8 325 19.4 376 21C325 22.6 274 23.2 223 23.3Z" fill={paint} strokeWidth="0" />
    </>
  );
}

function TaperedRule({ paint }: { paint: string }) {
  return (
    <path
      d="M20 21C102 20.4 298 20.4 380 21C298 21.6 102 21.6 20 21Z"
      fill={paint}
      strokeWidth="0"
    />
  );
}

function RadiantFlower({ paint }: { paint: string }) {
  return (
    <g transform="translate(186.04 7.04) scale(0.098)" fill={paint} stroke="none">
      <path d="m277.651,133.196c-0.974-1.24-10.02-12.337-27.357-20.004-7.234-3.199-16.642-6.08-28.046-6.967 4.019-9.175 3.801-16.8 3.314-20.502-1.834-13.929-12.424-24.519-26.352-26.353-3.595-0.472-10.884-0.693-19.7,2.97-1.373-8.744-4.088-16.115-7.05-21.999-8.289-16.463-20.149-24.957-21.474-25.872l-8.521-5.88-8.521,5.881c-1.325,0.914-13.184,9.409-21.473,25.871-2.963,5.884-5.678,13.257-7.051,22.003-8.816-3.663-16.106-3.443-19.699-2.973-13.928,1.834-24.519,12.424-26.352,26.353-0.488,3.701-0.706,11.326 3.313,20.501-11.406,0.887-20.816,3.77-28.05,6.97-17.337,7.67-26.381,18.769-27.355,20.009l-7.277,9.267 7.281,9.266c0.974,1.24 10.02,12.337 27.357,20.004 7.233,3.199 16.643,6.079 28.046,6.966-4.02,9.176-3.801,16.801-3.313,20.502 1.833,13.929 12.424,24.519 26.352,26.353 1.073,0.141 2.474,0.26 4.147,0.26 3.933,0 9.367-0.66 15.551-3.23 1.373,8.745 4.088,16.116 7.051,22 8.289,16.463 20.149,24.957 21.475,25.872l8.52,5.88 8.521-5.881c1.325-0.914 13.184-9.409 21.473-25.871 2.962-5.884 5.677-13.255 7.05-22 6.185,2.57 11.62,3.23 15.552,3.23 1.673,0 3.075-0.119 4.147-0.26 13.928-1.834 24.518-12.424 26.352-26.353 0.487-3.702 0.705-11.327-3.314-20.502 11.405-0.887 20.818-3.769 28.051-6.969 17.337-7.67 26.381-18.769 27.355-20.009l7.278-9.268-7.281-9.265zm-85.326-43.66c1.072-0.35 1.893-0.451 2.467-0.451 0.48,0 0.788,0.071 0.929,0.127 0.123,0.309 0.317,1.428-0.324,3.396-0.739,2.268-3.691,8.622-14.553,15.889-0.686-0.774-1.39-1.537-2.131-2.278-0.74-0.74-1.503-1.444-2.276-2.13 7.267-10.861 13.621-13.814 15.888-14.553zm-34.825,67.964c-8.29,8.289-21.777,8.288-30.067,0.001-8.29-8.29-8.29-21.778 0-30.068 4.146-4.145 9.589-6.217 15.033-6.217s10.89,2.072 15.033,6.217c8.29,8.289 8.29,21.777 0.001,30.067zm-18.763-102.577c1.143-2.432 2.429-4.593 3.729-6.478 1.104,1.6 2.197,3.397 3.198,5.387 5.573,11.068 6.27,23.712 2.15,37.683-3.557-0.37-7.143-0.37-10.7,0-3.981-13.508-3.458-25.785 1.623-36.592zm-49.525,34.288c0.306-0.123 1.429-0.317 3.395,0.324 2.268,0.739 8.622,3.693 15.889,14.554-0.773,0.685-1.536,1.389-2.276,2.13-0.741,0.741-1.445,1.503-2.131,2.277-10.863-7.268-13.815-13.621-14.554-15.89-0.64-1.967-0.447-3.086-0.323-3.395zm-46.205,53.255c9.929-5.317 25.961-9.718 48.341-3.305-0.141,2.201-0.141,4.408 0,6.609-22.381,6.412-38.412,2.013-48.341-3.304zm49.599,52.931c-1.967,0.643-3.087,0.447-3.395,0.324-0.124-0.309-0.317-1.428 0.323-3.396 0.739-2.268 3.691-8.622 14.554-15.89 0.686,0.774 1.39,1.537 2.131,2.277 0.74,0.74 1.503,1.444 2.276,2.13-7.266,10.862-13.62,13.816-15.889,14.555zm53.589,34.612c-1.143,2.432-2.43,4.594-3.729,6.479-1.3-1.885-2.587-4.047-3.729-6.479-5.083-10.807-5.605-23.083-1.623-36.593 1.779,0.185 3.565,0.286 5.352,0.286s3.573-0.101 5.352-0.286c3.982,13.51 3.459,25.786-1.623,36.593zm49.526-34.288c-0.309,0.122-1.426,0.318-3.396-0.324-2.268-0.739-8.622-3.693-15.889-14.553 0.773-0.685 1.536-1.389 2.276-2.13l.001-.001c0.74-0.74 1.444-1.503 2.13-2.277 10.862,7.267 13.814,13.621 14.553,15.889 0.642,1.968 0.448,3.088 0.325,3.396zm-2.138-49.95c0.141-2.201 0.141-4.408 0-6.609 22.381-6.414 38.412-2.014 48.343,3.304-9.929,5.317-25.961,9.719-48.343,3.305z" />
    </g>
  );
}
function RadiantLotus() {
  return (
    <>
      <path d="M200 33C190 29 186 22 188 15C194 16 198 20 200 25C202 20 206 16 212 15C214 22 210 29 200 33Z" strokeWidth="0.95" />
      <path d="M200 30C195 23 195 15 200 9C205 15 205 23 200 30Z" strokeWidth="1" />
      <path d="M188 28C192 27 195 28 197 31M212 28C208 27 205 28 203 31" strokeWidth="0.7" opacity="0.8" />
      <path d="M192 34H208" strokeWidth="0.7" />
    </>
  );
}

function RadiantKbach({ paint }: { paint: string }) {
  return (
    <>
      <path d="M200 7L205 15L214 16L208 22L210 31L200 26L190 31L192 22L186 16L195 15Z" strokeWidth="0.9" />
      <path d="M200 13L204 21L200 25L196 21Z" strokeWidth="0.75" />
      <path d="M186 25C190 20 194 22 193 26C192 29 188 29 186 27M214 25C210 20 206 22 207 26C208 29 212 29 214 27" strokeWidth="0.8" />
      <circle cx="200" cy="20" r="1.35" fill={paint} strokeWidth="0" />
    </>
  );
}

function CursiveBloomHalf() {
  return (
    <>
      <path d="M18 22C35 7 56 8 70 20C56 9 40 10 38 18C35 29 53 32 63 24C75 14 87 11 102 19C88 9 75 9 73 17C70 27 86 30 98 23C115 13 132 14 145 24C153 30 167 29 184 22" />
      <path d="M51 17C42 10 30 10 26 16C22 22 29 26 37 23M118 17C126 8 139 9 144 16C148 22 143 26 136 24" strokeWidth="0.72" opacity="0.78" />
    </>
  );
}

function CursiveRibbonHalf() {
  return (
    <>
      <path d="M18 23C34 10 54 8 69 18C81 26 71 34 59 29C47 24 51 15 63 16C82 17 86 32 102 29C118 26 115 10 132 11C148 12 145 29 160 28C170 27 176 23 184 20" strokeWidth="1.05" />
      <path d="M25 28C41 34 52 31 61 26M108 31C122 35 137 31 144 23M151 29C162 35 174 29 181 23" strokeWidth="0.65" opacity="0.7" />
    </>
  );
}

function CursiveFloralHalf() {
  return (
    <>
      <path d="M18 23C34 17 47 10 61 16C73 21 69 31 57 29C47 27 48 18 57 17C73 15 82 28 98 28C116 28 122 14 138 14C154 14 159 26 171 25C178 24 181 21 184 19" strokeWidth="0.98" />
      <path d="M77 22C82 10 91 7 96 18C100 7 109 10 112 21M126 17C130 8 138 8 142 16" strokeWidth="0.78" />
      <path d="M37 18C29 7 23 7 21 14M151 17C158 6 166 8 168 15" strokeWidth="0.7" opacity="0.78" />
    </>
  );
}

function CursiveCrestHalf() {
  return (
    <>
      <path d="M18 23C30 6 50 7 65 19C76 28 66 36 54 31C43 26 49 16 60 17C78 18 83 33 99 30C115 27 110 8 128 9C146 10 145 31 160 30C172 29 178 22 184 18" strokeWidth="1.12" />
      <path d="M29 16C24 8 19 7 17 13M76 17C80 4 91 4 96 17M112 17C116 3 128 4 132 16M146 18C154 5 166 7 170 16" strokeWidth="0.82" />
      <path d="M37 27C30 32 31 37 39 37C47 37 49 29 44 26M132 25C138 33 148 34 151 27" strokeWidth="0.72" opacity="0.78" />
    </>
  );
}
