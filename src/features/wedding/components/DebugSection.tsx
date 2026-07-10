import { ReactNode, useEffect, useRef } from "react";

function isDebugSectionsEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debugSections") === "1";
}

type DebugSectionProps = {
  children: ReactNode;
  name: string;
};

export function DebugSection({ children, name }: DebugSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const debugEnabled = isDebugSectionsEnabled();

  useEffect(() => {
    const section = sectionRef.current;
    if (!debugEnabled || !section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.info(`[Wedding section enter] ${name}`);
        } else {
          console.info(`[Wedding section exit] ${name}`);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [debugEnabled, name]);

  if (!debugEnabled) {
    return <>{children}</>;
  }

  return (
    <div ref={sectionRef} className="relative border-y-2 border-gold-500/80">
      <div className="pointer-events-none sticky top-16 z-[60] ml-3 inline-flex bg-gold-500 px-3 py-1 font-sans text-[11px] uppercase tracking-[0.2em] text-white shadow-sm">
        {name}
      </div>
      {children}
    </div>
  );
}
