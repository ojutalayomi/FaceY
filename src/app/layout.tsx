import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ClientComponents from "./clientComps";

import "./globals.css";
import { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FaceY App",
  description: "Created by Ayomide",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <ClerkProvider>
          <html lang='en'>
            <head>
              <link rel="manifest" href="/manifest.json" />
              <link rel="icon" href="/favicon.ico" sizes="any" />
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" type="imag/png" sizes="any" />
            </head>
            <body className={`${inter.className}`}>
                <ClientComponents>
                  {children}
                </ClientComponents>
            </body>
          </html>
      </ClerkProvider>
  );
}