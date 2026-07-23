import { weddingContent } from "../content/weddingContent";

export function WeddingFooter() {
  const footer = weddingContent.footer;

  return (
    <footer
      data-wedding-section="អំណរគុណ"
      className="footer-section wedding-section wedding-text-primary mx-auto w-full max-w-4xl px-5 py-24 text-center md:px-8 md:py-32"
    >
      <h2 className="footer-heading wedding-animated wedding-text-kicker mb-8 text-3xl leading-[1.8] opacity-0 md:text-5xl">
        {footer.title}
      </h2>
      <div className="wedding-text-secondary space-y-3 text-xl leading-[2] md:text-3xl">
        <p className="footer-line wedding-animated opacity-0">{footer.gratitudeLineOne}</p>
        <p className="footer-line wedding-animated crown-gold-leaf-text opacity-0">{footer.gratitudeLineTwo}</p>
      </div>
      <p className="footer-credit wedding-animated wedding-text-accent mt-12 text-xl leading-[1.8] opacity-0 md:text-2xl">
        {footer.credit}
      </p>
    </footer>
  );
}
