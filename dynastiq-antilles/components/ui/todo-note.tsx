import type { ReactNode } from "react";

export function TodoNote({ children }: { children: ReactNode }) {
  return (
    <p className="border-vermillon/40 bg-vermillon/10 text-blanc/70 rounded-lg border border-dashed px-4 py-3 font-mono text-sm">
      TODO — {children}
    </p>
  );
}
