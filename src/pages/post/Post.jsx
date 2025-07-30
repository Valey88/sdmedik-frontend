import React, { useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import sanitizeHtml from "sanitize-html";
import useBlogStore from "../../store/blogStore";

// Функция для извлечения URL изображения из HTML
const extractImageUrl = (html) => {
  if (!html) {
    console.log("extractImageUrl: HTML is empty or undefined");
    return "https://via.placeholder.com/400";
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  const url = img ? img.getAttribute("src") : "https://via.placeholder.com/400";
  console.log("extractImageUrl: Extracted URL:", url);
  return url;
};

// Функция для извлечения текста из HTML
const extractTextFromHtml = (html) => {
  if (!html) {
    console.log("extractTextFromHtml: HTML is empty or undefined");
    return "Без заголовка";
  }
  const text = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
  console.log("extractTextFromHtml: Extracted text:", text);
  return text || "Без заголовка";
};

// Функция для санитизации HTML-контента
const sanitizeContent = (html) => {
  return sanitizeHtml(html, {
    allowedTags: ["p", "strong", "em", "ul", "ol", "li", "img", "br", "div"],
    allowedAttributes: {
      img: ["src", "alt", "style"],
      div: ["class", "style"],
    },
    transformTags: {
      img: (tagName, attribs) => {
        const style = attribs.style || "";
        const styles = style
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s);
        if (!styles.includes("object-fit: contain")) {
          styles.push("object-fit: contain");
        }
        return {
          tagName: "img",
          attribs: {
            ...attribs,
            alt: attribs.alt || "",
            style: styles.join("; "),
          },
        };
      },
      div: (tagName, attribs) => {
        if (attribs.class && attribs.class.includes("custom-image")) {
          return { tagName: "div", attribs };
        }
        return { tagName: "div", attribs: {} };
      },
    },
  });
};

export default function Post() {
  const { id } = useParams();
  const { post, fetchBlogById } = useBlogStore();

  useEffect(() => {
    fetchBlogById(id);
  }, [id, fetchBlogById]);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Helmet>
        <title>
          {extractTextFromHtml(post && post.data && post?.data.heading)} - Блог
          - СД-МЕД
        </title>
        <meta
          name="description"
          content="Подробная информация о посте в блоге СД-МЕД."
        />
        <meta name="keywords" content="блог, СД-МЕД, статья" />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          variant="contained"
          component={Link}
          to="/blog-list"
          sx={{
            mb: 2,
            backgroundColor: "#00B3A4",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#00B3A4",
            },
          }}
        >
          Назад к блогу
        </Button>
        <Card
          sx={{
            border: `2px solid ${post && post.data && post?.data.hex}`,
            boxShadow: 3,
            mb: 4,
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            height="100%"
            image={extractImageUrl(post && post.data && post?.data.prewiew)}
            alt={extractTextFromHtml(post && post.data && post?.data.heading)}
            sx={{
              objectFit: "contain",
              width: "100%",
              maxHeight: 500,
            }}
          />
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              {extractTextFromHtml(post && post.data && post?.data.heading)}
            </Typography>
            <Box
              sx={{
                mt: 2,
                color: "text.secondary",
                typography: "body1",
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },
                "& .custom-image-left": {
                  float: "left",
                  mr: 2,
                  mb: 1,
                },
                "& .custom-image-right": {
                  float: "right",
                  ml: 2,
                  mb: 1,
                },
                "& .custom-image-center": {
                  display: "block",
                  mx: "auto",
                  mb: 1,
                },
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(post && post.data && post?.data.text),
              }}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
