import React from "react";
import {
  Box,
  Paper,
  Typography,
  Rating,
  LinearProgress,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import { RateReview, Star } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  padding: theme.spacing(3.5),
  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
  border: "1px solid #E2E8F0",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.5),
  },
}));

const CustomLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: "#E2E8F0",
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    backgroundColor: "#26BDB8",
  },
}));

const StarBarRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(38, 189, 184, 0.08)",
  },
}));

export default function ReviewsSummary({
  stats,
  total,
  onOpenModal,
  selectedRating,
  onSelectRating,
}) {
  const avgRating = stats?.average_rating || 5.0;
  const totalCount = stats?.total_reviews || total || 0;
  const ratingCounts = stats?.rating_counts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const stars = [5, 4, 3, 2, 1];

  return (
    <StyledPaper elevation={0}>
      <Grid container spacing={3} alignItems="center">
        {/* Left: Overall Score */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
              pr: { md: 2 },
            }}
          >
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                color: "#1E293B",
                fontSize: { xs: "3rem", md: "3.5rem" },
                lineHeight: 1,
                mb: 1,
              }}
            >
              {avgRating.toFixed(1)}
            </Typography>
            <Rating
              value={avgRating}
              precision={0.1}
              readOnly
              size="large"
              sx={{
                color: "#FFB800",
                mb: 1,
                "& .MuiRating-iconFilled": { color: "#FFB800" },
              }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              На основе {totalCount} {totalCount === 1 ? "отзыва" : "отзывов"} клиентов
            </Typography>

            <Button
              variant="contained"
              startIcon={<RateReview />}
              onClick={onOpenModal}
              sx={{
                mt: 2.5,
                background: "linear-gradient(135deg, #26BDB8 0%, #1E9E9A 100%)",
                color: "#FFFFFF",
                borderRadius: "12px",
                px: 3,
                py: 1.2,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.95rem",
                boxShadow: "0 4px 14px rgba(38, 189, 184, 0.35)",
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
        </Grid>

        {/* Right: Star Breakdown Progress Bars */}
        <Grid item xs={12} md={8}>
          <Box sx={{ pl: { md: 2 }, borderLeft: { md: "1px solid #E2E8F0" } }}>
            <Stack spacing={1}>
              {stars.map((star) => {
                const count = ratingCounts[star] || 0;
                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                const isSelected = selectedRating === star;

                return (
                  <StarBarRow
                    key={star}
                    onClick={() => onSelectRating(isSelected ? 0 : star)}
                    sx={{
                      backgroundColor: isSelected ? "rgba(38, 189, 184, 0.12)" : "transparent",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", width: 45, gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#334155">
                        {star}
                      </Typography>
                      <Star sx={{ fontSize: 16, color: "#FFB800" }} />
                    </Box>

                    <Box sx={{ flexGrow: 1, mx: 1 }}>
                      <CustomLinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: isSelected ? "#1E9E9A" : "#26BDB8",
                          },
                        }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ width: 45, textAlign: "right" }}
                    >
                      {count}
                    </Typography>
                  </StarBarRow>
                );
              })}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </StyledPaper>
  );
}
