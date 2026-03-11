import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebMonitor - Monitor Dostępności Stron",
  description: "Monitoruj dostępność swoich stron internetowych w czasie rzeczywistym",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
