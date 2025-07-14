import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../../../configs/axiosConfig";
import { supportChat } from "@/constants/constants";
import useUserStore from "../../../../store/userStore";
import { FixedSizeList } from "react-window";
import { useLocation } from "react-router-dom";

const SIDEBAR_WIDTH = 260;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [adminSenderId, setAdminSenderId] = useState(null);
  const [fragments, setFragments] = useState([]);
  const [orders, setOrders] = useState([]);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const fragmentRefs = useRef({});
  const processedMessages = useRef(new Set());
  const { getUserInfo, user } = useUserStore();
  const location = useLocation();

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
      const response = await api.get(`${url}/order`);
      setOrders(response.data);
      console.log("Orders:", response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Не удалось загрузить данные заказов.");
    }
  };

  // Прокрутка к фрагменту из URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const fragmentId = queryParams.get("fragment");
    if (fragmentId && fragmentRefs.current[fragmentId]) {
      fragmentRefs.current[fragmentId].scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChatId, fragments]);

  const fetchAdminSenderId = async () => {
    try {
      await getUserInfo();
      if (user?.data?.id) {
        setAdminSenderId(user.data.id);
        console.log("Admin Sender ID:", user.data.id);
      } else {
        throw new Error("Пользователь не найден");
      }
    } catch (err) {
      console.error("Ошибка при загрузке sender_id администратора:", err);
      setError("Не удалось загрузить данные администратора.");
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
      console.log("Chat Rooms:", rooms);
    } catch (err) {
      console.error("Ошибка при загрузке чатов:", err);
      setError("Не удалось загрузить список чатов.");
    }
  };

  const fetchFragments = async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}/fragments`);
      const fragmentsData = response.data || [];
      const formattedFragments = fragmentsData.map((fragment) => ({
        id: fragment.id,
        Color: fragment.color,
        Messages: fragment.messages.map((msg) => ({
          id: msg.id,
          text: msg.message,
          timestamp: msg.time_to_send,
          sender_id: msg.sender_id,
        })),
      }));
      setFragments(formattedFragments);
      console.log("Fragments:", formattedFragments);
    } catch (err) {
      console.error("Ошибка при загрузке фрагментов:", err);
      setError("Не удалось загрузить фрагменты чата.");
    }
  };

  const sendJoinEvent = (chatId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      setIsLoadingHistory(false);
      console.error("WebSocket не открыт для join:", ws.current?.readyState);
      return;
    }
    ws.current.send(
      JSON.stringify({ event: "admin-join", data: { chat_id: chatId } })
    );
    console.log("Отправлено событие admin-join:", { chat_id: chatId });
  };

  const markAsRead = (messageId, userId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      console.error(
        "WebSocket не открыт для mark-as-read:",
        ws.current?.readyState
      );
      return;
    }
    if (!messageId || !userId) {
      console.error("Отсутствует messageId или userId:", { messageId, userId });
      return;
    }
    const eventData = {
      event: "mark-as-read",
      data: {
        message_id: messageId,
        user_id: userId,
      },
    };
    ws.current.send(JSON.stringify(eventData));
    console.log("Отправлено событие mark-as-read:", eventData);
  };

  const handleWebSocketMessage = (event) => {
    if (!isValidJSON(event.data)) {
      const messageKey = `${event.data}-${new Date().toISOString()}`;
      if (processedMessages.current.has(messageKey)) return;
      processedMessages.current.add(messageKey);
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          text: event.data,
          timestamp: new Date().toISOString(),
          sender_id: "unknown",
          isNew: true,
        },
      ]);
      console.log("Получено не-JSON сообщение:", event.data);
      return;
    }

    try {
      const messageData = JSON.parse(event.data);
      console.log("Получено сообщение:", messageData);

      // Обработка фрагментов
      if (
        Array.isArray(messageData) &&
        messageData[0]?.id &&
        messageData[0]?.color
      ) {
        const formattedFragments = messageData.map((fragment) => ({
          id: fragment.id,
          Color: fragment.color,
          Messages: fragment.messages.map((msg) => ({
            id: msg.id,
            text: msg.message,
            timestamp: msg.time_to_send,
            sender_id: msg.sender_id,
          })),
        }));
        setFragments(formattedFragments);
        console.log("Fragments:", formattedFragments);

        const newMessages = messageData.flatMap((fragment) =>
          fragment.messages
            .filter(
              (msg) =>
                !messages.some(
                  (m) =>
                    m.id === msg.id ||
                    (m.text === msg.message && m.timestamp === msg.time_to_send)
                )
            )
            .map((msg) => ({
              id: msg.id,
              type:
                adminSenderId && msg.sender_id === adminSenderId
                  ? "manager"
                  : "user",
              text: msg.message || "Пустое сообщение",
              timestamp: msg.time_to_send || new Date().toISOString(),
              sender_id: msg.sender_id,
              isNew: true,
            }))
        );
        setMessages((prev) => [...prev, ...newMessages]);
        console.log("Messages:", [...messages, ...newMessages]);

        // Отметка непрочитанных сообщений пользователя как прочитанных
        if (selectedChatId && adminSenderId) {
          const userMessages = newMessages.filter(
            (msg) => msg.type === "user" && msg.id
          );
          console.log(
            "Непрочитанные сообщения пользователя в фрагментах:",
            userMessages
          );
          userMessages.forEach((msg) => {
            markAsRead(msg.id, adminSenderId);
          });
        } else {
          console.warn("selectedChatId или adminSenderId не определены:", {
            selectedChatId,
            adminSenderId,
          });
        }
        setIsLoadingHistory(false);
        return;
      }

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
        const messageKey = `${chat_id}-${message}-${time_to_send}`;
        if (processedMessages.current.has(messageKey)) return;
        processedMessages.current.add(messageKey);

        const messageType =
          adminSenderId && sender_id === adminSenderId ? "manager" : "user";

        if (chat_id === selectedChatId) {
          setMessages((prev) => [
            ...prev,
            {
              id,
              type: messageType,
              text: message || "Пустое сообщение",
              timestamp: time_to_send || new Date().toISOString(),
              sender_id,
              isNew: true,
            },
          ]);
          console.log("Messages:", [
            ...messages,
            {
              id,
              type: messageType,
              text: message,
              timestamp: time_to_send,
              sender_id,
            },
          ]);
          if (messageType === "user" && !read_status && id && adminSenderId) {
            markAsRead(id, adminSenderId);
            console.log(
              "Новое сообщение пользователя отмечено как прочитанное:",
              id
            );
          } else {
            console.log("Не отправлено mark-as-read:", {
              messageType,
              read_status,
              id,
              adminSenderId,
            });
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
                      { message, sender_id, time_to_send, chat_id },
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
              body: `Сообщение в чате ${chat_id.split("-")[0]}: ${message.slice(
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
        const formattedMessages = messageData.map((msg) => ({
          id: msg.id,
          type:
            adminSenderId && msg.sender_id === adminSenderId
              ? "manager"
              : "user",
          text: msg.message || "Пустое сообщение",
          timestamp: msg.time_to_send || new Date().toISOString(),
          sender_id: msg.sender_id,
        }));
        setMessages(formattedMessages);
        console.log("Messages:", formattedMessages);
        if (selectedChatId && adminSenderId) {
          const userMessages = messageData.filter(
            (msg) =>
              msg.id && msg.sender_id !== adminSenderId && !msg.read_status
          );
          console.log("Непрочитанные сообщения пользователя:", userMessages);
          userMessages.forEach((msg) => {
            markAsRead(msg.id, adminSenderId);
            console.log(
              "Отправлен ID сообщения пользователя для markAsRead:",
              msg.id
            );
          });
        } else {
          console.warn("selectedChatId или adminSenderId не определены:", {
            selectedChatId,
            adminSenderId,
          });
        }
        setIsLoadingHistory(false);
      }
    } catch (err) {
      console.error("Ошибка парсинга сообщения:", err, "Данные:", event.data);
      setError("Ошибка обработки сообщения от сервера.");
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAdminSenderId();
    fetchChatRooms();
    fetchOrders();

    ws.current = new WebSocket(supportChat);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError("");
      if (chatId) sendJoinEvent(chatId);
      console.log("WebSocket открыт");
    };

    ws.current.onmessage = handleWebSocketMessage;

    ws.current.onerror = () => {
      setError("Не удалось подключиться к чату. Проверьте соединение.");
      setIsConnected(false);
      setIsLoadingHistory(false);
      console.error("WebSocket ошибка");
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setError("Соединение с чатом разорвано.");
      setIsLoadingHistory(false);
      console.error("WebSocket закрыт");
    };

    if ("Notification" in window && window.Notification !== undefined) {
      Notification.requestPermission().catch((err) => {
        console.error("Ошибка запроса уведомлений:", err);
      });
    } else {
      console.warn("Уведомления не поддерживаются");
      setError("Уведомления не поддерживаются на вашем устройстве.");
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        ws.current = new WebSocket(supportChat);
        ws.current.onopen = () => {
          setIsConnected(true);
          setError("");
          if (chatId) sendJoinEvent(chatId);
          console.log("WebSocket переподключен");
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
      if (ws.current) ws.current.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chatId]);

  const handleSend = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      return;
    }
    if (input.trim() && chatId) {
      const messageEvent = {
        event: "message-event",
        data: {
          message: input.trim(),
          chat_id: chatId,
          sender_id: adminSenderId || "admin",
        },
      };
      ws.current.send(JSON.stringify(messageEvent));
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

  const handleChatSelect = (roomId) => {
    setSelectedChatId(roomId);
    setChatId(roomId);
    setMessages([]);
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
    setIsLoadingHistory(true);
    processedMessages.current.clear();
    fetchFragments(roomId);
    if (adminSenderId) {
      // Отметить все непрочитанные сообщения в выбранном чате
      messages.forEach((msg) => {
        if (msg.type === "user" && msg.id) {
          markAsRead(msg.id, adminSenderId);
        }
      });
    }
  };

  const handleCloseChat = () => {
    setSelectedChatId(null);
    setChatId("");
    setMessages([]);
    setFragments([]);
    processedMessages.current.clear();
  };

  const ChatRoomRow = ({ index, style }) => {
    const room = chatRooms.filter(
      (r) =>
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.messages
          ?.slice(-1)[0]
          ?.message.toLowerCase()
          .includes(searchQuery.toLowerCase())
    )[index];
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
                  sx={{ maxWidth: { xs: 120, sm: 160 }, fontSize: "0.85rem" }}
                >
                  {lastMessage.message.slice(0, 20) +
                    (lastMessage.message.length > 20 ? "..." : "")}
                </Typography>
              ) : (
                <Typography variant="caption" color="#708499">
                  Нет сообщений
                </Typography>
              )}
              {lastMessage?.time_to_send && (
                <Typography
                  variant="caption"
                  color="#708499"
                  sx={{ display: "block", fontSize: "0.8rem" }}
                >
                  {new Date(lastMessage.time_to_send).toLocaleString(
                    undefined,
                    { timeStyle: "short" }
                  )}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItem>
    );
  };

  const groupedMessages = useMemo(() => {
    const today = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

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
                const msgDateStr = new Date(msg.timestamp).toDateString();
                const prevMsg = fragmentMessages[index - 1];
                const nextMsg = fragmentMessages[index + 1];

                if (
                  !prevMsg ||
                  new Date(prevMsg.timestamp).toDateString() !== msgDateStr
                ) {
                  const dateLabel =
                    msgDateStr === today
                      ? "Сегодня"
                      : msgDateStr === yesterday
                      ? "Вчера"
                      : new Date(msg.timestamp).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                  elements.push(
                    <Typography
                      key={`date-${msg.timestamp}-${index}`}
                      variant="caption"
                      align="center"
                      sx={{ my: 2, color: "#708499" }}
                    >
                      {dateLabel}
                    </Typography>
                  );
                }

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
                    key={`container-${msg.timestamp}-${index}`}
                    sx={{
                      display: "flex",
                      justifyContent: isManager ? "flex-end" : "flex-start",
                      mb: isLast ? 1.5 : 0.5,
                      alignItems: "flex-end",
                      animation:
                        !/iPhone|iPad|iPod/.test(navigator.userAgent) &&
                        msg.isNew
                          ? "fadeIn 0.5s ease-in"
                          : "none",
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
                        borderTopLeftRadius: isFirst ? 16 : 6,
                        borderTopRightRadius: isFirst ? 16 : 6,
                        borderBottomLeftRadius: isLast ? 16 : 6,
                        borderBottomRightRadius: isLast ? 16 : 6,
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
                      {isLast && msg.timestamp && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            color: "#708499",
                            textAlign: isManager ? "right" : "left",
                            fontSize: "0.75rem",
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </Typography>
                      )}
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
        const msgDateStr = new Date(msg.timestamp).toDateString();
        const prevMsg = ungroupedMessages[index - 1];
        const nextMsg = ungroupedMessages[index + 1];

        if (
          !prevMsg ||
          new Date(prevMsg.timestamp).toDateString() !== msgDateStr
        ) {
          const dateLabel =
            msgDateStr === today
              ? "Сегодня"
              : msgDateStr === yesterday
              ? "Вчера"
              : new Date(msg.timestamp).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
          elements.push(
            <Typography
              key={`date-${msg.timestamp}-${index}`}
              variant="caption"
              align="center"
              sx={{ my: 2, color: "#708499" }}
            >
              {dateLabel}
            </Typography>
          );
        }

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
            key={`container-${msg.timestamp}-${index}`}
            sx={{
              display: "flex",
              justifyContent: isManager ? "flex-end" : "flex-start",
              mb: isLast ? 1.5 : 0.5,
              alignItems: "flex-end",
              animation:
                !/iPhone|iPad|iPod/.test(navigator.userAgent) && msg.isNew
                  ? "fadeIn 0.5s ease-in"
                  : "none",
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
                borderTopLeftRadius: isFirst ? 16 : 6,
                borderTopRightRadius: isFirst ? 16 : 6,
                borderBottomLeftRadius: isLast ? 16 : 6,
                borderBottomRightRadius: isLast ? 16 : 6,
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
              {isLast && msg.timestamp && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "#708499",
                    textAlign: isManager ? "right" : "left",
                    fontSize: "0.75rem",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </Typography>
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
    } else {
      sortedMessages.forEach((msg, index) => {
        const msgDateStr = new Date(msg.timestamp).toDateString();
        const prevMsg = sortedMessages[index - 1];
        const nextMsg = sortedMessages[index + 1];

        if (
          !prevMsg ||
          new Date(prevMsg.timestamp).toDateString() !== msgDateStr
        ) {
          const dateLabel =
            msgDateStr === today
              ? "Сегодня"
              : msgDateStr === yesterday
              ? "Вчера"
              : new Date(msg.timestamp).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
          elements.push(
            <Typography
              key={`date-${msg.timestamp}-${index}`}
              variant="caption"
              align="center"
              sx={{ my: 2, color: "#708499" }}
            >
              {dateLabel}
            </Typography>
          );
        }

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
            key={`container-${msg.timestamp}-${index}`}
            sx={{
              display: "flex",
              justifyContent: isManager ? "flex-end" : "flex-start",
              mb: isLast ? 1.5 : 0.5,
              alignItems: "flex-end",
              animation:
                !/iPhone|iPad|iPod/.test(navigator.userAgent) && msg.isNew
                  ? "fadeIn 0.5s ease-in"
                  : "none",
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
                borderTopLeftRadius: isFirst ? 16 : 6,
                borderTopRightRadius: isFirst ? 16 : 6,
                borderBottomLeftRadius: isLast ? 16 : 6,
                borderBottomRightRadius: isLast ? 16 : 6,
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
              {isLast && msg.timestamp && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "#708499",
                    textAlign: isManager ? "right" : "left",
                    fontSize: "0.75rem",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </Typography>
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
        position: "relative",
      }}
    >
      <Drawer
        variant={{ xs: "temporary", sm: "persistent" }}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{
          width: isSidebarOpen ? SIDEBAR_WIDTH : { xs: 0, sm: 56 },
          flexShrink: 0,
          zIndex: 1300,
          "& .MuiDrawer-paper": {
            width: isSidebarOpen ? SIDEBAR_WIDTH : { xs: 0, sm: 56 },
            bgcolor: "#F4F4F5",
            borderRight: "none",
            transition: "width 0.3s",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 2 },
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              sx={{ mr: 1 }}
            >
              <MenuIcon sx={{ color: "#40C4FF" }} />
            </IconButton>
            {isSidebarOpen && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: "#17212B",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                Поддержка
              </Typography>
            )}
          </Box>
          {isSidebarOpen && (
            <>
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
                    "&.Mui-focused fieldset": { borderColor: "#40C4FF" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  },
                }}
              />
              <FixedSizeList
                height={window.innerHeight - 120}
                width="100%"
                itemCount={
                  chatRooms.filter(
                    (room) =>
                      room.id
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
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
            </>
          )}
        </Box>
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: {
            xs: "100%",
            sm: `calc(100% - ${isSidebarOpen ? SIDEBAR_WIDTH : 56}px)`,
          },
          transition: "width 0.3s",
          bgcolor: "#FFFFFF",
          ml: { sm: isSidebarOpen ? 0 : "56px" },
        }}
      >
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            p: { xs: 1, sm: 1.5 },
            borderBottom: "1px solid #E8ECEF",
            display: "flex",
            alignItems: "center",
            zIndex: 1200,
          }}
        >
          <IconButton onClick={() => setIsSidebarOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon sx={{ color: "#40C4FF" }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              color: "#17212B",
              fontSize: { xs: "1rem", sm: "1.1rem" },
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
                sx={{ mr: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                {messages.length} сообщений
              </Typography>
              <IconButton onClick={handleCloseChat} sx={{ color: "#F44336" }}>
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>

        {error && (
          <Box sx={{ p: 2, bgcolor: "#FFEBEE" }}>
            <Typography
              variant="body2"
              color="#F44336"
              sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 120px)",
            WebkitOverflowScrolling: "touch",
            p: { xs: 1, sm: 2 },
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
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
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
              p: { xs: 1, sm: 1.5 },
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
                  padding: { xs: "8px 10px", sm: "10px 12px" },
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                },
              }}
              disabled={!chatId || !isConnected}
            />
            <Button
              onClick={handleSend}
              variant="contained"
              sx={{
                ml: 1,
                borderRadius: "8px",
                bgcolor: "#40C4FF",
                "&:hover": { bgcolor: "#33B7F0" },
                px: { xs: 1.5, sm: 2 },
                py: 1,
                minWidth: { xs: "36px", sm: "40px" },
              }}
              disabled={!chatId || !isConnected}
            >
              <SendIcon
                sx={{ color: "#FFF", fontSize: { xs: "20px", sm: "24px" } }}
              />
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
