import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Schedula — Smart Scheduling", template: "%s | Schedula" },
  description: "The smarter way to schedule meetings. Share your link, let others book time that works for everyone.",
  keywords: ["scheduling", "calendar", "appointments", "meetings", "booking"],
  openGraph: {
    title: "Schedula — Smart Scheduling",
    description: "Share your link, let others book time with you instantly.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
