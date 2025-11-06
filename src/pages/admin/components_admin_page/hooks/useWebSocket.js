import { useState, useEffect, useRef, useCallback } from "react";
import api from "../configs/axiosConfig";

export const useWebSocket = (
  supportChatUrl,
  selectedChatId,
  adminSenderId,
  isAdminLoaded
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [fragments, setFragments] = useState([]);

  const ws = useRef(null);
  const processedMessages = useRef(new Set());
  const messagesRef = useRef([]);

  // Helper functions
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const markAsRead = useCallback((messageId, userId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      markMessageReadOnServer(messageId);
      return;
    }
    if (!messageId || !userId) return;
    const eventData = {
      event: "mark-as-read",
      data: { message_id: messageId, user_id: userId },
    };
    ws.current.send(JSON.stringify(eventData));
    markMessageReadOnServer(messageId);
  }, []);

  const markMessageReadOnServer = async (messageId) => {
    try {
      return await api.post(`/messages/${messageId}/mark-read`, {
        user_id: adminSenderId,
      });
    } catch (err) {
      console.error("markMessageReadOnServer error", err);
    }
  };

  const sendJoinEvent = useCallback((chatIdParam) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      setIsLoadingHistory(false);
      return;
    }
    ws.current.send(
      JSON.stringify({ event: "admin-join", data: { chat_id: chatIdParam } })
    );
  }, []);

  const editMessageOnServer = async (messageId, newText) => {
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            event: "edit-message",
            data: {
              message_id: messageId,
              message: newText,
              user_id: adminSenderId,
            },
          })
        );
        return { success: true };
      } else {
        throw new Error("Нет соединения с сервером");
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteMessageOnServer = async (messageId) => {
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            event: "delete-message",
            data: {
              message_id: messageId,
              user_id: adminSenderId,
            },
          })
        );
        return { success: true };
      } else {
        throw new Error("Нет соединения с сервером");
      }
    } catch (err) {
      throw err;
    }
  };

  const sendMessage = useCallback(
    (message, chatId) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        setError("Нет соединения с сервером чата.");
        return;
      }
      if (message.trim() && chatId && isAdminLoaded) {
        const messageEvent = {
          event: "message-event",
          data: {
            message: message.trim(),
            chat_id: chatId,
            sender_id: adminSenderId || "admin",
          },
        };
        ws.current.send(JSON.stringify(messageEvent));

        const messageKey = `${chatId}-${message.trim()}-${new Date().toISOString()}`;
        processedMessages.current.add(messageKey);

        const newMessage = {
          id: `${Math.random().toString(36).slice(2, 9)}-local`,
          type: "manager",
          text: message.trim(),
          timestamp: new Date().toISOString(),
          sender_id: adminSenderId || "admin",
          read_status: false,
          read_at: null,
          isNew: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
      }
    },
    [isAdminLoaded, adminSenderId]
  );

  const handleWebSocketMessage = useCallback(
    (event) => {
      if (!event || !event.data) return;

      if (!isValidJSON(event.data)) {
        const messageKey = `${event.data}-${new Date().toISOString()}`;
        if (processedMessages.current.has(messageKey)) return;
        processedMessages.current.add(messageKey);
        setMessages((prev) => [
          ...prev,
          {
            type: "user",
            text: event.data || "Сообщение отсутствует",
            timestamp: new Date().toISOString(),
            sender_id: "unknown",
            isNew: true,
          },
        ]);
        return;
      }

      try {
        const messageData = JSON.parse(event.data);

        // Handle fragments array (history)
        if (
          Array.isArray(messageData) &&
          messageData[0]?.id &&
          messageData[0]?.color
        ) {
          const formattedFragments = messageData.map((fragment) => ({
            id: fragment.id,
            Color: fragment.color,
            Messages: fragment.messages.map((msg) => {
              const text = msg.message || msg.text || "Сообщение отсутствует";
              return {
                id: msg.id,
                text,
                timestamp: msg.time_to_send || new Date().toISOString(),
                sender_id: msg.sender_id,
                read_status: msg.read_status,
                read_at: msg.read_at,
                updated_at: msg.updated_at,
                deleted: msg.deleted || false,
              };
            }),
          }));
          setFragments(formattedFragments);

          const newMessages = formattedFragments.flatMap((fragment) =>
            fragment.Messages.filter(
              (msg) =>
                !processedMessages.current.has(`${selectedChatId}-${msg.id}`) &&
                !messagesRef.current.some((m) => m.id === msg.id)
            ).map((msg) => {
              const messageKey = `${selectedChatId}-${msg.id}`;
              processedMessages.current.add(messageKey);
              return {
                id: msg.id,
                type:
                  adminSenderId && msg.sender_id === adminSenderId
                    ? "manager"
                    : "user",
                text: msg.text,
                timestamp: msg.timestamp,
                sender_id: msg.sender_id,
                read_status: msg.read_status || false,
                read_at: msg.read_at || null,
                updated_at: msg.updated_at || null,
                deleted: msg.deleted || false,
                isNew: true,
              };
            })
          );
          setMessages((prev) => [...prev, ...newMessages]);

          if (selectedChatId && adminSenderId) {
            newMessages
              .filter((msg) => msg.type === "user" && msg.id)
              .forEach((msg) => {
                markAsRead(msg.id, adminSenderId);
              });
          }
          setIsLoadingHistory(false);
          return;
        }

        // Handle event-type messages
        if (messageData.event === "new-chat") {
          const newChat = messageData.data;
          setChatRooms((prev) => {
            const updatedRooms = prev.some((room) => room.id === newChat.id)
              ? prev.map((room) =>
                  room.id === newChat.id
                    ? { ...room, messages: newChat.messages }
                    : room
                )
              : [newChat, ...prev];
            return updatedRooms.sort((a, b) => {
              const aTime = a.messages?.slice(-1)[0]?.time_to_send || 0;
              const bTime = b.messages?.slice(-1)[0]?.time_to_send || 0;
              return new Date(bTime) - new Date(aTime);
            });
          });
          setUnreadCounts((prev) => ({
            ...prev,
            [newChat.id]: newChat.unreadCount || newChat.messages?.length || 1,
          }));
        } else if (messageData.event === "message-event") {
          const {
            chat_id,
            message,
            sender_id,
            time_to_send,
            id,
            read_status,
            read_at,
            updated_at,
            deleted,
          } = messageData.data;
          const messageKey = `${chat_id}-${id || message}-${time_to_send}`;
          if (processedMessages.current.has(messageKey)) return;
          processedMessages.current.add(messageKey);

          const messageType =
            adminSenderId && sender_id === adminSenderId ? "manager" : "user";
          const text = message || "Сообщение отсутствует";

          if (chat_id === selectedChatId) {
            setMessages((prev) => {
              // Replace local message with server response
              if (messageType === "manager") {
                const idx = prev.findIndex(
                  (m) =>
                    m.type === "manager" &&
                    m.sender_id === (adminSenderId || "admin") &&
                    (!m.id || String(m.id).endsWith("-local")) &&
                    m.text === text
                );
                if (idx !== -1) {
                  const next = [...prev];
                  next[idx] = {
                    id,
                    type: messageType,
                    text,
                    timestamp: time_to_send || new Date().toISOString(),
                    sender_id,
                    read_status: read_status || false,
                    read_at: read_at || null,
                    updated_at: updated_at || null,
                    deleted: deleted || false,
                    isNew: true,
                  };
                  return next;
                }
              }
              return [
                ...prev,
                {
                  id,
                  type: messageType,
                  text,
                  timestamp: time_to_send || new Date().toISOString(),
                  sender_id,
                  read_status: read_status || false,
                  read_at: read_at || null,
                  updated_at: updated_at || null,
                  deleted: deleted || false,
                  isNew: true,
                },
              ];
            });
            if (messageType === "user" && !read_status && id && adminSenderId) {
              markAsRead(id, adminSenderId);
            }
          } else {
            setUnreadCounts((prev) => ({
              ...prev,
              [chat_id]: (prev[chat_id] || 0) + 1,
            }));
            setChatRooms((prev) => {
              const updatedRooms = prev.map((room) =>
                room.id === chat_id
                  ? {
                      ...room,
                      messages: [
                        ...(room.messages || []),
                        { message: text, sender_id, time_to_send, chat_id },
                      ],
                    }
                  : room
              );
              return updatedRooms.sort((a, b) => {
                const aTime = a.messages?.slice(-1)[0]?.time_to_send || 0;
                const bTime = b.messages?.slice(-1)[0]?.time_to_send || 0;
                return new Date(bTime) - new Date(aTime);
              });
            });
          }
        } else if (messageData.event === "mark-as-read") {
          const { chat_id } = messageData.data;
          setUnreadCounts((prev) => ({ ...prev, [chat_id]: 0 }));
          setChatRooms((prev) =>
            prev.map((room) =>
              room.id === chat_id ? { ...room, unreadCount: 0 } : room
            )
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.type === "manager"
                ? { ...m, read_status: true, read_at: new Date().toISOString() }
                : m
            )
          );
        } else if (messageData.event === "message-updated") {
          const { id, message: newText } = messageData.data;
          setMessages((prev) => {
            return prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    text: newText,
                    edited: true,
                    updated_at: new Date().toISOString(),
                  }
                : m
            );
          });
        } else if (messageData.event === "message-deleted") {
          const { id } = messageData.data;
          setMessages((prev) => {
            return prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    text: "Сообщение удалено",
                    deleted: true,
                    updated_at: new Date().toISOString(),
                  }
                : m
            );
          });
        } else if (Array.isArray(messageData)) {
          const formattedMessages = messageData
            .filter(
              (msg) =>
                !processedMessages.current.has(`${selectedChatId}-${msg.id}`) &&
                !messagesRef.current.some((m) => m.id === msg.id)
            )
            .map((msg) => {
              const text = msg.message || msg.text || "Сообщение отсутствует";
              const messageKey = `${selectedChatId}-${msg.id}`;
              processedMessages.current.add(messageKey);
              return {
                id: msg.id,
                type:
                  adminSenderId && msg.sender_id === adminSenderId
                    ? "manager"
                    : "user",
                text,
                timestamp: msg.time_to_send || new Date().toISOString(),
                sender_id: msg.sender_id,
                read_status: msg.read_status || false,
                read_at: msg.read_at || null,
                updated_at: msg.updated_at || null,
                deleted: msg.deleted || false,
              };
            });
          setMessages((prev) => [...prev, ...formattedMessages]);
          if (selectedChatId && adminSenderId) {
            formattedMessages
              .filter(
                (msg) => msg.type === "user" && msg.id && !msg.read_status
              )
              .forEach((msg) => {
                markAsRead(msg.id, adminSenderId);
              });
          }
          setIsLoadingHistory(false);
        }
      } catch (err) {
        setError("Ошибка обработки сообщения от сервера: " + err.message);
        setIsLoadingHistory(false);
      }
    },
    [selectedChatId, adminSenderId, markAsRead]
  );

  // WebSocket connection management
  useEffect(() => {
    if (!selectedChatId || !isAdminLoaded) return;

    // Clean old connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsLoadingHistory(true);
    ws.current = new WebSocket(supportChatUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError("");
      sendJoinEvent(selectedChatId);
    };

    ws.current.onmessage = handleWebSocketMessage;

    ws.current.onerror = () => {
      setError("Не удалось подключиться к чату. Проверьте соединение.");
      setIsConnected(false);
      setIsLoadingHistory(false);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setError("Соединение с чатом разорвано.");
      setIsLoadingHistory(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [selectedChatId, isAdminLoaded, supportChatUrl, sendJoinEvent]);

  // Clear messages when chat changes
  useEffect(() => {
    if (selectedChatId) {
      setMessages([]);
      setFragments([]);
      processedMessages.current.clear();
    }
  }, [selectedChatId]);

  // Update message types after adminSenderId is known
  useEffect(() => {
    if (isAdminLoaded && adminSenderId && messages.length > 0) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          type:
            adminSenderId && msg.sender_id === adminSenderId
              ? "manager"
              : "user",
        }))
      );
    }
  }, [isAdminLoaded, adminSenderId, messages.length]);

  // Keep a stable snapshot of messages for non-reactive consumers
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  return {
    isConnected,
    error,
    setError,
    isLoadingHistory,
    messages,
    setMessages,
    chatRooms,
    setChatRooms,
    unreadCounts,
    setUnreadCounts,
    fragments,
    setFragments,
    sendMessage,
    editMessageOnServer,
    deleteMessageOnServer,
    markAsRead,
  };
};
