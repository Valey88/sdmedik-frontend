import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import { Helmet } from "react-helmet";
import api from "../../configs/axiosConfig";

// Иконки
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { toast } from "react-toastify";

// Начальные резервные данные
const DEFAULT_INITIAL_DATA = {
  "page-title": "Контакты - Компании СД-МЕД",
  "meta-description": "Контактная информация нашей компании",
  "meta-keywords": "контакты, адрес, телефон, склад, магазин",
  "main-heading": "<h1>Контакты</h1>",
  "contacts-phones": JSON.stringify([
    {
      id: "phone-1",
      phone: "+7 (903) 086 3091",
      label: "Единая справочная",
    },
    {
      id: "phone-2",
      phone: "+7 (353) 293 5241",
      label: "Отдел продаж (Оренбург)",
    },
  ]),
  "contacts-addresses": JSON.stringify([
    {
      id: "addr-1",
      city: "г. Оренбург",
      title: "Магазин - Склад",
      address: "ул. Шевченко д. 20 «В»",
      phone: "+7 3532 93-52-41",
      schedule: "Пн-Пт: 09:00 - 18:00",
      coords: [51.798286, 55.111328],
    },
    {
      id: "addr-2",
      city: "г. Орск",
      title: "Магазин «Памперсы»",
      address: "проспект Мира. 15 «Д», ТД Яшма",
      phone: "+7 905 896-23-23",
      schedule: "Пн-Пт: 09:00 - 18:00",
      coords: [51.230507, 58.485481],
    },
    {
      id: "addr-3",
      city: "г. Уфа",
      title: "Магазин - Склад",
      address: "ул. Степана Кувыкина, 41",
      phone: "+7 961 366-82-46",
      schedule: "Пн-Пт: 09:00 - 18:00",
      coords: [54.711229, 56.000041],
    },
    {
      id: "addr-4",
      city: "г. Екатеринбург",
      title: "Центр обеспечения ТСР",
      address: "пр-т. Ленина 79 «Б»",
      phone: "+7 903 086-34-11",
      schedule: "Пн-Пт: 09:00 - 18:00",
      coords: [56.841763, 60.628368],
    },
    {
      id: "addr-5",
      city: "г. Москва",
      title: "Пункт выдачи",
      address: "Коровинское ш., 17А, метро Селигерская",
      phone: "8 (499) 488-00-83, 8 (800) 234-57-20",
      schedule: "Пн-Пт: 09:00 - 18:00",
      coords: [55.864388, 37.545722],
    },
    {
      id: "addr-6",
      city: "г. Оренбург",
      title: "Филиал",
      address: "ул. Просторная 13/1",
      phone: "8 909-611-20-55",
      schedule: "Пн-Пт: 09:00 - 18:00",
      coords: [51.838324, 55.156641],
    },
  ]),
};

