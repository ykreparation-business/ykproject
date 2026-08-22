import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { articles, getArticleBySlug } from "@/content/blog";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return { title: article.titre, description: article.extrait };
}

export default async function ArticlePage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <PageShell kicker="Blog" title={article.titre} intro={article.extrait}>
      <div className="text-blanc/80 leading-relaxed whitespace-pre-line">
        {article.contenu}
      </div>
    </PageShell>
  );
}
