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
  Divider,
} from "@mui/material";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import useBlogStore from "../../store/blogStore";

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const extractImageUrl = (html) => {
  if (!html) {
    return "https://via.placeholder.com/800x400?text=No+Image";
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  return img
    ? img.getAttribute("src")
    : "https://via.placeholder.com/800x400?text=No+Image";
};

const extractTextFromHtml = (html) => {
  if (!html) return "Без заголовка";
  const text = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: {},
  }).trim();
  return text || "Без заголовка";
};

// --- КОМПОНЕНТ КАРТОЧКИ (для Pinned и Normal) ---
const PostCard = ({ post }) => {
  return (
    <Link to={`/post/${post.id}`} style={{ display: "flex", width: "100%" }}>
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
                fontSize: { xs: "1.3rem", sm: "1.4rem" },
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
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function BlogList() {
  const { blog, fetchBlog } = useBlogStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Разделение постов на категории
  const { mainPost, pinnedPosts, normalPosts } = useMemo(() => {
    if (!blog.data || !Array.isArray(blog.data)) {
      return { mainPost: null, pinnedPosts: [], normalPosts: [] };
    }

    // 1. Сначала фильтруем по поиску
    const filtered = blog.data.filter((post) =>
      extractTextFromHtml(post.heading)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    // 2. Сортируем (новые первыми), предполагая что ID растет, или можно reverse() исходный массив
    const sorted = [...filtered].reverse();

    // 3. Распределяем по группам
    let main = null;
    const pinned = [];
    const normal = [];

    sorted.forEach((post) => {
      // Если это main и мы еще не нашли главный пост -> назначаем
      if (post.pin_type === "main" && !main) {
        main = post;
      }
      // Если pinned -> добавляем в закрепленные
      else if (post.pin_type === "pinned") {
        pinned.push(post);
      }
      // Все остальное (normal, undefined, или лишние main) -> в обычные
      else {
        normal.push(post);
      }
    });

    return { mainPost: main, pinnedPosts: pinned, normalPosts: normal };
  }, [blog.data, searchQuery]);

  if (blog.loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (blog.error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Ошибка: {blog.error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9f9f9" }}>
      <Helmet>
        <title>Блог - СД-МЕД</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Поиск */}

        {/* 1. ГЛАВНАЯ НОВОСТЬ (MAIN) */}
        {mainPost && (
          <Box sx={{ mb: 6 }}>
            <Link
              to={`/post/${mainPost.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                sx={{
                  position: "relative",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  height: { xs: "300px", md: "450px" },
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.05)" },
                }}
              >
                <CardMedia
                  component="img"
                  image={extractImageUrl(mainPost.prewiew)}
                  alt="Main Post"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.8s ease",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "60%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    p: { xs: 3, md: 5 },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      color: "white",
                      fontWeight: 800,
                      mb: 2,
                      fontSize: { xs: "1.5rem", md: "2.5rem" },
                      textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    {mainPost.prewiew_text ||
                      extractTextFromHtml(mainPost.heading)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                  >
                    {extractTextFromHtml(mainPost.heading)}
                  </Typography>
                </Box>
              </Card>
            </Link>
          </Box>
        )}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Поиск по заголовку..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              border: "1px solid #2CC0B3",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": { color: "#2CC0B3" },
              },
              "&:hover .MuiInputLabel-root": {
                color: "#2CC0B3",
              },
            }}
          />
        </Box>
        {/* 2. ЗАКРЕПЛЕННЫЕ (PINNED) - ТОП 3 СТАТЬИ */}
        {pinnedPosts.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ textAlign: "center", mb: 4, position: "relative" }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#4DB6AC", // Цвет как на скрине (бирюзовый)
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: 1,
                  display: "inline-block",
                  bgcolor: "#f9f9f9",
                  px: 2,
                  zIndex: 1,
                  position: "relative",
                }}
              >
                ТОП 3 СТАТЬИ
              </Typography>
              <Divider
                sx={{
                  mt: 2,
                  border: "2px solid #ddd",
                }}
              />
            </Box>

            <Grid container spacing={2}>
              {pinnedPosts.map((post) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={post.id}
                  sx={{ display: "flex" }}
                >
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        <Divider
          sx={{
            mt: 2,
            border: "2px solid #ddd",
          }}
        />

        {/* 3. ОБЫЧНЫЕ НОВОСТИ (NORMAL) */}
        {normalPosts.length > 0 && (
          <Box>
            {/* Если есть закрепленные, отделяем обычные визуально, если нет - это просто список */}
            {(pinnedPosts.length > 0 || mainPost) && (
              <Typography
                variant="h4"
                sx={{ mt: 3, mb: 5, fontWeight: 600, color: "#444" }}
              >
                Все статьи
              </Typography>
            )}
            <Grid container spacing={2}>
              {normalPosts.map((post) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={post.id}
                  sx={{ display: "flex" }}
                >
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Пустое состояние */}
        {!mainPost && pinnedPosts.length === 0 && normalPosts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography color="textSecondary">Посты не найдены</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
