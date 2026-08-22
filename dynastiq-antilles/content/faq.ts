export type FaqItem = { question: string; reponse: string };

export const faq: FaqItem[] = [
  {
    question: "Combien coûte une installation de vidéosurveillance ou d'alarme ?",
    reponse:
      "Le prix dépend du nombre de points à couvrir, du type de matériel et de la configuration du site. Chaque devis est établi après une visite technique ou un échange détaillé — voir la page Tarifs pour les fourchettes indicatives.",
  },
  {
    question: "Combien de temps prend une installation ?",
    reponse:
      "Pour une maison ou un petit commerce, l'installation se fait généralement en une journée. Pour des sites plus grands (entreprise, copropriété), cela peut prendre plusieurs jours selon le nombre de points et la complexité du câblage.",
  },
  {
    question: "Faut-il une autorisation pour installer des caméras ?",
    reponse:
      "Cela dépend de ce que les caméras filment. Un lieu privé (intérieur, jardin clos) ne nécessite pas d'autorisation préfectorale, contrairement à un lieu ouvert au public. Voir la page « Vidéoprotection : vos obligations » pour le détail — ce n'est pas un conseil juridique, en cas de doute contacte la préfecture.",
  },
  {
    question: "Sans fil ou filaire, quelle différence ?",
    reponse:
      "Le sans fil (comme Ajax pour l'alarme) s'installe sans saignées ni câblage à tirer, ce qui est plus rapide et moins invasif — idéal pour l'existant. Le filaire (souvent utilisé pour la vidéosurveillance en PoE) est plus robuste dans la durée et ne dépend pas de piles. Le choix dépend du site et du budget.",
  },
  {
    question: "Puis-je consulter mes caméras à distance ?",
    reponse:
      "Oui, via l'application du fabricant (Hik-Connect, gDMSS/DMSS, Safire View selon la marque) ou l'application Ajax pour l'alarme, à condition d'avoir une connexion internet sur le site.",
  },
  {
    question: "Que se passe-t-il en cas de coupure internet ?",
    reponse:
      "L'enregistrement local continue sur le NVR/DVR même sans internet — seule la consultation à distance est coupée. Pour les sites qui doivent rester joignables (alarme notamment), une bascule 4G peut être ajoutée en option.",
  },
  {
    question: "Et en cas de coupure secteur (électricité) ?",
    reponse:
      "Les équipements peuvent être associés à un onduleur pour garder une autonomie de quelques heures. Les détecteurs Ajax fonctionnent sur pile et ne sont pas affectés par une coupure secteur.",
  },
  {
    question: "Le matériel résiste-t-il au climat de la Guadeloupe ?",
    reponse:
      "C'est un point d'attention central de nos installations : boîtiers et visserie adaptés à la corrosion saline, indices de protection IP66/IP67 pour l'extérieur, parafoudres sur les lignes sensibles. Voir la section « Conçu pour les Antilles » sur la page d'accueil.",
  },
  {
    question: "Proposez-vous un contrat de maintenance ?",
    reponse:
      "Oui, un suivi et un SAV local sont proposés après l'installation. Le contenu exact de la formule de maintenance est précisé au devis.",
  },
  {
    question: "Intervenez-vous sur toute la Guadeloupe ?",
    reponse:
      "Oui, y compris les dépendances. Le délai d'intervention varie selon la commune — voir les pages locales par zone pour plus de détail.",
  },
];
