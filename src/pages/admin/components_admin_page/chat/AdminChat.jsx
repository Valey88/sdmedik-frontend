import React, { useState, useEffect, useRef } from "react";
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

const WS_URL = "ws://sdmedik.ru/api/v1/api/v1/chat/conn/";
const POLL_INTERVAL_MS = 5000; // 5s polling
const SIDEBAR_WIDTH = 260;

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
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Загрузка списка чатов
  const fetchChatRooms = async () => {
    try {
      const response = await api.get("/chat");
      const rooms = response.data.data || [];
      console.log("Chat rooms fetched:", JSON.stringify(rooms, null, 2));
      rooms.sort((a, b) => {
        const aTime = a.messages?.slice(-1)[0]?.time_to_send || 0;
        const bTime = b.messages?.slice(-1)[0]?.time_to_send || 0;
        return new Date(bTime) - new Date(aTime);
      });
      setChatRooms(rooms);
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        rooms.forEach((room) => {
          if (room.id !== selectedChatId) {
            newCounts[room.id] = room.messages?.length || 0;
          }
        });
        return newCounts;
      });
    } catch (err) {
      console.error("Ошибка при загрузке чатов:", err);
      setError("Не удалось загрузить список чатов.");
    }
  };

  // Инициализация WebSocket
  useEffect(() => {
    fetchChatRooms();
    const pollInterval = setInterval(fetchChatRooms, POLL_INTERVAL_MS);

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket подключен");
      setIsConnected(true);
      setError("");
      if (chatId) {
        sendJoinEvent(chatId);
      }
    };

    ws.current.onmessage = (event) => {
      console.log("Received WebSocket message:", event.data);
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.event === "new-chat") {
          const newChat = messageData.data;
          console.log("New chat received:", newChat);
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
            [newChat.id]: newChat.messages?.length || 1,
          }));
          if (Notification.permission === "granted") {
            new Notification("Новый чат", {
              body: `Создан новый чат: ${newChat.id.split("-")[0]}`,
            });
          }
        } else if (messageData.event === "message-event") {
          const { chat_id, message, sender_id, time_to_send } =
            messageData.data;
          console.log("Message sender_id:", sender_id);
          if (chat_id === selectedChatId) {
            setMessages((prev) => [
              ...prev,
              {
                type: sender_id.includes("admin") ? "manager" : "user",
                text: message || "Пустое сообщение",
                timestamp: time_to_send || new Date().toISOString(),
                isNew: true,
              },
            ]);
            setTimeout(() => {
              setMessages((prev) =>
                prev.map((msg) => (msg.isNew ? { ...msg, isNew: false } : msg))
              );
            }, 1000);
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
                body: `Сообщение в чате ${
                  chat_id.split("-")[0]
                }: ${message.slice(0, 50)}`,
              });
            }
          }
        } else if (Array.isArray(messageData)) {
          const formattedMessages = messageData.map((msg) => {
            console.log("History message sender_id:", msg.sender_id);
            return {
              type: msg.sender_id.includes("admin") ? "manager" : "user",
              text: msg.message || "Пустое сообщение",
              timestamp: msg.time_to_send || new Date().toISOString(),
            };
          });
          setMessages(formattedMessages);
          setUnreadCounts((prev) => ({ ...prev, [selectedChatId]: 0 }));
          setIsLoadingHistory(false);
        } else if (messageData.event === "error") {
          setError(messageData.data || "Произошла ошибка на сервере.");
          setIsLoadingHistory(false);
        } else {
          console.warn("Unexpected message format:", messageData);
        }
      } catch (err) {
        console.error("Ошибка парсинга сообщения:", err, "Data:", event.data);
        if (chatId) {
          setMessages((prev) => [
            ...prev,
            {
              type: "user",
              text: event.data,
              timestamp: new Date().toISOString(),
            },
          ]);
          setUnreadCounts((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || 0) + 1,
          }));
        }
        setIsLoadingHistory(false);
      }
    };

    ws.current.onerror = (event) => {
      console.error("WebSocket ошибка:", event);
      setError("Не удалось подключиться к чату. Проверьте соединение.");
      setIsConnected(false);
      setIsLoadingHistory(false);
    };

    ws.current.onclose = () => {
      console.log("WebSocket закрыт");
      setIsConnected(false);
      setError("Соединение с чатом разорвано.");
      setIsLoadingHistory(false);
    };

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => {
      ws.current?.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Отправка admin-join при изменении chatId
  useEffect(() => {
    if (chatId && isConnected) {
      setIsLoadingHistory(true);
      sendJoinEvent(chatId);
    }
  }, [chatId, isConnected]);

  // Автоматическая прокрутка
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendJoinEvent = (chatId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("Нет соединения с сервером чата.");
      setIsLoadingHistory(false);
      return;
    }
    const joinEvent = {
      event: "admin-join",
      data: { chat_id: chatId },
    };
    console.log("Sending admin-join event:", joinEvent);
    ws.current.send(JSON.stringify(joinEvent));
  };

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
        },
      };
      console.log("Sending message-event:", messageEvent);
      ws.current.send(JSON.stringify(messageEvent));
      setMessages((prev) => [
        ...prev,
        {
          type: "manager",
          text: input.trim(),
          timestamp: new Date().toISOString(),
        },
      ]);
      setInput("");
    }
  };

  const handleChatSelect = (roomId) => {
    console.log("Selected chat room:", roomId);
    setSelectedChatId(roomId);
    setChatId(roomId);
    setMessages([]);
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
  };

  const handleCloseChat = () => {
    setSelectedChatId(null);
    setChatId("");
    setMessages([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredChatRooms = chatRooms.filter((room) => {
    const query = searchQuery.toLowerCase();
    return (
      room.id.toLowerCase().includes(query) ||
      room.messages?.slice(-1)[0]?.message.toLowerCase().includes(query)
    );
  });

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
        display: "flex",
        p: 0,
        overflow: "hidden",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={isSidebarOpen}
        sx={{
          width: isSidebarOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          transition: "width 0.3s",
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            bgcolor: "#F4F4F5",
            borderRight: "none",
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={toggleSidebar} sx={{ mr: 1 }}>
              <MenuIcon sx={{ color: "#40C4FF" }} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#17212B" }}>
              Поддержка
            </Typography>
          </Box>
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
            }}
          />
        </Box>
        <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
          {filteredChatRooms.length > 0 ? (
            filteredChatRooms.map((room) => {
              const lastMessage = room.messages?.slice(-1)[0];
              return (
                <ListItem
                  key={room.id}
                  button
                  onClick={() => handleChatSelect(room.id)}
                  sx={{
                    bgcolor:
                      selectedChatId === room.id ? "#E1F5FE" : "transparent",
                    "&:hover": { bgcolor: "#E8ECEF" },
                    py: 1,
                    px: 2,
                    borderBottom: "1px solid #E8ECEF",
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={unreadCounts[room.id] || 0}
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
                        sx={{ bgcolor: "#708499", width: 36, height: 36 }}
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
                            sx={{ maxWidth: 160, fontSize: "0.85rem" }}
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
            })
          ) : (
            <ListItem sx={{ justifyContent: "center" }}>
              <Typography variant="body2" color="#708499">
                Чаты не найдены
              </Typography>
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* Main Chat Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          ml: isSidebarOpen ? 0 : `-${SIDEBAR_WIDTH}px`,
          transition: "margin-left 0.3s",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            p: 1.5,
            borderBottom: "1px solid #E8ECEF",
            display: "flex",
            alignItems: "center",
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
              <IconButton onClick={handleCloseChat} sx={{ color: "#F44336" }}>
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ p: 2, bgcolor: "#FFEBEE" }}>
            <Typography variant="body2" color="#F44336">
              {error}
            </Typography>
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          {isLoadingHistory ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress sx={{ color: "#40C4FF" }} />
            </Box>
          ) : selectedChatId ? (
            messages.map((msg, index) => {
              const isManager = msg.type === "manager";
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: isManager ? "flex-end" : "flex-start",
                    mb: 1.5,
                    alignItems: "flex-end",
                    animation: msg.isNew ? "fadeIn 0.5s ease-in" : "none",
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  {!isManager && (
                    <Avatar
                      sx={{ bgcolor: "#708499", mr: 1, width: 36, height: 36 }}
                    >
                      <SupportAgentIcon
                        fontSize="small"
                        sx={{ color: "#FFF" }}
                      />
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: isManager ? "#E1F5FE" : "#FFFFFF",
                      color: "#17212B",
                      borderRadius: "12px",
                      maxWidth: "70%",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontSize: "0.95rem", lineHeight: 1.5 }}
                    >
                      {msg.text}
                    </Typography>
                    {msg.timestamp && (
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
                  {isManager && (
                    <Avatar
                      sx={{ bgcolor: "#708499", ml: 1, width: 36, height: 36 }}
                    >
                      <PersonIcon fontSize="small" sx={{ color: "#FFF" }} />
                    </Avatar>
                  )}
                </Box>
              );
            })
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="h6" color="#708499">
                Выберите чат для общения
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
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
                  color: "#17212B",
                  fontSize: "0.95rem",
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
                px: 2,
                py: 1,
                minWidth: "40px",
              }}
              disabled={!chatId || !isConnected}
            >
              <SendIcon sx={{ color: "#FFF" }} />
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
