import type { Metadata } from "next";
import "./globals.css";
import Protected from "@/components/Protected";

export const metadata: Metadata = {
  title: "Next CRM - Consultoria & Seguros",
  description: "CRM para consultoria financeira e seguros de vida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Protected>{children}</Protected>
      </body>
    </html>
  );
}
