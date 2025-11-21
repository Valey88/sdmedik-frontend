import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import useBlogStore from "../../store/blogStore";

// Функция для извлечения URL изображения из HTML
const extractImageUrl = (html) => {
  if (!html) {
    console.log("extractImageUrl: HTML is empty or undefined");
    return "https://via.placeholder.com/200";
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  const url = img ? img.getAttribute("src") : "https://via.placeholder.com/200";
  return url;
};

// Функция для извлечения текста из HTML
const extractTextFromHtml = (html) => {
  if (!html) {
    return "Без заголовка";
  }
  const text = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: {},
  }).trim();
  return text || "Без заголовка";
};

export default function BlogList() {
  const { blog, fetchBlog } = useBlogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Фильтрация и сортировка постов (последние элементы массива первыми)
  const filteredPosts = useMemo(() => {
    if (!blog.data || !Array.isArray(blog.data)) {
      return [];
    }
    return blog.data
      .filter((post) =>
        extractTextFromHtml(post.heading)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .slice() // Создаем копию массива
      .reverse(); // Отображаем с конца массива (последние посты первыми)
  }, [blog.data, searchQuery]);

  // Проверки состояния
  if (blog.loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (blog.error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Ошибка загрузки постов: {blog.error}</Alert>
      </Box>
    );
  }

  if (!blog.data || !Array.isArray(blog.data) || blog.data.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Нет постов для отображения</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Helmet>
        <title>Блог - СД-МЕД</title>
        <meta
          name="description"
          content="Инструкции, видео и статьи о технических средствах реабилитации и государственной поддержке."
        />
        <meta
          name="keywords"
          content="блог, инструкции, ТСР, государственная поддержка, видео"
        />
      </Helmet>

      <Container sx={{ py: 4 }}>
        {/* Поиск */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Поиск по заголовку"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>
        {/* Посты блога */}
        <Grid container spacing={2}>
          {filteredPosts.map((post) => (
            <Grid
              item
              xs={12}
              md={4}
              lg={4}
              key={post.id}
              sx={{ display: "flex" }}
            >
              <Link
                to={`/post/${post.id}`}
                style={{ display: "flex", width: "100%" }}
              >
                <Card
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                    transition: "transform 0.35s ease, box-shadow 0.35s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                    },
                    width: 341,
                  }}
                >
                  {/* Image Block */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "300px",
                      overflow: "hidden",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={extractImageUrl(post.prewiew)}
                      alt={extractTextFromHtml(post.heading)}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.6s ease",
                        "&:hover": {
                          transform: "scale(1.08)",
                        },
                      }}
                    />

                    {/* Gradient + Title */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 3,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          lineHeight: 1.25,
                          fontSize: { xs: "1.3rem", sm: "1.6rem" },
                          textShadow: "0 2px 6px rgba(0,0,0,0.55)",
                        }}
                      >
                        {post.prewiew_text}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Bottom Content */}
                  <CardContent
                    sx={{
                      p: 3,
                      // --- ИСПРАВЛЕНИЕ 2: Исправляем ширину текста ---
                      width: "100%", // БЫЛО: width: 370 (это ломало верстку)
                      boxSizing: "border-box", // Чтобы padding не увеличивал ширину
                      flexGrow: 1, // Занимает всё оставшееся место
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      // ---------------------------------------------
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        lineHeight: 1.3,
                        mb: 1.2,
                        flexWrap: "wrap",
                      }}
                    >
                      {extractTextFromHtml(post.heading)}
                    </Typography>

                    <Box
                      sx={{
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      Читать далее →
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
