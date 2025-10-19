'use client';
import React, { useEffect } from 'react';
import { AppSidebar } from '@/components/chatbot/Sidebar/Sidebar';
import { ChatHeader } from '@/components/chatbot/ChatHeader';
import { ModeSelector } from '@/components/chatbot/ModeSelector';
import { ChatPanel } from '@/components/chatbot/ChatPanel';
import { MessageInput } from '@/components/chatbot/MessageInput';
import { useChatStore } from '@/lib/store/chatStore';

export default function ChatbotPage() {
	const { initAuth } = useChatStore();

	useEffect(() => {
		const unsubscribe = initAuth();
		return () => unsubscribe();
	}, [initAuth]);

	return (
		<main className="flex w-full h-screen">
			<AppSidebar />
			<div className="flex flex-col w-full">
				<ChatHeader />
				<ModeSelector />
				<ChatPanel />
				<MessageInput />
			</div>
		</main>
	);
}