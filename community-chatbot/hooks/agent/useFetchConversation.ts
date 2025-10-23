'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import { useAgentStore } from '@/lib/store/agent/agentStore';

export function useFetchConversation() {
    const { toast } = useToast();
    const pathname = usePathname();
    const currentMode = pathname.split('/')[1];
    const { fetchConversations, currentUser, chats } = useAgentStore();

    useEffect(() => {
        // Cleanup Flag
        let isMounted = true;

        if (!currentUser) return;

        const loadConversations = async () => {
            try {
                await fetchConversations(currentUser, currentMode);
            } catch (err: any) {
                if (!isMounted) return;

                toast({
                    variant: 'destructive',
                    title: 'Error loading chats',
                    description: err.message || 'Could not retrieve your conversations.',
                });
            }
        };
        loadConversations();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [currentMode, currentUser, fetchConversations, toast]);

    return { chats };
}
