export type msgStatus = 'sending' | 'failed' | 'sent';

export interface Messages {
	id: string;
	content: string;
	room: string;
	sender: {
		dp: string;
		name: string;
		username: string
	};
	time?: string;
	status?: msgStatus
}