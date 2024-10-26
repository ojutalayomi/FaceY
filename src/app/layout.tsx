import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ClientComponents from "./clientComps";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <ClerkProvider>
          <html lang='en'>
              <body className={`${inter.className} bg-bgLight`}>
                  <ClientComponents>
                    {children}
                  </ClientComponents>
              </body>
          </html>
      </ClerkProvider>
  );
}