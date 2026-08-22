import { z } from "zod";

// Schéma du formulaire de devis en 4 étapes (voir Phase 5 / app/devis).
// Un schéma par étape permet de valider chaque écran indépendamment ;
// devisSchema est l'union complète envoyée à /api/devis.

export const typeDeBienSchema = z.object({
  typeDeBien: z.enum(["maison", "appartement", "commerce", "entreprise", "copropriete"], {
    message: "Sélectionne le type de bien concerné.",
  }),
});

export const besoinSchema = z.object({
  besoin: z.enum(["cameras", "alarme", "les-deux", "controle-acces", "depannage"], {
    message: "Sélectionne ce dont tu as besoin.",
  }),
});

export const contexteSchema = z.object({
  surface: z.string().trim().min(1, "Indique une surface approximative (en m²)."),
  nombrePoints: z.coerce
    .number({ message: "Indique un nombre de points à couvrir." })
    .int()
    .min(1, "Indique au moins 1 point à couvrir.")
    .max(200, "Pour plus de 200 points, contacte-nous directement par téléphone."),
  emplacement: z.enum(["interieur", "exterieur", "les-deux"], {
    message: "Précise si c'est intérieur, extérieur, ou les deux.",
  }),
  internetSurPlace: z.enum(["oui", "non"], {
    message: "Précise s'il y a une connexion internet sur place.",
  }),
  delai: z.enum(["urgent", "1-mois", "3-mois", "pas-presse"], {
    message: "Indique le délai souhaité.",
  }),
});

const telephoneRegex = /^(?:\+?590|0)[0-9]{9}$/;

export const coordonneesSchema = z.object({
  nom: z.string().trim().min(2, "Indique ton nom complet."),
  telephone: z
    .string()
    .trim()
    .regex(telephoneRegex, "Indique un numéro à 10 chiffres (ex. 0690 12 34 56)."),
  email: z.string().trim().email("Indique une adresse email valide."),
  commune: z.string().trim().min(1, "Sélectionne ta commune."),
  message: z
    .string()
    .trim()
    .max(1000, "Le message ne peut pas dépasser 1000 caractères.")
    .optional(),
  // Honeypot anti-spam : doit rester vide. Un bot qui remplit ce champ est rejeté silencieusement.
  siteWeb: z.string().max(0).optional().or(z.literal("")),
});

export const devisSchema = typeDeBienSchema
  .merge(besoinSchema)
  .merge(contexteSchema)
  .merge(coordonneesSchema);

export type DevisInput = z.infer<typeof devisSchema>;
