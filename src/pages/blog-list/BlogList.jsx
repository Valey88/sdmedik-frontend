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
        <Grid container spacing={3}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} md={6} key={post.id}>
              <Link to={`/post/${post.id}`}>
                <Card
                  sx={{
                    borderRadius: "10px",
                    border: `2px solid ${post.hex}`,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={extractImageUrl(post.prewiew)}
                    alt={extractTextFromHtml(post.heading)}
                  />
                  <CardContent sx={{ maxWidth: "370px" }}>
                    <Typography variant="h6">
                      {extractTextFromHtml(post.heading)}
                    </Typography>
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
