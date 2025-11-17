import React, { useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import sanitizeHtml from "sanitize-html";
import useBlogStore from "../../store/blogStore";

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Извлечение URL изображения из HTML-строки
const extractImageUrl = (html) => {
  if (!html) return ""; // Возвращаем пустую строку, чтобы избежать ошибок
  const match = html.match(/<img src="([^"]+)"/);
  return match ? match[1] : "";
};

// Извлечение чистого текста из HTML-строки
const extractTextFromHtml = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

/**
 * ЧАСТЬ 4 (ПРОМПТ): Синхронизация sanitizeHtml с админ-панелью.
 * ЭТО КРИТИЧЕСКИ ВАЖНЫЙ ШАГ! Эта новая версия разрешает инлайн-стили для
 * цвета, фона, выравнивания текста и изображений, которые задаются в админке.
 */
const sanitizeContent = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "div"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      img: ["src", "alt", "width", "height"],
      a: ["href", "target", "rel"],
    },
    allowedStyles: {
      "*": {
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        "background-color": [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
        ],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        float: [/^left$/, /^right$/],
        margin: [/^\d+(?:px|em|%|auto)$/],
        "margin-left": [/^\d+(?:px|em|%|auto)$/],
        "margin-right": [/^\d+(?:px|em|%|auto)$/],
        display: [/^block$/, /^inline-block$/],
        width: [/^\d+(?:px|em|%)$/],
        height: [/^\d+(?:px|em|%)$/],
      },
    },
  });
};

export default function Post() {
  const { id } = useParams();
  // ЧАСТЬ 5 (ПРОМПТ): Получаем состояния загрузки и ошибки из стора
  const { post, fetchBlogById, loading, error } = useBlogStore();

  useEffect(() => {
    // Сбрасываем предыдущий пост при загрузке нового
    fetchBlogById(id);
  }, [id, fetchBlogById]);

  // --- Данные для рендеринга и SEO ---
  const postData = post?.data;
  const headingText = postData
    ? extractTextFromHtml(postData.heading)
    : "Загрузка...";
  const previewImageUrl = postData ? extractImageUrl(postData.prewiew) : "";
  const descriptionSnippet = postData
    ? extractTextFromHtml(postData.text).substring(0, 160) + "..."
    : "Читайте статью в блоге СД-МЕД.";

  /**
   * ЧАСТЬ 5 (ПРОМПТ): Реализация состояний загрузки и ошибок
   */
  if (loading && !postData) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          <b>Ошибка загрузки:</b> {error}.
          <Button component={Link} to="/blog-list" sx={{ ml: 2 }}>
            Вернуться к блогу
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!postData) {
    return null; // Ничего не рендерим, если данных нет
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/**
       * ЧАСТЬ 4 (ПРОМПТ): Улучшенное SEO с Open Graph тегами
       */}
      <Helmet>
        <title>{headingText} - Блог - СД-МЕД</title>
        <meta name="description" content={descriptionSnippet} />
        <meta property="og:title" content={headingText} />
        <meta property="og:description" content={descriptionSnippet} />
        <meta property="og:image" content={previewImageUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          variant="outlined"
          component={Link}
          to="/blog-list"
          sx={{ mb: 4, color: "#00B3A4", border: "1px solid #00B3A4" }}
        >
          Назад ко всем статьям
        </Button>

        {/**
         * ЧАСТЬ 1 (ПРОМПТ): Архитектура и Визуальная Иерархия - "Шапка" статьи
         */}
        {/* <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "700", mb: 1, lineHeight: 1.2 }}
        >
          {headingText}
        </Typography> */}

        {/* <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Опубликовано:{" "}
          {new Date(postData.createdAt || Date.now()).toLocaleDateString(
            "ru-RU"
          )}
        </Typography> */}

        {/* {previewImageUrl && (
          <Box
            component="img"
            src={previewImageUrl}
            alt={headingText}
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 2, // 16px
              mb: 4,
              display: "block",
              border: `1px solid #eee`,
            }}
          />
        )} */}

        {/**
         * ЧАСТЬ 1 (ПРОМПТ): "Тело" статьи в отдельной карточке
         */}
        <Card
          sx={{
            borderTop: `4px solid ${postData.hex || "#00B3A4"}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            overflow: "visible", // Позволяет контенту управлять своей шириной
          }}
        >
          <CardContent sx={{ px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 4 } }}>
            <Box
              /**
               * ЧАСТЬ 2 и 3 (ПРОМПТ): Глубокая стилизация и мобильная адаптация
               */
              sx={{
                // Базовая типографика
                fontSize: { xs: "1rem", sm: "1.1rem" }, // Адаптивный размер шрифта
                "& p": { lineHeight: 1.7, margin: "0 0 1.5em 0" },
                "& h1, & h2, & h3, & h4": {
                  marginTop: "2em",
                  marginBottom: "0.8em",
                  lineHeight: 1.3,
                  fontWeight: "600",
                },
                "& ul, & ol": { paddingLeft: "2em", margin: "0 0 1.5em 0" },
                "& li": { marginBottom: "0.5em", lineHeight: 1.7 },
                "& a": {
                  color: "#00B3A4",
                  textDecoration: "underline",
                  "&:hover": { textDecoration: "none" },
                },
                "& blockquote": {
                  borderLeft: `4px solid ${postData.hex || "#00B3A4"}`,
                  paddingLeft: "16px",
                  marginLeft: 0,
                  fontStyle: "italic",
                  color: "text.secondary",
                  margin: "1.5em 0",
                },
                // Стили для изображений внутри текста
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  display: "block", // Убирает лишний отступ под картинкой
                  margin: "1.5em auto", // Центрирует по умолчанию
                },
                // Поддержка выравнивания из админки
                '& img[style*="float: left"]': {
                  marginRight: { xs: 0, sm: "1.5em" },
                  marginBottom: "0.5em",
                  margin: { xs: "1.5em auto", sm: "0 1.5em 0.5em 0" },
                },
                '& img[style*="float: right"]': {
                  marginLeft: { xs: 0, sm: "1.5em" },
                  marginBottom: "0.5em",
                  margin: { xs: "1.5em auto", sm: "0 0 0.5em 1.5em" },
                },

                // Мобильная адаптация обтекания
                "@media (max-width: 600px)": {
                  '& img[style*="float"]': {
                    float: "none !important",
                    margin: "1.5em auto !important", // Центрируем с отступами
                  },
                },
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(postData.text),
              }}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