export default function Contacts() {
  const [content, setContent] = useState(DEFAULT_INITIAL_DATA);
  const [activeAddressId, setActiveAddressId] = useState(null);
  const mapRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const stripHtml = (html) => {
    if (!html) return "";
    return String(html).replace(/<[^>]+>/g, "").trim();
  };

  const copyToClipboard = (text, label = "Текст") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопирован!`);
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/page/contacts");
        const newContent = {};
        const elements = Array.isArray(response.data?.data?.elements)
          ? response.data.data.elements
          : Array.isArray(response.data?.elements)
          ? response.data.elements
          : [];

        elements.forEach((item) => {
          newContent[item.element_id] = item.value;
        });

        setContent((prev) => ({ ...prev, ...newContent }));
      } catch (error) {
        console.error("Error fetching page content:", error);
      }
    };
    fetchContent();
  }, []);

  // --- Парсинг номеров телефонов ---
  const getParsedPhones = () => {
    // 1. Проверяем динамический JSON массив
    if (content["contacts-phones"]) {
      try {
        const parsed = JSON.parse(content["contacts-phones"]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) =>
            typeof item === "string"
              ? { id: `phone-${idx}`, phone: item, label: "" }
              : {
                  id: item.id || `phone-${idx}`,
                  phone: item.phone || "",
                  label: item.label || "",
                  note: item.note || "",
                }
          );
        }
      } catch (e) {
        console.error("Error parsing contacts-phones JSON:", e);
      }
    }

    // 2. Fallback: извлекаем старые ключи `phone-1`, `phone-2`, ...
    const phoneKeys = Object.keys(content)
      .filter((key) => key.startsWith("phone-"))
      .sort((a, b) => {
        const numA = parseInt(a.split("-")[1], 10) || 0;
        const numB = parseInt(b.split("-")[1], 10) || 0;
        return numA - numB;
      });

    if (phoneKeys.length > 0) {
      return phoneKeys.map((key, idx) => ({
        id: key,
        phone: stripHtml(content[key]),
        label: idx === 0 ? "Единая справочная" : "Отдел продаж",
      }));
    }

    // 3. Fallback defaults
    return [
      { id: "p1", phone: "+7 (903) 086 3091", label: "Единая справочная" },
      { id: "p2", phone: "+7 (353) 293 5241", label: "Отдел продаж" },
    ];
  };

  // --- Парсинг адресов ---
  const getParsedAddresses = () => {
    // 1. Проверяем динамический JSON массив
    if (content["contacts-addresses"]) {
      try {
        const parsed = JSON.parse(content["contacts-addresses"]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => {
            let coords = [55.751574, 37.573856];
            if (Array.isArray(item.coords) && item.coords.length >= 2) {
              coords = [Number(item.coords[0]) || 0, Number(item.coords[1]) || 0];
            } else if (item.lat !== undefined && item.lng !== undefined) {
              coords = [Number(item.lat) || 0, Number(item.lng) || 0];
            }
            return {
              id: item.id || `addr-${idx}`,
              city: item.city || "",
              title: item.title || "",
              address: item.address || "",
              phone: item.phone || "",
              schedule: item.schedule || "",
              coords,
            };
          });
        }
      } catch (e) {
        console.error("Error parsing contacts-addresses JSON:", e);
      }
    }

    // 2. Fallback: извлекаем старые ключи `address-1`, `address-2`... и `coords-1`...
    const addressKeys = Object.keys(content)
      .filter((key) => key.startsWith("address-"))
      .sort((a, b) => {
        const numA = parseInt(a.split("-")[1], 10) || 0;
        const numB = parseInt(b.split("-")[1], 10) || 0;
        return numA - numB;
      });

    if (addressKeys.length > 0) {
      return addressKeys.map((key) => {
        const index = key.split("-")[1];
        const coordsKey = `coords-${index}`;
        let coords = [55.751574, 37.573856];
        try {
          if (content[coordsKey]) {
            coords = JSON.parse(content[coordsKey]);
          }
        } catch (e) {}

        const rawHtml = content[key] || "";
        const parts = rawHtml.split("<br>").map((s) => stripHtml(s));
        const fullAddress = parts[0] || "";
        const phone = parts[1] || "";

        let city = "";
        let addr = fullAddress;
        if (fullAddress.includes(",")) {
          const split = fullAddress.split(",");
          city = split[0]?.trim() || "";
          addr = split.slice(1).join(",").trim();
        }

        return {
          id: key,
          city: city,
          title: "",
          address: addr || fullAddress,
          phone: phone,
          schedule: fullAddress.includes("режим") ? "с пн по пт с 9 до 18.00" : "",
          coords,
          rawHtml,
        };
      });
    }

    return [];
  };

  const phones = getParsedPhones();
  const addresses = getParsedAddresses();

  // Функция центрирования карты на выбранном адресе
  const handleFocusAddress = (item) => {
    setActiveAddressId(item.id);
    if (mapRef.current && item.coords) {
      mapRef.current.setCenter(item.coords, 16, {
        checkZoomRange: true,
        duration: 600,
      });
    }
  };

  // Генерация HTML содержимого для балуна метки
  const getBalloonContent = (item) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 6px; max-width: 260px;">
        ${item.city ? `<div style="font-weight: bold; color: #00B3A4; font-size: 14px; margin-bottom: 2px;">${item.city}</div>` : ""}
        ${item.title ? `<div style="font-weight: 600; font-size: 13px; color: #333; margin-bottom: 4px;">${item.title}</div>` : ""}
        <div style="font-size: 12px; color: #555; margin-bottom: 6px;">${item.address}</div>
        ${
          item.phone
            ? `<div style="font-size: 12px; margin-bottom: 4px;">📞 <a href="tel:${item.phone.replace(/[^0-9+]/g, "")}" style="color: #00887A; text-decoration: none; font-weight: bold;">${item.phone}</a></div>`
            : ""
        }
        ${
          item.schedule
            ? `<div style="font-size: 11px; color: #777;">🕒 ${item.schedule}</div>`
            : ""
        }
      </div>
    `;
  };

  return (
    <Box sx={{ mb: 8, mt: 2 }}>
      <Helmet>
        <title>{content["page-title"] || "Контакты - Компании СД-МЕД"}</title>
        <meta name="description" content={content["meta-description"] || ""} />
        <meta name="keywords" content={content["meta-keywords"] || ""} />
      </Helmet>

      <Container maxWidth="lg">
        {/* Заголовок страницы */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "#2c3e50",
              fontSize: { xs: "24px", md: "32px" },
              textAlign: "center",
            }}
            dangerouslySetInnerHTML={{
              __html: content["main-heading"] || "<h1>Контакты</h1>",
            }}
          />
        </Box>

        {/* Разделительная линия */}
        <Box sx={{ width: "100%", mb: 3 }}>
          <img
            style={{ width: "100%", height: "auto", display: "block" }}
            src="/Line 1.png"
            alt="Линия разделения"
          />
        </Box>

        {/* БЛОК НОМЕРОВ ТЕЛЕФОНОВ */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 4,
            borderRadius: 3,
            bgcolor: "#F4FAF9",
            border: "1px solid #D5EFEA",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              bgcolor: "#00B3A4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0, 179, 164, 0.3)",
            }}
          >
            <PhoneIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#6c757d",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Телефоны для связи
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              {phones.map((p, idx) => (
                <Box
                  key={p.id || idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "white",
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 2,
                    border: "1px solid #e0f2f1",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  <Box>
                    <Box
                      component="a"
                      href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}
                      sx={{
                        color: "#00887A",
                        fontWeight: 700,
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline", color: "#00B3A4" },
                      }}
                    >
                      {p.phone}
                    </Box>
                    {p.label && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "#757575",
                          fontSize: "0.75rem",
                          lineHeight: 1.1,
                        }}
                      >
                        {p.label}
                      </Typography>
                    )}
                  </Box>

                  <Tooltip title="Скопировать номер">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(p.phone, "Номер")}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* ГЛАВНАЯ СЕКЦИЯ: КАРТА + ДИНАМИЧЕСКИЙ СПИСОК АДРЕСОВ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "58% 42%" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* ЛЕВАЯ КОЛОНКА: ЯНДЕКС.КАРТА */}
          <Box
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid #e0e0e0",
              height: { xs: "380px", sm: "480px", md: "620px" },
              position: "sticky",
              top: 20,
            }}
          >
            <YMaps>
              <Map
                instanceRef={(ref) => {
                  mapRef.current = ref;
                }}
                defaultState={{ center: [54.5, 55.0], zoom: 5 }}
                style={{ width: "100%", height: "100%" }}
                modules={["control.ZoomControl", "control.FullscreenControl"]}
              >
                {addresses.map((item, index) => (
                  <Placemark
                    key={item.id || index}
                    geometry={item.coords}
                    properties={{
                      balloonContent: getBalloonContent(item),
                      hintContent: `${item.city || ""} ${item.address}`,
                    }}
                    options={{
                      preset:
                        activeAddressId === item.id
                          ? "islands#redDotIcon"
                          : "islands#tealDotIcon",
                    }}
                  />
                ))}
              </Map>
            </YMaps>
          </Box>

          {/* ПРАВАЯ КОЛОНКА: СПИСОК ПУНКТОВ ВЫДАЧИ И АДРЕСОВ */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: { xs: "auto", md: "620px" },
            }}
          >
            {/* Заголовок секции адресов */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                pb: 1,
                borderBottom: "2px solid #E7FFFC",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "rgba(0, 179, 164, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00B3A4",
                  }}
                >
                  <LocationOnIcon fontSize="small" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#2c3e50", fontSize: "1.2rem" }}
                >
                  Пункты выдачи заказов
                </Typography>
              </Box>

              <Chip
                label={`${addresses.length} филиалов`}
                size="small"
                sx={{
                  bgcolor: "#E7FFFC",
                  color: "#00887A",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              />
            </Box>

            {/* Скроллируемый контейнер с карточками адресов */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                /* Стили для элегантного скроллбара */
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1e7e3",
                  borderRadius: "10px",
                  "&:hover": {
                    background: "#00B3A4",
                  },
                },
              }}
            >
              {addresses.map((item, index) => {
                const isActive = activeAddressId === item.id;
                return (
                  <Paper
                    key={item.id || index}
                    elevation={isActive ? 3 : 0}
                    onClick={() => handleFocusAddress(item)}
                    sx={{
                      p: 2.2,
                      borderRadius: 2.5,
                      border: isActive
                        ? "2px solid #00B3A4"
                        : "1px solid #e8e8e8",
                      bgcolor: isActive ? "#F0FBF9" : "#ffffff",
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "#00B3A4",
                        boxShadow: "0 4px 14px rgba(0, 179, 164, 0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {/* Город и Название филиала */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {item.city && (
                          <Chip
                            label={item.city}
                            size="small"
                            sx={{
                              bgcolor: "#00B3A4",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                            }}
                          />
                        )}
                        {item.title && (
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "#455a64" }}
                          >
                            {item.title}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        size="small"
                        variant="text"
                        startIcon={<MyLocationIcon sx={{ fontSize: 16 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocusAddress(item);
                        }}
                        sx={{
                          fontSize: "0.75rem",
                          textTransform: "none",
                          color: "#00887A",
                          fontWeight: 600,
                          py: 0.2,
                          px: 1,
                          "&:hover": { bgcolor: "rgba(0, 179, 164, 0.1)" },
                        }}
                      >
                        На карте
                      </Button>
                    </Box>

                    {/* Адрес */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <StorefrontIcon
                        sx={{ fontSize: 18, color: "#00B3A4", mt: 0.2, flexShrink: 0 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#2c3e50", fontWeight: 500, lineHeight: 1.4 }}
                      >
                        {item.address}
                      </Typography>
                    </Box>

                    {/* Телефон */}
                    {item.phone && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.8,
                        }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 16, color: "#78909c", flexShrink: 0 }}
                        />
                        <Box
                          component="a"
                          href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: "#00887A",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {item.phone}
                        </Box>
                      </Box>
                    )}

                    {/* График работы */}
                    {item.schedule && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <AccessTimeIcon
                          sx={{ fontSize: 16, color: "#90a4ae", flexShrink: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "#607d8b", fontSize: "0.8rem" }}
                        >
                          {item.schedule}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}

              {addresses.length === 0 && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    bgcolor: "#fafafa",
                    borderRadius: 2,
                    border: "1px dashed #ccc",
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Адреса пока не добавлены
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
