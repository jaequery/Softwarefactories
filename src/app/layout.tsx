import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Software Factories: independent reviews of every AI software factory",
  description:
    "Hands-on scores for the agents and platforms that turn tickets into shipped code: autonomy, code quality, speed and price.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen">
        <div className="relative z-10">
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
