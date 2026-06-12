import { useEffect, RefObject } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useShowcaseAnimations(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Text Stagger Animation
      const tlStagger = gsap.timeline();
      tlStagger.fromTo(
        ".stagger-char",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 1, ease: "back.out(1.7)" }
      );

      // 2. Vertical Parallax Section
      const parallaxImages = gsap.utils.toArray(".parallax-img");
      parallaxImages.forEach((img: any) => {
        const speed = parseFloat(img.dataset.speed || "1");
        gsap.to(img, {
          y: () => -500 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: ".vertical-parallax-section",
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      });

      // 3. Scale & Rotate on Scroll
      gsap.to(".spin-box", {
        rotation: 360,
        scale: 1.5,
        borderRadius: "50%",
        scrollTrigger: {
          trigger: ".spin-section",
          start: "top center",
          end: "bottom center",
          scrub: true,
        }
      });

      // 4. Color Change Background
      gsap.to(".color-section", {
        backgroundColor: "#1c1917", // stone-900
        color: "#f5f5f4", // stone-100
        scrollTrigger: {
          trigger: ".color-section",
          start: "top center",
          end: "bottom center",
          scrub: true,
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
}
