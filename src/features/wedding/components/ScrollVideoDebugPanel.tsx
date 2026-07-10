import { useEffect, useRef } from "react";

function isDebugScrollEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debugScroll") === "1";
}

function isDebugScrollLoggingEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debugScrollLogs") === "1";
}

function getActiveSectionName() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-wedding-section]"));
  const viewportCenter = window.innerHeight / 2;

  const activeSection = sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
  });

  if (activeSection) return activeSection.dataset.weddingSection ?? "unknown";

  let nearestSection: HTMLElement | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSection = section;
    }
  });

  return nearestSection?.dataset.weddingSection ?? "unknown";
}

export function ScrollVideoDebugPanel() {
  const panelRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!isDebugScrollEnabled()) return;

    const panel = panelRef.current;
    if (!panel) return;

    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let worstFrameMs = 0;
    let longFrameCount = 0;
    let lastLongFrameLog = 0;
    const logLongFrames = isDebugScrollLoggingEnabled();
    const frameSamples: number[] = [];

    const updatePanel = (now: number) => {
      const frameMs = now - lastFrameTime;
      lastFrameTime = now;

      frameSamples.push(frameMs);
      if (frameSamples.length > 30) frameSamples.shift();

      worstFrameMs = Math.max(worstFrameMs, frameMs);
      const isLongFrame = frameMs > 50;

      if (isLongFrame) {
        longFrameCount += 1;
      }

      const scrollTop = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      const video = document.querySelector<HTMLVideoElement>('[data-scroll-video="main-background"]');
      const videoCurrentTime = Number.isFinite(video?.currentTime) ? video.currentTime : 0;
      const videoDuration = Number.isFinite(video?.duration) ? video.duration : 0;
      const engineDirection = video?.dataset.scrollVideoDirection ?? "unknown";
      const engineSeeking = video?.dataset.scrollVideoSeeking ?? "false";
      const engineTargetTime = video?.dataset.scrollVideoTargetTime ?? "0.000";
      const engineEasedTime = video?.dataset.scrollVideoEasedTime ?? "0.000";
      const engineLastCommittedTime = video?.dataset.scrollVideoLastCommittedTime ?? "0.000";
      const engineSkippedSeeks = video?.dataset.scrollVideoSkippedSeeks ?? "0";
      const engineLastSeekAge = video?.dataset.scrollVideoLastSeekAge ?? "0";
      const avgFrameMs = frameSamples.reduce((total, sample) => total + sample, 0) / frameSamples.length;
      const fps = frameMs > 0 ? 1000 / frameMs : 0;
      const avgFps = avgFrameMs > 0 ? 1000 / avgFrameMs : 0;
      const activeSection = getActiveSectionName();

      const copyLine = [
        `y=${Math.round(scrollTop)}`,
        `p=${(progress * 100).toFixed(1)}%`,
        `section=${activeSection}`,
        `video=${videoCurrentTime.toFixed(2)}/${videoDuration.toFixed(2)}s`,
        `dir=${engineDirection}`,
        `seeking=${engineSeeking}`,
        `frame=${frameMs.toFixed(1)}ms`,
        `avg=${avgFps.toFixed(0)}fps`,
        `worst=${worstFrameMs.toFixed(1)}ms`,
      ].join(" ");

      panel.textContent = [
        "Scroll Video Debug",
        `scroll px: ${Math.round(scrollTop)} / ${Math.round(maxScroll)}`,
        `progress: ${(progress * 100).toFixed(1)}%`,
        `section: ${activeSection}`,
        `video: ${videoCurrentTime.toFixed(2)} / ${videoDuration.toFixed(2)}s`,
        `engine: ${engineDirection} seeking=${engineSeeking}`,
        `target/eased: ${engineTargetTime} / ${engineEasedTime}s`,
        `committed: ${engineLastCommittedTime}s`,
        `skipped seeks: ${engineSkippedSeeks}`,
        `last seek age: ${engineLastSeekAge}ms`,
        `frame: ${frameMs.toFixed(1)}ms (${fps.toFixed(0)}fps)`,
        `avg fps: ${avgFps.toFixed(0)}`,
        `worst frame: ${worstFrameMs.toFixed(1)}ms`,
        `long frames >50ms: ${longFrameCount}`,
        "",
        copyLine,
      ].join("\n");

      if (logLongFrames && isLongFrame && now - lastLongFrameLog > 500) {
        lastLongFrameLog = now;
        console.info(`[Scroll video long frame] ${copyLine}`);
      }

      animationFrame = window.requestAnimationFrame(updatePanel);
    };

    animationFrame = window.requestAnimationFrame(updatePanel);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (!isDebugScrollEnabled()) return null;

  return (
    <pre
      ref={panelRef}
      className="pointer-events-none fixed bottom-3 right-3 z-[90] max-w-[min(92vw,440px)] whitespace-pre-wrap rounded-md bg-black/75 p-3 font-mono text-[11px] leading-relaxed text-white shadow-lg"
    >
      Loading scroll debug...
    </pre>
  );
}
