import { create } from 'zustand';

import { AuthSlice, createAuthSlice } from '@/lib/store/slices/authSlice';
import {
  ConversationSlice, createConversationSlice,
} from '@/lib/store/slices/conversationSlice';
import {
  createMessageSlice, MessageSlice,
} from '@/lib/store/slices/messageSlice';
import { createUiSlice, UiSlice } from '@/lib/store/slices/uiSlice';

export type ChatState = AuthSlice & ConversationSlice & MessageSlice & UiSlice;

export const useChatStore = create<ChatState>()((...a) => ({
	...createAuthSlice(...a),
	...createConversationSlice(...a),
	...createMessageSlice(...a),
	...createUiSlice(...a),
}));
