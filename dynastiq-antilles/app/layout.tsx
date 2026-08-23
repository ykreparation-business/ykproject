import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { CustomCursor } from "@/components/motion/custom-cursor";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { JsonLd } from "@/components/ui/json-ld";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { site } from "@/content/site";
import { localBusinessJsonLd } from "@/lib/seo";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: `${site.nom} — ${site.baseline}`,
    template: `%s — ${site.nom}`,
  },
  description: site.baseline,
  openGraph: {
    title: `${site.nom} — ${site.baseline}`,
    description: site.baseline,
    url: site.siteUrl,
    siteName: site.nom,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.nom} — ${site.baseline}`,
    description: site.baseline,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${chakraPetch.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="bg-nuit text-blanc flex min-h-full flex-col pb-14 lg:pb-0">
        <JsonLd data={localBusinessJsonLd()} />
        <MotionProvider>
          <CustomCursor />
          <SiteHeader />
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
          <MobileActionBar />
          <CookieBanner />
        </MotionProvider>
      </body>
    </html>
  );
}
