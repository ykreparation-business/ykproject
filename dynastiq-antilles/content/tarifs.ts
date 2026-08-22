export type Formule = {
  nom: string;
  pourQui: string;
  inclus: string[];
  fourchette: string; // À CONFIRMER — aucun prix n'est inventé.
};

// Fourchettes de prix marquées "À CONFIRMER" : aucun chiffre n'est inventé.
// À remplacer par les vraies fourchettes tarifaires de l'entreprise.
export const formules: Formule[] = [
  {
    nom: "Essentielle",
    pourQui: "Maison ou petit commerce, quelques points à couvrir",
    inclus: [
      "2 à 4 caméras ou alarme Ajax de base",
      "Configuration de l'application",
      "1 an de garantie matériel",
    ],
    fourchette: "À CONFIRMER",
  },
  {
    nom: "Standard",
    pourQui: "Commerce ou maison avec plusieurs bâtiments/accès",
    inclus: [
      "4 à 8 caméras et/ou alarme complète",
      "Contrôle d'accès simple en option",
      "Contrat de maintenance",
    ],
    fourchette: "À CONFIRMER",
  },
  {
    nom: "Sur mesure",
    pourQui: "Entreprise, copropriété, entrepôt, hôtellerie",
    inclus: [
      "Étude technique dédiée",
      "Contrôle d'accès multi-zones, onduleur, bascule 4G",
      "Suivi et SAV local personnalisé",
    ],
    fourchette: "Sur devis",
  },
];
