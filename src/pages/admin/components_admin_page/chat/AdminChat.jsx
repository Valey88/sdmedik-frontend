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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../../configs/axiosConfig";
import { supportChat } from "@/constants/constants";
import useUserStore from "../../../../store/userStore";
import { FixedSizeList } from "react-window";
import { useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH = 360;
const MESSAGE_GAP = 5 * 60 * 1000; // 5 минут в миллисекундах

export default function AdminChat() {
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const fragmentRefs = useRef({});
  const chatContainerRef = useRef(null);
  const processedMessages = useRef(new Set());
  const { getUserInfo, user } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Проверка валидности JSON
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  // Загрузка заказов
  const fetchOrders = async () => {
    try {
      const response = await api.get(`/order`);
      setOrders(response.data);
    } catch (error) {
      setError("Не удалось загрузить данные заказов.");
    }
  };

  // Загрузка списка чатов
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

  // Загрузка фрагментов чата
  const fetchFragments = async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}/fragments`);
      console.log("Fragments API response:", response.data);
      const fragmentsData = response.data || [];
      const formattedFragments = fragmentsData.map((fragment) => ({
        id: fragment.id,
        Color: fragment.color,
        Messages: fragment.messages.map((msg) => {
          const text = msg.message || msg.text || "Сообщение отсутствует";
          console.log("Fragment message:", {
            id: msg.id,
            text,
            sender_id: msg.sender_id,
          });
          return {
            id: msg.id,
            text,
            timestamp: msg.time_to_send || new Date().toISOString(),
            sender_id: msg.sender_id,
          };
        }),
      }));
      setFragments(formattedFragments);

      const newMessages = formattedFragments.flatMap((fragment) =>
        fragment.Messages.filter(
          (msg) =>
            !processedMessages.current.has(`${chatId}-${msg.id}`) &&
            !messages.some(
              (m) =>
                m.id === msg.id ||
                (m.text === msg.text && m.timestamp === msg.time_to_send)
            )
        ).map((msg) => {
          const messageKey = `${chatId}-${msg.id}`;
          processedMessages.current.add(messageKey);
          return {
            id: msg.id,
            type:
              adminSenderId && msg.sender_id === adminSenderId
                ? "manager"
                : "user",
            text: msg.text,
            timestamp: msg.time_to_send || new Date().toISOString(),
            sender_id: msg.sender_id,
            isNew: true,
          };
        })
      );
      console.log("New messages from fragments:", newMessages);
      setMessages((prev) => [...prev, ...newMessages]);

      if (chatId && adminSenderId) {
        newMessages
          .filter((msg) => msg.type === "user" && msg.id)
          .forEach((msg) => markAsRead(msg.id, adminSenderId));
      }
    } catch (err) {
      setError("Не удалось загрузить фрагменты чата: " + err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Получение ID администратора
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

  // Отправка события присоединения к чату
  const sendJoinEvent = (chatId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      setIsLoadingHistory(false);
      return;
    }
    ws.current.send(
      JSON.stringify({ event: "admin-join", data: { chat_id: chatId } })
    );
  };

  // Отметка сообщения как прочитанного
  const markAsRead = (messageId, userId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      return;
    }
    if (!messageId || !userId) return;
    const eventData = {
      event: "mark-as-read",
      data: { message_id: messageId, user_id: userId },
    };
    ws.current.send(JSON.stringify(eventData));
  };

  // Удаление чата
  const handleDeleteChat = async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      setChatRooms((prev) => prev.filter((room) => room.id !== chatId));
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[chatId];
        return newCounts;
      });
      if (chatId === selectedChatId) {
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

  // Обновление типов сообщений после загрузки adminSenderId
  const updateMessageTypes = () => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        type:
          adminSenderId && msg.sender_id === adminSenderId ? "manager" : "user",
      }))
    );
  };

  // Обработка сообщений WebSocket
  const handleWebSocketMessage = (event) => {
    console.log("WebSocket message received:", event.data);
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

      // Обработка фрагментов
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
            console.log("Fragment message:", {
              id: msg.id,
              text,
              sender_id: msg.sender_id,
            });
            return {
              id: msg.id,
              text,
              timestamp: msg.time_to_send || new Date().toISOString(),
              sender_id: msg.sender_id,
            };
          }),
        }));
        setFragments(formattedFragments);

        const newMessages = formattedFragments.flatMap((fragment) =>
          fragment.Messages.filter(
            (msg) =>
              !processedMessages.current.has(`${selectedChatId}-${msg.id}`) &&
              !messages.some(
                (m) =>
                  m.id === msg.id ||
                  (m.text === msg.text && m.timestamp === msg.time_to_send)
              )
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
              timestamp: msg.time_to_send || new Date().toISOString(),
              sender_id: msg.sender_id,
              isNew: true,
            };
          })
        );
        console.log("New messages from WebSocket fragments:", newMessages);
        setMessages((prev) => [...prev, ...newMessages]);

        if (selectedChatId && adminSenderId) {
          newMessages
            .filter((msg) => msg.type === "user" && msg.id)
            .forEach((msg) => markAsRead(msg.id, adminSenderId));
        }
        setIsLoadingHistory(false);
        return;
      }

      // Обработка событий WebSocket
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
        if (Notification.permission === "granted") {
          new Notification("Новый чат", {
            body: `Создан новый чат: ${newChat.id.split("-")[0]}`,
          });
        }
      } else if (messageData.event === "message-event") {
        const { chat_id, message, sender_id, time_to_send, id, read_status } =
          messageData.data;
        const messageKey = `${chat_id}-${id || message}-${time_to_send}`;
        if (processedMessages.current.has(messageKey)) return;
        processedMessages.current.add(messageKey);

        const messageType =
          adminSenderId && sender_id === adminSenderId ? "manager" : "user";
        const text = message || "Сообщение отсутствует";

        console.log("New WebSocket message:", {
          chat_id,
          id,
          text,
          sender_id,
          messageType,
        });

        if (chat_id === selectedChatId) {
          setMessages((prev) => [
            ...prev,
            {
              id,
              type: messageType,
              text,
              timestamp: time_to_send || new Date().toISOString(),
              sender_id,
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
          if (Notification.permission === "granted") {
            new Notification("Новое сообщение", {
              body: `Сообщение в чате ${chat_id.split("-")[0]}: ${text.slice(
                0,
                50
              )}`,
            });
          }
        }
      } else if (messageData.event === "mark-as-read") {
        const { chat_id } = messageData.data;
        setUnreadCounts((prev) => ({ ...prev, [chat_id]: 0 }));
        setChatRooms((prev) =>
          prev.map((room) =>
            room.id === chat_id ? { ...room, unreadCount: 0 } : room
          )
        );
      } else if (Array.isArray(messageData)) {
        const formattedMessages = messageData
          .filter(
            (msg) =>
              !processedMessages.current.has(`${selectedChatId}-${msg.id}`) &&
              !messages.some(
                (m) =>
                  m.id === msg.id ||
                  (m.text === msg.message && m.timestamp === msg.time_to_send)
              )
          )
          .map((msg) => {
            const text = msg.message || msg.text || "Сообщение отсутствует";
            const messageKey = `${selectedChatId}-${msg.id}`;
            processedMessages.current.add(messageKey);
            console.log("History message:", {
              id: msg.id,
              text,
              sender_id: msg.sender_id,
            });
            return {
              id: msg.id,
              type:
                adminSenderId && msg.sender_id === adminSenderId
                  ? "manager"
                  : "user",
              text,
              timestamp: msg.time_to_send || new Date().toISOString(),
              sender_id: msg.sender_id,
            };
          });
        console.log("New messages from history:", formattedMessages);
        setMessages((prev) => [...prev, ...formattedMessages]);
        if (selectedChatId && adminSenderId) {
          formattedMessages
            .filter((msg) => msg.type === "user" && msg.id && !msg.read_status)
            .forEach((msg) => markAsRead(msg.id, adminSenderId));
        }
        setIsLoadingHistory(false);
      }
    } catch (err) {
      setError("Ошибка обработки сообщения от сервера: " + err.message);
      setIsLoadingHistory(false);
    }
  };

  // Инициализация WebSocket и загрузка данных
  useEffect(() => {
    fetchAdminSenderId();
    fetchChatRooms();
    fetchOrders();

    // Закрываем предыдущее соединение, если оно существует
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    ws.current = new WebSocket(supportChat);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError("");
      if (chatId && isAdminLoaded) sendJoinEvent(chatId);
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
        ws.current = new WebSocket(supportChat);
        ws.current.onopen = () => {
          setIsConnected(true);
          setError("");
          if (chatId && isAdminLoaded) sendJoinEvent(chatId);
        };
        ws.current.onmessage = handleWebSocketMessage;
        ws.current.onerror = ws.current.onclose;
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
  }, [chatId, isAdminLoaded]);

  // Обработка URL-параметров для выбора чата и прокрутки к фрагменту
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

    // Прокрутка только к фрагменту внутри контейнера чата
    if (
      chatContainerRef.current &&
      !isLoadingHistory &&
      fragmentId &&
      fragmentRefs.current[fragmentId]
    ) {
      setTimeout(() => {
        const fragmentElement = fragmentRefs.current[fragmentId];
        fragmentElement.scrollIntoView({ behavior: "smooth" });
        // Корректировка скролла контейнера чата
        const container = chatContainerRef.current;
        const offset = fragmentElement.offsetTop - container.offsetTop;
        container.scrollTop = offset;
      }, 100);
    }
  }, [
    location.search,
    isLoadingHistory,
    fragments,
    isConnected,
    isAdminLoaded,
  ]);

  // Обновление типов сообщений после загрузки adminSenderId
  useEffect(() => {
    if (isAdminLoaded && adminSenderId && messages.length > 0) {
      updateMessageTypes();
    }
  }, [isAdminLoaded, adminSenderId]);

  // Выбор чата
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

  // Закрытие чата
  const handleCloseChat = () => {
    setSelectedChatId(null);
    setChatId("");
    setMessages([]);
    setFragments([]);
    processedMessages.current.clear();
    navigate("/admin/admin_chat");
  };

  // Отправка сообщения
  const handleSend = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      return;
    }
    if (input.trim() && chatId && isAdminLoaded) {
      const messageEvent = {
        event: "message-event",
        data: {
          message: input.trim(),
          chat_id: chatId,
          sender_id: adminSenderId || "admin",
        },
      };
      ws.current.send(JSON.stringify(messageEvent));
      const messageKey = `${chatId}-${input.trim()}-${new Date().toISOString()}`;
      processedMessages.current.add(messageKey);
      setMessages((prev) => [
        ...prev,
        {
          type: "manager",
          text: input.trim(),
          timestamp: new Date().toISOString(),
          sender_id: adminSenderId || "admin",
          isNew: true,
        },
      ]);
      setInput("");
    }
  };

  // Компонент для рендеринга чата в списке
  const ChatRoomRow = ({ index, style }) => {
    const filteredRooms = chatRooms.filter(
      (r) =>
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.messages
          ?.slice(-1)[0]
          ?.message.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    const room = filteredRooms[index];
    const lastMessage = room?.messages?.slice(-1)[0];

    return (
      <ListItem
        key={room.id}
        button
        onClick={() => handleChatSelect(room.id)}
        style={style}
        sx={{
          bgcolor: selectedChatId === room.id ? "#E1F5FE" : "transparent",
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
            <Avatar sx={{ bgcolor: "#40C4FF", width: 36, height: 36 }}>
              <SupportAgentIcon fontSize="small" sx={{ color: "#FFF" }} />
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
                  sx={{ maxWidth: { xs: 140, sm: 180 }, fontSize: "0.85rem" }}
                >
                  {(
                    lastMessage.message ||
                    lastMessage.text ||
                    "Сообщение отсутствует"
                  ).slice(0, 20) +
                    ((lastMessage.message || lastMessage.text || "").length > 20
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
  };

  // Рендеринг сообщений без разделителей дат
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
                        bgcolor: isOrderMessage
                          ? "#FFF8E1"
                          : isManager
                          ? "#E1F5FE"
                          : "#F4F4F5",
                        color: "#17212B",
                        borderRadius: 2,
                        p: 1.5,
                        maxWidth: "70%",
                        boxShadow: `0 1px 2px rgba(0,0,0,0.1), 0 0 0 2px ${fragment.Color}`,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontSize: "0.95rem", lineHeight: 1.5 }}
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
                bgcolor: isOrderMessage
                  ? "#FFF8E1"
                  : isManager
                  ? "#E1F5FE"
                  : "#F4F4F5",
                color: "#17212B",
                borderRadius: 2,
                p: 1.5,
                maxWidth: "70%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontSize: "0.95rem", lineHeight: 1.5 }}
              >
                {isOrderMessage && order?.fragment_link ? (
                  <a
                    href={order.fragment_link}
                    style={{ color: "#40C4FF", textDecoration: "underline" }}
                  >
                    {msg.text}
                  </a>
                ) : (
                  msg.text
                )}
              </Typography>
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
  }, [messages, fragments, orders]);

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
              chatRooms.filter(
                (room) =>
                  room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  room.messages
                    ?.slice(-1)[0]
                    ?.message.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              ).length
            }
            itemSize={70}
          >
            {ChatRoomRow}
          </FixedSizeList>
        </Box>
      </Box>

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
              disabled={!chatId || !isConnected || !isAdminLoaded}
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
              disabled={!chatId || !isConnected || !isAdminLoaded}
            >
              <SendIcon sx={{ color: "#FFF", fontSize: "24px" }} />
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}