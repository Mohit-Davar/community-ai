export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface ChatHistoryItem {
    id: string;
    title: string;
    date: string;
    icon: string;
    messages: Message[];
    mode: string;
    active?: boolean;
    userId: string;
}

export interface IntegrationMode {
    id: string;
    name: string;
    icon: string;
    image: string;
    color: string;
    description: string;
    systemPrompt?: string;
    useCustomBackend?: boolean;
}

export interface Conversation extends Omit<ChatHistoryItem, 'messages'> {
    messages: Message[];
    active: boolean;
}

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';
