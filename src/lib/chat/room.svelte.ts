import { joinRoom } from 'trystero';

export type ChatMessage = { id: string; name: string; text: string; ts: number; mine: boolean };

export class Room {
	messages = $state<ChatMessage[]>([]);
	peers = $state<Record<string, { name: string }>>({});

	#room;
	#me: { id: string; name: string };
	#sendChat: (m: { id: string; name: string; text: string; ts: number }) => Promise<void>;

	constructor(code: string, roomKey: string, me: { id: string; name: string }) {
		this.#me = me;
		this.#room = joinRoom(
			{
				appId: 'sv-better-auth-chat',
				password: roomKey
			},
			code
		);

		const chat = this.#room.makeAction<{ id: string; name: string; text: string; ts: number }>(
			'chat'
		);
		const hello = this.#room.makeAction<{ name: string }>('hello');
		this.#sendChat = chat.send;

		this.#room.onPeerJoin = (peerId) => {
			this.peers[peerId] = { name: '…' };
			hello.send({ name: this.#me.name }, { target: peerId });
		};

		this.#room.onPeerLeave = (peerId) => {
			delete this.peers[peerId];
		};

		hello.onMessage = ({ name }, { peerId }) => {
			this.peers[peerId] = { name: String(name).slice(0, 40) };
		};

		chat.onMessage = ({ id, name, text, ts }, { peerId }) => {
			this.messages.push({
				id: String(id),
				text: String(text),
				ts: Number(ts),
				name: this.peers[peerId]?.name ?? String(name ?? 'Unknown'),
				mine: false
			});
		};
	}

	send(text: string) {
		const msg = { id: crypto.randomUUID(), name: this.#me.name, text, ts: Date.now() };
		this.messages.push({ ...msg, mine: true });
		this.#sendChat(msg);
	}

	close() {
		return this.#room.leave();
	}
}
