import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "EstateOS — Transparent estate finances",
  description:
    "Stop getting accused of stealing. Give your residents a transparent view of every naira collected and spent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
