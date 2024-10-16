/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
	Dialog,
	DialogTitle,
	DialogPanel,
	Transition,
	Description,
	TransitionChild,
} from "@headlessui/react";
import { FaCopy } from "react-icons/fa";
import CopyToClipboard from "react-copy-to-clipboard";
import { Fragment, useState, Dispatch, SetStateAction } from "react";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Props {
	enable: boolean;
	setEnable: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InstantMeeting({ enable, setEnable }: Props) {
	const [showMeetingLink, setShowMeetingLink] = useState(false);
	const [CallLink, setCallLink] = useState<string>("");

	const closeModal = () => setEnable(false);

	return (
		<>
			<Transition appear show={enable} as={Fragment}>
				<Dialog as='div' className='relative z-10' onClose={closeModal}>
					<TransitionChild
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<div className='fixed inset-0 bg-black/75' />
					</TransitionChild>

					<div className='fixed inset-0 overflow-y-auto'>
						<div className='flex min-h-full items-center justify-center p-4 text-center'>
							<TransitionChild
								as={Fragment}
								enter='ease-out duration-300'
								enterFrom='opacity-0 scale-95'
								enterTo='opacity-100 scale-100'
								leave='ease-in duration-200'
								leaveFrom='opacity-100 scale-100'
								leaveTo='opacity-0 scale-95'
							>
								<DialogPanel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 align-middle shadow-xl transition-all text-center'>
									{showMeetingLink ? (
										<MeetingLink CallLink={CallLink} />
									) : (
										<MeetingForm
											setShowMeetingLink={setShowMeetingLink}
											setCallLink={setCallLink}
										/>
									)}
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}

const MeetingForm = ({
	setShowMeetingLink,
	setCallLink,
}: {
	setShowMeetingLink: Dispatch<SetStateAction<boolean>>;
	setCallLink: Dispatch<SetStateAction<string>>;
}) => {
	const [description, setDescription] = useState<string>("");
	const [callDetail, setCallDetail] = useState<Call>();

	const client = useStreamVideoClient();
	const { user } = useUser();

	const handleStartMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!client || !user) return;
		try {
			const id = crypto.randomUUID();
			const call = client.call("default", id);
			if (!call) throw new Error("Failed to create meeting");

			await call.getOrCreate({
				data: {
					starts_at: new Date(Date.now()).toISOString(),
					custom: {
						description,
					},
				},
			});

			setCallDetail(call);
			setCallLink(`${call.id}`);
			setShowMeetingLink(true);
			console.log("Meeting Created!");
		} catch (error) {
			console.error(error);
			alert("Failed to create Meeting");
		}
	};

	return (
		<>
			<DialogTitle
				as='h3'
				className='text-lg font-bold leading-6 text-brand/80'
			>
				Create Instant Call
			</DialogTitle>

			<Description className='text-xs opacity-40 mb-4'>
				You can start a new Call instantly.
			</Description>

			<form className='w-full' onSubmit={handleStartMeeting}>
				<label
					className='block text-left text-sm font-medium text-white'
					htmlFor='description'
				>
					Meeting Description
				</label>
				<input
					type='text'
					name='description'
					id='description'
					value={description}
					required
					onChange={(e) => setDescription(e.target.value)}
					className='mt-1 block w-full text-sm py-3 px-4 border-gray-200 border-[1px] text-gray-800 rounded mb-3'
					placeholder='Enter a description for the meeting'
				/>

				<button className='w-full bg-brand/95 text-white py-3 rounded mt-4'>
					Proceed
				</button>
			</form>
		</>
	);
};

const MeetingLink = ({ CallLink }: { CallLink: string }) => {
	const [copied, setCopied] = useState<boolean>(false);
	const handleCopy = () => setCopied(true);

	return (
		<>
			<DialogTitle
				as='h3'
				className='text-lg font-bold leading-6 text-white'
			>
				Copy Call Link
			</DialogTitle>

			<Description className='text-xs opacity-40 mb-4'>
				You can start a new Call instantly.
			</Description>

			<div className='bg-gray-100 p-4 rounded flex items-center justify-between'>
				<p className='text-xs text-gray-500'>{`${process.env.NEXT_PUBLIC_CALL_HOST}/${CallLink}`}</p>

				<CopyToClipboard
					onCopy={handleCopy}
					text={`${process.env.NEXT_PUBLIC_CALL_HOST}/${CallLink}`}
				>
					<FaCopy className='text-gray-900 text-lg cursor-pointer' />
				</CopyToClipboard>
			</div>

			{copied && (
				<p className='text-green-600 text-xs mt-2'>Link copied to clipboard</p>
			)}

			<Link href={`${process.env.NEXT_PUBLIC_CALL_HOST}/${CallLink}`} className='w-full block bg-brand text-white py-3 rounded mt-4'>
				Start Call
			</Link>
		</>
	);
};