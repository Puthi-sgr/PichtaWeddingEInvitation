import { getRegisteredCldImage } from "../../../shared/utils/cld";
import { weddingContent } from "../content/weddingContent";

export function EventAgenda() {
  const agenda = weddingContent.agenda;

  return (
    <section
      data-wedding-section="របៀបវារៈ"
      className="agenda-section wedding-section wedding-text-primary mx-auto min-h-[100svh] w-full max-w-5xl px-5 py-24 md:px-8 md:py-36"
      lang="km"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-radial-backdrop text-radial-backdrop--block">
          <p className="agenda-kicker wedding-animated wedding-text-kicker text-lg leading-[1.8] opacity-0 md:text-2xl">
            {agenda.kicker}
          </p>
        </div>
        <div className="text-radial-backdrop text-radial-backdrop--block mt-2">
          <h2 className="agenda-heading wedding-animated text-4xl leading-[1.65] opacity-0 md:text-6xl">
            {agenda.heading}
          </h2>
        </div>
        <div className="text-radial-backdrop text-radial-backdrop--block mt-3 max-w-2xl">
          <p className="agenda-note wedding-animated wedding-text-secondary text-base leading-[1.9] opacity-0 md:text-xl">
            {agenda.note}
          </p>
        </div>
      </div>

      <ol className="agenda-timeline relative mx-auto mt-14 max-w-3xl space-y-1 md:mt-20">
        <span
          className="agenda-timeline-line absolute bottom-7 left-1/2 top-7 w-[2px] -translate-x-1/2"
          aria-hidden="true"
        />
        {agenda.items.map((item) => {
          const icon = getRegisteredCldImage(item.iconAsset, { width: 160, height: 160 });

          return (
            <li
              key={`${item.time}-${item.title}`}
              className="agenda-item wedding-animated relative grid grid-cols-[minmax(0,1fr)_1.4rem_minmax(0,1fr)] gap-x-3 py-5 opacity-0 md:gap-x-5 md:py-6"
            >
              <span className="flex min-h-12 items-center justify-end">
                <img
                  src={icon.url}
                  alt=""
                  aria-hidden="true"
                  className="agenda-icon-image h-16 w-16 object-contain md:h-20 md:w-20"
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="relative flex justify-center pt-5" aria-hidden="true">
                <span className="agenda-timeline-node z-10 h-2.5 w-2.5 rounded-full" />
              </span>
              <div className="min-w-0 pb-1 text-left">
                <div className="text-radial-backdrop text-radial-backdrop--start">
                  <time className="agenda-time wedding-text-kicker block text-lg leading-[1.55] md:text-xl">{item.time}</time>
                </div>
                <div className="text-radial-backdrop text-radial-backdrop--start mt-1">
                  <p className="agenda-label crown-gold-leaf-text text-base leading-[1.65] md:text-xl">{item.title}</p>
                </div>
                {item.detail ? (
                  <div className="text-radial-backdrop text-radial-backdrop--start mt-1">
                    <p className="crown-gold-leaf-text text-xs leading-[1.75] md:text-base">{item.detail}</p>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
