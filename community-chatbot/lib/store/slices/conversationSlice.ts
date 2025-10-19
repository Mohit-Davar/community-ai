import { StateCreator } from 'zustand';

import { integrationModes } from '@/lib/constants/chat';
import {
	addConversation,
	deleteConversationFromDB,
	updateConversation,
} from '@/lib/firestore';
import { ChatHistoryItem } from '@/types/chat/types';

export interface ConversationSlice {
	selectedMode: string;
	chatHistory: ChatHistoryItem[];
	activeConversationIds: Record<string, string>;
	isCreatingNewChat: boolean;

	setSelectedMode: (modeId: string) => void;
	createNewConversation: () => Promise<string>;
	switchConversation: (conversationId: string) => void;
	deleteConversation: (conversationId: string, e: React.MouseEvent) => Promise<void>;
	renameConversation: (conversationId: string, newTitle: string) => Promise<void>;
}

export const createConversationSlice: StateCreator<
	ConversationSlice & any,
	[],
	[],
	ConversationSlice
> = (set, get) => ({
	selectedMode: 'general',
	chatHistory: [],
	activeConversationIds: {},
	isCreatingNewChat: false,

	setSelectedMode: (modeId) => {
		const { activeConversationIds, chatHistory } = get();
		const activeConvId = activeConversationIds[modeId];
		const activeConversation = chatHistory.find((c: { id: any; }) => c.id === activeConvId);

		const updatedChatHistory = chatHistory.map((chat: { id: any; }) => ({
			...chat,
			active: chat.id === activeConvId,
		}));

		set({
			selectedMode: modeId,
			messages: activeConversation ? activeConversation.messages || [] : [],
			chatHistory: updatedChatHistory,
		});
	},

	createNewConversation: async () => {
		set({ isCreatingNewChat: true });
		const { selectedMode, currentUser, chatHistory, activeConversationIds } = get();
		const currentMode = integrationModes.find((m) => m.id === selectedMode);

		const newChatData: Omit<ChatHistoryItem, 'id'> = {
			title: `New ${currentMode?.name || 'Chat'}`,
			date: new Date().toLocaleDateString(),
			icon: currentMode?.image || '/mifos.png',
			messages: [],
			mode: selectedMode as any,
			active: true,
			userId: currentUser?.uid!,
		};

		let newId: string;
		try {
			newId = await addConversation(newChatData);
		} catch (error) {
			console.error('Failed to create new conversation in Firestore:', error);
			newId = crypto.randomUUID();
		}

		const updatedHistory = [
			{ ...newChatData, id: newId },
			...chatHistory.map((chat: { mode: any; }) =>
				chat.mode === selectedMode ? { ...chat, active: false } : chat
			),
		];

		set({
			chatHistory: updatedHistory,
			activeConversationIds: { ...activeConversationIds, [selectedMode]: newId },
			messages: [],
			input: '',
			isCreatingNewChat: false,
			sidebarOpen: false,
		});

		return newId;
	},

	switchConversation: (conversationId) => {
		const { chatHistory, activeConversationIds } = get();
		const conversationToSwitch = chatHistory.find((c: { id: string; }) => c.id === conversationId);
		if (!conversationToSwitch) return;

		const updatedHistory = chatHistory.map((chat: { id: string; }) => ({
			...chat,
			active: chat.id === conversationId,
		}));

		set({
			selectedMode: conversationToSwitch.mode,
			activeConversationIds: {
				...activeConversationIds,
				[conversationToSwitch.mode]: conversationId,
			},
			messages: conversationToSwitch.messages || [],
			chatHistory: updatedHistory,
			sidebarOpen: false,
		});
	},

	deleteConversation: async (conversationId, e) => {
		e.stopPropagation();
		const { chatHistory, activeConversationIds, selectedMode, switchConversation } = get();

		const conversationToDelete = chatHistory.find((c: { id: string; }) => c.id === conversationId);
		if (!conversationToDelete) return;

		const isLastInMode =
			chatHistory.filter((c: { mode: any; }) => c.mode === conversationToDelete.mode).length <= 1;
		if (isLastInMode) return; // Prevent deleting the last conversation in a mode

		try {
			await deleteConversationFromDB(conversationId);
		} catch (error) {
			console.error('Failed to delete conversation from Firestore:', error);
		}

		const updatedChatHistory = chatHistory.filter((c: { id: string; }) => c.id !== conversationId);
		set({ chatHistory: updatedChatHistory });

		const wasActive = activeConversationIds[conversationToDelete.mode] === conversationId;
		if (wasActive) {
			const remainingConversations = updatedChatHistory.filter(
				(c: { mode: any; }) => c.mode === conversationToDelete.mode
			);
			if (remainingConversations.length > 0) {
				const newActiveId = remainingConversations[0].id;
				if (selectedMode === conversationToDelete.mode) {
					switchConversation(newActiveId);
				} else {
					set({
						activeConversationIds: {
							...get().activeConversationIds,
							[conversationToDelete.mode]: newActiveId,
						},
					});
				}
			}
		}
	},

	renameConversation: async (conversationId, newTitle) => {
		set((state: { chatHistory: any[]; }) => ({
			chatHistory: state.chatHistory.map((chat: { id: string; }) =>
				chat.id === conversationId ? { ...chat, title: newTitle } : chat
			),
		}));

		try {
			await updateConversation(conversationId, { title: newTitle });
		} catch (error) {
			console.error('Failed to rename conversation in Firestore:', error);
		}
	},
});
