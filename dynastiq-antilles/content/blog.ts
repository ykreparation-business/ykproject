export type Article = {
  slug: string;
  titre: string;
  extrait: string;
  contenu: string;
  date: string; // ISO
};

// Aucun article n'est publié pour l'instant — un vrai blog ne doit pas
// démarrer avec des articles inventés. Ajouter ici au fur et à mesure de la
// publication de vrais contenus.
export const articles: Article[] = [];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
