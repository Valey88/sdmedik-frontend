import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Stack,
  Pagination,
  Button,
  Paper,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  NavigateNext,
  PhotoCamera,
  SentimentSatisfiedAlt,
  RateReview,
  Check,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import useReviewStore from "../../store/reviewStore";
import ReviewsSummary from "./components/ReviewsSummary";
import ReviewCard from "./components/ReviewCard";
import ReviewFormModal from "./components/ReviewFormModal";
import { SOURCE_CONFIGS } from "./components/SourceIcons";

export default function ReviewsPage() {
  const { reviews, total, stats, loading, fetchReviews } = useReviewStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [withPhotos, setWithPhotos] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // 9 reviews per page (exactly 3 rows of 3)
  const limit = 9;

  useEffect(() => {
    fetchReviews({
      page,
      limit,
      rating: ratingFilter || undefined,
      with_photos: withPhotos || undefined,
      source: sourceFilter || undefined,
      sort_by: sortBy,
    });
  }, [page, ratingFilter, withPhotos, sourceFilter, sortBy, fetchReviews]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleRatingSelect = (rating) => {
    setRatingFilter(rating);
    setPage(1);
  };

  // Client-side photo check filter for instant visual feedback
  const displayedReviews = useMemo(() => {
    if (!withPhotos) return reviews;
    return reviews.filter((r) => {
      const imgs = r.images || [];
      return (
        Array.isArray(imgs) &&
        imgs.some((img) => {
          const url = typeof img === "string" ? img : img?.url || img?.URL;
          return url && String(url).trim() !== "";
        })
      );
    });
  }, [reviews, withPhotos]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <Box sx={{ backgroundColor: "#F8FAFC", minHeight: "100vh", pb: 10 }}>
      {/* Top Breadcrumbs & Page Header Banner */}
      <Box sx={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0", py: 3.5, mb: 4 }}>
        <Container maxWidth="xl" sx={{ maxWidth: 1360, px: { xs: 2, sm: 3, md: 4 } }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 1.5 }}
          >
            <MuiLink component={Link} to="/" underline="hover" color="inherit">
              Главная
            </MuiLink>
            <Typography color="#26BDB8" fontWeight={600}>
              Отзывы
            </Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2.5,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                color="#0F172A"
                sx={{ fontSize: { xs: "1.75rem", sm: "2.1rem" }, letterSpacing: "-0.02em" }}
              >
                Отзывы покупателей
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.95rem" }}>
                Честные отзывы и впечатления наших клиентов о продукции и сервисе sdmedik
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RateReview />}
              onClick={() => setModalOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #26BDB8 0%, #1E9E9A 100%)",
                borderRadius: "12px",
                px: 3.5,
                py: 1.3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.95rem",
                boxShadow: "0 4px 16px rgba(38, 189, 184, 0.35)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  background: "linear-gradient(135deg, #1E9E9A 0%, #17837F 100%)",
                  boxShadow: "0 6px 20px rgba(38, 189, 184, 0.45)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Оставить отзыв
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ maxWidth: 1360, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Summary Rating Widget */}
        <ReviewsSummary
          stats={stats}
          total={total}
          selectedRating={ratingFilter}
          onSelectRating={handleRatingSelect}
          onOpenModal={() => setModalOpen(true)}
        />

        {/* Filter & Sort Bar */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            mb: 4,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left: Filter Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: "center" }}>
              <Chip
                label="Все отзывы"
                clickable
                onClick={() => {
                  setRatingFilter(0);
                  setSourceFilter("");
                  setWithPhotos(false);
                  setPage(1);
                }}
                sx={{
                  fontWeight: 600,
                  backgroundColor:
                    !ratingFilter && !sourceFilter && !withPhotos ? "#26BDB8" : "#F1F5F9",
                  color: !ratingFilter && !sourceFilter && !withPhotos ? "#fff" : "#334155",
                  border: !ratingFilter && !sourceFilter && !withPhotos ? "none" : "1px solid #E2E8F0",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                }}
              />

              {[
                { key: "max", label: "MAX (Макс)" },
                { key: "vk", label: "ВКонтакте" },
                { key: "telegram", label: "Telegram" },
                { key: "whatsapp", label: "WhatsApp" },
                { key: "yandex", label: "Яндекс" },
              ].map((item) => {
                const cfg = SOURCE_CONFIGS[item.key];
                const isSelected = sourceFilter === item.key;
                return (
                  <Chip
                    key={item.key}
                    icon={cfg.icon}
                    label={item.label}
                    clickable
                    onClick={() => {
                      setSourceFilter(isSelected ? "" : item.key);
                      setPage(1);
                    }}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: isSelected ? undefined : "#F1F5F9",
                      background: isSelected ? cfg.activeBg : undefined,
                      color: isSelected ? "#fff" : "#334155",
                      border: isSelected ? "none" : "1px solid #E2E8F0",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                      "& .MuiChip-icon": {
                        color: isSelected ? "#fff" : undefined,
                        ml: "6px",
                      },
                    }}
                  />
                );
              })}

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 0.5,
                  height: 26,
                  alignSelf: "center",
                  borderColor: "#CBD5E1",
                  display: { xs: "none", sm: "block" },
                }}
              />

              {/* Photo Filter Switch */}
              <Chip
                icon={
                  withPhotos ? (
                    <Check sx={{ fontSize: "16px !important", color: "#fff !important" }} />
                  ) : (
                    <PhotoCamera sx={{ fontSize: "16px !important" }} />
                  )
                }
                label={withPhotos ? "Только с фото" : "С фото"}
                clickable
                onClick={() => {
                  setWithPhotos(!withPhotos);
                  setPage(1);
                }}
                sx={{
                  fontWeight: 600,
                  backgroundColor: withPhotos ? "#0D9488" : "#F8FAFC",
                  color: withPhotos ? "#fff" : "#475569",
                  border: withPhotos ? "1px solid #0D9488" : "1px solid #CBD5E1",
                  boxShadow: withPhotos ? "0 2px 8px rgba(13, 148, 136, 0.25)" : "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: withPhotos ? "#0F766E" : "#F1F5F9",
                    transform: "translateY(-1px)",
                  },
                  "& .MuiChip-icon": {
                    color: withPhotos ? "#fff" : "#64748B",
                  },
                }}
              />
            </Stack>

            {/* Right: Sort Dropdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Сортировка:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <MenuItem value="newest">Сначала новые</MenuItem>
                  <MenuItem value="oldest">Сначала старые</MenuItem>
                  <MenuItem value="highest_rating">Высокая оценка</MenuItem>
                  <MenuItem value="lowest_rating">Низкая оценка</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {/* Reviews Grid: Exactly 3 cards per row on desktop (>=900px), 2 on tablet, 1 on mobile */}
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "18px",
                  border: "1px solid #E2E8F0",
                  height: 240,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={18} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
              </Paper>
            ))}
          </Box>
        ) : displayedReviews.length > 0 ? (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
              }}
            >
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    "& .Mui-selected": {
                      backgroundColor: "#26BDB8 !important",
                      color: "#fff",
                      fontWeight: 700,
                    },
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          /* Empty State */
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: "20px",
              border: "1px dashed #CBD5E1",
              backgroundColor: "#FFFFFF",
            }}
          >
            <SentimentSatisfiedAlt sx={{ fontSize: 60, color: "#94A3B8", mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700} color="#334155">
              Отзывов пока нет
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mt: 0.5, mb: 3 }}>
              {ratingFilter || sourceFilter || withPhotos
                ? "По выбранным фильтрам ничего не найдено."
                : "Станьте первым, кто поделится отзывом о покупках и сервисе sdmedik!"}
            </Typography>
            {ratingFilter || sourceFilter || withPhotos ? (
              <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
                {withPhotos && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setWithPhotos(false);
                      setPage(1);
                    }}
                    sx={{
                      borderColor: "#26BDB8",
                      color: "#26BDB8",
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      "&:hover": { borderColor: "#1E9E9A", backgroundColor: "rgba(38, 189, 184, 0.05)" },
                    }}
                  >
                    Показать отзывы без фото
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRatingFilter(0);
                    setSourceFilter("");
                    setWithPhotos(false);
                    setPage(1);
                  }}
                  sx={{
                    borderColor: "#94A3B8",
                    color: "#475569",
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  Сбросить все фильтры
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                startIcon={<RateReview />}
                onClick={() => setModalOpen(true)}
                sx={{
                  background: "linear-gradient(135deg, #26BDB8 0%, #1E9E9A 100%)",
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 3,
                }}
              >
                Написать первый отзыв
              </Button>
            )}
          </Paper>
        )}
      </Container>

      {/* Review Modal Form */}
      <ReviewFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchReviews({ page: 1, limit });
        }}
      />
    </Box>
  );
}
