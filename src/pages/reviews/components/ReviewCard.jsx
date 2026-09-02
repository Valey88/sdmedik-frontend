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
  borderRadius: "18px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 18px rgba(0, 0, 0, 0.03)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "#FFFFFF",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    boxShadow: "0 14px 32px rgba(38, 189, 184, 0.12)",
    borderColor: "rgba(38, 189, 184, 0.45)",
    transform: "translateY(-3px)",
  },
}));

const ImageThumb = styled(Box)(({ theme }) => ({
  width: "74px",
  height: "74px",
  borderRadius: "10px",
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
  border: "1px solid #E2E8F0",
  flexShrink: 0,
  transition: "all 0.2s ease-in-out",
  backgroundColor: "#F8FAFC",
  "&:hover": {
    transform: "scale(1.04)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
    borderColor: "#26BDB8",
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

const OverlayThumb = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(1px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
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
    "#0284C7",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
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

  const images = (review.images || []).filter((img) => {
    const url = typeof img === "string" ? img : img?.url || img?.URL;
    return url && String(url).trim() !== "";
  });

  const text = review.text || "";
  const isLongText = text.length > 240;
  const displayText = isExpanded || !isLongText ? text : text.slice(0, 240) + "…";

  const handleOpenImage = (index) => {
    setSelectedImgIndex(index);
    setViewerOpen(true);
  };

  const initial = (review.author_name || "К").trim().charAt(0).toUpperCase();
  const maxThumbs = 3;
  const visibleImages = images.slice(0, maxThumbs);
  const remainingImagesCount = images.length - maxThumbs;

  return (
    <>
      <StyledReviewCard>
        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
            "&:last-child": { pb: { xs: 2.5, sm: 3 } },
          }}
        >
          {/* Top Header: Avatar, Name, Date, Source, Rating */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1.5,
              mb: 2,
            }}
          >
            {/* User Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(review.author_name),
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  flexShrink: 0,
                }}
              >
                {initial}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="#0F172A"
                  sx={{
                    lineHeight: 1.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {review.author_name || "Покупатель"}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                  {formattedDate && (
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {formattedDate}
                    </Typography>
                  )}
                  <Chip
                    icon={sourceInfo.icon}
                    label={sourceInfo.shortLabel || sourceInfo.label}
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
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
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
          <Box sx={{ mb: 2, flexGrow: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#334155",
                fontSize: "0.92rem",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
                wordBreak: "break-word",
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
                    ml: 0.6,
                    minWidth: "auto",
                    color: "#26BDB8",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textTransform: "none",
                    verticalAlign: "baseline",
                    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                  }}
                >
                  {isExpanded ? "Свернуть" : "Читать полностью"}
                </Button>
              )}
            </Typography>
          </Box>

          {/* Footer Area (Anchored to Bottom) */}
          <Box sx={{ mt: "auto", pt: 1 }}>
            {/* Attached Links */}
            {parsedLinks.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.6 }}>
                  Прикрепленные ссылки:
                </Typography>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {parsedLinks.map((link, idx) => (
                    <ShortLink key={idx} url={link} />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Attached Photos Gallery */}
            {images.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.8 }}>
                  Фотографии ({images.length}):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {visibleImages.map((img, idx) => {
                    const isLastThumb = idx === maxThumbs - 1 && remainingImagesCount > 0;
                    return (
                      <ImageThumb key={idx} onClick={() => handleOpenImage(idx)}>
                        <img
                          src={getReviewImageUrl(img)}
                          alt={`Фото отзыва ${idx + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2274%22%20height%3D%2274%22%20viewBox%3D%220%200%2074%2074%22%3E%3Crect%20fill%3D%22%23F1F5F9%22%20width%3D%2274%22%20height%3D%2274%22%2F%3E%3Ctext%20fill%3D%22%2394A3B8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%D0%A4%D0%BE%D1%82%D0%BE%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                        />
                        {isLastThumb && (
                          <OverlayThumb>
                            +{remainingImagesCount + 1}
                          </OverlayThumb>
                        )}
                      </ImageThumb>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
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
