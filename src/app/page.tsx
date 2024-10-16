/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { FaLink, FaVideo } from "react-icons/fa";
import InstantMeeting from "@/app/modals/InstantMeeting";
import UpcomingMeeting from "@/app/modals/UpcomingMeeting";
import CreateLink from "@/app/modals/CreateLink";
import JoinMeeting from "@/app/modals/JoinMeeting";
import { Link, UserPlus, Video } from "lucide-react";

export default function Dashboard() {
    const [startInstantMeeting, setStartInstantMeeting] =
        useState<boolean>(false);
    const [joinMeeting, setJoinMeeting] = useState<boolean>(false);
    const [showUpcomingMeetings, setShowUpcomingMeetings] =
        useState<boolean>(false);
    const [showCreateLink, setShowCreateLink] = useState<boolean>(false);

    return (
        <>

            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
                <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold mb-2 text-center">FaceY</h1>
                    <p 
                        className="cursor-pointer text-sm text-center mb-8 text-gray-400"
                        onClick={() => setShowUpcomingMeetings(true)}
                    >
                        Upcoming Call
                    </p>
                
                <div className="space-y-4">
                    <button 
                        className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg flex items-center justify-center space-x-2"
                        onClick={() => setShowCreateLink(true)}
                    >
                        <Link size={20} />
                        <span>Create link</span>
                    </button>
                    
                    <button 
                        className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 transition-colors rounded-lg flex items-center justify-center space-x-2"
                        onClick={() => setStartInstantMeeting(true)}
                    >
                        <Video size={20} />
                        <span>New Call</span>
                    </button>
                    
                    <button 
                        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 transition-colors rounded-lg flex items-center justify-center space-x-2"
                        onClick={() => setJoinMeeting(true)}
                    >
                        <UserPlus size={20} />
                        <span>Join Call</span>
                    </button>
                </div>
                </div>
            </div>

            {startInstantMeeting && (
                <InstantMeeting
                    enable={startInstantMeeting}
                    setEnable={setStartInstantMeeting}
                />
            )}
            {showUpcomingMeetings && (
                <UpcomingMeeting
                    enable={showUpcomingMeetings}
                    setEnable={setShowUpcomingMeetings}
                />
            )}
            {showCreateLink && (
                <CreateLink enable={showCreateLink} setEnable={setShowCreateLink} />
            )}
            {joinMeeting && (
                <JoinMeeting enable={joinMeeting} setEnable={setJoinMeeting} />
            )}
        </>
    );
}