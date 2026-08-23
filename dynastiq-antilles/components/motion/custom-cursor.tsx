"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useDesktopMotion } from "@/lib/use-desktop-motion";

type Variant = "default" | "hover" | "hidden";

// Réticule de tracking : suit le curseur, s'agrandit sur les éléments
// interactifs, affiche un micro-label si l'élément porte data-cursor="...".
// Jamais actif sur les champs de formulaire. Desktop uniquement, désactivé
// sous prefers-reduced-motion.
export function CustomCursor() {
  const enabled = useDesktopMotion();
  const reduce = useReducedMotion();
  const [variant, setVariant] = useState<Variant>("default");
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  const active = enabled && !reduce;

  useEffect(() => {
    if (!active) return;

    document.documentElement.classList.add("has-custom-cursor");

    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        setVariant("hidden");
        setLabel(null);
        return;
      }

      const cursorEl = target.closest<HTMLElement>("[data-cursor]");
      const interactiveEl = target.closest("a, button, [role='button'], summary");

      if (cursorEl) {
        setVariant("hover");
        setLabel(cursorEl.dataset.cursor ?? null);
      } else if (interactiveEl) {
        setVariant("hover");
        setLabel(null);
      } else {
        setVariant("default");
        setLabel(null);
      }
    }

    document.addEventListener("mousemove", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100]"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        animate={{
          scale: variant === "hover" ? 1.9 : variant === "hidden" ? 0 : 1,
          opacity: variant === "hidden" ? 0 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="border-teal flex size-8 items-center justify-center rounded-full border"
      >
        {label ? (
          <span className="text-teal font-mono text-[8px] tracking-widest uppercase">
            {label}
          </span>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
