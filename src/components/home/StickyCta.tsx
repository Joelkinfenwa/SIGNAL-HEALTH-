"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { stickyCta } from "@/config/home";
import { cx } from "@/lib/cx";
import styles from "./StickyCta.module.css";

/**
 * Mobile-only sticky bar that appears once the hero has scrolled away.
 * Hidden on desktop by CSS. Uses IntersectionObserver on #hero (no scroll listeners).
 */
export function StickyCta({ priceLine }: { priceLine: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry ? !entry.isIntersecting : false), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className={cx(styles.bar, visible && styles.visible)} aria-hidden={!visible} data-theme="light">
      <div className={styles.inner}>
        <span className={styles.price}>{priceLine}</span>
        <Button href={stickyCta.href} size="sm" ctaId="sticky_find_my_test" location="sticky_bar" className={styles.button}>
          {stickyCta.label}
        </Button>
      </div>
    </div>
  );
}
