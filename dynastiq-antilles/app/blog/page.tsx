import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { articles } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conseils et actualités sur la vidéosurveillance et l'alarme en Guadeloupe.",
};

export default function BlogPage() {
  return (
    <PageShell kicker="Blog" title="Conseils & actualités">
      {articles.length === 0 ? (
        <p className="text-blanc/60">
          Aucun article publié pour l&apos;instant. Reviens bientôt, ou consulte la{" "}
          <Link href="/faq" className="text-teal hover:underline">
            FAQ
          </Link>{" "}
          en attendant.
        </p>
      ) : (
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug} className="border-slate/60 rounded-xl border p-5">
              <Link
                href={`/blog/${article.slug}`}
                className="hover:text-teal font-display text-lg font-semibold"
              >
                {article.titre}
              </Link>
              <p className="text-blanc/70 mt-2 text-sm">{article.extrait}</p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
