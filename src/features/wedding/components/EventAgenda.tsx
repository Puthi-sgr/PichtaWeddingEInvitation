import { weddingContent } from "../content/weddingContent";

function AgendaGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{
    time: string;
    label: string;
  }>;
}) {
  return (
    <div className="agenda-group wedding-text-primary">
      <h3 className="agenda-group-title wedding-animated wedding-text-kicker mb-6 text-2xl leading-[1.8] opacity-0 md:text-3xl">{title}</h3>
      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={`${item.time}-${item.label}`}
            className="agenda-item wedding-animated grid gap-2 border-b border-white/20 pb-5 text-left opacity-0 md:grid-cols-[10rem_1fr]"
          >
            <p className="wedding-text-accent text-lg leading-[1.8] md:text-xl">{item.time}</p>
            <p className="text-xl leading-[1.8] md:text-2xl">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventAgenda() {
  const agenda = weddingContent.agenda;

  return (
    <section
      data-wedding-section="របៀបវារៈ"
      className="agenda-section wedding-section wedding-text-primary mx-auto min-h-[100svh] w-full max-w-5xl px-5 py-28 md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="agenda-heading wedding-animated mb-14 text-4xl leading-[1.8] opacity-0 md:text-6xl">
          {agenda.title}
        </h2>
      </div>
      <div className="grid gap-14 md:grid-cols-2">
        <AgendaGroup title={agenda.morningTitle} items={agenda.morningItems} />
        <AgendaGroup title={agenda.eveningTitle} items={agenda.eveningItems} />
      </div>
    </section>
  );
}
