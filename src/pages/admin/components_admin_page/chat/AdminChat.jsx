import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../../configs/axiosConfig";
import { supportChat } from "@/constants/constants";
import useUserStore from "../../../../store/userStore";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "../../../../hooks/useWebSocket";
import ChatListSidebar from "./ChatListSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import InputBar from "./InputBar";
import ConfirmDialog from "./ConfirmDialog";

const SIDEBAR_WIDTH = 360;

export default function AdminChat() {
  // --- states
  const [input, setInput] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminSenderId, setAdminSenderId] = useState(null);
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null);
  const [openMsgDeleteDialog, setOpenMsgDeleteDialog] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { getUserInfo, user } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use WebSocket hook
  const {
    isConnected,
    error,
    setError,
    isLoadingHistory,
    messages,
    setMessages,
    chatRooms,
    setChatRooms,
    unreadCounts,
    setUnreadCounts,
    fragments,
    setFragments,
    sendMessage,
    editMessageOnServer,
    deleteMessageOnServer,
    markAsRead,
  } = useWebSocket(supportChat, selectedChatId, adminSenderId, isAdminLoaded);

  // --- helpers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- fetch functions ---
  const fetchOrders = async () => {
    try {
      const response = await api.get(`/order`);
      setOrders(response.data);
    } catch (err) {
      setError("Не удалось загрузить данные заказов.");
    }
  };

  const fetchChatRooms = async () => {
    try {
      const userData = localStorage.getItem("user");
      const parsedUser = JSON.parse(userData);
      const admin_id = parsedUser?.data?.id;
      const response = await api.get("/chat", {
        params: { user_id: admin_id },
      });
      const rooms = response.data.data || [];
      rooms.sort((a, b) => {
        const aTime = a.messages?.slice(-1)[0]?.time_to_send || 0;
        const bTime = b.messages?.slice(-1)[0]?.time_to_send || 0;
        return new Date(bTime) - new Date(aTime);
      });
      setChatRooms(rooms);
      setUnreadCounts(
        rooms.reduce(
          (acc, room) => ({
            ...acc,
            [room.id]: room.unread_count || room.messages?.length || 0,
          }),
          {}
        )
      );
    } catch (err) {
      setError("Не удалось загрузить список чатов.");
    }
  };

  const fetchAdminSenderId = async () => {
    try {
      await getUserInfo();
      if (user?.data?.id) {
        setAdminSenderId(user.data.id);
        setIsAdminLoaded(true);
      } else {
        throw new Error("Пользователь не найден");
      }
    } catch (err) {
      setError("Не удалось загрузить данные администратора: " + err.message);
      setIsAdminLoaded(true);
    }
  };

  // --- message edit/delete handlers ---
  const handleEditStart = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditSave = async (msgId) => {
    try {
      await editMessageOnServer(msgId, editingText);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                text: editingText,
                edited: true,
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );
      handleEditCancel();
    } catch (err) {
      setError("Не удалось отредактировать сообщение: " + err.message);
    }
  };

  const handleDeleteMessageRequest = (msg) => {
    setOpenMsgDeleteDialog(msg);
  };

  const handleDeleteMessageConfirm = async (msg) => {
    try {
      await deleteMessageOnServer(msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                text: "Сообщение удалено",
                deleted: true,
                edited: false,
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );
    } catch (err) {
      setError("Не удалось удалить сообщение: " + err.message);
    } finally {
      setOpenMsgDeleteDialog(null);
    }
  };

  const handleEditMessage = (msg) => {
    if (msg.save) {
      handleEditSave(msg.id);
    } else if (msg.cancel) {
      handleEditCancel();
    } else {
      setEditingMessageId(msg.id);
      setEditingText(msg.text);
    }
  };

  const handleDeleteMsg = (msg) => handleDeleteMessageRequest(msg);

  // --- initialization ---
  useEffect(() => {
    fetchAdminSenderId();
    fetchChatRooms();
    fetchOrders();

    if ("Notification" in window) {
      Notification.requestPermission().catch((err) => {
        setError("Ошибка запроса уведомлений: " + err.message);
      });
    }

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const iOSVersion = isIOS
      ? parseFloat(navigator.userAgent.match(/OS (\d+)_/)?.[1] || 0)
      : null;
    if (isIOS && iOSVersion < 15) {
      setError("Ваша версия iOS устарела. Обновите iOS до версии 15 или выше.");
    }
  }, []);

  // --- handle url params to select chat ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const chatIdFromUrl = queryParams.get("chat_id");

    if (chatIdFromUrl && chatIdFromUrl !== selectedChatId && isAdminLoaded) {
      setSelectedChatId(chatIdFromUrl);
    }
  }, [location.search, selectedChatId, isAdminLoaded]);

  const handleChatSelect = (roomId) => {
    setSelectedChatId(roomId);
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
    navigate(`/admin/admin_chat?chat_id=${roomId}`);
  };

  const handleCloseChat = () => {
    setSelectedChatId(null);
    navigate("/admin/admin_chat");
  };

  const handleMobileChatSelect = (id) => {
    setSelectedChatId(id);
    setSidebarOpen(false);
    setUnreadCounts((prev) => ({ ...prev, [id]: 0 }));
    navigate(`/admin/admin_chat?chat_id=${id}`);
  };

  // --- send message ---
  const handleSend = () => {
    if (input.trim() && selectedChatId && isAdminLoaded) {
      sendMessage(input.trim(), selectedChatId);
      setInput("");
      // scrollToBottom();
    }
  };

  // --- message delete confirmation dialog ---
  const MsgDeleteDialog = () => (
    <ConfirmDialog
      open={!!openMsgDeleteDialog}
      title="Удалить сообщение?"
      onCancel={() => setOpenMsgDeleteDialog(null)}
      onConfirm={() => handleDeleteMessageConfirm(openMsgDeleteDialog)}
    />
  );

  // --- chat delete handler ---
  const handleDeleteChat = async (chatIdToDelete) => {
    try {
      await api.delete(`/chat/${chatIdToDelete}`);
      setChatRooms((prev) => prev.filter((room) => room.id !== chatIdToDelete));
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[chatIdToDelete];
        return newCounts;
      });
      if (chatIdToDelete === selectedChatId) {
        setSelectedChatId(null);
        navigate("/admin/admin_chat");
      }
    } catch (err) {
      setError("Не удалось удалить чат: " + err.message);
    }
    setOpenDeleteDialog(null);
  };

  // --- UI render ---
  return (
    <Fade in timeout={500}>
      <Container
        maxWidth={false}
        sx={{
          minHeight: "100vh",
          bgcolor: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          p: 0,
          fontFamily: "Roboto, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <ChatListSidebar
          chats={chatRooms}
          selectedChatId={selectedChatId}
          onSelect={isMobile ? handleMobileChatSelect : handleChatSelect}
          search={searchQuery}
          onSearch={setSearchQuery}
          sx={{
            display: isMobile
              ? isSidebarOpen || !selectedChatId
                ? "flex"
                : "none"
              : "flex",
          }}
        />

        {/* Chat panel */}
        <Box
          sx={{
            flexGrow: 1,
            display: isMobile
              ? !isSidebarOpen && selectedChatId
                ? "flex"
                : "none"
              : "flex",
            flexDirection: "column",
            width: { xs: "100%", sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
            bgcolor: "white",
            height: "100vh",
            borderRadius: { xs: 0, sm: "16px 0 0 16px" },
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* ChatHeader */}
          <ChatHeader
            chatId={selectedChatId}
            messageCount={messages.length}
            onClose={handleCloseChat}
            onDelete={() => setOpenDeleteDialog(selectedChatId)}
            onInfo={() => console.log("Chat info")}
            mobileBackButton={
              isMobile && (
                <IconButton
                  onClick={() => setSidebarOpen(true)}
                  sx={{
                    mr: 2,
                    bgcolor: "rgba(0,0,0,0.05)",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )
            }
            userName={`Пользователь ${selectedChatId?.split("-")[0] || ""}`}
            isOnline={true}
          />

          {/* Error Display */}
          {error && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                  borderBottom: "1px solid #ffcdd2",
                }}
              >
                <Typography
                  variant="body2"
                  color="#d32f2f"
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {error}
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Messages Container */}
          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              position: "relative",
              maxHeight: {
                xs: "calc(100vh - 180px)",
                sm: "calc(100vh - 140px)",
              },
              WebkitOverflowScrolling: "touch",
              bgcolor: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
            }}
          >
            {isLoadingHistory ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <CircularProgress
                  sx={{
                    color: "primary.main",
                    width: 48,
                    height: 48,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Загрузка сообщений...
                </Typography>
              </Box>
            ) : selectedChatId ? (
              <MessageList
                messages={messages}
                fragments={fragments}
                adminSenderId={adminSenderId}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMsg}
                editingMessageId={editingMessageId}
                editingText={editingText}
                setEditingText={setEditingText}
                orders={orders}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: 3,
                  p: 4,
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    bgcolor:
                      "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(25, 118, 210, 0.2)",
                  }}
                >
                  <Typography variant="h2" sx={{ color: "primary.main" }}>
                    💬
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Выберите чат для общения
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    maxWidth: 400,
                  }}
                >
                  Выберите чат из списка слева, чтобы начать общение с
                  пользователем
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Bar */}
          {selectedChatId && (
            <Box sx={{ p: 2, bgcolor: "white" }}>
              <InputBar
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSend={handleSend}
                disabled={!selectedChatId || !isConnected || !isAdminLoaded}
                placeholder={
                  !isConnected
                    ? "Подключение к серверу..."
                    : !isAdminLoaded
                    ? "Загрузка данных..."
                    : "Напишите сообщение..."
                }
              />
            </Box>
          )}
        </Box>

        {/* Dialogs */}
        <ConfirmDialog
          open={!!openDeleteDialog}
          title={`Удалить чат ${openDeleteDialog?.split("-")[0]}?`}
          onCancel={() => setOpenDeleteDialog(null)}
          onConfirm={() => handleDeleteChat(openDeleteDialog)}
        />
        <MsgDeleteDialog />
      </Container>
    </Fade>
  );
}
