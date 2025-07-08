import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/routers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserStore from "./store/userStore";
import Chat from "./global/components/Chat";
import ChatWindow from "./global/components/ChatWindow";

function App() {
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasShownToast) {
        // Показываем уведомление
        toast.info("Есть вопросы? Задайте их нашему специалисту в чате!", {
          position: "top-right",
          autoClose: 5000, // Уведомление исчезает через 5 секунд
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setHasShownToast(true); // Устанавливаем флаг, чтобы уведомление и чат не открывались повторно
        setIsOpen(true); // Открываем чат
      }
    }, 30000); // 10 секунд

    // Очищаем таймер при размонтировании компонента
    return () => clearTimeout(timer);
  }, [hasShownToast]);

  return (
    <Box>
      <RouterProvider router={router} />
      <ToastContainer />
      <Chat />
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </Box>
  );
}

export default App;
