import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamVideoProvider } from "./providers/StreamVideoProvider";

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
                <StreamVideoProvider>
                    <div className='absolute flex items-center justify-end gap-5 top-5 left-5'>
                        {/*-- if user is signed out --*/}
                        <SignedOut>
                            <SignInButton mode='modal' />
                        </SignedOut>
                        {/*-- if user is signed in --*/}
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>

                    {children}
                </StreamVideoProvider>
              </body>
          </html>
      </ClerkProvider>
  );
}