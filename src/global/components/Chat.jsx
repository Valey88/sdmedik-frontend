import React, { useState } from "react";
import { Button, Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ChatWindow from "./ChatWindow";

function Chat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        color="primary"
        aria-label="chat"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          backgroundColor: "#00B3A4",
          color: "white",
          "&:hover": {
            backgroundColor: "#009688",
          },
          gridGap: 20,
          p: 1,
        }}
        onClick={() => setIsOpen(true)}
      >
        Напишите нам, мы онлайн
        <ChatIcon />
      </Button>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default Chat;
