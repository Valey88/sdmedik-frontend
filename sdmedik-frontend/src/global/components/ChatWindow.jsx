import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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

function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMessages([
      { type: "bot", text: "Здравствуйте! Выберите вопрос или напишите свой." },
      { type: "faq" },
    ]);
  }, []);

  const handleFAQClick = (answer) => {
    setMessages((prev) => [...prev, { type: "bot", text: answer }]);
  };

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { type: "user", text: input }]);
      setInput("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "manager", text: "Это мок-ответ менеджера." },
        ]);
      }, 1000);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 80,
        right: 16,
        width: { xs: "90%", sm: 350 },
        height: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Чат поддержки</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
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
                  mb: 1,
                }}
              >
                {faqData.map((faq, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    sx={{ m: 1, borderColor: "#00B3A4", color: "#00B3A4" }}
                    onClick={() => handleFAQClick(faq.answer)}
                  >
                    {faq.question}
                  </Button>
                ))}
              </Box>
            );
          } else {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.type === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    backgroundColor:
                      msg.type === "user" ? "#2CC0B3" : "grey.300",
                    color: msg.type === "user" ? "white" : "black",
                    maxWidth: "70%",
                  }}
                >
                  <Typography>{msg.text}</Typography>
                </Paper>
              </Box>
            );
          }
        })}
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid #ccc", display: "flex" }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
            },
            "& .MuiInputLabel-root": {
              "&.Mui-focused": { color: "#2CC0B3" },
            },
          }}
        />
        <Button
          onClick={handleSend}
          variant="contained"
          sx={{ ml: 1, background: "#00B3A4" }}
        >
          Отправить
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatWindow;
