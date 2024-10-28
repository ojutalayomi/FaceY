/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { addMessage, updateMessage } from '@/redux/chatSlice';
import { useGetCallById } from "@/app/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import {
	StreamCall,
	StreamTheme,
	PaginatedGridLayout,
	SpeakerLayout,
	CallControls
} from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { Dispatch, Fragment, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Loader, Check } from "lucide-react"
import { useSocket } from "@/app/providers/SocketProvider";
import { Messages, msgStatus } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

export default function CallPage() {
	const { id } = useParams<{ id: string }>();
	const { user, isLoaded } = useUser();
	const socket = useSocket();
	const dispatch = useDispatch();
	const { call, isCallLoading } = useGetCallById(id);
	const [confirmJoin, setConfirmJoin] = useState<boolean>(false);
	const [camMicEnabled, setCamMicEnabled] = useState<boolean>(false);
	const router = useRouter();

	
	useEffect(() => {
		if (camMicEnabled) {
			call?.camera.enable();
			call?.microphone.enable();
		} else {
			call?.camera.disable();
			call?.microphone.disable();
		}

	}, [call, camMicEnabled]);

	const handleJoin = () => {
		if(socket && call){ 
			call.join();
			socket.emit('register', id);
			socket.emit('getMesages', { userId: user?.id, id: id });
			setConfirmJoin(true)
		} else {
			alert("Network connection problem.")
		}
	}

	const sendMessage = (inputMessage: string,setInputMessage: Dispatch<SetStateAction<string>>) => {
	
		if (!inputMessage.trim()) return; // Prevent sending empty messages
	
		const msg = {
		  id: generateId(),
		  content: inputMessage,
		  room: id,
		  sender: {
			dp: String(user?.imageUrl),
			name: user?.fullName || '',
			username: String(user?.username),
		  },
		  time: new Date().toISOString(),
		  status: 'sending' as msgStatus,
		};
	
		// Clear input and dispatch the message
		setInputMessage('');
		dispatch(addMessage(msg));
	
		if (socket) {
		  const clone = { ...msg, status: 'sent' };
		  socket.emit('message', clone );
		  dispatch(updateMessage({ id: msg.id, updates: { status: 'sent' } }))
		}
	}

	if (isCallLoading || !isLoaded) return <p className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen w-full flex items-center justify-center">Loading...</p>;

	if (!call) return (<p className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen w-full flex items-center justify-center">Call not found</p>);

	return (
		<main className='bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen w-full items-center justify-center'>
			<StreamCall call={call}>
				<StreamTheme className="flex flex-col h-screen">
					{confirmJoin ? <MeetingRoom id={id} sendMessage={sendMessage}/> : (
						<div className='flex flex-col flex-1 items-center justify-center gap-5'>
							<h1 className='text-3xl font-bold'>Join Call</h1>
							<p className='text-lg'>Are you sure you want to join this call?</p>
							<div className='flex gap-5'>
								<button onClick={handleJoin} className='px-4 py-3 bg-green-600 rounded-lg text-green-50'>Join</button>
								<button onClick={() => router.push("/")} className='px-4 py-3 bg-red-600 rounded-lg text-red-50'>Cancel</button>
							</div>
						</div>
				)}
				</StreamTheme>
			</StreamCall>
		</main>
	);

}



const generateId = () => {
	const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
	const machineId = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
	const processId = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
	const counter = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
	
	return timestamp + machineId + processId + counter;
}

const MeetingRoom = ({ id, sendMessage } : { id: string, sendMessage: (inputMessage: string, setInputMessage: Dispatch<SetStateAction<string>>) => void}) => {
	const { user, isLoaded } = useUser();
	const [layout, setLayout] = useState<CallLayoutType>("grid");
	const router = useRouter();
	const socket = useSocket();
	const dispatch = useDispatch();
	const lastDateRef = useRef<string>();
  	const socketChat = useSelector((state: RootState) => state.chat.messages);
	const [isOpen, setIsOpen] = useState(false);
	// const [sendMessage, setSendMessage] = useState<boolean>(false);
	const [inputMessage, setInputMessage] = useState("");

	const renderStatusIcon = (status: string) => {
		switch (status) {
		  case 'sending':
			return <Loader size={10} className="dark:text-gray-400 animate-spin dark:after:text-slate-200"/>;
		  case 'failed':
			return <b className="text-red-800 dark:after:text-slate-200">Not sent!</b>;
		  default:
			return <Check size={10} className="text-brand dark:after:text-slate-200"/>;
		}
	}
  
	const toggleChat = (): void => setIsOpen(!isOpen)

	const handleLeave = () => {
		if (confirm("Are you sure you want to leave the call?")) router.push("/");
		// if (socket) socket.emit('leave',id);
	};


	const CallLayout = () => {
		switch (layout) {
			case "grid":
				return <PaginatedGridLayout />;
			case "speaker-right":
				return <SpeakerLayout participantsBarPosition='left' />;
			default:
				return <SpeakerLayout participantsBarPosition='right' />;
		}
	};

	return (
		<>
		<section className='relative min-h-screen w-full overflow-hidden pt-4'>
			<div className='relative flex size-full items-center justify-center text-white'>
				<div className='flex size-full max-w-[1000px] items-center'>
					<CallLayout />
				</div>
				<div className='fixed bottom-0 flex w-full items-center justify-center gap-5'>
					<CallControls onLeave={handleLeave} />
					<Button className="msg rounded-full" onClick={toggleChat}>
						<MessageCircle />
					</Button>
				</div>
			</div>
		</section>
		{isOpen && (
			<div className="absolute flex items-center justify-center w-full h-full">
				<Card 
				className="mb-2 w-80 shadow-lg border-none bg-gradient-to-r text-white to-indigo-500 max-[640px]:flex max-[640px]:flex-col max-[640px]:h-full max-[640px]:justify-between max-[640px]:w-full"
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium truncate">Chat with others</CardTitle>
						<Button variant="ghost" size="icon" 
							onClick={(e) => {
								e.preventDefault();
								toggleChat()
							}}
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</Button>
					</CardHeader>
					<CardContent className='max-[640px]:flex-1 max-[640px]:overflow-auto'>
						<ScrollArea className="h-[300px] w-full max-[640px]:h-full">
							{socketChat?.reduce((acc: JSX.Element[], message, index) => {
							// Null/undefined check for message
							if (!message || !message.time) return acc;

							const messageDate = new Date(message.time).toLocaleDateString('en-US', { 
								day: '2-digit', 
								month: 'short', 
								year: 'numeric' 
							});
							const time = new Date(message.time).toLocaleTimeString('en-US', { 
								hour: 'numeric', 
								minute: '2-digit', 
								hour12: true 
							});

							acc.push(
								<Fragment key={message.id || generateId()}>
									{(index === 0 || messageDate !== lastDateRef.current) && (
										<div data-date={messageDate} className="text-center my-2 sticky top-0 z-[1]">
											<span className="dark:shadow-bar-dark bg-gray-700 p-1 rounded-sm text-xs">
												{messageDate}
											</span>
										</div>
									)}
									<div
										className={`mb-4 ${
											message.sender?.username === user?.username ? 'text-right' : 'text-left'
										}`}
									>
										<span
											className={`inline-flex flex-col rounded-lg px-3 py-2 text-sm ${
												message.sender?.username === user?.username
													? 'bg-primary text-primary-foreground'
													: 'bg-gray-700 hover:bg-gray-600'
											}`}
										>
											<b className={`flex gap-1 items-center text-xs 
												${message.sender?.username === user?.username ? 'justify-end' : ''}`}
											>
												{message.sender?.name || message.sender?.username}
												<Avatar className='h-5 w-5'>
													<AvatarImage src={message.sender?.dp} />
													<AvatarFallback>
														{message.sender?.name.slice(0,2)}
													</AvatarFallback>
												</Avatar>
											</b>

											<div className='bg-gradient-to-r text-white to-indigo-500 my-1 p-1 rounded-sm shadow-inner shadow-[#233351] w-full'>{message.content}</div>
											<abbr
												className={`cursor-text no-underline text-xs flex gap-1 items-center ${
													message.sender?.username === user?.username ? 'justify-end' : ''
												}`}
												title={time}
											>
												{(message.sender?.username === user?.username) &&
													<>
														{renderStatusIcon(message.status as string)}
														<b> • </b>
													</>
												}
												{time}
											</abbr>
										</span>
									</div>
								</Fragment>
							);
							lastDateRef.current = messageDate;
							return acc;
						}, [])}
						</ScrollArea>

					</CardContent>
					<CardFooter>
						<form
						className="flex w-full gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							sendMessage(inputMessage, setInputMessage)
						}}
						>
							<Input
								placeholder="Type a message..."
								value={inputMessage}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
							/>
							<Button 
							type="submit"
							>
								Send
							</Button>
						</form>
					</CardFooter>
				</Card>
			</div>
		)}
		</>
	);
};