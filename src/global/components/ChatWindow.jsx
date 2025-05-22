import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

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

function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Инициализация WebSocket и восстановление chatId
  useEffect(() => {
    // Проверяем localStorage для существующего chatId
    const storedChatId = localStorage.getItem("chatId");
    if (storedChatId && !isAdmin) {
      setChatId(storedChatId);
    } else if (!isAdmin) {
      const newChatId = generateUUID();
      setChatId(newChatId);
      localStorage.setItem("chatId", newChatId);
    }

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket подключен");
      setIsConnected(true);
      if (!isAdmin && chatId) {
        sendJoinEvent(chatId);
      }
    };

    ws.current.onmessage = (event) => {
      console.log("Received WebSocket message:", event.data);
      try {
        const messageData = JSON.parse(event.data);
        if (Array.isArray(messageData)) {
          // История сообщений
          const formattedMessages = messageData.map((msg) => ({
            type: msg.sender_id.includes("admin") ? "manager" : "user",
            text: msg.message || "Пустое сообщение",
            timestamp: msg.time_to_send || new Date().toISOString(),
          }));
          setMessages([
            ...formattedMessages,
            ...(messages.some((m) => m.type === "faq")
              ? []
              : [
                  {
                    type: "bot",
                    text: "Здравствуйте! Выберите вопрос или напишите свой.",
                  },
                  { type: "faq" },
                ]),
          ]);
        } else if (messageData.event === "error") {
          // Обработка ошибок от сервера
          console.error("Server error:", messageData.data);
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: `Ошибка: ${messageData.data}` },
          ]);
        } else {
          console.warn("Unexpected message format:", messageData);
        }
      } catch (err) {
        // Новое сообщение (предполагается от менеджера)
        if (chatId) {
          setMessages((prev) => [
            ...prev,
            {
              type: "manager",
              text: event.data,
              timestamp: new Date().toISOString(),
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
        { type: "bot", text: "Ошибка подключения к чату." },
      ]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket закрыт");
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Соединение с чатом разорвано." },
      ]);
    };

    return () => ws.current?.close();
  }, [chatId, isAdmin]);

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
        { type: "bot", text: "Нет соединения с сервером чата." },
      ]);
      return;
    }
    const joinEvent = {
      event: isAdmin ? "admin-join" : "join",
      data: { chat_id: chatId },
    };
    console.log("Sending join event:", joinEvent);
    ws.current.send(JSON.stringify(joinEvent));
  };

  const handleSend = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Нет соединения с сервером чата." },
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
        },
      ]);
      setInput("");
    }
  };

  const handleFAQClick = (answer) => {
    setMessages((prev) => [
      ...prev,
      { type: "bot", text: answer, timestamp: new Date().toISOString() },
    ]);
  };

  const renderAdminControls = () => (
    <Box sx={{ p: 2, borderBottom: "1px solid #ccc" }}>
      <TextField
        label="Chat ID"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendJoinEvent(chatId)}
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={() => sendJoinEvent(chatId)}
                variant="contained"
                sx={{
                  backgroundColor: "#00B3A4",
                  "&:hover": { backgroundColor: "#009688" },
                }}
              >
                Подключиться
              </Button>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
          },
        }}
      />
    </Box>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 80,
        right: 16,
        width: { xs: "90%", sm: 650 },
        height: 450,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ccc",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="h6">
          {isAdmin ? "Админ чат" : "Чат поддержки"}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {isAdmin && renderAdminControls()}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {messages.map((msg, index) => {
          if (msg.type === "faq") {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  mb: 2,
                }}
              >
                {faqData.map((faq, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    sx={{
                      m: 1,
                      borderColor: "#00B3A4",
                      color: "#00B3A4",
                      borderRadius: 20,
                      "&:hover": {
                        backgroundColor: "#00B3A4",
                        color: "white",
                      },
                    }}
                    onClick={() => handleFAQClick(faq.answer)}
                  >
                    {faq.question}
                  </Button>
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
                  mb: 2,
                }}
              >
                {!isUser && !isBot && (
                  <SupportAgentIcon sx={{ mr: 1, color: "#00B3A4" }} />
                )}
                <Paper
                  sx={{
                    p: 1,
                    backgroundColor: isUser
                      ? "#2CC0B3"
                      : isBot
                      ? "#e0e0e0"
                      : "#f0f0f0",
                    color: isUser ? "white" : "black",
                    borderRadius: isUser
                      ? "10px 10px 0 10px"
                      : isBot
                      ? "10px"
                      : "10px 10px 10px 0",
                    maxWidth: isBot ? "80%" : "70%",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                  {msg.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        color: isUser ? "#e0e0e0" : "#666",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  )}
                </Paper>
                {isUser && <PersonIcon sx={{ ml: 1, color: "#00B3A4" }} />}
              </Box>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid #ccc", display: "flex" }}>
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
              "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
            },
          }}
          disabled={!chatId || !isConnected}
        />
        <Button
          onClick={handleSend}
          variant="contained"
          sx={{
            ml: 1,
            backgroundColor: "#00B3A4",
            "&:hover": { backgroundColor: "#009688" },
          }}
          disabled={!chatId || !isConnected}
        >
          Отправить
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatWindow;
