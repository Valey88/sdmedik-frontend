import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  IconButton,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import Cookies from "js-cookie";
import { supportChat } from "@/constants/constants"; // Путь к константам
import useUserStore from "../../store/userStore";

const faqData = [
  {
    question: "Как оформить заказ?",
    answer:
      "Чтобы оформить заказ, выполните следующие шаги:\n1. Выберите нужные товары на сайте.\n2. Добавьте их в корзину.\n3. Перейдите в корзину и оформите покупку, следуя инструкциям.",
  },
  {
    question: "Где мой заказ?",
    answer:
      "Вы можете отследить статус вашего заказа в личном кабинете:\n1. Перейдите в раздел 'Мои заказы'.\n2. Найдите нужный заказ и проверьте его статус.\nЕсли у вас возникли вопросы, свяжитесь с нашей поддержкой.",
  },
  {
    question: "Как вернуть товар?",
    answer:
      "Для возврата товара:\n1. Свяжитесь с нашей службой поддержки через чат или по телефону.\n2. Укажите номер вашего заказа.\n3. Следуйте инструкциям специалиста для оформления возврата.",
  },
  {
    question: "Узнать стоимость доставки?",
    answer:
      "Стоимость доставки зависит от региона и условий заказа:\n- При оформлении полного сертификата на выдачу технических средств реабилитации (ТСР) стоимость заказа включает цену товаров и доставку до вашего региона.\n- При заказе отдельных ТСР уточняйте стоимость доставки у специалиста в чате.\n\nДоступные способы доставки:\n- Транспортные компании: ПЭК, СДЭК\n- Курьерская доставка\n- Почта России\n- Собственная логистика или другие варианты\n\nСтоимость доставки рассчитывается в зависимости от региона. При доставке через СДЭК учитывается общий вес заказа. Точную стоимость вы увидите на странице оформления заказа после выбора региона.",
  },
  {
    question: "Как оплатить сертификатом?",
    answer:
      "Для оплаты электронным сертификатом следуйте этим шагам:\n1. Выберите товар и регион на сайте — отобразится цена с учетом сертификата.\n2. Добавьте товар в корзину и укажите количество.\n3. Перейдите к оплате, выбрав 'Оплата электронным сертификатом'.\n4. Введите данные карты МИР, привязанной к сертификату, и нажмите 'Найти сертификат'.\n5. Убедитесь, что сертификат найден, и введите код из SMS от банка для завершения оплаты.\n\nВажно:\n- Если сертификат не найден или указано 'Оплата банковской картой', проверьте данные.\n- Если цена товара фиксированная (не зависит от региона), может потребоваться доплата с той же карты МИР.\n\nПри возникновении вопросов обратитесь в чат поддержки или по телефону. Режим работы поддержки: с 9:00 до 18:00. Вы можете оставить свои контактные данные (имя и телефон), и наш специалист свяжется с вами в рабочее время.",
  },
];

const CHAT_ID_EXPIRY_MS = 5 * 60 * 60 * 1000; // 5 часов в миллисекундах
const MESSAGE_GAP = 5 * 60 * 1000; // 5 минут в миллисекундах для группировки

