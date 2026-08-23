export type TypeEquipement = "camera" | "detecteur" | "sirene" | "hub" | "acces";

export type PointEquipement = {
  id: string;
  type: TypeEquipement;
  x: number; // position en unités du viewBox (0-400)
  y: number; // position en unités du viewBox (0-260)
  // Angle du cône de champ pour les caméras, en degrés, 0° = vers le haut,
  // sens horaire (90° = vers la droite, 180° = vers le bas...).
  angle?: number;
  label: string;
  materiel: string[];
  pourquoi: string;
};

export type Segment = { x1: number; y1: number; x2: number; y2: number };

export type PlanBien = {
  id: "maison" | "commerce" | "entrepot";
  label: string;
  // Murs du plan, dessinés comme une série de segments (viewBox 400x260).
  murs: Segment[];
  // Limite de terrain / bâtiment, en pointillés (optionnel).
  contour?: Segment[];
  points: PointEquipement[];
};

export const VIEWBOX = { width: 400, height: 260 };

export const plans: PlanBien[] = [
  {
    id: "maison",
    label: "Maison",
    contour: [
      { x1: 20, y1: 20, x2: 360, y2: 20 },
      { x1: 360, y1: 20, x2: 360, y2: 240 },
      { x1: 360, y1: 240, x2: 20, y2: 240 },
      { x1: 20, y1: 240, x2: 20, y2: 20 },
    ],
    murs: [
      { x1: 40, y1: 40, x2: 240, y2: 40 },
      { x1: 240, y1: 40, x2: 240, y2: 200 },
      { x1: 240, y1: 200, x2: 40, y2: 200 },
      { x1: 40, y1: 200, x2: 40, y2: 40 },
      { x1: 140, y1: 40, x2: 140, y2: 200 },
      { x1: 40, y1: 120, x2: 140, y2: 120 },
      { x1: 140, y1: 150, x2: 240, y2: 150 },
    ],
    points: [
      {
        id: "maison-cam-entree",
        type: "camera",
        x: 40,
        y: 40,
        angle: 220,
        label: "Caméra — entrée & portail",
        materiel: ["Caméra extérieure IP66, grand angle", "Vision nocturne infrarouge"],
        pourquoi:
          "Premier point de passage : identifie qui entre avant l'ouverture du portail.",
      },
      {
        id: "maison-cam-jardin",
        type: "camera",
        x: 320,
        y: 210,
        angle: 315,
        label: "Caméra — jardin",
        materiel: ["Caméra extérieure IP67", "Détection de mouvement"],
        pourquoi: "Le jardin est une zone extérieure peu visible depuis l'intérieur.",
      },
      {
        id: "maison-detecteur-salon",
        type: "detecteur",
        x: 90,
        y: 80,
        label: "Détecteur — salon",
        materiel: ["Détecteur MotionCam (photo à la détection)"],
        pourquoi:
          "Pièce de passage principale : une détection ici lève le doute rapidement.",
      },
      {
        id: "maison-detecteur-chambre",
        type: "detecteur",
        x: 190,
        y: 80,
        label: "Détecteur — chambre",
        materiel: ["Détecteur d'ouverture", "Détecteur de mouvement"],
        pourquoi:
          "Chambre accessible depuis l'extérieur : double détection contre les fausses alertes.",
      },
      {
        id: "maison-hub",
        type: "hub",
        x: 140,
        y: 120,
        label: "Hub Ajax",
        materiel: ["Hub Ajax, communication chiffrée"],
        pourquoi:
          "Emplacement central, à portée radio de tous les détecteurs de la maison.",
      },
      {
        id: "maison-sirene",
        type: "sirene",
        x: 240,
        y: 40,
        label: "Sirène extérieure",
        materiel: ["Sirène extérieure avec flash"],
        pourquoi: "Dissuasion visible et sonore, positionnée côté rue.",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    murs: [
      { x1: 60, y1: 40, x2: 340, y2: 40 },
      { x1: 340, y1: 40, x2: 340, y2: 200 },
      { x1: 340, y1: 200, x2: 60, y2: 200 },
      { x1: 60, y1: 200, x2: 60, y2: 40 },
      { x1: 280, y1: 40, x2: 280, y2: 200 },
    ],
    contour: [{ x1: 40, y1: 220, x2: 360, y2: 220 }],
    points: [
      {
        id: "commerce-cam-entree",
        type: "camera",
        x: 70,
        y: 45,
        angle: 160,
        label: "Caméra — entrée & caisse",
        materiel: ["Caméra grand angle", "Vision nocturne"],
        pourquoi: "Couvre l'entrée et la caisse, le point le plus sensible du commerce.",
      },
      {
        id: "commerce-cam-reserve",
        type: "camera",
        x: 330,
        y: 45,
        angle: 180,
        label: "Caméra — réserve",
        materiel: ["Caméra intérieure discrète"],
        pourquoi: "Surveille les accès à la réserve et les stocks.",
      },
      {
        id: "commerce-detecteur-reserve",
        type: "detecteur",
        x: 330,
        y: 150,
        label: "Détecteur — porte réserve",
        materiel: ["Détecteur d'ouverture"],
        pourquoi: "Alerte immédiate si la réserve est ouverte en dehors des horaires.",
      },
      {
        id: "commerce-hub",
        type: "hub",
        x: 200,
        y: 120,
        label: "Hub Ajax",
        materiel: ["Hub Ajax"],
        pourquoi: "Position centrale pour couvrir toute la surface de vente.",
      },
      {
        id: "commerce-sirene",
        type: "sirene",
        x: 335,
        y: 45,
        label: "Sirène",
        materiel: ["Sirène extérieure"],
        pourquoi: "Visible depuis la rue, dissuasion en dehors des horaires d'ouverture.",
      },
    ],
  },
  {
    id: "entrepot",
    label: "Entrepôt",
    murs: [
      { x1: 40, y1: 30, x2: 360, y2: 30 },
      { x1: 360, y1: 30, x2: 360, y2: 220 },
      { x1: 360, y1: 220, x2: 40, y2: 220 },
      { x1: 40, y1: 220, x2: 40, y2: 30 },
      { x1: 200, y1: 30, x2: 200, y2: 220 },
    ],
    points: [
      {
        id: "entrepot-cam-quai-1",
        type: "camera",
        x: 100,
        y: 220,
        angle: 180,
        label: "Caméra — quai 1",
        materiel: ["Caméra extérieure grand angle"],
        pourquoi: "Trace les mouvements de marchandises au quai de chargement.",
      },
      {
        id: "entrepot-cam-quai-2",
        type: "camera",
        x: 260,
        y: 220,
        angle: 180,
        label: "Caméra — quai 2",
        materiel: ["Caméra extérieure grand angle"],
        pourquoi: "Second quai couvert indépendamment, pour ne pas laisser d'angle mort.",
      },
      {
        id: "entrepot-cam-perimetre",
        type: "camera",
        x: 360,
        y: 60,
        angle: 225,
        label: "Caméra — périmètre",
        materiel: ["Caméra périmétrique longue portée"],
        pourquoi: "Surveille le pourtour du bâtiment, hors des zones de quai.",
      },
      {
        id: "entrepot-acces",
        type: "acces",
        x: 40,
        y: 80,
        label: "Contrôle d'accès — entrée personnel",
        materiel: ["Lecteur de badge", "Traçabilité des accès"],
        pourquoi: "Sait qui entre et quand, sans gérer de clés physiques.",
      },
      {
        id: "entrepot-hub",
        type: "hub",
        x: 200,
        y: 120,
        label: "Hub Ajax",
        materiel: ["Hub Ajax", "Onduleur + bascule 4G"],
        pourquoi: "Site sensible : continuité assurée même en cas de coupure secteur.",
      },
      {
        id: "entrepot-sirene",
        type: "sirene",
        x: 355,
        y: 200,
        label: "Sirène",
        materiel: ["Sirène extérieure"],
        pourquoi: "Couvre toute la zone de stockage en cas de déclenchement.",
      },
    ],
  },
];
