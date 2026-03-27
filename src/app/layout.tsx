import type { Metadata } from "next";
import { Providers } from "./providers";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Daily Games",
  description: "Hub de jogos diários entre amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  );
}
