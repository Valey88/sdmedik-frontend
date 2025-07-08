import { Dialog, DialogContent, CardMedia, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Close } from "@mui/icons-material";

export default function ImageZoomDialog({
  open,
  onClose,
  images,
  zoomedImageIndex,
  setZoomedImageIndex,
}) {
  const handleNextImage = () => {
    setZoomedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setZoomedImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "auto",
          height: "auto",
          borderRadius: 2,
        },
      }}
      aria-labelledby="zoom-image-dialog"
    >
      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.9)",
        }}
      >
        <CardMedia
          component="img"
          image={images[zoomedImageIndex]}
          alt={`Увеличенное изображение ${zoomedImageIndex + 1}`}
          sx={{
            maxWidth: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
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
          aria-label="Предыдущее увеличенное изображение"
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
          aria-label="Следующее увеличенное изображение"
        >
          <ArrowForward />
        </IconButton>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255,255,255,0.9)",
            "&:hover": { backgroundColor: "#FFFFFF" },
          }}
          aria-label="Закрыть увеличенное изображение"
        >
          <Close />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
}
