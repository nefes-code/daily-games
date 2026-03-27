import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "./providers";
import { DashboardShell } from "@/components/dashboard-shell";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeFEs - Hub de Jogos Diários",
  description: "Hub de jogos diários entre amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={roboto.variable}>
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  );
}
