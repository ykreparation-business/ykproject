"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Fondu + translation courte entre pages, 300ms max. Ne branche pas sur
// useReducedMotion() (non sûr pour le SSR) — MotionConfig reducedMotion="user"
// (motion-provider.tsx) neutralise la translation automatiquement.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
