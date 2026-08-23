import type { FaqItem } from "@/content/faq";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-slate/60 divide-y">
      {items.map((item) => (
        <details key={item.question} className="group py-4">
          <summary className="hover:text-teal flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {item.question}
            <span
              aria-hidden
              className="text-blanc/40 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="text-blanc/70 mt-3 text-sm leading-relaxed">{item.reponse}</p>
        </details>
      ))}
    </div>
  );
}
