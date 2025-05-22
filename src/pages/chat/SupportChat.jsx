import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  IconButton,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

const faqData = [
  {
    question: "Как оформить заказ?",
    answer:
      "Чтобы оформить заказ, выберите товары, добавьте их в корзину и оформите покупку.",
  },
  {
    question: "Где мой заказ?",
    answer: "Отследить заказ можно в личном кабинете в разделе 'Мои заказы'.",
  },
  {
    question: "Как вернуть товар?",
    answer: "Для возврата товара свяжитесь с поддержкой, указав номер заказа.",
  },
];

const WS_URL = "ws://localhost:8080/api/v1/chat/conn/";
const CHAT_ID_EXPIRY_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

function SupportChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Инициализация WebSocket и управление chatId
  useEffect(() => {
    const storedChatData = localStorage.getItem("chatData");
    let newChatId = null;

    if (storedChatData) {
      try {
        const chatData = JSON.parse(storedChatData);
        const currentTime = Date.now();
        if (
          chatData.timestamp &&
          currentTime - chatData.timestamp < CHAT_ID_EXPIRY_MS
        ) {
          newChatId = chatData.id;
          console.log("Reusing stored chatId:", newChatId);
        } else {
          console.log("Stored chatId expired or invalid, generating new one");
          localStorage.removeItem("chatData");
        }
      } catch (err) {
        console.error("Error parsing chatData from localStorage:", err);
        localStorage.removeItem("chatData");
      }
    }

    if (!newChatId) {
      newChatId = generateUUID();
      const chatData = {
        id: newChatId,
        timestamp: Date.now(),
      };
      localStorage.setItem("chatData", JSON.stringify(chatData));
      console.log("Generated new chatId:", newChatId);
    }

    setChatId(newChatId);

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket подключен");
      setIsConnected(true);
      if (newChatId) {
        sendJoinEvent(newChatId);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        if (Array.isArray(messageData)) {
          const formattedMessages = messageData.map((msg) => {
            console.log("History message sender_id:", msg.sender_id); // Debug sender_id
            return {
              type: msg.sender_id.includes("admin") ? "manager" : "user",
              text: msg.message || "Пустое сообщение",
              timestamp: msg.time_to_send || new Date().toISOString(),
            };
          });
          setMessages([
            ...formattedMessages,
            ...(messages.some((m) => m.type === "faq")
              ? []
              : [
                  {
                    type: "bot",
                    text: "Здравствуйте! Выберите вопрос или напишите свой.",
                    timestamp: new Date().toISOString(),
                  },
                  { type: "faq" },
                ]),
          ]);
        } else if (messageData.event === "message-event") {
          const { message, sender_id, time_to_send } = messageData.data;
          console.log("Message sender_id:", sender_id); // Debug sender_id
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
        } else if (messageData.event === "error") {
          console.error("Server error:", messageData.data);
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `Ошибка: ${messageData.data}`,
              timestamp: new Date().toISOString(),
              isNew: true,
            },
          ]);
        } else {
          console.warn("Unexpected message format:", messageData);
        }
      } catch (err) {
        console.error("Ошибка парсинга сообщения:", err, "Data:", event.data);
        if (chatId) {
          setMessages((prev) => [
            ...prev,
            {
              type: "manager",
              text: event.data,
              timestamp: new Date().toISOString(),
              isNew: true,
            },
          ]);
        }
      }
    };

    ws.current.onerror = (event) => {
      console.error("WebSocket ошибка:", event);
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Ошибка подключения к чату.",
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket закрыт");
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Соединение с чатом разорвано.",
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ]);
    };

    return () => ws.current?.close();
  }, [chatId]);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const sendJoinEvent = (chatId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Нет соединения с сервером чата.",
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ]);
      return;
    }
    const joinEvent = {
      event: "join",
      data: { chat_id: chatId },
    };
    console.log("Sending join event:", joinEvent);
    ws.current.send(JSON.stringify(joinEvent));
  };

  const handleSend = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Нет соединения с сервером чата.",
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ]);
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
      console.log("Sending message event:", messageEvent);
      ws.current.send(JSON.stringify(messageEvent));
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          text: input.trim(),
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ]);
      setInput("");
    }
  };

  const handleFAQClick = (answer) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: answer,
        timestamp: new Date().toISOString(),
        isNew: true,
      },
    ]);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        py: 0,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          p: 1.5,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon sx={{ color: "#000" }} />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            color: "#000",
            fontSize: "1.1rem",
          }}
        >
          Чат поддержки
        </Typography>
        <Avatar sx={{ bgcolor: "#00B3A4", width: 36, height: 36 }}>
          <SupportAgentIcon fontSize="small" />
        </Avatar>
      </Box>

      {/* Message Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          bgcolor: "#ffffff",
          p: 2,
        }}
      >
        {messages.map((msg, index) => {
          if (msg.type === "faq") {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                {faqData.map((faq, idx) => (
                  <Chip
                    key={idx}
                    label={faq.question}
                    onClick={() => handleFAQClick(faq.answer)}
                    sx={{
                      m: 0.5,
                      bgcolor: "#e0f7fa",
                      color: "#007bff",
                      fontSize: "0.85rem",
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: "#00B3A4",
                        color: "#fff",
                      },
                    }}
                  />
                ))}
              </Box>
            );
          } else {
            const isUser = msg.type === "user";
            const isBot = msg.type === "bot";
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: isUser
                    ? "flex-end"
                    : isBot
                    ? "center"
                    : "flex-start",
                  mb: 1.5,
                  alignItems: "flex-end",
                  animation: msg.isNew ? "fadeIn 0.5s ease-in" : "none",
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {!isUser && !isBot && (
                  <Avatar
                    sx={{ bgcolor: "#00B3A4", mr: 1, width: 36, height: 36 }}
                  >
                    <SupportAgentIcon fontSize="small" />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: isUser ? "#00B3A4" : isBot ? "#e0f7fa" : "#f5f5f5",
                    color: isUser ? "#fff" : "#000",
                    borderRadius: "12px",
                    maxWidth: isBot ? "80%" : "70%",
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
                        color: isUser ? "#e0e0e0" : "#666",
                        textAlign: isUser ? "right" : "left",
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
                {isUser && (
                  <Avatar
                    sx={{ bgcolor: "#00B3A4", ml: 1, width: 36, height: 36 }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          p: 1.5,
          borderTop: "1px solid #e0e0e0",
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
              backgroundColor: "#f5f5f5",
              "&.Mui-focused fieldset": {
                borderColor: "#00B3A4",
              },
            },
            "& .MuiInputBase-input": {
              padding: "10px 12px",
              color: "#000",
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
            bgcolor: "#00B3A4",
            "&:hover": { bgcolor: "#009688" },
            px: 2,
            py: 1,
            minWidth: "40px",
          }}
          disabled={!chatId || !isConnected}
        >
          <SendIcon sx={{ color: "#fff" }} />
        </Button>
      </Box>
    </Container>
  );
}

export default SupportChat;
