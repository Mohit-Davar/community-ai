"use client";
import React, { useEffect, useRef } from "react";
import { AppSidebar } from "@/components/chatbot/Sidebar/Sidebar";
import { ChatHeader } from "@/components/chatbot/ChatHeader";
import { ModeSelector } from "@/components/chatbot/ModeSelector";
import { ChatPanel } from "@/components/chatbot/ChatPanel";
import { MessageInput } from "@/components/chatbot/MessageInput";
import { useChatStore } from "@/lib/store/chatStore";
import { integrationModes, quickActions } from "@/lib/constants/chat";

export default function ChatbotPage() {
	const {
		selectedMode,
		chatHistory,
		isCreatingNewChat,
		messages,
		input,
		status,
		error,
		activeConversationIds,
		initAuth,
		createNewConversation,
		switchConversation,
		deleteConversation,
		setSelectedMode,
		setInput,
		sendMessage,
		reload,
		handleQuickAction,
	} = useChatStore();

	const scrollAreaRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const unsubscribe = initAuth();
		return () => unsubscribe();
	}, [initAuth]);

	const activeConversationId = activeConversationIds[selectedMode];
	const currentMode = integrationModes.find((m) => m.id === selectedMode);

	const handleSubmit = (event?: React.FormEvent) => {
		if (event) event.preventDefault();
		sendMessage();
	};

	return (
		<main className="flex w-full h-screen">
			<AppSidebar
				chatHistory={chatHistory.filter((c) => c.mode === selectedMode)}
				createNewConversation={createNewConversation}
				isCreatingNewChat={isCreatingNewChat}
				switchConversation={switchConversation}
				deleteConversation={deleteConversation}
				integrationModes={integrationModes}
			/>

			<div className="flex flex-col w-full">
				<ChatHeader
					currentMode={currentMode}
					isCreatingNewChat={isCreatingNewChat}
					createNewConversation={createNewConversation}
				/>

				<ModeSelector
					integrationModes={integrationModes}
					selectedMode={selectedMode}
					handleModeChange={setSelectedMode}
				/>

				<ChatPanel
					key={`${selectedMode}-${activeConversationId}`}
					messages={messages}
					status={status}
					error={error}
					reload={reload}
					scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
					currentMode={currentMode}
					quickActions={quickActions}
					handleQuickAction={handleQuickAction}
					integrationModes={integrationModes}
				/>

				<MessageInput
					input={input}
					handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
					handleSubmit={handleSubmit as (event?: React.FormEvent) => void}
					status={status}
					stop={() => { }} // `stop` is not implemented in the store yet.
					currentModeName={currentMode?.name}
				/>
			</div>
		</main>
	);
}