import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { getReviewImageUrl } from "../../../utils/reviewImage";

export default function ReviewMediaViewer({
  open,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
}) {
  if (!images || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];
  const url = getReviewImageUrl(currentImg);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      onIndexChange(images.length - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onIndexChange(0);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(10, 15, 20, 0.95)",
          backdropFilter: "blur(12px)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            color: "#fff",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {images.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 20,
            zIndex: 10,
          }}
        >
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
            {currentIndex + 1} / {images.length}
          </Typography>
        </Box>
      )}

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "450px",
          maxHeight: "80vh",
          position: "relative",
        }}
      >
        {images.length > 1 && (
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 16,
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)" },
              zIndex: 5,
            }}
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
        )}

        <Box
          component="img"
          src={url}
          alt="Фото отзыва"
          sx={{
            maxWidth: "100%",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: 1,
            userSelect: "none",
          }}
        />

        {images.length > 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 16,
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)" },
              zIndex: 5,
            }}
          >
            <ChevronRight fontSize="large" />
          </IconButton>
        )}
      </DialogContent>
    </Dialog>
  );
}
