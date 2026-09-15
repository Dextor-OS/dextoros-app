import type { Metadata, Viewport } from "next";
import { Martian_Mono, Mona_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { site } from "@/lib/site";
import { THEME_COLORS, THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const mona = Mona_Sans({ subsets: ["latin"], variable: "--font-mona" });
const martian = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", axes: ["wdth"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  // The portal is behind a login; nothing here should be indexed.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mona.variable} ${martian.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <span className="theme-scanline" aria-hidden="true" />
      </body>
    </html>
  );
}
