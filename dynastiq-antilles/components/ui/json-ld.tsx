// JSON.stringify output is safe here : les données viennent de content/
// et lib/seo.ts, jamais d'une saisie utilisateur non échappée.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
