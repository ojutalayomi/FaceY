'use client'
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamVideoProvider } from "./providers/StreamVideoProvider";
import { SocketProvider } from "./providers/SocketProvider";
import { ReactNode } from 'react';

const ClientComponents: React.FC<{ children: ReactNode }> = ({ children }) => {
    return(
        <Provider store={store}>
            <SocketProvider>
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
            </SocketProvider>
        </Provider>
    )
}

export default ClientComponents;