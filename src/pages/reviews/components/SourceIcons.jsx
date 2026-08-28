import React from "react";
import { SvgIcon, Box } from "@mui/material";

// 1. Мессенджер МАКС (MAX) от VK (max.ru) - используем скачанную официальную иконку /Max.png
export function MaxIcon(props) {
  const { sx = {}, ...other } = props;
  const size = sx.fontSize || sx.width || 18;
  return (
    <Box
      component="img"
      src="/Max.png"
      alt="MAX"
      {...other}
      sx={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "4px",
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...sx,
      }}
    />
  );
}

// 2. ВКонтакте (VK) - официальный синий логотип
export function VkIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#0077FF"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      />
      <path
        fill="#FFFFFF"
        d="M13.162 16.5c-4.717 0-7.404-3.23-7.517-8.6h2.378c.078 3.944 1.82 5.614 3.2 5.96V7.9h2.24v3.4c1.372-.15 2.775-1.685 3.262-3.4h2.24c-.378 2.122-1.932 3.657-3.033 4.296 1.101.516 2.87 1.87 3.513 4.304h-2.47c-.503-1.57-1.758-2.78-3.418-2.946v2.946h-.445z"
      />
    </SvgIcon>
  );
}

// 3. Telegram - официальный самолетик
export function TelegramIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#229ED9"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      />
      <path
        fill="#FFFFFF"
        d="M17.9 6.8l-2.4 11.5c-.2.8-.7 1-1.4.6l-3.7-2.7-1.8 1.7c-.2.2-.4.4-.8.4l.3-3.8 6.9-6.2c.3-.3-.1-.4-.5-.2L6.1 13.5 2.4 12.3c-.8-.2-.8-.8.2-1.2L16.8 5.6c.7-.3 1.3.1 1.1 1.2z"
      />
    </SvgIcon>
  );
}

// 4. WhatsApp - официальный зелёный значок со стилизованной телефонной трубкой
export function WhatsAppIcon(props) {
  return (
    <SvgIcon {...props} viewBox="15 15 145 145" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#25D366"
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
      />
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
      />
    </SvgIcon>
  );
}

// 5. Viber - официальный фиолетовый значок
export function ViberIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#7360F2"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      />
      <path
        fill="#FFFFFF"
        d="M16.5 13.2c-.2-.1-.5-.1-.7.1l-.7.8c-.2.2-.4.2-.6.1-1.1-.5-2-1.4-2.5-2.5-.1-.2-.1-.4.1-.6l.8-.7c.2-.2.2-.5.1-.7l-1.2-2.7c-.2-.3-.5-.4-.7-.3l-1.3.4c-.4.2-.7.5-.8 1 0 3.7 3 6.7 6.7 6.7.5-.1.8-.4 1-.8l.4-1.3c.1-.2 0-.5-.2-.7l-1-1.3zm.5-3.6c.5.8.6 1.8.4 2.7l.9.3c.3-1.2.2-2.4-.4-3.4l-.9.4zm-1.6 1c.3.5.3 1 .2 1.4l.8.3c.2-.6.2-1.3-.1-1.9l-.9.2z"
      />
    </SvgIcon>
  );
}

// 6. 2ГИС (2GIS) - официальный зелёный маркер
export function TwoGisIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#00B956"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      />
      <path
        fill="#FFFFFF"
        d="M12 5a5 5 0 0 0-5 5c0 3.75 5 9 5 9s5-5.25 5-9a5 5 0 0 0-5-5zm0 6.8a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z"
      />
    </SvgIcon>
  );
}

// 7. Яндекс (Yandex) - официальный красный круг с буквой «Я»
export function YandexIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10z"
        fill="#FC3F1D"
      />
      <path
        d="M13.32 7.666h-.924c-1.694 0-2.585.858-2.585 2.123 0 1.43.616 2.1 1.881 2.959l1.045.704-3.003 4.487H7.49l2.695-4.014c-1.55-1.111-2.42-2.19-2.42-4.015 0-2.288 1.595-3.85 4.62-3.85h3.003v11.868H13.32V7.666z"
        fill="#FFFFFF"
      />
    </SvgIcon>
  );
}

// 8. Сайт sdmedik
export function SdmedikIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#26BDB8"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      />
      <path
        fill="#FFFFFF"
        d="M10.5 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z"
      />
    </SvgIcon>
  );
}

