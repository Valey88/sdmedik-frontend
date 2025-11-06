import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Fade,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Videocam as VideoIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

const ChatHeader = ({
  chatId,
  messageCount,
  onClose,
  onDelete,
  onInfo,
  mobileBackButton,
  isOnline = false,
  lastSeen,
  userName = "Пользователь",
}) => {
  const theme = useTheme();

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Недавно";
    const now = new Date();
    const lastSeenDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Только что";
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return lastSeenDate.toLocaleDateString("ru-RU");
  };

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Mobile Back Button */}
          {mobileBackButton}

          {/* User Avatar and Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    color: "#2c3e50",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Message Count Badge */}
          {messageCount > 0 && (
            <Chip
              label={`${messageCount} сообщений`}
              size="small"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {onDelete && (
              <Tooltip title="Удалить чат" arrow>
                <IconButton
                  onClick={onDelete}
                  size="small"
                  sx={{
                    color: "#6c757d",
                    "&:hover": {
                      color: "#f44336",
                      bgcolor: "#ffebee",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default ChatHeader;
