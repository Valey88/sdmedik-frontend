import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageItem({
  msg,
  isManager,
  isFirst,
  isLast,
  adminSenderId,
  editingMessageId,
  editingText,
  setEditingText,
  onEdit,
  onDelete,
}) {
  const isMine = isManager && msg.sender_id === adminSenderId && !msg.deleted;
  const isTemp = !msg.id || String(msg.id).endsWith("-local");

  const renderActions = () => {
    if (!isMine || isTemp) return null;
    return (
      <Box sx={{ ml: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => onEdit(msg)}
          aria-label="редактировать"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(msg)}
          aria-label="удалить"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const content = () => {
    if (!isTemp && editingMessageId === msg.id) {
      return (
        <Paper
          sx={{
            bgcolor: "#FFF5E1",
            color: "#17212B",
            borderRadius: 2,
            p: 1.25,
            maxWidth: "70%",
            border: "1px solid #40C4FF",
          }}
        >
          <TextField
            multiline
            fullWidth
            minRows={2}
            value={editingText || ""}
            onChange={(e) => setEditingText(e.target.value)}
            size="small"
          />
          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}
          >
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => onEdit({ ...msg, save: true })}
              startIcon={<SaveIcon />}
            >
              Сохранить
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEdit({ ...msg, cancel: true })}
              startIcon={<CancelIcon />}
            >
              Отмена
            </Button>
          </Box>
        </Paper>
      );
    }
    return (
      <Paper
        sx={{
          bgcolor: msg.deleted ? "#F0F0F0" : isManager ? "#E1F5FE" : "#F4F4F5",
          color: "#17212B",
          borderRadius: 2,
          boxShadow: msg.deleted ? "none" : "0 1px 2px rgba(0,0,0,.1)",
          p: 1.25,
          maxWidth: "70%",
        }}
      >
        <Tooltip title={msg.timestamp} placement="top-start">
          <Typography
            variant="body1"
            sx={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}
          >
            {msg.text}
          </Typography>
        </Tooltip>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <Typography variant="caption" color="#708499">
            {msg.edited && msg.updated_at
              ? `edited ${formatTimestamp(msg.updated_at)}`
              : formatTimestamp(msg.timestamp)}
          </Typography>
          {renderActions()}
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isManager ? "flex-end" : "flex-start",
        mb: isLast ? 2 : 0.5,
        alignItems: "flex-end",
      }}
    >
      {!isManager && isFirst && (
        <Avatar sx={{ bgcolor: "#40C4FF", mr: 1, width: 32, height: 32 }}>
          <PersonIcon fontSize="small" sx={{ color: "#FFF" }} />
        </Avatar>
      )}
      {!isManager && !isFirst && <Box sx={{ width: 36, mr: 1 }} />}

      {content()}

      {isManager && isFirst && (
        <Avatar sx={{ bgcolor: "#40C4FF", ml: 1, width: 32, height: 32 }}>
          <SupportAgentIcon fontSize="small" sx={{ color: "#FFF" }} />
        </Avatar>
      )}
      {isManager && !isFirst && <Box sx={{ width: 36, ml: 1 }} />}
    </Box>
  );
}
