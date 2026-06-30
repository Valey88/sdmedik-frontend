import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/routers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chat from "./global/components/Chat";
import ChatWindow from "./global/components/ChatWindow";
import CookieConsent from "./global/components/CookieConsent";
import YandexMetrika from "./global/components/YandexMetrika";

function App() {
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Получаем данные пользователя из localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.data?.role_id === 1 || user?.data?.role === "admin";

  useEffect(() => {
    // Проверяем, что пользователь не администратор
    if (!isAdmin) {
      const timer = setTimeout(() => {
        if (!hasShownToast) {
          // Показываем уведомление
          toast.info("Есть вопросы? Задайте их нашему специалисту в чате!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setHasShownToast(true);
          setIsOpen(true); // Открываем чат только для не-администраторов
        }
      }, 30000); // 30 секунд

      // Очищаем таймер при размонтировании компонента
      return () => clearTimeout(timer);
    }
  }, [hasShownToast, user?.data?.role]);

  return (
    <Box>
      <RouterProvider router={router} />
      <ToastContainer />
      {!isAdmin && <Chat />}
      {isOpen && !isAdmin && (
        <ChatWindow onClose={() => setIsOpen(false)} />
      )}
      <CookieConsent />
      <YandexMetrika />
    </Box>
  );
}

export default App;
