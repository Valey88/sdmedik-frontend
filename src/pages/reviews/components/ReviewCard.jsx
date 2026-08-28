import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Rating,
  Chip,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import ShortLink from "./ShortLink";
import ReviewMediaViewer from "./ReviewMediaViewer";
import { getSourceConfig } from "./SourceIcons";
import { getReviewImageUrl } from "../../../utils/reviewImage";

const StyledReviewCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  border: "1px solid #E5E7EB",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
  transition: "all 0.25s ease-in-out",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
  backgroundColor: "#FFFFFF",
  "&:hover": {
    boxShadow: "0 10px 25px rgba(38, 189, 184, 0.1)",
    borderColor: "rgba(38, 189, 184, 0.4)",
    transform: "translateY(-2px)",
  },
}));

const ImageThumb = styled(Box)(({ theme }) => ({
  width: "72px",
  height: "72px",
  borderRadius: "10px",
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
  border: "1px solid #E5E7EB",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderColor: "#26BDB8",
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

function getAvatarColor(name = "") {
  const colors = [
    "#26BDB8",
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EC4899",
    "#6366F1",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function ReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!review) return null;

  const sourceInfo = getSourceConfig(review.source);
  const formattedDate = formatDate(review.review_date || review.created_at);

  let parsedLinks = [];
  if (review.links) {
    try {
      parsedLinks = typeof review.links === "string" ? JSON.parse(review.links) : review.links;
      if (!Array.isArray(parsedLinks)) parsedLinks = [];
    } catch (e) {
      if (typeof review.links === "string" && review.links.trim().startsWith("http")) {
        parsedLinks = [review.links.trim()];
      }
    }
  }

  const images = review.images || [];
  const text = review.text || "";
  const isLongText = text.length > 260;
  const displayText = isExpanded || !isLongText ? text : text.slice(0, 260) + "…";

  const handleOpenImage = (index) => {
    setSelectedImgIndex(index);
    setViewerOpen(true);
  };

  const initial = (review.author_name || "К").charAt(0).toUpperCase();

  return (
    <>
      <StyledReviewCard>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Header: Avatar, Name, Source Badge, Rating, Date */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(review.author_name),
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {initial}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color="#1E293B" sx={{ lineHeight: 1.2 }}>
                  {review.author_name || "Покупатель"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
                  <Typography variant="caption" color="text.secondary">
                    {formattedDate}
                  </Typography>
                  <Chip
                    icon={sourceInfo.icon}
                    label={sourceInfo.label}
                    size="small"
                    sx={{
                      height: "22px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      backgroundColor: sourceInfo.bgColor,
                      color: sourceInfo.color,
                      border: `1px solid ${sourceInfo.borderColor}`,
                      "& .MuiChip-icon": { ml: "4px" },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Stars */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <Rating
                value={review.rating || 5}
                readOnly
                size="small"
                precision={0.5}
                sx={{
                  color: "#FFB800",
                  "& .MuiRating-iconFilled": {
                    color: "#FFB800",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Review Text */}
          <Typography
            variant="body2"
            sx={{
              color: "#334155",
              fontSize: "0.93rem",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
              mb: 2,
            }}
          >
            {displayText}
            {isLongText && (
              <Button
                variant="text"
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                  p: 0,
                  ml: 0.5,
                  minWidth: "auto",
                  color: "#26BDB8",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                }}
              >
                {isExpanded ? "Свернуть" : "Читать полностью"}
              </Button>
            )}
          </Typography>

          {/* Attached Links (ShortLink auto-shortening) */}
          {parsedLinks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.8 }}>
                Прикрепленные ссылки:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {parsedLinks.map((link, idx) => (
                  <ShortLink key={idx} url={link} />
                ))}
              </Stack>
            </Box>
          )}

          {/* Attached Photos Gallery */}
          {images.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.8 }}>
                Фотографии ({images.length}):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {images.map((img, idx) => (
                  <ImageThumb key={idx} onClick={() => handleOpenImage(idx)}>
                    <img
                      src={getReviewImageUrl(img)}
                      alt={`Фото отзыва ${idx + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2272%22%20height%3D%2272%22%20viewBox%3D%220%200%2072%2072%22%3E%3Crect%20fill%3D%22%23F1F5F9%22%20width%3D%2272%22%20height%3D%2272%22%2F%3E%3Ctext%20fill%3D%22%2394A3B8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%D0%A4%D0%BE%D1%82%D0%BE%3C%2Ftext%3E%3C%2Fsvg%3E";
                      }}
                    />
                  </ImageThumb>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </StyledReviewCard>

      {/* Full Size Image Viewer Lightbox */}
      <ReviewMediaViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={images}
        currentIndex={selectedImgIndex}
        onIndexChange={setSelectedImgIndex}
      />
    </>
  );
}
