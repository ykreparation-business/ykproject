import type { ReactNode } from "react";

type PageShellProps = {
  kicker?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

export function PageShell({ kicker, title, intro, children }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
      {kicker ? (
        <p className="text-teal font-mono text-xs tracking-widest uppercase">{kicker}</p>
      ) : null}
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {intro ? (
        <p className="text-blanc/75 mt-6 text-lg leading-relaxed">{intro}</p>
      ) : null}
      {children ? <div className="mt-10 space-y-8">{children}</div> : null}
    </main>
  );
}
