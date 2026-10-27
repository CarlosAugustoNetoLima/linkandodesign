import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatAgent from "@/components/agent/ChatAgent";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-bricolage",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
});

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL("https://linkandodesign.com"),
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={dict.htmlLang}>
      <body className={`${bricolage.variable} ${inter.variable} font-sans`}>
        <ScrollProgress />
        <Header locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <ChatAgent locale={locale} />
      </body>
    </html>
  );
}
