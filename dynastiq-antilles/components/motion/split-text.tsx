"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const word = {
  hidden: { y: "100%" },
  show: { y: "0%", transition: { duration: 0.6, ease: EASE } },
};

// Révèle un titre mot par mot (masque + translation verticale). Réservé aux
// H1/H2 majeurs — le composant rend l'inline content, l'appelant garde la
// balise sémantique (<h1><SplitText text="..." /></h1>).
//
// Ne branche jamais l'arbre rendu sur useReducedMotion() : ce hook n'est pas
// sûr pour le SSR (mismatch d'hydratation si le média est déjà actif au
// premier rendu client). À la place, on garde toujours la même structure et
// on laisse <MotionConfig reducedMotion="user"> (voir motion-provider.tsx)
// neutraliser l'animation de transform automatiquement.
export function SplitText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      style={{ display: "inline" }}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {words.map((w, i) => (
        <span key={i}>
          <span
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
          >
            <motion.span variants={word} style={{ display: "inline-block" }}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}
