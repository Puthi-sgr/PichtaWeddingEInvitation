import { Link } from "react-router-dom";

export function Navbar({ title = "E & J", links = [] }: { title?: string, links?: { label: string, to: string }[] }) {
  return (
    <nav className="wedding-text-primary fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="font-serif text-xl tracking-widest uppercase">{title}</div>
      <div className="font-sans text-sm tracking-widest uppercase flex gap-4">
        {links.map((link, i) => (
          <Link key={i} to={link.to} className="transition-opacity hover:opacity-70">{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}
