import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AgroNegocia — Máquinas e Veículos do Agro",
    template: "%s | AgroNegocia",
  },
  description:
    "AgroNegocia é o marketplace de compra e venda de máquinas agrícolas e veículos automotivos. Anuncie e encontre tratores, colheitadeiras, implementos, caminhões e mais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
