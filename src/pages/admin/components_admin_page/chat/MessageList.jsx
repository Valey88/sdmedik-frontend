import React, { useMemo, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
  Button,
  Chip,
  Fade,
  useTheme,
} from "@mui/material";
import {
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const MESSAGE_GAP = 5 * 60 * 1000; // 5 минут в миллисекундах

const MessageItem = ({
  msg,
  prevMsg,
  nextMsg,
  isManager,
  adminSenderId,
  onEdit,
  onDelete,
  editingMessageId,
  editingText,
  setEditingText,
  fragmentColor,
  orders,
}) => {
  const theme = useTheme();

  const timeDiff = prevMsg
    ? new Date(msg.timestamp) - new Date(prevMsg.timestamp)
    : 0;
  const isFirst =
    !prevMsg || prevMsg.sender_id !== msg.sender_id || timeDiff > MESSAGE_GAP;
  const isLast =
    !nextMsg ||
    nextMsg.sender_id !== msg.sender_id ||
    new Date(nextMsg.timestamp) - new Date(msg.timestamp) > MESSAGE_GAP;

  const formatTimestamp = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    const pad = (n) => n.toString().padStart(2, "0");
    const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (sameDay) return hhmm;
    if (isYesterday) return `вчера ${hhmm}`;

    if (d.getFullYear() === now.getFullYear()) {
      return `${pad(d.getDate())} ${d.toLocaleString("ru", {
        month: "short",
      })} ${hhmm}`;
    }
    return `${pad(d.getDate())} ${d.toLocaleString("ru", {
      month: "short",
    })} ${d.getFullYear()} ${hhmm}`;
  };

  const isoTooltip = (iso) => (iso ? new Date(iso).toISOString() : "");

  const isOrderMessage = msg.text.includes("(пользователь совершил заказ)");
  const order = isOrderMessage
    ? orders.find((o) => o.fragment_link?.includes(fragmentColor))
    : null;

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: "flex",
          justifyContent: isManager ? "flex-end" : "flex-start",
          mb: isLast ? 2 : 0.5,
          alignItems: "flex-end",
          animation: msg.isNew ? "messageSlideIn 0.4s ease-out" : "none",
          "@keyframes messageSlideIn": {
            from: {
              opacity: 0,
              transform: `translateY(${
                isManager ? "20px" : "-20px"
              }) scale(0.95)`,
            },
            to: {
              opacity: 1,
              transform: "translateY(0) scale(1)",
            },
          },
        }}
      >
        {/* User Avatar */}
        {!isManager && isFirst && (
          <Avatar
            sx={{
              bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              mr: 1.5,
              width: 40,
              height: 40,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            <PersonIcon fontSize="small" sx={{ color: "#FFF" }} />
          </Avatar>
        )}
        {!isManager && !isFirst && <Box sx={{ width: 40, mr: 1.5 }} />}

        {/* Message Content */}
        <Box sx={{ maxWidth: "70%", minWidth: "120px" }}>
          <Paper
            elevation={msg.deleted ? 0 : 2}
            sx={{
              bgcolor: msg.deleted
                ? "#f5f5f5"
                : isOrderMessage
                ? "linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%)"
                : isManager
                ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              color: msg.deleted ? "#999" : "#2c3e50",
              borderRadius: isManager
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              p: 2,
              position: "relative",
              border: msg.deleted ? "1px dashed #ddd" : "none",
              boxShadow: msg.deleted
                ? "none"
                : `0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px ${
                    fragmentColor || "transparent"
                  }`,
              "&:hover": {
                boxShadow: msg.deleted
                  ? "none"
                  : `0 4px 16px rgba(0,0,0,0.15), 0 0 0 1px ${
                      fragmentColor || "transparent"
                    }`,
                transform: "translateY(-1px)",
                transition: "all 0.2s ease",
              },
            }}
          >
            {/* Message Text or Edit Mode */}
            {editingMessageId === msg.id ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 1,
                    gap: 1,
                  }}
                >
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={() => onEdit({ ...msg, save: true })}
                    size="small"
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Сохранить
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={() => onEdit({ ...msg, cancel: true })}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Отмена
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Tooltip title={isoTooltip(msg.timestamp)} arrow>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontWeight: 400,
                    }}
                  >
                    {isOrderMessage && order?.fragment_link ? (
                      <Box
                        component="a"
                        href={order.fragment_link}
                        sx={{
                          color: "#1976d2",
                          textDecoration: "none",
                          fontWeight: 600,
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {msg.text}
                      </Box>
                    ) : (
                      msg.text
                    )}
                  </Typography>
                </Tooltip>

                {/* Message Footer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                    pt: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: msg.deleted ? "#999" : "#6c757d",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {msg.edited && msg.updated_at ? (
                      <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: "0.7rem" }} />
                        edited {formatTimestamp(msg.updated_at)}
                      </Box>
                    ) : (
                      formatTimestamp(msg.timestamp)
                    )}
                  </Typography>

                  {/* Read Status and Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {isManager && (
                      <Tooltip
                        title={
                          msg.read_status
                            ? `Прочитано: ${isoTooltip(msg.read_at)}`
                            : "Не прочитано"
                        }
                        arrow
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {msg.read_status ? (
                            <DoneAllIcon
                              fontSize="small"
                              sx={{ color: "#1976d2" }}
                            />
                          ) : (
                            <DoneIcon
                              fontSize="small"
                              sx={{ color: "#adb5bd" }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    )}

                    {/* Action Buttons for Manager's Messages */}
                    {isManager &&
                      msg.sender_id === adminSenderId &&
                      !msg.deleted && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => onEdit(msg)}
                            sx={{
                              opacity: 0.7,
                              "&:hover": {
                                opacity: 1,
                                bgcolor: "rgba(0,0,0,0.04)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(msg)}
                            sx={{
                              opacity: 0.7,
                              "&:hover": {
                                opacity: 1,
                                bgcolor: "rgba(244, 67, 54, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Box>

        {/* Manager Avatar */}
        {isManager && isFirst && (
          <Avatar
            sx={{
              bgcolor: "linear-gradient(135deg, #40c4ff 0%, #2196f3 100%)",
              ml: 1.5,
              width: 40,
              height: 40,
              boxShadow: "0 4px 12px rgba(64, 196, 255, 0.3)",
            }}
          >
            <SupportAgentIcon fontSize="small" sx={{ color: "#FFF" }} />
          </Avatar>
        )}
        {isManager && !isFirst && <Box sx={{ width: 40, ml: 1.5 }} />}
      </Box>
    </Fade>
  );
};

const MessageList = ({
  messages,
  fragments,
  adminSenderId,
  onEdit,
  onDelete,
  editingMessageId,
  editingText,
  setEditingText,
  orders = [],
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  const groupedMessages = useMemo(() => {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const elements = [];

    if (fragments.length > 0) {
      fragments.forEach((fragment) => {
        const fragmentMessages = sortedMessages.filter((msg) =>
          fragment.Messages.some(
            (fm) =>
              fm.id === msg.id ||
              (fm.text === msg.text && fm.timestamp === msg.timestamp)
          )
        );

        if (fragmentMessages.length > 0) {
          elements.push(
            <Box
              key={`fragment-${fragment.id}`}
              sx={{
                borderLeft: `4px solid ${fragment.Color}`,
                pl: 2,
                my: 3,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: -2,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: `linear-gradient(180deg, ${fragment.Color} 0%, ${fragment.Color}80 100%)`,
                  borderRadius: "0 2px 2px 0",
                },
              }}
            >
              <Chip
                label={`Фрагмент ${fragment.id}`}
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: fragment.Color,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
              {fragmentMessages.map((msg, index) => {
                const prevMsg = fragmentMessages[index - 1];
                const nextMsg = fragmentMessages[index + 1];
                const isManager = msg.type === "manager";

                return (
                  <MessageItem
                    key={`msg-${msg.id || msg.timestamp}-${index}`}
                    msg={msg}
                    prevMsg={prevMsg}
                    nextMsg={nextMsg}
                    isManager={isManager}
                    adminSenderId={adminSenderId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    editingMessageId={editingMessageId}
                    editingText={editingText}
                    setEditingText={setEditingText}
                    fragmentColor={fragment.Color}
                    orders={orders}
                  />
                );
              })}
            </Box>
          );
        }
      });

      // Ungrouped messages
      const ungroupedMessages = sortedMessages.filter(
        (msg) =>
          !fragments.some((fragment) =>
            fragment.Messages.some(
              (fm) =>
                fm.id === msg.id ||
                (fm.text === msg.text && fm.timestamp === msg.timestamp)
            )
          )
      );

      ungroupedMessages.forEach((msg, index) => {
        const prevMsg = ungroupedMessages[index - 1];
        const nextMsg = ungroupedMessages[index + 1];
        const isManager = msg.type === "manager";

        elements.push(
          <MessageItem
            key={`msg-${msg.id || msg.timestamp}-${index}`}
            msg={msg}
            prevMsg={prevMsg}
            nextMsg={nextMsg}
            isManager={isManager}
            adminSenderId={adminSenderId}
            onEdit={onEdit}
            onDelete={onDelete}
            editingMessageId={editingMessageId}
            editingText={editingText}
            setEditingText={setEditingText}
            orders={orders}
          />
        );
      });
    } else {
      // No fragments, render all messages
      sortedMessages.forEach((msg, index) => {
        const prevMsg = sortedMessages[index - 1];
        const nextMsg = sortedMessages[index + 1];
        const isManager = msg.type === "manager";

        elements.push(
          <MessageItem
            key={`msg-${msg.id || msg.timestamp}-${index}`}
            msg={msg}
            prevMsg={prevMsg}
            nextMsg={nextMsg}
            isManager={isManager}
            adminSenderId={adminSenderId}
            onEdit={onEdit}
            onDelete={onDelete}
            editingMessageId={editingMessageId}
            editingText={editingText}
            setEditingText={setEditingText}
            orders={orders}
          />
        );
      });
    }

    return elements;
  }, [
    messages,
    fragments,
    adminSenderId,
    onEdit,
    onDelete,
    editingMessageId,
    editingText,
    setEditingText,
    orders,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100%",
        background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
      }}
    >
      {groupedMessages}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
