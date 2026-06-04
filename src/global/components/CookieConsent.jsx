import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Link, Paper } from "@mui/material";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 30 },
        left: { xs: 16, sm: 30 },
        right: { xs: 16, sm: "auto" },
        maxWidth: { sm: "600px" },
        p: { xs: 3, sm: 4 },
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        backgroundColor: "#fff",
        borderRadius: 3,
        borderLeft: "6px solid #2CC0B3",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)"
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
        Мы используем файлы Cookie 🍪
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "#555", lineHeight: 1.6 }}>
        Наш сайт использует файлы cookie для улучшения пользовательского опыта, сбора статистики и обеспечения бесперебойной работы. Продолжая использовать сайт, вы соглашаетесь с нашей{" "}
        <Link href="/Политика файлов Куки.pdf" target="_blank" sx={{ color: "#2CC0B3", fontWeight: "bold", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Политикой использования файлов Cookie
        </Link>.
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={handleDecline}
          sx={{
            borderColor: "#ccc",
            color: "#555",
            "&:hover": { borderColor: "#aaa", backgroundColor: "#f5f5f5" },
            px: 3,
            py: 1
          }}
        >
          Отказаться
        </Button>
        <Button
          variant="contained"
          onClick={handleAccept}
          sx={{
            backgroundColor: "#2CC0B3",
            color: "#fff",
            "&:hover": { backgroundColor: "#25a095" },
            px: 4,
            py: 1,
            fontWeight: "bold"
          }}
        >
          Принять все
        </Button>
      </Box>
    </Paper>
  );
}
