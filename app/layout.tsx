import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Workbench",
  description: "AI stack for rapid project integration and DevOps automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
