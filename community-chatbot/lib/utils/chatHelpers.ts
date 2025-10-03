import { ChatMessage, Conversation } from '@/types/chat/types';

export const createUserMessage = (content: string): ChatMessage => ({
	id: crypto.randomUUID(),
	role: 'user',
	content,
	timestamp: Date.now()
});

export const generateChatTitle = (firstMessage: string): string => {
	if (!firstMessage) return 'New Chat';
	const words = firstMessage.split(' ').slice(0, 6).join(' ');
	return words.length > 40 ? `${words.substring(0, 40)}...` : words;
};

export const buildActiveConversationMap = (chats: Conversation[]): Record<string, string> => {
	return chats.reduce((acc, chat) => {
		if (!acc[chat.mode] || chat.active) {
			acc[chat.mode] = chat.id;
		}
		return acc;
	}, {} as Record<string, string>);
};

export const markConversationActive = (chats: Conversation[], activeId: string): Conversation[] => {
	return chats.map(chat => ({
		...chat,
		active: chat.id === activeId
	}));
};

export const updateConversationMessages = (
	chats: Conversation[],
	conversationId: string,
	messages: ChatMessage[]
): Conversation[] => {
	return chats.map(chat =>
		chat.id === conversationId
			? { ...chat, messages, title: generateChatTitle(messages[0]?.content || '') }
			: chat
	);
};
