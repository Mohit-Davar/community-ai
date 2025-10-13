import { StateCreator } from 'zustand';
import { Message, ChatHistoryItem } from '@/types/chat/types';
import { updateConversation } from '@/lib/firestore';
import { integrationModes } from '@/lib/constants/chat';

const generateChatTitle = (firstMessage: string) => {
  if (!firstMessage) return "New Chat";
  const words = firstMessage.split(" ").slice(0, 6).join(" ");
  return words.length > 40 ? words.substring(0, 40) + "..." : words;
};

export interface MessageSlice {
  messages: Message[];
  input: string;
  status: "ready" | "submitted" | "streaming" | "error";
  error: Error | undefined;

  setInput: (input: string) => void;
  sendMessage: () => Promise<void>;
  reload: () => void;
  handleQuickAction: (action: string) => void;
}

export const createMessageSlice: StateCreator<MessageSlice & any, [], [], MessageSlice> = (set, get) => ({
  messages: [],
  input: "",
  status: "ready",
  error: undefined,

  setInput: (input) => set({ input }),

  reload: () => set({ error: undefined, status: "ready" }),

  sendMessage: async () => {
    const { input, selectedMode, activeConversationIds, createNewConversation, currentUser, messages, chatHistory } = get();
    if (!input.trim()) return;

    let convId = activeConversationIds[selectedMode];
    if (!convId) {
      convId = await createNewConversation();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    const currentMessages = messages;
    const updatedMessages = [...currentMessages, userMessage];
    const newTitle = updatedMessages.length === 1 ? generateChatTitle(updatedMessages[0].content) : (chatHistory.find(c => c.id === convId)?.title || "New Chat");

    set({ messages: updatedMessages, input: "", status: "submitted" });

    set(state => ({
      chatHistory: state.chatHistory.map(c => c.id === convId ? { ...c, messages: updatedMessages, title: newTitle } : c)
    }));

    try {
      await updateConversation(convId, { messages: updatedMessages, title: newTitle });
    } catch (error) {
      console.error("Firestore Error: Failed to update conversation.", error);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [userMessage],
          mode: selectedMode,
          conversationId: convId,
          userId: currentUser?.uid,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";
      const assistantMessageId = crypto.randomUUID();

      set(state => ({
        messages: [...state.messages, { id: assistantMessageId, role: "assistant", content: "", timestamp: Date.now() }]
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponse += decoder.decode(value, { stream: true });
        set(state => ({
          messages: state.messages.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
          )
        }));
      }

      const finalMessages = get().messages;
      try {
        await updateConversation(convId, { messages: finalMessages, title: newTitle });
      } catch (error) {
        console.error("Firestore Error: Failed to update conversation with assistant response.", error);
      }
      set(state => ({
        chatHistory: state.chatHistory.map(c => c.id === convId ? { ...c, messages: finalMessages, title: newTitle } : c),
        status: "ready"
      }));

    } catch (err) {
      console.error(`Error sending ${selectedMode} message:`, err);
      set({ error: err instanceof Error ? err : new Error(String(err)), status: "error" });
    }
  },

  handleQuickAction: (action: string) => {
    get().setInput(action);
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    }, 100);
  }
});
