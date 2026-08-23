"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// reducedMotion="user" fait respecter prefers-reduced-motion par tous les
// composants motion.* de l'arbre : les animations de transform sont
// supprimées, les fondus (opacity) restent — exactement le comportement
// demandé (fondus instantanés plutôt que disparition complète).
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
