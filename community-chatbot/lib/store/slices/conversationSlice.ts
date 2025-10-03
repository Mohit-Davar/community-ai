import { StateCreator } from 'zustand';

import { integrationModes } from '@/lib/constants/chat';
import { addConversation, deleteConversationFromDB } from '@/lib/firestore';
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
}

export const createConversationSlice: StateCreator<ConversationSlice & any, [], [], ConversationSlice> = (set, get) => ({
	selectedMode: "general",
	chatHistory: [],
	activeConversationIds: {},
	isCreatingNewChat: false,

	setSelectedMode: (modeId) => {
		set({ selectedMode: modeId });
		const { activeConversationIds, chatHistory } = get();
		const activeConvId = activeConversationIds[modeId];

		if (activeConvId) {
			const activeConversation = chatHistory.find((c) => c.id === activeConvId);
			if (activeConversation) {
				set({
					messages: activeConversation.messages || [],
					chatHistory: chatHistory.map((chat) => (chat.id === activeConvId ? { ...chat, active: true } : { ...chat, active: false }))
				});
			}
		} else {
			set({ messages: [] });
		}
	},

	createNewConversation: async () => {
		set({ isCreatingNewChat: true });
		const { selectedMode, currentUser, chatHistory, activeConversationIds } = get();
		const currentMode = integrationModes.find((m) => m.id === selectedMode);

		const newChatData: Omit<ChatHistoryItem, "id"> = {
			title: `New ${currentMode?.name || "Chat"}`,
			date: new Date().toLocaleDateString(),
			icon: currentMode?.image || "/mifos.png",
			messages: [],
			mode: selectedMode as any,
			active: true,
			userId: currentUser?.uid!
		};

		try {
			const newId = await addConversation(newChatData);

			const updatedHistory = [
				{ ...newChatData, id: newId },
				...chatHistory.map((chat) => (chat.mode === selectedMode ? { ...chat, active: false } : chat)),
			];

			set({
				chatHistory: updatedHistory,
				activeConversationIds: { ...activeConversationIds, [selectedMode]: newId },
				messages: [],
				input: ""
			});
			return newId;
		} catch (err) {
			console.error("Failed to create new conversation in Firestore:", err);
			const fallbackId = crypto.randomUUID();
			const updatedHistory = [
				{ ...newChatData, id: fallbackId },
				...chatHistory.map((chat) => (chat.mode === selectedMode ? { ...chat, active: false } : chat)),
			];
			set({
				chatHistory: updatedHistory,
				activeConversationIds: { ...activeConversationIds, [selectedMode]: fallbackId },
				messages: [],
				input: ""
			});
			return fallbackId;
		} finally {
			set({ isCreatingNewChat: false, sidebarOpen: false });
		}
	},

	switchConversation: (conversationId) => {
		const { chatHistory, activeConversationIds } = get();
		const conversation = chatHistory.find((c) => c.id === conversationId);
		if (!conversation) return;

		set({
			selectedMode: conversation.mode,
			activeConversationIds: { ...activeConversationIds, [conversation.mode]: conversationId },
			messages: conversation.messages || [],
			chatHistory: chatHistory.map((chat) => (chat.id === conversationId ? { ...chat, active: true } : { ...chat, active: false })),
			sidebarOpen: false
		});
	},

	deleteConversation: async (conversationId, e) => {
		e.stopPropagation();
		const { chatHistory, activeConversationIds, selectedMode, switchConversation } = get();

		const conversationToDelete = chatHistory.find((c) => c.id === conversationId);
		if (!conversationToDelete) return;

		const conversationsForMode = chatHistory.filter((c) => c.mode === conversationToDelete.mode);
		if (conversationsForMode.length <= 1) {
			return; // Prevent deleting the last conversation in a mode
		}

		try {
			await deleteConversationFromDB(conversationId);
		} catch (err) {
			console.error("Failed to delete conversation from Firestore:", err);
		}

		const newChatHistory = chatHistory.filter((c) => c.id !== conversationId);
		set({ chatHistory: newChatHistory });

		if (activeConversationIds[conversationToDelete.mode] === conversationId) {
			const remaining = newChatHistory.filter((c) => c.mode === conversationToDelete.mode);
			if (remaining.length > 0) {
				const newActiveId = remaining[0].id;
				if (selectedMode === conversationToDelete.mode) {
					switchConversation(newActiveId);
				} else {
					set({ activeConversationIds: { ...get().activeConversationIds, [conversationToDelete.mode]: newActiveId } });
				}
			}
		}
	},
});
