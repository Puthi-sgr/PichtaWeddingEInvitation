import { Link } from "react-router-dom";

export function Navbar({ title = "E & J", links = [] }: { title?: string, links?: { label: string, to: string }[] }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center mix-blend-difference text-white">
      <div className="font-serif text-xl tracking-widest uppercase">{title}</div>
      <div className="font-sans text-sm tracking-widest uppercase flex gap-4">
        {links.map((link, i) => (
          <Link key={i} to={link.to} className="hover:opacity-70 transition-opacity">{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}