// 9. Другой источник
export function OtherIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ width: 18, height: 18, ...props.sx }}>
      <path
        fill="#64748B"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      />
      <circle cx="7.5" cy="12" r="1.5" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
      <circle cx="16.5" cy="12" r="1.5" fill="#FFFFFF" />
    </SvgIcon>
  );
}

// Конфигурация всех источников отзывов
export const SOURCE_CONFIGS = {
  max: {
    key: "max",
    label: "МАКС (MAX)",
    shortLabel: "МАКС",
    icon: <MaxIcon />,
    color: "#4338CA",
    bgColor: "rgba(79, 70, 229, 0.09)",
    borderColor: "rgba(79, 70, 229, 0.3)",
    activeBg: "linear-gradient(135deg, #4A56E2 0%, #6838D6 100%)",
    activeColor: "#FFFFFF",
  },
  vk: {
    key: "vk",
    label: "ВКонтакте",
    shortLabel: "ВКонтакте",
    icon: <VkIcon />,
    color: "#0055B3",
    bgColor: "rgba(0, 119, 255, 0.09)",
    borderColor: "rgba(0, 119, 255, 0.3)",
    activeBg: "#0077FF",
    activeColor: "#FFFFFF",
  },
  telegram: {
    key: "telegram",
    label: "Telegram",
    shortLabel: "Telegram",
    icon: <TelegramIcon />,
    color: "#1673A0",
    bgColor: "rgba(34, 158, 217, 0.09)",
    borderColor: "rgba(34, 158, 217, 0.3)",
    activeBg: "#229ED9",
    activeColor: "#FFFFFF",
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    shortLabel: "WhatsApp",
    icon: <WhatsAppIcon />,
    color: "#1E7E34",
    bgColor: "rgba(37, 211, 102, 0.09)",
    borderColor: "rgba(37, 211, 102, 0.3)",
    activeBg: "#25D366",
    activeColor: "#FFFFFF",
  },
  viber: {
    key: "viber",
    label: "Viber",
    shortLabel: "Viber",
    icon: <ViberIcon />,
    color: "#5340C9",
    bgColor: "rgba(115, 96, 242, 0.09)",
    borderColor: "rgba(115, 96, 242, 0.3)",
    activeBg: "#7360F2",
    activeColor: "#FFFFFF",
  },
  "2gis": {
    key: "2gis",
    label: "2ГИС",
    shortLabel: "2ГИС",
    icon: <TwoGisIcon />,
    color: "#0D7A3E",
    bgColor: "rgba(0, 185, 86, 0.09)",
    borderColor: "rgba(0, 185, 86, 0.3)",
    activeBg: "#00B956",
    activeColor: "#FFFFFF",
  },
  yandex: {
    key: "yandex",
    label: "Яндекс Отзывы",
    shortLabel: "Яндекс",
    icon: <YandexIcon />,
    color: "#C02C10",
    bgColor: "rgba(252, 63, 29, 0.09)",
    borderColor: "rgba(252, 63, 29, 0.3)",
    activeBg: "#FC3F1D",
    activeColor: "#FFFFFF",
  },
  website: {
    key: "website",
    label: "Покупатель sdmedik",
    shortLabel: "Сайт sdmedik",
    icon: <SdmedikIcon />,
    color: "#18948F",
    bgColor: "rgba(38, 189, 184, 0.09)",
    borderColor: "rgba(38, 189, 184, 0.3)",
    activeBg: "#26BDB8",
    activeColor: "#FFFFFF",
  },
  other: {
    key: "other",
    label: "Другой источник",
    shortLabel: "Другой",
    icon: <OtherIcon />,
    color: "#475569",
    bgColor: "rgba(100, 116, 139, 0.09)",
    borderColor: "rgba(100, 116, 139, 0.3)",
    activeBg: "#64748B",
    activeColor: "#FFFFFF",
  },
};

/**
 * Получить конфигурацию и стили для источника отзыва
 * @param {string} sourceKey 
 * @returns {object} sourceConfig
 */
export function getSourceConfig(sourceKey) {
  if (!sourceKey) return SOURCE_CONFIGS.website;
  const normalized = String(sourceKey).toLowerCase().trim();
  return SOURCE_CONFIGS[normalized] || SOURCE_CONFIGS.other;
}
