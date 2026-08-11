import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { EvaluatorWidget } from "@/features/lab/evaluator-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ticketim",
  description: "Eventos, reservas e validação de ingressos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <div className="page-ambient" aria-hidden />
        <div className="page-grain" aria-hidden />
        <AuthProvider>
          {children}
          <EvaluatorWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
