'use client'

import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SidebarGroup } from '@/components/ui/sidebar';
import { useChatStore } from '@/lib/store/chatStore';
import { ChatHistoryItem } from '@/types/chat/types';

interface ChatHistoryProps {
	isExpanded: boolean
}

export function ChatHistory({
	isExpanded,
}: ChatHistoryProps) {
	const { chatHistory, switchConversation, deleteConversation, renameConversation, selectedMode } = useChatStore()
	const filteredHistory = chatHistory.filter((c) => c.mode === selectedMode)

	const [editingId, setEditingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState('');

	const handleRenameSubmit = (chatId: string) => {
		if (renameValue.trim() && chatId) {
			renameConversation(chatId, renameValue.trim());
		}
		setEditingId(null);
		setRenameValue('');
	};

	const handleStartEditing = (chat: ChatHistoryItem) => {
		setEditingId(chat.id);
		setRenameValue(chat.title);
	};

	return (
		<SidebarGroup className="space-y-4 overflow-y-auto">
			{filteredHistory?.map((chat) => (
				<div
					key={chat.id}
					className={`flex items-center justify-center flex-wrap gap-3 p-3 rounded-2xl cursor-pointer transition-colors
						${chat.active
							? "bg-blue-600 text-white"
							: "hover:bg-gray-100 dark:hover:bg-gray-700"
						}`}
					onClick={() => editingId !== chat.id && switchConversation(chat.id)}
				>
					<div className="bg-white p-2 rounded-full">
						<Image
							src={chat.icon}
							alt={chat.title}
							width={20}
							height={20}
						/>
					</div>

					{isExpanded && (
						<div className="flex-1 px-2 min-w-0">
							{editingId === chat.id ? (
								<input
									value={renameValue}
									onChange={(e) => setRenameValue(e.target.value)}
									onBlur={() => handleRenameSubmit(chat.id)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleRenameSubmit(chat.id);
										if (e.key === 'Escape') setEditingId(null);
									}}
									onClick={(e) => e.stopPropagation()}
									className={`w-full bg-transparent focus:outline-none ${chat.active ? 'text-white' : ''}`}
									autoFocus
								/>
							) : (
								<p className="font-medium truncate">{chat.title}</p>
							)}
							<p
								className={`text-sm ${chat.active
									? "text-blue-100"
									: "text-gray-500 dark:text-gray-400"
									}`}
							>
								{chat.date}
							</p>
						</div>
					)}

					{isExpanded && editingId !== chat.id && (
						<div className="flex items-center">
							<Button
								variant="ghost"
								size="icon"
								className={`size-6 transition
                                    ${chat.active
										? "text-white hover:text-white hover:bg-blue-700"
										: "hover:bg-gray-200 dark:hover:bg-gray-600"
									}`}
								onClick={(e) => {
									e.stopPropagation();
									handleStartEditing(chat);
								}}
							>
								<Pencil className="w-3 h-3" />
							</Button>
							{filteredHistory.length > 1 && (
								<Button
									variant="ghost"
									size="icon"
									className={`size-6 transition
									    ${chat.active
											? "text-white hover:text-white hover:bg-blue-700"
											: "hover:bg-gray-200 dark:hover:bg-gray-600"
										}`}
									onClick={(e) => {
										e.stopPropagation(); // don’t trigger switchConversation
										deleteConversation(chat.id, e);
									}}
								>
									<Trash2 className="w-3 h-3" />
								</Button>
							)}
						</div>
					)}
				</div>
			))}

		</SidebarGroup>
	)
}