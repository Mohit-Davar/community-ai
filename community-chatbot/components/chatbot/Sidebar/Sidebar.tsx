"use client"

import { ChatHistory } from '@/components/chatbot/Sidebar/ChatHistory';
import { NewChatButton } from '@/components/chatbot/Sidebar/NewChatButton';
import {
  Header as SidebarHeader,
} from '@/components/chatbot/Sidebar/SidebarHeader';
import { Sidebar, SidebarContent, useSidebar } from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar()
  const isExpanded = state === "expanded"

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      {/* Header */}
      <SidebarHeader isExpanded={isExpanded} />
      {/* Content */}
      <SidebarContent className="flex flex-col h-full">
        {/* New Chat Button */}
        <NewChatButton isExpanded={isExpanded} />
        {/* Scrollable History */}
        <ChatHistory isExpanded={isExpanded} />
      </SidebarContent>
    </Sidebar>
  )
}