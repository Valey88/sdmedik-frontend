import React, { useState } from "react";
import { Button, Box, IconButton, Tooltip } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import ChatWindow from "./ChatWindow";

function Chat() {
  const [isOpen, setIsOpen] = useState(false);

  // Номер телефона в формате для ссылок (без пробелов и плюсов)
  const phoneNumber = "79030863091";

  return (
    <>
      {/* Контейнер, фиксирующий все кнопки в правом нижнем углу */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end", // Выравнивание по правому краю
          gap: 1, // Отступ между элементами
          zIndex: 1000, // Чтобы было поверх остального контента
        }}
      >
        {/* Блок с иконками мессенджеров */}
        <Box sx={{ display: "flex", gap: 1, paddingRight: 0.5 }}>
          {/* Telegram */}
          <Tooltip title="Написать в Telegram" placement="left">
            <IconButton
              component="a"
              href={`https://t.me/+${phoneNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                backgroundColor: "#0088cc",
                color: "white",
                "&:hover": { backgroundColor: "#007dbb" },
                width: 45,
                height: 45,
              }}
            >
              <TelegramIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Написать в Макс" placement="left">
            <IconButton
              component="a"
              href={`https://web.max.ru/+${phoneNumber}`} // Замена ссылки на мессенджер Макс
              target="_blank"
              rel="noopener noreferrer"
            >
              <img style={{ width: 35, height: 35 }} src="/Max.png" alt="" />
            </IconButton>
          </Tooltip>

          {/* WhatsApp */}
          <Tooltip title="Написать в WhatsApp" placement="left">
            <IconButton
              component="a"
              href={`https://wa.me/${phoneNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                backgroundColor: "#25D366",
                color: "white",
                "&:hover": { backgroundColor: "#20b85c" },
                width: 45,
                height: 45,
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Основная кнопка чата */}
        <Button
          color="primary"
          aria-label="chat"
          sx={{
            backgroundColor: "#00B3A4",
            color: "white",
            "&:hover": {
              backgroundColor: "#009688",
            },
            gridGap: 10,
            p: 1.5,
            borderRadius: 2,
            boxShadow: 3,
          }}
          onClick={() => setIsOpen(true)}
        >
          Напишите нам, мы онлайн
          <ChatIcon />
        </Button>
      </Box>

      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default Chat;
