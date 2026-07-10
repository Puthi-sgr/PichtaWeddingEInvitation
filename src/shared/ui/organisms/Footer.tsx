export function Footer({ text = "រៀបចំឡើងដោយក្តីស្រលាញ់" }: { text?: string }) {
  return (
    <footer className="wedding-text-secondary py-12 text-center font-sans text-sm tracking-widest uppercase">
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </footer>
  );
}
