import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Paper,
  InputAdornment,
  CircularProgress,
  IconButton,
  styled,
  Dialog,
  DialogTitle,
  DialogActions,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../../../../configs/axiosConfig";
import { supportChat } from "@/constants/constants";
import useUserStore from "../../../../store/userStore";
import { FixedSizeList } from "react-window";
import { useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH = 360;
const MESSAGE_GAP = 5 * 60 * 1000; // 5 минут в миллисекундах

export default function AdminChat() {
  // --- states from your original file + new ones
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [adminSenderId, setAdminSenderId] = useState(null);
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);
  const [fragments, setFragments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null); // for chat delete
  const [openMsgDeleteDialog, setOpenMsgDeleteDialog] = useState(null); // {id, text}
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); // menu for message actions
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const fragmentRefs = useRef({});
  const chatContainerRef = useRef(null);
  const processedMessages = useRef(new Set());
  const { getUserInfo, user } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  // --- helpers ---
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const formatTimestamp = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    const pad = (n) => n.toString().padStart(2, "0");
    const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (sameDay) return hhmm;
    if (isYesterday) return `вчера ${hhmm}`;

    if (d.getFullYear() === now.getFullYear()) {
      // DD MMM HH:mm
      return `${pad(d.getDate())} ${d.toLocaleString("ru", {
        month: "short",
      })} ${hhmm}`;
    }
    // DD MMM YYYY HH:mm
    return `${pad(d.getDate())} ${d.toLocaleString("ru", {
      month: "short",
    })} ${d.getFullYear()} ${hhmm}`;
  };

  const isoTooltip = (iso) => (iso ? new Date(iso).toISOString() : "");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- API wrappers for edit/delete/mark-read ---
  const editMessageOnServer = async (messageId, newText) => {
    try {
      // Отправляем через Socket.IO вместо REST API
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
      // Отправляем через Socket.IO вместо REST API
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

  const markMessageReadOnServer = async (messageId) => {
    try {
      return await api.post(`/messages/${messageId}/mark-read`, {
        user_id: adminSenderId,
      });
    } catch (err) {
      // ignore occasional errors, WS will sync
      console.error("markMessageReadOnServer error", err);
    }
  };

  // --- fetch orders / rooms / fragments (kept from your code; small fixes) ---
  const fetchOrders = async () => {
    try {
      const response = await api.get(`/order`);
      setOrders(response.data);
    } catch (err) {
      setError("Не удалось загрузить данные заказов.");
    }
  };

  const fetchChatRooms = async () => {
    try {
      const userData = localStorage.getItem("user");
      const parsedUser = JSON.parse(userData);
      const admin_id = parsedUser?.data?.id;
      const response = await api.get("/chat", {
        params: { user_id: admin_id },
      });
      const rooms = response.data.data || [];
      rooms.sort((a, b) => {
        const aTime = a.messages?.slice(-1)[0]?.time_to_send || 0;
        const bTime = b.messages?.slice(-1)[0]?.time_to_send || 0;
        return new Date(bTime) - new Date(aTime);
      });
      setChatRooms(rooms);
      setUnreadCounts(
        rooms.reduce(
          (acc, room) => ({
            ...acc,
            [room.id]: room.unreadCount || room.messages?.length || 0,
          }),
          {}
        )
      );
    } catch (err) {
      setError("Не удалось загрузить список чатов.");
    }
  };

  const fetchFragments = async (chatIdParam) => {
    try {
      const response = await api.get(`/chat/${chatIdParam}/fragments`);
      const fragmentsData = response.data || [];
      const formattedFragments = fragmentsData.map((fragment) => ({
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
            !processedMessages.current.has(`${chatIdParam}-${msg.id}`) &&
            !messages.some(
              (m) =>
                m.id === msg.id ||
                (m.text === msg.text && m.timestamp === msg.time_to_send)
            )
        ).map((msg) => {
          const messageKey = `${chatIdParam}-${msg.id}`;
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

      if (chatIdParam && adminSenderId) {
        newMessages
          .filter((msg) => msg.type === "user" && msg.id)
          .forEach((msg) => {
            // send both WS event and REST for reliability
            markAsRead(msg.id, adminSenderId);
            markMessageReadOnServer(msg.id);
          });
      }
    } catch (err) {
      setError("Не удалось загрузить фрагменты чата: " + err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchAdminSenderId = async () => {
    try {
      await getUserInfo();
      if (user?.data?.id) {
        setAdminSenderId(user.data.id);
        setIsAdminLoaded(true);
      } else {
        throw new Error("Пользователь не найден");
      }
    } catch (err) {
      setError("Не удалось загрузить данные администратора: " + err.message);
      setIsAdminLoaded(true);
    }
  };

  // --- websocket helpers from your original code ---
  const sendJoinEvent = (chatIdParam) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      setIsLoadingHistory(false);
      return;
    }
    ws.current.send(
      JSON.stringify({ event: "admin-join", data: { chat_id: chatIdParam } })
    );
  };

  const markAsRead = (messageId, userId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      // still call server for reliability
      markMessageReadOnServer(messageId);
      return;
    }
    if (!messageId || !userId) return;
    const eventData = {
      event: "mark-as-read",
      data: { message_id: messageId, user_id: userId },
    };
    ws.current.send(JSON.stringify(eventData));
    // also attempt REST call
    markMessageReadOnServer(messageId);
  };

  // --- message edit/delete handlers (frontend + server) ---
  const handleEditStart = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text);
    setAnchorEl(null);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditSave = async (msgId) => {
    try {
      await editMessageOnServer(msgId, editingText);
      // update local messages: mark edited + updated_at if provided
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                text: editingText,
                edited: true,
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );
      handleEditCancel();
    } catch (err) {
      setError("Не удалось отредактировать сообщение: " + err.message);
    }
  };

  const handleDeleteMessageRequest = (msg) => {
    setOpenMsgDeleteDialog(msg);
    setAnchorEl(null);
  };

  const handleDeleteMessageConfirm = async (msg) => {
    try {
      await deleteMessageOnServer(msg.id);
      // soft-delete in UI: replace text, set deleted flag
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                text: "Сообщение удалено",
                deleted: true,
                edited: false,
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );
    } catch (err) {
      setError("Не удалось удалить сообщение: " + err.message);
    } finally {
      setOpenMsgDeleteDialog(null);
    }
  };

  // --- WebSocket message handler (extended) ---
  const handleWebSocketMessage = (event) => {
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

      // fragments array (history)
      if (
        Array.isArray(messageData) &&
        messageData[0]?.id &&
        messageData[0]?.color
      ) {
        // reuse your fragment handling
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
              !messages.some((m) => m.id === msg.id)
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

      // event-type messages
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
          setMessages((prev) => [
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
          ]);
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
        // update read_status for messages in UI
        setMessages((prev) =>
          prev.map((m) =>
            m.type === "manager"
              ? { ...m, read_status: true, read_at: new Date().toISOString() }
              : m
          )
        );
      } else if (messageData.event === "message-updated") {
        const { id, message: newText } = messageData.data;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  text: newText,
                  edited: true,
                  updated_at: new Date().toISOString(),
                }
              : m
          )
        );
      } else if (messageData.event === "message-deleted") {
        const { id } = messageData.data;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  text: "Сообщение удалено",
                  deleted: true,
                  updated_at: new Date().toISOString(),
                }
              : m
          )
        );
      } else if (messageData.event === "edited-message") {
        const { message_id } = messageData;
        console.log("Сообщение отредактировано на сервере:", message_id);
        // Сервер сам разошлет обновление через message-updated
      } else if (messageData.event === "deleted-message") {
        const { message_id } = messageData;
        console.log("Сообщение удалено на сервере:", message_id);
        // Сервер сам разошлет обновление через message-deleted
      } else if (Array.isArray(messageData)) {
        const formattedMessages = messageData
          .filter(
            (msg) =>
              !processedMessages.current.has(`${selectedChatId}-${msg.id}`) &&
              !messages.some((m) => m.id === msg.id)
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
            .filter((msg) => msg.type === "user" && msg.id && !msg.read_status)
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
  };

  // --- WebSocket lifecycle (connect per chat) ---
  useEffect(() => {
    fetchAdminSenderId();
    fetchChatRooms();
    fetchOrders();

    // close previous
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    // global connection for events (optional) - keep closed until chat selected
    // We'll open per-chat socket in effect below when selectedChatId changes.

    if ("Notification" in window) {
      Notification.requestPermission().catch((err) => {
        setError("Ошибка запроса уведомлений: " + err.message);
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
        // don't auto-open until chat chosen
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const iOSVersion = isIOS
      ? parseFloat(navigator.userAgent.match(/OS (\d+)_/)?.[1] || 0)
      : null;
    if (isIOS && iOSVersion < 15) {
      setError("Ваша версия iOS устарела. Обновите iOS до версии 15 или выше.");
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Open per-chat websocket when selectedChatId changes
  useEffect(() => {
    if (!selectedChatId) return;

    // clean old
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsLoadingHistory(true);
    // open ws to supportChat (preserve your previous supportChat address format)
    ws.current = new WebSocket(supportChat);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId, isAdminLoaded]);

  // --- handle url params to select chat (kept from your original) ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const chatIdFromUrl = queryParams.get("chat_id");
    const fragmentId = queryParams.get("fragment");

    if (chatIdFromUrl && chatIdFromUrl !== selectedChatId && isAdminLoaded) {
      setSelectedChatId(chatIdFromUrl);
      setChatId(chatIdFromUrl);
      setMessages([]);
      setFragments([]);
      processedMessages.current.clear();
      setIsLoadingHistory(true);
      fetchFragments(chatIdFromUrl);
      if (isConnected) sendJoinEvent(chatIdFromUrl);
    }

    if (
      chatContainerRef.current &&
      !isLoadingHistory &&
      fragmentId &&
      fragmentRefs.current[fragmentId]
    ) {
      setTimeout(() => {
        const fragmentElement = fragmentRefs.current[fragmentId];
        fragmentElement.scrollIntoView({ behavior: "smooth" });
        const container = chatContainerRef.current;
        const offset = fragmentElement.offsetTop - container.offsetTop;
        container.scrollTop = offset;
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.search,
    isLoadingHistory,
    fragments,
    isConnected,
    isAdminLoaded,
  ]);

  // update message types after adminSenderId known
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLoaded, adminSenderId]);

  const handleChatSelect = (roomId) => {
    setSelectedChatId(roomId);
    setChatId(roomId);
    setMessages([]);
    setFragments([]);
    processedMessages.current.clear();
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
    setIsLoadingHistory(true);
    if (isAdminLoaded) {
      fetchFragments(roomId);
      if (isConnected) sendJoinEvent(roomId);
    }
    navigate(`/admin/admin_chat?chat_id=${roomId}`);
  };

  const handleCloseChat = () => {
    setSelectedChatId(null);
    setChatId("");
    setMessages([]);
    setFragments([]);
    processedMessages.current.clear();
    navigate("/admin/admin_chat");
  };

  // --- send message (via ws) ---
  const handleSend = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      return;
    }
    if (input.trim() && selectedChatId && isAdminLoaded) {
      const messageEvent = {
        event: "message-event",
        data: {
          message: input.trim(),
          chat_id: selectedChatId,
          sender_id: adminSenderId || "admin",
        },
      };
      ws.current.send(JSON.stringify(messageEvent));
      const messageKey = `${selectedChatId}-${input.trim()}-${new Date().toISOString()}`;
      processedMessages.current.add(messageKey);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Math.random().toString(36).slice(2, 9)}-local`,
          type: "manager",
          text: input.trim(),
          timestamp: new Date().toISOString(),
          sender_id: adminSenderId || "admin",
          read_status: false,
          read_at: null,
          isNew: true,
        },
      ]);
      setInput("");
      scrollToBottom();
    }
  };

  // --- message menu open/close ---
  const handleOpenMsgMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMsgMenu = () => {
    setAnchorEl(null);
  };

  // --- render helpers & groupedMessages (kept with additions) ---
  const groupedMessages = useMemo(() => {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const elements = [];

    if (fragments.length > 0) {
      fragments.forEach((fragment) => {
        const fragmentMessages = sortedMessages.filter((msg) =>
          fragment.Messages.some(
            (fm) =>
              fm.id === msg.id ||
              (fm.text === msg.text && fm.timestamp === msg.timestamp)
          )
        );

        if (fragmentMessages.length > 0) {
          elements.push(
            <Box
              key={`fragment-${fragment.id}`}
              ref={(el) => (fragmentRefs.current[fragment.id] = el)}
              sx={{
                borderLeft: `4px solid ${fragment.Color}`,
                pl: 2,
                my: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: "#708499", mb: 1 }}>
                Фрагмент {fragment.id}
              </Typography>
              {fragmentMessages.map((msg, index) => {
                const prevMsg = fragmentMessages[index - 1];
                const nextMsg = fragmentMessages[index + 1];

                const timeDiff = prevMsg
                  ? new Date(msg.timestamp) - new Date(prevMsg.timestamp)
                  : 0;
                const isFirst =
                  !prevMsg ||
                  prevMsg.sender_id !== msg.sender_id ||
                  timeDiff > MESSAGE_GAP;
                const isLast =
                  !nextMsg ||
                  nextMsg.sender_id !== msg.sender_id ||
                  new Date(nextMsg.timestamp) - new Date(msg.timestamp) >
                    MESSAGE_GAP;
                const isManager = msg.type === "manager";

                const isOrderMessage = msg.text.includes(
                  "(пользователь совершил заказ)"
                );
                const order = isOrderMessage
                  ? orders.find((o) => o.fragment_link?.includes(fragment.id))
                  : null;

                return (
                  <Box
                    key={`msg-${msg.id || msg.timestamp}-${index}`}
                    sx={{
                      display: "flex",
                      justifyContent: isManager ? "flex-end" : "flex-start",
                      mb: isLast ? 1.5 : 0.5,
                      alignItems: "flex-end",
                      animation: msg.isNew ? "fadeIn 0.5s ease-in" : "none",
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(10px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {!isManager && isFirst && (
                      <Avatar
                        sx={{
                          bgcolor: "#40C4FF",
                          mr: 1,
                          width: 36,
                          height: 36,
                        }}
                      >
                        <PersonIcon fontSize="small" sx={{ color: "#FFF" }} />
                      </Avatar>
                    )}
                    {!isManager && !isFirst && (
                      <Box sx={{ width: 36, mr: 1 }} />
                    )}

                    <Paper
                      sx={{
                        bgcolor: msg.deleted
                          ? "#F0F0F0"
                          : isOrderMessage
                          ? "#FFF8E1"
                          : isManager
                          ? "#E1F5FE"
                          : "#F4F4F5",
                        color: "#17212B",
                        borderRadius: 2,
                        p: 1.25,
                        maxWidth: "70%",
                        boxShadow: msg.deleted
                          ? "none"
                          : `0 1px 2px rgba(0,0,0,0.05), 0 0 0 2px ${fragment.Color}`,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {/* message content or edit mode */}
                        {editingMessageId === msg.id ? (
                          <Box sx={{ width: "100%" }}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              size="small"
                            />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mt: 1,
                              }}
                            >
                              <Button
                                startIcon={<SaveIcon />}
                                onClick={() => handleEditSave(msg.id)}
                                size="small"
                                variant="contained"
                              >
                                Сохранить
                              </Button>
                              <Button
                                startIcon={<CancelIcon />}
                                onClick={handleEditCancel}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                Отмена
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Tooltip title={isoTooltip(msg.timestamp)}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontSize: "0.95rem",
                                  lineHeight: 1.5,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {msg.text}
                              </Typography>
                            </Tooltip>
                          </>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 0.75,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="#708499">
                            {msg.edited && msg.updated_at ? (
                              <>edited {formatTimestamp(msg.updated_at)}</>
                            ) : (
                              formatTimestamp(msg.timestamp)
                            )}
                          </Typography>
                        </Box>

                        {/* read receipts + actions for manager messages */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {isManager && (
                            <Tooltip
                              title={
                                msg.read_status
                                  ? `Прочитано: ${isoTooltip(msg.read_at)}`
                                  : "Не прочитано"
                              }
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {msg.read_status ? (
                                  <DoneAllIcon
                                    fontSize="small"
                                    sx={{ color: "#1E88E5" }}
                                    aria-label="прочитано"
                                  />
                                ) : (
                                  <DoneIcon
                                    fontSize="small"
                                    sx={{ color: "#9E9E9E" }}
                                    aria-label="не прочитано"
                                  />
                                )}
                              </Box>
                            </Tooltip>
                          )}

                          {/* actions only for manager's own messages */}
                          {isManager &&
                            msg.sender_id === adminSenderId &&
                            !msg.deleted && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditStart(msg)}
                                  aria-label="редактировать"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteMessageRequest(msg)
                                  }
                                  aria-label="удалить"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                        </Box>
                      </Box>
                    </Paper>

                    {isManager && isFirst && (
                      <Avatar
                        sx={{
                          bgcolor: "#40C4FF",
                          ml: 1,
                          width: 36,
                          height: 36,
                        }}
                      >
                        <SupportAgentIcon
                          fontSize="small"
                          sx={{ color: "#FFF" }}
                        />
                      </Avatar>
                    )}
                    {isManager && !isFirst && <Box sx={{ width: 36, ml: 1 }} />}
                  </Box>
                );
              })}
            </Box>
          );
        }
      });

      // ungrouped messages (same logic)
      const ungroupedMessages = sortedMessages.filter(
        (msg) =>
          !fragments.some((fragment) =>
            fragment.Messages.some(
              (fm) =>
                fm.id === msg.id ||
                (fm.text === msg.text && fm.timestamp === msg.timestamp)
            )
          )
      );

      ungroupedMessages.forEach((msg, index) => {
        const prevMsg = ungroupedMessages[index - 1];
        const nextMsg = ungroupedMessages[index + 1];

        const timeDiff = prevMsg
          ? new Date(msg.timestamp) - new Date(prevMsg.timestamp)
          : 0;
        const isFirst =
          !prevMsg ||
          prevMsg.sender_id !== msg.sender_id ||
          timeDiff > MESSAGE_GAP;
        const isLast =
          !nextMsg ||
          nextMsg.sender_id !== msg.sender_id ||
          new Date(nextMsg.timestamp) - new Date(msg.timestamp) > MESSAGE_GAP;
        const isManager = msg.type === "manager";

        const isOrderMessage = msg.text.includes(
          "(пользователь совершил заказ)"
        );
        const order = isOrderMessage
          ? orders.find((o) => o.created_at === msg.timestamp)
          : null;

        elements.push(
          <Box
            key={`msg-${msg.id || msg.timestamp}-${index}`}
            sx={{
              display: "flex",
              justifyContent: isManager ? "flex-end" : "flex-start",
              mb: isLast ? 1.5 : 0.5,
              alignItems: "flex-end",
              animation: msg.isNew ? "fadeIn 0.5s ease-in" : "none",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {!isManager && isFirst && (
              <Avatar sx={{ bgcolor: "#40C4FF", mr: 1, width: 36, height: 36 }}>
                <PersonIcon fontSize="small" sx={{ color: "#FFF" }} />
              </Avatar>
            )}
            {!isManager && !isFirst && <Box sx={{ width: 36, mr: 1 }} />}

            <Paper
              sx={{
                bgcolor: msg.deleted
                  ? "#F0F0F0"
                  : isOrderMessage
                  ? "#FFF8E1"
                  : isManager
                  ? "#E1F5FE"
                  : "#F4F4F5",
                color: "#17212B",
                borderRadius: 2,
                p: 1.25,
                maxWidth: "70%",
                boxShadow: msg.deleted ? "none" : "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {editingMessageId === msg.id ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    size="small"
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={() => handleEditSave(msg.id)}
                      size="small"
                      variant="contained"
                    >
                      Сохранить
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleEditCancel}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Отмена
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Tooltip title={isoTooltip(msg.timestamp)}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "0.95rem",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {isOrderMessage && order?.fragment_link ? (
                        <a
                          href={order.fragment_link}
                          style={{
                            color: "#40C4FF",
                            textDecoration: "underline",
                          }}
                        >
                          {msg.text}
                        </a>
                      ) : (
                        msg.text
                      )}
                    </Typography>
                  </Tooltip>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.75,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="#708499">
                        {msg.edited && msg.updated_at ? (
                          <>edited {formatTimestamp(msg.updated_at)}</>
                        ) : (
                          formatTimestamp(msg.timestamp)
                        )}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {isManager && (
                        <Tooltip
                          title={
                            msg.read_status
                              ? `Прочитано: ${isoTooltip(msg.read_at)}`
                              : "Не прочитано"
                          }
                        >
                          {msg.read_status ? (
                            <DoneAllIcon
                              fontSize="small"
                              sx={{ color: "#1E88E5" }}
                            />
                          ) : (
                            <DoneIcon
                              fontSize="small"
                              sx={{ color: "#9E9E9E" }}
                            />
                          )}
                        </Tooltip>
                      )}

                      {isManager &&
                        msg.sender_id === adminSenderId &&
                        !msg.deleted && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleEditStart(msg)}
                              aria-label="редактировать"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMessageRequest(msg)}
                              aria-label="удалить"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                    </Box>
                  </Box>
                </>
              )}
            </Paper>

            {isManager && isFirst && (
              <Avatar sx={{ bgcolor: "#40C4FF", ml: 1, width: 36, height: 36 }}>
                <SupportAgentIcon fontSize="small" sx={{ color: "#FFF" }} />
              </Avatar>
            )}
            {isManager && !isFirst && <Box sx={{ width: 36, ml: 1 }} />}
          </Box>
        );
      });
    }

    return <Box sx={{ p: 2 }}>{elements}</Box>;
  }, [
    messages,
    fragments,
    orders,
    adminSenderId,
    editingMessageId,
    editingText,
  ]);

  // --- message delete confirmation dialog (single message) ---
  const MsgDeleteDialog = () => (
    <Dialog
      open={!!openMsgDeleteDialog}
      onClose={() => setOpenMsgDeleteDialog(null)}
    >
      <DialogTitle>Удалить сообщение?</DialogTitle>
      <DialogActions>
        <Button onClick={() => setOpenMsgDeleteDialog(null)}>Отмена</Button>
        <Button
          onClick={() => {
            handleDeleteMessageConfirm(openMsgDeleteDialog);
          }}
          color="error"
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );

  // --- chat delete dialog remains as in your original code ---
  const handleDeleteChat = async (chatIdToDelete) => {
    try {
      await api.delete(`/chat/${chatIdToDelete}`);
      setChatRooms((prev) => prev.filter((room) => room.id !== chatIdToDelete));
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[chatIdToDelete];
        return newCounts;
      });
      if (chatIdToDelete === selectedChatId) {
        setSelectedChatId(null);
        setChatId("");
        setMessages([]);
        setFragments([]);
        processedMessages.current.clear();
        navigate("/admin/admin_chat");
      }
    } catch (err) {
      setError("Не удалось удалить чат: " + err.message);
    }
    setOpenDeleteDialog(null);
  };

  // --- useEffect: scroll when messages update ---
  useEffect(() => {
    // scrollToBottom();
  }, [messages]);

  // --- UI render ---
  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        p: 0,
        fontFamily: "Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", sm: SIDEBAR_WIDTH },
          bgcolor: "#F4F4F5",
          borderRight: { sm: "1px solid #E8ECEF" },
          display: { xs: selectedChatId ? "none" : "flex", sm: "flex" },
          flexDirection: "column",
          height: { xs: "100%", sm: "100vh" },
          overflowY: "auto",
        }}
      >
        <Box
          sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: "#17212B",
              fontSize: "1.25rem",
              mb: 2,
            }}
          >
            Поддержка
          </Typography>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск чатов..."
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#708499" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                "& .Mui-focused fieldset": { borderColor: "#40C4FF" },
              },
              "& .MuiInputBase-input": { fontSize: "0.95rem" },
            }}
          />

          <FixedSizeList
            height={window.innerHeight - 120}
            width="100%"
            itemCount={
              chatRooms.filter((room) => {
                const last = room.messages?.slice(-1)[0]?.message || "";
                return (
                  room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  last.toLowerCase().includes(searchQuery.toLowerCase())
                );
              }).length
            }
            itemSize={70}
          >
            {({ index, style }) => {
              const filtered = chatRooms.filter((room) => {
                const last = room.messages?.slice(-1)[0]?.message || "";
                return (
                  room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  last.toLowerCase().includes(searchQuery.toLowerCase())
                );
              });
              const room = filtered[index];
              if (!room) return null;
              const lastMessage = room?.messages?.slice(-1)[0];
              return (
                <ListItem
                  key={room.id}
                  button
                  onClick={() => handleChatSelect(room.id)}
                  style={style}
                  sx={{
                    bgcolor:
                      selectedChatId === room.id ? "#E1F5FE" : "transparent",
                    "&:hover": { bgcolor: "#E8ECEF" },
                    py: 1,
                    px: 2,
                    borderBottom: "1px solid #E8ECEF",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={room.unread_count || 0}
                      sx={{
                        "& .MuiBadge-badge": {
                          bgcolor: "#40C4FF",
                          color: "#FFF",
                          fontSize: "0.7rem",
                          minWidth: "18px",
                          height: "18px",
                        },
                      }}
                    >
                      <Avatar
                        sx={{ bgcolor: "#40C4FF", width: 36, height: 36 }}
                      >
                        <SupportAgentIcon
                          fontSize="small"
                          sx={{ color: "#FFF" }}
                        />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: unreadCounts[room.id] ? 600 : 400,
                          color: "#17212B",
                          fontSize: "0.95rem",
                        }}
                      >
                        {room.id.split("-")[0]}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {lastMessage ? (
                          <Typography
                            variant="caption"
                            color="#708499"
                            noWrap
                            sx={{
                              maxWidth: { xs: 140, sm: 180 },
                              fontSize: "0.85rem",
                            }}
                          >
                            {(
                              lastMessage.message ||
                              lastMessage.text ||
                              "Сообщение отсутствует"
                            ).slice(0, 20) +
                              ((lastMessage.message || lastMessage.text || "")
                                .length > 20
                                ? "..."
                                : "")}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="#708499">
                            Нет сообщений
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            }}
          </FixedSizeList>
        </Box>
      </Box>

      {/* Chat panel */}
      <Box
        sx={{
          flexGrow: 1,
          display: { xs: selectedChatId ? "flex" : "none", sm: "flex" },
          flexDirection: "column",
          width: { xs: "100%", sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          bgcolor: "#FFFFFF",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            p: 1.5,
            borderBottom: "1px solid #E8ECEF",
            display: "flex",
            alignItems: "center",
            zIndex: 1200,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              color: "#17212B",
              fontSize: "1.1rem",
            }}
          >
            {selectedChatId
              ? `Чат ${selectedChatId.split("-")[0]}`
              : "Выберите чат"}
          </Typography>
          {selectedChatId && (
            <>
              <Typography
                variant="body2"
                color="#708499"
                sx={{ mr: 2, fontSize: "0.9rem" }}
              >
                {messages.length} сообщений
              </Typography>

              <Button
                onClick={handleCloseChat}
                sx={{ color: "#F44336", fontSize: "0.9rem" }}
              >
                Закрыть
              </Button>
              <Button
                onClick={() => setOpenDeleteDialog(selectedChatId)}
                sx={{ color: "#F44336", mr: 1 }}
              >
                удалить чат
                <DeleteIcon fontSize="small" />
              </Button>
            </>
          )}
        </Box>

        <Dialog
          open={!!openDeleteDialog}
          onClose={() => setOpenDeleteDialog(null)}
        >
          <DialogTitle>
            Удалить чат {openDeleteDialog?.split("-")[0]}?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(null)}>Отмена</Button>
            <Button
              onClick={() => handleDeleteChat(openDeleteDialog)}
              color="error"
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>

        {error && (
          <Box sx={{ p: 2, bgcolor: "#FFEBEE" }}>
            <Typography
              variant="body2"
              color="#F44336"
              sx={{ fontSize: "0.95rem" }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            position: "relative",
            maxHeight: { xs: "calc(100vh - 180px)", sm: "calc(100vh - 140px)" },
            WebkitOverflowScrolling: "touch",
            p: 2,
            bgcolor: "#FFFFFF",
          }}
        >
          {isLoadingHistory ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress sx={{ color: "#40C4FF" }} />
            </Box>
          ) : selectedChatId ? (
            groupedMessages
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                color="#708499"
                sx={{ fontSize: "1.25rem" }}
              >
                Выберите чат для общения
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {selectedChatId && (
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              p: 1.5,
              borderTop: "1px solid #E8ECEF",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Напишите сообщение..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#F4F4F5",
                  "&.Mui-focused fieldset": { borderColor: "#40C4FF" },
                },
                "& .MuiInputBase-input": {
                  padding: "10px 12px",
                  fontSize: "0.95rem",
                },
              }}
              disabled={!selectedChatId || !isConnected || !isAdminLoaded}
            />
            <Button
              onClick={handleSend}
              variant="contained"
              sx={{
                ml: 1,
                borderRadius: "8px",
                bgcolor: "#40C4FF",
                "&:hover": { bgcolor: "#33B7F0" },
                px: 2,
                py: 1,
                minWidth: "40px",
              }}
              disabled={
                !selectedChatId ||
                !isConnected ||
                !isAdminLoaded ||
                !input.trim()
              }
            >
              <SendIcon sx={{ color: "#FFF", fontSize: "24px" }} />
            </Button>
          </Box>
        )}
      </Box>

      {/* message delete dialog */}
      <MsgDeleteDialog />
    </Container>
  );
}
