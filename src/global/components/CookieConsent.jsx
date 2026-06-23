import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Link,
  Paper,
  Switch,
  Divider,
  IconButton,
} from "@mui/material";
import Cookies from "js-cookie";
import api from "../../configs/axiosConfig";

const CONSENT_COOKIE = "cookie_consent";
const CONSENT_EXPIRES = 365;

const defaultConsent = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const CATEGORIES = [
  {
    key: "necessary",
    label: "Обязательные",
    desc: "Необходимы для корректной работы сайта. Всегда активны.",
    locked: true,
  },
  {
    key: "analytics",
    label: "Аналитические",
    desc: "Помогают нам понять, как посетители взаимодействуют с сайтом.",
    locked: false,
  },
  {
    key: "functional",
    label: "Функциональные",
    desc: "Запоминают ваши предпочтения: город, просмотренные товары.",
    locked: false,
  },
  {
    key: "marketing",
    label: "Маркетинговые",
    desc: "Используются для персонализации рекламы и аналитики.",
    locked: false,
  },
];

function parseSaved(raw) {
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultConsent, ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function getCookieConsent() {
  const raw = Cookies.get(CONSENT_COOKIE);
  if (!raw) return null;
  return parseSaved(raw);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [consent, setConsent] = useState(defaultConsent);
  const [iconVisible, setIconVisible] = useState(false);

  useEffect(() => {
    const saved = Cookies.get(CONSENT_COOKIE);
    if (!saved) {
      setVisible(true);
    } else {
      const parsed = parseSaved(saved);
      if (parsed) setConsent(parsed);
      setIconVisible(true);
    }
  }, []);

  const save = (data) => {
    Cookies.set(CONSENT_COOKIE, JSON.stringify(data), { expires: CONSENT_EXPIRES });
    setConsent(data);
    setVisible(false);
    setCustomizing(false);
    setIconVisible(true);
    window.dispatchEvent(new Event("cookieConsentUpdated"));
    api.post("/consent-log", data).catch(() => {});
  };

  const handleAcceptAll = () =>
    save({ necessary: true, analytics: true, functional: true, marketing: true });

  const handleNecessaryOnly = () =>
    save({ necessary: true, analytics: false, functional: false, marketing: false });

  const handleSaveCustom = () => save(consent);

  const handleToggle = (key) =>
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleOpenSettings = () => {
    setVisible(true);
    setIconVisible(false);
  };

  const switchSx = {
    "& .MuiSwitch-switchBase.Mui-checked": { color: "#2CC0B3" },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#2CC0B3",
    },
  };

  return (
    <>
      {iconVisible && !visible && (
        <IconButton
          onClick={handleOpenSettings}
          title="Настройки cookie"
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            backgroundColor: "#2CC0B3",
            color: "#fff",
            width: 48,
            height: 48,
            fontSize: "22px",
            zIndex: 9998,
            "&:hover": { backgroundColor: "#25a095" },
            boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          🍪
        </IconButton>
      )}

      {visible && (
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
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
            Мы используем файлы Cookie 🍪
          </Typography>

          {!customizing ? (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: "#555", lineHeight: 1.6 }}>
                Наш сайт использует файлы cookie для улучшения пользовательского
                опыта, сбора статистики и обеспечения бесперебойной работы.
                Продолжая использовать сайт, вы соглашаетесь с нашей{" "}
                <Link
                  href="/Политика файлов Куки.pdf"
                  target="_blank"
                  sx={{
                    color: "#2CC0B3",
                    fontWeight: "bold",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Политикой использования файлов Cookie
                </Link>
                .
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleNecessaryOnly}
                  sx={{
                    borderColor: "#ccc",
                    color: "#555",
                    "&:hover": { borderColor: "#aaa", backgroundColor: "#f5f5f5" },
                    px: 2,
                    py: 1,
                  }}
                >
                  Только необходимые
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCustomizing(true)}
                  sx={{
                    borderColor: "#2CC0B3",
                    color: "#2CC0B3",
                    "&:hover": { borderColor: "#25a095", backgroundColor: "#f0fafa" },
                    px: 2,
                    py: 1,
                  }}
                >
                  Настроить
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAcceptAll}
                  sx={{
                    backgroundColor: "#2CC0B3",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#25a095" },
                    px: 3,
                    py: 1,
                    fontWeight: "bold",
                  }}
                >
                  Принять все
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
                Выберите категории файлов cookie, которые вы разрешаете использовать.
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {CATEGORIES.map(({ key, label, desc, locked }) => (
                <Box key={key} sx={{ py: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "#333" }}>
                      {label}
                    </Typography>
                    <Switch
                      checked={consent[key]}
                      disabled={locked}
                      onChange={() => !locked && handleToggle(key)}
                      sx={switchSx}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#777", mt: 0.25 }}>
                    {desc}
                  </Typography>
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              ))}

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setCustomizing(false)}
                  sx={{
                    borderColor: "#ccc",
                    color: "#555",
                    "&:hover": { borderColor: "#aaa", backgroundColor: "#f5f5f5" },
                  }}
                >
                  Назад
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveCustom}
                  sx={{
                    backgroundColor: "#2CC0B3",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#25a095" },
                    fontWeight: "bold",
                  }}
                >
                  Сохранить настройки
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
    </>
  );
}
