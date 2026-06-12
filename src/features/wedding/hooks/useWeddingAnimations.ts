import { useEffect, RefObject } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useWeddingAnimations(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Parallax
      gsap.to(".hero-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-content", {
        yPercent: 50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Reveal Animations for sections
      const revealLeftElements = gsap.utils.toArray(".reveal-left");
      revealLeftElements.forEach((el: any) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, x: -50 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      const revealRightElements = gsap.utils.toArray(".reveal-right");
      revealRightElements.forEach((el: any) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, x: 50 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Story Section Parallax
      gsap.fromTo(
        ".story-bg",
        { yPercent: -20 },
        {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: ".story-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Image Parallax Reveal
      const imgContainers = gsap.utils.toArray(".img-parallax-container");
      imgContainers.forEach((container: any) => {
        const img = container.querySelector(".img-parallax");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -15, scale: 1.1 },
            {
              yPercent: 15,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
}
