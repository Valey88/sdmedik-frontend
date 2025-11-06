import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Chip,
  Fade,
  useTheme,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

const SIDEBAR_WIDTH = 360;

const ChatListItem = ({ chat, isSelected, onSelect, unreadCount }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return "сейчас";
    if (diffInMinutes < 60) return `${diffInMinutes}м`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}ч`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}д`;
    return messageTime.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const getLastMessage = () => {
    if (!chat.messages || chat.messages.length === 0) return "Нет сообщений";
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message || lastMsg.text || "Сообщение отсутствует";
  };

  const getUnreadCount = () => {
    return unreadCount || chat.unreadCount || 0;
  };

  return (
    <Fade in timeout={300}>
      <ListItem
        disablePadding
        sx={{
          mb: 0.5,
          borderRadius: 2,
          overflow: "hidden",
          mx: 1,
        }}
      >
        <ListItemButton
          selected={isSelected}
          onClick={() => onSelect(chat.id)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            bgcolor: isSelected
              ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
              : isHovered
              ? "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
              : "transparent",
            border: isSelected
              ? `2px solid ${theme.palette.primary.main}`
              : "2px solid transparent",
            boxShadow: isSelected
              ? `0 4px 12px rgba(25, 118, 210, 0.2)`
              : isHovered
              ? "0 2px 8px rgba(0,0,0,0.1)"
              : "none",
            transform: isHovered ? "translateY(-1px)" : "translateY(0)",
            "&:hover": {
              bgcolor: isSelected
                ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            },
            "&.Mui-selected": {
              bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
              "&:hover": {
                bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
              },
            },
          }}
        >
          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                getUnreadCount() > 0 ? (
                  <Chip
                    label={getUnreadCount() > 99 ? "99+" : getUnreadCount()}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.error.main,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 18,
                      minWidth: 18,
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                  />
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                <PersonIcon />
              </Avatar>
            </Badge>
          </ListItemAvatar>

          <ListItemText
            primary={
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: isSelected ? theme.palette.primary.main : "#2c3e50",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  Чат {chat.id?.split("-")[0] || "Неизвестно"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6c757d",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {formatLastMessageTime(
                    chat.messages?.[chat.messages.length - 1]?.time_to_send
                  )}
                </Typography>
              </Box>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: isSelected ? theme.palette.primary.dark : "#6c757d",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getLastMessage()}
                </Box>
                {getUnreadCount() > 0 && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: theme.palette.error.main,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
    </Fade>
  );
};

const ChatListSidebar = ({
  chats,
  selectedChatId,
  onSelect,
  search,
  onSearch,
  sx = {},
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(search || "");

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    return chats.filter((chat) => {
      const chatId = chat.id?.split("-")[0] || "";
      const lastMessage =
        chat.messages?.[chat.messages.length - 1]?.message || "";
      const searchLower = searchQuery.toLowerCase();

      return (
        chatId.toLowerCase().includes(searchLower) ||
        lastMessage.toLowerCase().includes(searchLower)
      );
    });
  }, [chats, searchQuery]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch?.("");
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
        ...sx,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: "linear-gradient(135deg, #40c4ff 0%, #2196f3 100%)",
              width: 40,
              height: 40,
            }}
          >
            <SupportAgentIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>
              Поддержка
            </Typography>
            <Typography variant="caption" sx={{ color: "#6c757d" }}>
              {chats.length} активных чатов
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Поиск чатов..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#6c757d" }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  sx={{ color: "#6c757d" }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "white",
              "& fieldset": {
                borderColor: "#e9ecef",
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {filteredChats.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 3,
              textAlign: "center",
            }}
          >
            <ChatIcon
              sx={{
                fontSize: 64,
                color: "#e9ecef",
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "#6c757d",
                fontWeight: 500,
                mb: 1,
              }}
            >
              {searchQuery ? "Чаты не найдены" : "Нет активных чатов"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#adb5bd",
                fontSize: "0.85rem",
              }}
            >
              {searchQuery
                ? "Попробуйте изменить поисковый запрос"
                : "Новые чаты появятся здесь"}
            </Typography>
          </Box>
        ) : (
          <List
            sx={{
              p: 1,
              "& .MuiListItem-root": {
                px: 0,
              },
            }}
          >
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onSelect={onSelect}
                unreadCount={chat.unreadCount}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "#f8f9fa",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#6c757d",
            fontSize: "0.75rem",
            textAlign: "center",
            display: "block",
          }}
        >
          © 2024 Система поддержки
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatListSidebar;
