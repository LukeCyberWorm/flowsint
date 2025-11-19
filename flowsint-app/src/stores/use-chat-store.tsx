import { ChatMessage } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatState {
  currentChatId: string | null
  setCurrentChatId: (chatId: string | null) => void
  messages: ChatMessage[]
  setMessages: (messages: ChatMessage[]) => void
  mergeServerMessages: (serverMessages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  removeMessage: (messageId: string) => void
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void
  deleteChat: (chatId: string) => void
}

export const useChatState = create<ChatState>()(
  persist(
    (set, _) => ({
      currentChatId: null,
      messages: [],
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      setMessages: (messages) => set({ messages: messages }),
      mergeServerMessages: (serverMessages) =>
        set((state) => {
          // Keep optimistic messages that haven't been confirmed yet
          const optimisticMessages = state.messages.filter((msg) => msg.isOptimistic)

          // Remove duplicates: if server has the message, remove optimistic version
          const serverMessageIds = new Set(serverMessages.map((msg) => msg.id))
          const uniqueOptimistic = optimisticMessages.filter(
            (msg) => !serverMessageIds.has(msg.id)
          )

          // Combine and sort by creation date
          const allMessages = [...serverMessages, ...uniqueOptimistic].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          return { messages: allMessages }
        }),
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, chatId: message.chatId || state.currentChatId || undefined }
          ]
        })),
      removeMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId)
        })),
      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        })),
      deleteChat: (chatId) =>
        set((state) => ({
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId
        }))
    }),
    {
      name: 'chat-state-storage',
      partialize: (state) => ({
        currentChatId: state.currentChatId
      })
    }
  )
)
