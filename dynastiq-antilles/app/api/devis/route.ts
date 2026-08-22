import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { site } from "@/content/site";
import { isRateLimited } from "@/lib/rate-limit";
import { devisSchema } from "@/lib/validations/devis";

const besoinLabels: Record<string, string> = {
  cameras: "Caméras",
  alarme: "Alarme",
  "les-deux": "Caméras + alarme",
  "controle-acces": "Contrôle d'accès",
  depannage: "Dépannage sur installation existante",
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessaie dans une minute." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = devisSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formulaire invalide.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot rempli => on répond succès sans rien envoyer, pour ne pas
  // signaler au bot que le champ est surveillé.
  if (data.siteWeb) {
    return NextResponse.json({ ok: true });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.DEVIS_NOTIFICATION_EMAIL ?? site.email;
  const fromEmail = process.env.DEVIS_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    console.error("RESEND_API_KEY ou DEVIS_FROM_EMAIL manquant dans l'environnement.");
    return NextResponse.json(
      { error: "Le service d'envoi n'est pas configuré." },
      { status: 500 },
    );
  }

  const resend = new Resend(resendApiKey);

  const summary = `
    Type de bien : ${data.typeDeBien}
    Besoin : ${besoinLabels[data.besoin] ?? data.besoin}
    Surface : ${data.surface}
    Points à couvrir : ${data.nombrePoints}
    Emplacement : ${data.emplacement}
    Internet sur place : ${data.internetSurPlace}
    Délai souhaité : ${data.delai}
    Commune : ${data.commune}
    Message : ${data.message ?? "—"}
  `.trim();

  try {
    await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      replyTo: data.email,
      subject: `Nouvelle demande de devis — ${data.nom} (${data.commune})`,
      text: `${data.nom} — ${data.telephone} — ${data.email}\n\n${summary}`,
    });

    await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: `${site.nom} — nous avons bien reçu ta demande de devis`,
      text: `Bonjour ${data.nom},\n\nNous avons bien reçu ta demande de devis. Un conseiller ${site.nom} te recontacte sous peu au ${data.telephone}.\n\nRécapitulatif :\n${summary}\n\n${site.nom} — ${site.zones}`,
    });
  } catch (error) {
    console.error("Échec d'envoi Resend :", error);
    return NextResponse.json(
      { error: "L'envoi a échoué. Merci de nous appeler directement." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
