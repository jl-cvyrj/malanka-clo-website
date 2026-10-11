"use client";

import { useEffect, useRef } from "react";
import styles from "./ParallaxStrip.module.css";

export function ParallaxStrip({ text }: { text: string }) {
  const stripRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = stripRef.current;
    if (!node) return;

    let ticking = false;

    const updateParallax = () => {
      const offset = Math.min(window.scrollY * 0.3, 120);

      node.style.setProperty("--strip-offset", `${offset}px`);
      node.style.transform = `translateY(-${offset}px)`;

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    };

    updateParallax();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
      <section ref={stripRef} id="parallax-logo-strip" className={styles.strip}>
        <div className={styles.inner}>
          <img
              src="/images/logo.png"
              alt="MALANKA"
              className={styles.logo}
              loading="lazy"
          />
          <p className={styles.text}>{text}</p>
        </div>
      </section>
  );
}