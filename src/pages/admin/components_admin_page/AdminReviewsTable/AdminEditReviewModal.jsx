import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload,
  Delete,
  AddLink,
  Edit,
  PhotoLibrary,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import useReviewStore from "../../../../store/reviewStore";
import ShortLink from "../../../reviews/components/ShortLink";
import {
  MaxIcon,
  VkIcon,
  TelegramIcon,
  WhatsAppIcon,
  YandexIcon,
  SdmedikIcon,
  OtherIcon,
} from "../../../reviews/components/SourceIcons";
import { getReviewImageUrl } from "../../../../utils/reviewImage";
import { toast } from "react-toastify";

const DropzoneBox = styled(Box)(({ theme }) => ({
  border: "2px dashed #CBD5E1",
  borderRadius: "12px",
  padding: theme.spacing(2.5),
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: "#F8FAFC",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#1976D2",
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
}));

const ExistingThumb = styled(Box)(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "10px",
  overflow: "hidden",
  position: "relative",
  border: "1px solid #E2E8F0",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

const PreviewThumb = styled(Box)(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "10px",
  overflow: "hidden",
  position: "relative",
  border: "2px dashed #26BDB8",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

export default function AdminEditReviewModal({ open, onClose, review, onSuccess }) {
  const { adminUpdateReview, uploadImage } = useReviewStore();

  const [authorName, setAuthorName] = useState("");
  const [authorContact, setAuthorContact] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [source, setSource] = useState("website");
  const [status, setStatus] = useState("approved");
  const [reviewDate, setReviewDate] = useState("");
  const [currentLinkInput, setCurrentLinkInput] = useState("");
  const [links, setLinks] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (review && open) {
      setAuthorName(review.author_name || "");
      setAuthorContact(review.author_contact || "");
      setRating(review.rating || 5);
      setText(review.text || "");
      setSource(review.source || "website");
      setStatus(review.status || "approved");

      if (review.review_date) {
        try {
          const d = new Date(review.review_date);
          setReviewDate(d.toISOString().slice(0, 10));
        } catch (e) {
          setReviewDate(new Date().toISOString().slice(0, 10));
        }
      } else {
        setReviewDate(new Date().toISOString().slice(0, 10));
      }

      let parsedLinks = [];
      if (review.links) {
        try {
          parsedLinks =
            typeof review.links === "string"
              ? JSON.parse(review.links)
              : review.links;
          if (!Array.isArray(parsedLinks)) parsedLinks = [];
        } catch (e) {
          if (typeof review.links === "string" && review.links.trim()) {
            parsedLinks = [review.links.trim()];
          }
        }
      }
      setLinks(parsedLinks);

      const imgs = review.images || [];
      const normalizedImgs = imgs.map((img) => {
        if (typeof img === "string") return { url: img };
        return { id: img.id, url: img.url || img.URL };
      }).filter((img) => img.url);

      setExistingImages(normalizedImgs);
      setNewFiles([]);
      setNewPreviews([]);
      setCurrentLinkInput("");
    }
  }, [review, open]);

  const handleAddLink = () => {
    const trimmed = currentLinkInput.trim();
    if (!trimmed) return;
    if (!trimmed.includes(".")) {
      toast.warning("Пожалуйста, введите корректную ссылку");
      return;
    }
    if (links.includes(trimmed)) {
      toast.info("Эта ссылка уже добавлена");
      return;
    }
    setLinks([...links, trimmed]);
    setCurrentLinkInput("");
  };

  const handleRemoveLink = (idx) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages(existingImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + newFiles.length + files.length > 10) {
      toast.warning("Максимум 10 изображений для отзыва");
      return;
    }
    const updated = [...newFiles, ...files];
    setNewFiles(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveNewFile = (idx) => {
    const updatedFiles = newFiles.filter((_, i) => i !== idx);
    setNewFiles(updatedFiles);
    setNewPreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorName.trim()) {
      toast.error("Укажите имя автора");
      return;
    }
    if (!text.trim()) {
      toast.error("Укажите текст отзыва");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload new image files
      const uploadedUrls = [];
      for (const file of newFiles) {
        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      }

      // 2. Combine remaining existing image URLs + newly uploaded image URLs
      const finalImageUrls = [
        ...existingImages.map((img) => img.url),
        ...uploadedUrls,
      ];

      // 3. Send update request
      await adminUpdateReview(review.id, {
        author_name: authorName.trim(),
        author_contact: authorContact.trim() || undefined,
        rating: Number(rating) || 5,
        text: text.trim(),
        source,
        status,
        review_date: reviewDate ? new Date(reviewDate) : undefined,
        links,
        image_urls: finalImageUrls,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Admin edit review error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!submitting ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Edit sx={{ color: "#1976D2", fontSize: 24 }} />
          <Typography variant="h6" fontWeight={700} color="#1E293B">
            Редактирование отзыва
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 1.5 }}>
          <Stack spacing={2.5}>
            {/* Status & Source & Date Row */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Status */}
              <FormControl fullWidth size="small">
                <InputLabel id="edit-status-select-label">Статус модерации *</InputLabel>
                <Select
                  labelId="edit-status-select-label"
                  value={status}
                  label="Статус модерации *"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="approved">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label="Одобрен" size="small" color="success" sx={{ height: 20, fontSize: "0.75rem" }} />
                      (Виден на сайте)
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label="На модерации" size="small" color="warning" sx={{ height: 20, fontSize: "0.75rem" }} />
                      (Скрыт)
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label="Отклонен" size="small" color="error" sx={{ height: 20, fontSize: "0.75rem" }} />
                      (Скрыт)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Source */}
              <FormControl fullWidth size="small">
                <InputLabel id="edit-source-select-label">Источник отзыва *</InputLabel>
                <Select
                  labelId="edit-source-select-label"
                  value={source}
                  label="Источник отзыва *"
                  onChange={(e) => setSource(e.target.value)}
                >
                  <MenuItem value="max">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MaxIcon sx={{ fontSize: 18 }} /> МАКС (MAX)
                    </Box>
                  </MenuItem>
                  <MenuItem value="vk">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VkIcon sx={{ fontSize: 18 }} /> ВКонтакте
                    </Box>
                  </MenuItem>
                  <MenuItem value="whatsapp">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WhatsAppIcon sx={{ fontSize: 18 }} /> WhatsApp
                    </Box>
                  </MenuItem>
                  <MenuItem value="telegram">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TelegramIcon sx={{ fontSize: 18 }} /> Telegram
                    </Box>
                  </MenuItem>
                  <MenuItem value="yandex">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <YandexIcon sx={{ fontSize: 18 }} /> Яндекс Отзывы
                    </Box>
                  </MenuItem>
                  <MenuItem value="website">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SdmedikIcon sx={{ fontSize: 18 }} /> Сайт sdmedik
                    </Box>
                  </MenuItem>
                  <MenuItem value="other">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <OtherIcon sx={{ fontSize: 18 }} /> Другой источник
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Review Date */}
              <TextField
                label="Дата отзыва"
                type="date"
                size="small"
                fullWidth
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* Author Name & Contact */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Имя автора *"
                variant="outlined"
                size="small"
                fullWidth
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Иван Петров"
                required
              />
              <TextField
                label="Телефон / Email / Контакт"
                variant="outlined"
                size="small"
                fullWidth
                value={authorContact}
                onChange={(e) => setAuthorContact(e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </Stack>

            {/* Rating Stars */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#334155">
                Оценка отзыва:
              </Typography>
              <Rating
                value={Number(rating)}
                onChange={(e, val) => setRating(val || 5)}
                size="large"
                sx={{ color: "#FFB800" }}
              />
              <Typography variant="body2" fontWeight={700} color="#64748B">
                ({rating} из 5)
              </Typography>
            </Box>

            {/* Text of Review */}
            <TextField
              label="Текст отзыва *"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Полный текст отзыва..."
              required
            />

            {/* Attached Links */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: "block", mb: 0.8 }}>
                Прикрепленные ссылки:
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  placeholder="https://..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={currentLinkInput}
                  onChange={(e) => setCurrentLinkInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddLink}
                  startIcon={<AddLink />}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Добавить
                </Button>
              </Box>

              {links.length > 0 && (
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {links.map((link, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#F8FAFC",
                        p: 1,
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <ShortLink url={link} />
                      <IconButton size="small" onClick={() => handleRemoveLink(idx)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Photos & Images Management */}
            <Box sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0", backgroundColor: "#FAFAFA" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <PhotoLibrary sx={{ color: "#1976D2", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                  Управление фотографиями и скриншотами
                </Typography>
              </Box>

              {/* Current / Existing Images */}
              {existingImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: "block", mb: 1 }}>
                    Текущие фото ({existingImages.length}) — нажмите на корзину, чтобы удалить:
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    {existingImages.map((img, idx) => (
                      <ExistingThumb key={idx}>
                        <img
                          src={getReviewImageUrl(img.url)}
                          alt={`Фото ${idx + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20fill%3D%22%23F1F5F9%22%20width%3D%2280%22%20height%3D%2280%22%2F%3E%3Ctext%20fill%3D%22%2394A3B8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%D0%A4%D0%BE%D1%82%D0%BE%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                        />
                        <Tooltip title="Удалить это фото">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingImage(idx)}
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              backgroundColor: "rgba(220, 38, 38, 0.85)",
                              color: "#fff",
                              p: "3px",
                              "&:hover": { backgroundColor: "rgba(220, 38, 38, 1)" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </ExistingThumb>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Upload New Images */}
              <Box>
                <input
                  type="file"
                  id="admin-review-edit-photo-upload"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={submitting}
                />
                <label htmlFor="admin-review-edit-photo-upload">
                  <DropzoneBox>
                    <CloudUpload sx={{ fontSize: 32, color: "#1976D2", mb: 0.5 }} />
                    <Typography variant="body2" fontWeight={600} color="#334155">
                      Добавить новые фотографии или скриншоты
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Нажмите для выбора файлов с компьютера
                    </Typography>
                  </DropzoneBox>
                </label>

                {/* Previews of newly selected files */}
                {newPreviews.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="#0D9488" sx={{ display: "block", mb: 1 }}>
                      Новые фото к загрузке ({newPreviews.length}):
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                      {newPreviews.map((previewUrl, idx) => (
                        <PreviewThumb key={idx}>
                          <img src={previewUrl} alt={`Новое фото ${idx + 1}`} />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveNewFile(idx)}
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              backgroundColor: "rgba(0, 0, 0, 0.65)",
                              color: "#fff",
                              p: "2px",
                              "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.85)" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </PreviewThumb>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button onClick={onClose} disabled={submitting} sx={{ color: "text.secondary", textTransform: "none" }}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: "#1976D2",
              borderRadius: "8px",
              px: 3.5,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1565C0" },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Сохранить изменения"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
