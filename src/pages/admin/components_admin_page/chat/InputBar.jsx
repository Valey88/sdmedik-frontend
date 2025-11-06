import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  Fade,
  useTheme,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

const InputBar = ({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "Напишите сообщение...",
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const textFieldRef = useRef(null);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.style.height = "auto";
      textFieldRef.current.style.height = `${Math.min(
        textFieldRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [value]);

  return (
    <Fade in timeout={300}>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          border: `1px solid ${
            isFocused ? theme.palette.primary.main : "#e9ecef"
          }`,
          boxShadow: isFocused
            ? `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${theme.palette.primary.main}20`
            : "0 4px 16px rgba(0,0,0,0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            alignContent: "center",
          }}
        >
          {/* Attachment and Emoji Buttons */}
          {/* Text Input */}
          <TextField
            ref={textFieldRef}
            fullWidth
            multiline
            maxRows={4}
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? "Выберите чат для общения" : placeholder}
            disabled={disabled}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "transparent",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
                "& textarea": {
                  fontSize: "0.95rem",
                  lineHeight: 1,
                  resize: "none",
                  "&::placeholder": {
                    color: "#6c757d",
                    opacity: 1,
                  },
                },
              },
              "& .MuiInputBase-input": {
                padding: "0px 10px",
              },
            }}
          />

          {/* Send Button */}
          <Tooltip title="Отправить (Enter)" arrow>
            <span>
              <IconButton
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    </Fade>
  );
};

export default InputBar;