function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const { isAuthenticated, user } = useUserStore();

  // Генерация UUID для сессий
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

  useEffect(() => {
    let newChatId = null;

    if (isAuthenticated) {
      // Try to get user data from localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          newChatId = parsedUser?.data?.id || generateUUID();
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          newChatId = generateUUID();
        }
      } else {
        newChatId = generateUUID();
      }
    } else {
      let sessionId = Cookies.get("session_id");
      if (!sessionId) {
        sessionId = generateUUID();
        Cookies.set("session_id", sessionId, { expires: 1 });
      }
      newChatId = sessionId;
    }

    setChatId(newChatId);

    ws.current = new WebSocket(supportChat);

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
          const formattedMessages = messageData.map((msg) => ({
            type: msg.sender_id.includes("admin") ? "manager" : "user",
            text: msg.message || "Пустое сообщение",
            timestamp: msg.time_to_send || new Date().toISOString(),
            senderId: msg.sender_id,
          }));
          setMessages([
            ...formattedMessages,
            ...(messages.some((m) => m.type === "faq")
              ? []
              : [
                  {
                    type: "bot",
                    text: "Здравствуйте!\nЯ помогу ответить на ваши вопросы.\nВыберите одну из популярных тем ниже или напишите свой вопрос.",
                    timestamp: new Date().toISOString(),
                    senderId: "bot",
                  },
                  { type: "faq" },
                ]),
          ]);
        } else if (messageData.event === "message-event") {
          const { message, sender_id, time_to_send } = messageData.data;
          setMessages((prev) => [
            ...prev,
            {
              type: sender_id.includes("admin") ? "manager" : "user",
              text: message || "Пустое сообщение",
              timestamp: time_to_send || new Date().toISOString(),
              senderId: sender_id,
              isNew: true,
            },
          ]);
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) => (msg.isNew ? { ...msg, isNew: false } : msg))
            );
          }, 1000);
        } else if (messageData.event === "error") {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `Ошибка: ${messageData.data}`,
              timestamp: new Date().toISOString(),
              senderId: "bot",
              isNew: true,
            },
          ]);
        }
      } catch (err) {
        console.error("Ошибка парсинга сообщения:", err, "Data:", event.data);
        setMessages((prev) => [
          ...prev,
          {
            type: "manager",
            text: String(event.data),
            timestamp: new Date().toISOString(),
            senderId: `manager-${Date.now()}`,
            isNew: true,
          },
        ]);
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
          senderId: "bot",
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
          senderId: "bot",
          isNew: true,
        },
      ]);
    };

    return () => ws.current?.close();
  }, [isAuthenticated]);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendJoinEvent = (chatId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Нет соединения с сервером чата.",
          timestamp: new Date().toISOString(),
          senderId: "bot",
          isNew: true,
        },
      ]);
      return;
    }
    const joinEvent = { event: "join", data: { chat_id: chatId } };
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
          senderId: "bot",
          isNew: true,
        },
      ]);
      return;
    }
    const trimmedInput = input.trim();
    if (trimmedInput && chatId) {
      console.log("Отправляемое сообщение:", trimmedInput); // Логирование для диагностики
      const messageEvent = {
        event: "message-event",
        data: { message: trimmedInput, chat_id: chatId },
      };
      ws.current.send(JSON.stringify(messageEvent));
      setMessages((prev) => {
        const newMessages = [
          ...prev,
          {
            type: "user",
            text: trimmedInput,
            timestamp: new Date().toISOString(),
            senderId: chatId,
            isNew: true,
          },
        ];
        console.log("Новое состояние messages:", newMessages); // Логирование
        return newMessages;
      });
      setInput("");
    } else {
      console.log("Сообщение пустое или отсутствует chatId");
    }
  };

  const handleFAQClick = (answer) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: answer,
        timestamp: new Date().toISOString(),
        senderId: "bot",
        isNew: true,
      },
    ]);
  };

  // Функция рендеринга сообщений с группировкой
  const renderMessages = () => {
    console.log("Все сообщения для рендеринга:", messages); // Логирование для диагностики
    const today = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    const elements = [];

    // Рендерим сообщения бота и FAQ
    messages.forEach((msg, index) => {
      if (msg.type === "bot") {
        elements.push(
          <Box
            key={`bot-${index}`}
            sx={{
              textAlign: "center",
              mb: 2,
              bgcolor: "#e0f7fa",
              p: 1,
              borderRadius: "10px",
              maxWidth: "80%",
              mx: "auto",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              animation: msg.isNew ? "fadeIn 0.5s ease-in" : "none",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.85rem",
                color: "#000",
                whiteSpace: "pre-line",
              }}
            >
              {msg.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.3,
                color: "#666",
                fontSize: "0.65rem",
              }}
            >
              {new Date(msg.timestamp).toLocaleString(undefined, {
                timeStyle: "short",
              })}
            </Typography>
          </Box>
        );
      } else if (msg.type === "faq") {
        elements.push(
          <Box
            key={`faq-${index}`}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              mb: 2,
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
                  fontSize: "0.75rem",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#00B3A4", color: "#fff" },
                }}
              />
            ))}
          </Box>
        );
      }
    });

    // Фильтруем сообщения пользователя и менеджера
    const chatMessages = messages.filter(
      (msg) => msg.type === "user" || msg.type === "manager"
    );

    for (let i = 0; i < chatMessages.length; i++) {
      const msg = chatMessages[i];
      const msgDateStr = new Date(msg.timestamp).toDateString();
      const prevMsg = chatMessages[i - 1];
      const nextMsg = chatMessages[i + 1];

      // Разделитель по дате
      if (
        i === 0 ||
        (prevMsg && new Date(prevMsg.timestamp).toDateString() !== msgDateStr)
      ) {
        let dateLabel;
        if (msgDateStr === today) {
          dateLabel = "Сегодня";
        } else if (msgDateStr === yesterday) {
          dateLabel = "Вчера";
        } else {
          dateLabel = new Date(msg.timestamp).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
        elements.push(
          <Typography
            key={`date-${msg.timestamp}`}
            variant="caption"
            align="center"
            sx={{ my: 2, color: "#666", fontSize: "0.75rem" }}
          >
            {dateLabel}
          </Typography>
        );
      }

      // Определяем границы группы сообщений
      const timeDiff = prevMsg
        ? new Date(msg.timestamp) - new Date(prevMsg.timestamp)
        : 0;
      const isFirst =
        !prevMsg || prevMsg.senderId !== msg.senderId || timeDiff > MESSAGE_GAP;
      const isLast =
        !nextMsg ||
        nextMsg.senderId !== msg.senderId ||
        new Date(nextMsg.timestamp) - new Date(msg.timestamp) > MESSAGE_GAP;

      const isUser = msg.senderId === chatId;
      const alignment = isUser ? "flex-end" : "flex-start";

      // Рендерим строку сообщения
      elements.push(
        <Box
          key={`msg-row-${msg.timestamp}`}
          sx={{
            display: "flex",
            justifyContent: alignment,
            alignItems: "flex-end",
            mb: isLast ? 1 : 0.5,
            animation: msg.isNew ? "fadeIn 0.5s ease-in" : "none",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(10px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {!isUser && isFirst && (
            <Avatar sx={{ bgcolor: "#00B3A4", mr: 1, width: 32, height: 32 }}>
              <SupportAgentIcon fontSize="small" />
            </Avatar>
          )}
          {!isUser && !isFirst && <Box sx={{ width: 40 }} />}
          <Box
            sx={{
              bgcolor: isUser ? "#00B3A4" : "#ffffff",
              color: isUser ? "#fff" : "#000",
              borderTopLeftRadius: isFirst ? 16 : 6,
              borderTopRightRadius: isFirst ? 16 : 6,
              borderBottomLeftRadius: isLast ? 16 : 6,
              borderBottomRightRadius: isLast ? 16 : 6,
              p: 1,
              maxWidth: "75%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}
            >
              {msg.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.3,
                color: isUser ? "#e0e0e0" : "#666",
                textAlign: isUser ? "right" : "left",
                fontSize: "0.65rem",
              }}
            >
              {new Date(msg.timestamp).toLocaleString(undefined, {
                timeStyle: "short",
              })}
            </Typography>
          </Box>
          {isUser && isLast && (
            <Avatar sx={{ bgcolor: "#00B3A4", ml: 1, width: 32, height: 32 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
          )}
        </Box>
      );
    }

    return elements;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 80,
        right: 16,
        width: { xs: "90%", sm: 360 },
        height: 480,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: "#ffffff",
        zIndex: 1300,
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          bgcolor: "#00B3A4",
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#fff", fontSize: "1rem", fontWeight: 500, ml: 1 }}
        >
          Чат поддержки
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Область сообщений */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2, bgcolor: "#f5f5f5" }}>
        {renderMessages()}
        <div ref={messagesEndRef} />
      </Box>

      {/* Область ввода */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          p: 1,
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
          placeholder="Сообщение..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#f5f5f5",
              "&.Mui-focused fieldset": { borderColor: "#00B3A4" },
            },
            "& .MuiInputBase-input": {
              padding: "8px 10px",
              color: "#000",
              fontSize: "0.85rem",
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
            minWidth: "36px",
            p: 0.8,
          }}
          disabled={!chatId || !isConnected}
        >
          <SendIcon sx={{ color: "#fff", fontSize: "20px" }} />
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatWindow;
