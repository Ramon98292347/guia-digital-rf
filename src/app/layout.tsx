import type { Metadata } from "next";
import type { ReactNode } from "react";
import { platformConfig } from "@/config/platform";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: platformConfig.companyName,
    template: `%s | ${platformConfig.platformName} ${platformConfig.companyName}`,
  },
  applicationName: `${platformConfig.platformName} ${platformConfig.companyName}`,
  description:
    "Plataforma SaaS multi-tenant para Guias Digitais de hospedagens.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={platformConfig.defaultLocale}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
