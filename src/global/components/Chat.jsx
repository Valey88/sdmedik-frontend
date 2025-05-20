import React, { useState } from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ChatWindow from "./ChatWindow";

function Chat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Fab
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
        }}
        onClick={() => setIsOpen(true)}
      >
        <ChatIcon />
      </Fab>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default Chat;
