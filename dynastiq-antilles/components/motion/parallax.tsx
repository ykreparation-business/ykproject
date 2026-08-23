"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useDesktopMotion } from "@/lib/use-desktop-motion";

// Profondeur discrète au scroll, amplitude limitée. Désactivée sur mobile et
// sous prefers-reduced-motion (rendu statique dans les deux cas).
export function Parallax({
  children,
  amplitude = 30,
  className,
}: {
  children: ReactNode;
  amplitude?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useDesktopMotion();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-amplitude, amplitude]);

  if (!enabled || reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
