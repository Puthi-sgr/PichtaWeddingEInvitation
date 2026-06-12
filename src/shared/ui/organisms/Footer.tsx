export function Footer({ text = "Emma & James &copy; 2026" }: { text?: string }) {
  return (
    <footer className="py-12 bg-stone-900 text-center text-stone-500 font-sans text-sm tracking-widest uppercase">
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </footer>
  );
}
