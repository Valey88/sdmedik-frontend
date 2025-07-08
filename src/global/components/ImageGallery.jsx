import { Box, CardMedia, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

export default function ImageGallery({
  images,
  mainImageIndex,
  setMainImageIndex,
  onImageClick,
}) {
  const handleNextImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setMainImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <CardMedia
          component="img"
          image={images[mainImageIndex]}
          alt={`Изображение продукта ${mainImageIndex + 1}`}
          sx={{
            width: { xs: "100%", md: "400px" },
            height: { xs: "300px", md: "400px" },
            borderRadius: 2,
            objectFit: "contain",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
          onClick={onImageClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onImageClick();
            }
          }}
          aria-label="Увеличить изображение"
        />
        <IconButton
          onClick={handlePrevImage}
          sx={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            "&:hover": { backgroundColor: "#FFFFFF" },
          }}
          aria-label="Предыдущее изображение"
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={handleNextImage}
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            "&:hover": { backgroundColor: "#FFFFFF" },
          }}
          aria-label="Следующее изображение"
        >
          <ArrowForward />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mt: 2,
          flexWrap: "wrap",
        }}
      >
        {images.map((image, index) => (
          <Box
            key={index}
            onClick={() => setMainImageIndex(index)}
            sx={{
              border:
                mainImageIndex === index
                  ? "2px solid #00B3A4"
                  : "1px solid #E0E0E0",
              borderRadius: 1,
              overflow: "hidden",
              cursor: "pointer",
              width: "60px",
              height: "60px",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#00B3A4",
                transform: "scale(1.05)",
              },
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setMainImageIndex(index);
              }
            }}
            aria-label={`Выбрать изображение ${index + 1}`}
          >
            <CardMedia
              component="img"
              image={image}
              alt={`Миниатюра ${index + 1}`}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
