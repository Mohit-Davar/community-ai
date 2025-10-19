"use client"

import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SidebarGroup } from '@/components/ui/sidebar';
import { useChatStore } from '@/lib/store/chatStore';

interface NewChatProps {
  isExpanded: boolean
}

export function NewChatButton({
  isExpanded,
}: NewChatProps) {
  const { isCreatingNewChat, createNewConversation } = useChatStore()

  return (
    <SidebarGroup className="flex justify-center items-center bg-white dark:bg-gray-800 p-2 dark:border-gray-700 border-b">
      <Button
        variant="outline"
        size={isExpanded ? "icon" : "default"}
        className="w-full"
        onClick={createNewConversation}
        disabled={isCreatingNewChat}
      >
        {isCreatingNewChat
          ? (<Loader2 className="w-4 h-4 animate-spin" />)
          : (<Plus className="w-4 h-4" />)
        }
        <span className="group-data-[state=collapsed]:hidden group-data-[state=expanded]:inline ml-2">
          New Chat
        </span>
      </Button>
    </SidebarGroup>
  )
}