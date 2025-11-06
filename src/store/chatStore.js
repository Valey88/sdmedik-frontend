import { create } from "zustand";

export const chatUrl = import.meta.env.VITE_URL_CHAT;

const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  fragments: {},
  wsConnection: null,
  isConnected: false,

  //экшаны для чата
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat }),

  //экшены для сообщений

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  updateMessage: (chatId, messageId, updatedMessage) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]:
          state.messages[chatId]?.map((msg) =>
            msg.id === messageId || msg.temp_id === messageId
              ? { ...msg, ...updatedMessage }
              : msg
          ) || [],
      },
    })),

  removeMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]:
          state.messages[chatId]?.filter(
            (msg) => msg.id !== messageId && msg.temp_id !== messageId
          ) || [],
      },
    })),

  replaceTempMessage: (chatId, tempId, realMessage) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]:
          state.messages[chatId]?.map((msg) =>
            msg.temp_id === tempId ? realMessage : msg
          ) || [],
      },
    })),

  // Экшены для статуса прочтения
  markMessagesAsRead: (chatId, messageIds) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]:
          state.messages[chatId]?.map((msg) =>
            messageIds.includes(msg.id)
              ? { ...msg, read_status: true, read_at: new Date().toISOString() }
              : msg
          ) || [],
      },
    })),

  // Вспомогательные методы
  getMessagesByChatId: (chatId) => {
    return get().messages[chatId] || [];
  },

  getFragmentsByChatId: (chatId) => {
    return get().fragments[chatId] || [];
  },

  // Отправка сообщения через WebSocket
  sendMessage: (event, data) => {
    const { wsConnection } = get();
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ event, data }));
    }
  },

  // Экшены для фрагментов
  setFragments: (chatId, fragments) =>
    set((state) => ({
      fragments: {
        ...state.fragments,
        [chatId]: fragments,
      },
    })),

  // Экшены для WebSocket
  setWebSocketConnection: (wsConnection) => set({ wsConnection }),
  setConnectionStatus: (isConnected) => set({ isConnected }),

  //Подключение к Websocket серверу
  connect: (chatUrl) => {
    //Создаем новое подключение
    const socket = new WebSocket(chatUrl);
  },
}));

export default useChatStore;
