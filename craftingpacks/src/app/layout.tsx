import type { Metadata } from "next";
import { Press_Start_2P, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import PixelCursorLayer from "@/components/ui/pixel-cursor-layer";

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-console",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CraftingPacks",
  description: "Minecraft datapack generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart.variable} ${splineMono.variable} antialiased`}
      >
        <PixelCursorLayer />
        {children}
      </body>
    </html>
  );
}
