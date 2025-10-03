import {
	addDoc, collection, deleteDoc, doc as firestoreDoc, getDocs, query, updateDoc,
	where,
} from 'firebase/firestore';

import { db } from '@/app/firebase/config';
import type { ChatHistoryItem, Message } from '@/types/chat/types';

import { integrationModes } from './constants/chat';

export const fetchChatsForUser = async (
	userId: string
): Promise<ChatHistoryItem[]> => {
	const chatsCol = collection(db, "chats");
	const q = query(chatsCol, where("userId", "==", userId));
	const chatsSnapshot = await getDocs(q);

	return chatsSnapshot.docs.map((d) => {
		const data = d.data() as Omit<ChatHistoryItem, "id">;
		return {
			id: d.id,
			...data,
			messages: (data.messages ?? []) as Message[],
			active: data.active ?? false,
		};
	});
};

export const createDefaultChats = async (
	userId: string
): Promise<ChatHistoryItem[]> => {
	const defaultChatsDefaults = integrationModes.map((mode) => ({
		title: `New ${mode.name} Chat`,
		date: new Date().toLocaleDateString(),
		icon: mode.image,
		messages: [] as Message[],
		mode: mode.id,
		active: false,
		userId: userId,
	}));

	const createdChats: ChatHistoryItem[] = [];
	for (const chatDef of defaultChatsDefaults) {
		const ref = await addDoc(collection(db, "chats"), chatDef);
		createdChats.push({ ...chatDef, id: ref.id });
	}
	return createdChats;
};

export const addConversation = async (
	newChatData: Omit<ChatHistoryItem, "id">
): Promise<string> => {
	const docRef = await addDoc(collection(db, "chats"), newChatData);
	return docRef.id;
};

export const updateConversation = async (
	conversationId: string,
	updatedData: { messages: Message[]; title: string }
) => {
	if (!conversationId) return;
	const chatRef = firestoreDoc(db, "chats", conversationId);
	await updateDoc(chatRef, updatedData);
};

export const deleteConversationFromDB = async (conversationId: string) => {
	await deleteDoc(firestoreDoc(db, "chats", conversationId));
};
