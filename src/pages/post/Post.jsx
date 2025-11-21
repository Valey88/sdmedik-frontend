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

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (без изменений) ---

const extractImageUrl = (html) => {
  if (!html) return "";
  const match = html.match(/<img src="([^"]+)"/);
  return match ? match[1] : "";
};

const extractTextFromHtml = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

const sanitizeContent = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    // Убедитесь, что span тоже разрешен, так как Tiptap накладывает стили на span
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "div",
      "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      img: ["src", "alt", "width", "height"],
      a: ["href", "target", "rel"],
    },
    allowedStyles: {
      "*": {
        // --- ВОТ ЧТО НУЖНО ДОБАВИТЬ: ---
        "font-size": [/^\d+(?:px|em|%|rem)$/],
        // -------------------------------

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
        "white-space": [/^pre-wrap$/, /^nowrap$/, /^pre$/],
      },
    },
  });
};

export default function Post() {
  const { id } = useParams();
  const { post, fetchBlogById, loading, error } = useBlogStore();

  useEffect(() => {
    fetchBlogById(id);
  }, [id, fetchBlogById]);

  const postData = post?.data;
  const headingText = postData
    ? extractTextFromHtml(postData.heading)
    : "Загрузка...";
  const previewImageUrl = postData ? extractImageUrl(postData.prewiew) : "";
  const descriptionSnippet = postData
    ? extractTextFromHtml(postData.text).substring(0, 160) + "..."
    : "Читайте статью в блоге СД-МЕД.";

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
    return null;
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
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

        {/* --- НАЧАЛО ИЗМЕНЕНИЙ --- */}
        {/* Контейнер для изображения и заголовка */}
        {previewImageUrl ? (
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "28px",
              mb: 5,
              boxShadow: "0 20px 40px rgba(0,0,0,0.14)",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              transition: "transform 0.35s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 26px 55px rgba(0,0,0,0.22)",
              },
            }}
          >
            <Box
              component="img"
              src={previewImageUrl}
              alt={headingText}
              sx={{
                width: "100%",
                height: "500px",
                objectFit: "cover",
                display: "block",
                borderRadius: "28px",
                filter: "brightness(0.92)",
                transition: "transform 0.75s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />

            {/* ПРОЗРАЧНАЯ ПАНЕЛЬ С ЗАГОЛОВКОМ */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: { xs: "22px", sm: "34px" },
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  fontSize: { xs: "2rem", sm: "3rem" },
                  textShadow: "0 3px 14px rgba(0,0,0,0.45)",
                }}
              >
                {headingText}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 4,
              fontSize: { xs: "2rem", sm: "3rem" },
            }}
          >
            {headingText}
          </Typography>
        )}

        {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}

        {/* Тело статьи в карточке (без изменений) */}
        <Card
          sx={{
            borderRadius: "26px",
            p: 0,
            overflow: "hidden",
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
            border: `1px solid rgba(255,255,255,0.4)`,
          }}
        >
          <CardContent
            sx={{
              px: { xs: 2.5, sm: 2 },
              py: { xs: 3, sm: 3 },
              fontSize: "1.1rem",
            }}
          >
            <Box
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.75,
                color: "#1a1a1a",

                "& p": {
                  lineHeight: 1.5,
                  margin: "0 0 1em 0",
                  minHeight: "1.5em",
                  whiteSpace: "pre-wrap",
                }, // Рекомендую вернуть небольшой отступ
                "& h1, & h2, & h3, & h4": {
                  marginTop: "1em",
                  marginBottom: "0.7em",
                  lineHeight: 1.3,
                  fontWeight: "600",
                },
                "& ul, & ol": { paddingLeft: "2em", margin: "0 0 0.5em 0" },
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
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  display: "block",
                  margin: "1.5em auto",
                },
                '& img[style*="float: left"]': {
                  margin: { xs: "1.5em auto", sm: "0 1.5em 0.5em 0" },
                },
                '& img[style*="float: right"]': {
                  margin: { xs: "1.5em auto", sm: "0 0 0.5em 1.5em" },
                },
                "@media (max-width: 600px)": {
                  '& img[style*="float"]': {
                    float: "none !important",
                    margin: "1.5em auto !important",
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
