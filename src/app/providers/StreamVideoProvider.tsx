"use client";
import { tokenProvider } from "@/actions/stream.actions";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useState, ReactNode, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();

    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user || !apiKey) return;
        if (!tokenProvider) return;
        const client = new StreamVideoClient({
            apiKey,
            user: {
                id: user?.id,
                name: user?.primaryEmailAddress?.emailAddress,
                image: user?.imageUrl,
            },
            tokenProvider, //👉🏻 pending creation
        });

        setVideoClient(client);
    }, [user, isLoaded]);

    if (!videoClient) return null;

    return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};