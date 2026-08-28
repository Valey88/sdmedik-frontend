import React, { useState } from "react";
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
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload,
  Delete,
  AddLink,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
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
import { toast } from "react-toastify";

const DropzoneBox = styled(Box)(({ theme }) => ({
  border: "2px dashed #CBD5E1",
  borderRadius: "12px",
  padding: theme.spacing(2.5),
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: "#F8FAFC",
  "&:hover": {
    borderColor: "#1976D2",
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
}));

const PreviewThumb = styled(Box)(({ theme }) => ({
  width: "70px",
  height: "70px",
  borderRadius: "8px",
  overflow: "hidden",
  position: "relative",
  border: "1px solid #E2E8F0",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

export default function AdminCreateReviewModal({ open, onClose, onSuccess }) {
  const { adminCreateReview, uploadImage } = useReviewStore();

  const [authorName, setAuthorName] = useState("");
  const [authorContact, setAuthorContact] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [source, setSource] = useState("whatsapp");
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currentLinkInput, setCurrentLinkInput] = useState("");
  const [links, setLinks] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 8) {
      toast.warning("Максимум 8 изображений/скриншотов");
      return;
    }
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    setFilePreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveFile = (idx) => {
    const updated = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(updated);
    setFilePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setAuthorName("");
    setAuthorContact("");
    setRating(5);
    setText("");
    setSource("whatsapp");
    setReviewDate(new Date().toISOString().slice(0, 10));
    setLinks([]);
    setCurrentLinkInput("");
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorName.trim()) {
      toast.error("Укажите имя клиента");
      return;
    }
    if (!text.trim()) {
      toast.error("Укажите текст отзыва");
      return;
    }

    setSubmitting(true);
    try {
      const uploadedUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadImage(file);
        if (url) uploadedUrls.push(url);
      }

      await adminCreateReview({
        author_name: authorName.trim(),
        author_contact: authorContact.trim() || undefined,
        rating,
        text: text.trim(),
        source,
        review_date: reviewDate ? new Date(reviewDate) : undefined,
        links,
        image_urls: uploadedUrls,
      });

      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Admin create review error:", error);
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
        <Typography variant="h6" fontWeight={700} color="#1E293B">
          Добавить отзыв от клиента (из мессенджера)
        </Typography>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 1.5 }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                backgroundColor: "rgba(25, 118, 210, 0.06)",
                border: "1px solid rgba(25, 118, 210, 0.15)",
              }}
            >
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                💡 Отзыв, добавленный администратором, публикуется сразу на сайте со статусом <strong>«Одобрен» (без модерации)</strong>.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Source selection */}
              <FormControl fullWidth size="small">
                <InputLabel id="source-select-label">Источник отзыва *</InputLabel>
                <Select
                  labelId="source-select-label"
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Имя клиента *"
                variant="outlined"
                size="small"
                fullWidth
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Анна С."
                required
              />
              <TextField
                label="Телефон / Email клиента"
                variant="outlined"
                size="small"
                fullWidth
                value={authorContact}
                onChange={(e) => setAuthorContact(e.target.value)}
                placeholder="+7 (999) 000-00-00"
              />
            </Stack>

            {/* Rating Stars */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#334155">
                Оценка клиента:
              </Typography>
              <Rating
                value={rating}
                onChange={(e, val) => setRating(val || 5)}
                size="large"
                sx={{ color: "#FFB800" }}
              />
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
              placeholder="Вставьте скопированный отзыв клиента из переписки или диалога..."
              required
            />

            {/* Attached Links */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: "block", mb: 0.8 }}>
                Прикрепить ссылки (автоматически сокращаются):
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

            {/* Attached Images / Screenshots */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: "block", mb: 0.8 }}>
                Скриншоты переписки / Фото товара:
              </Typography>
              <input
                type="file"
                id="admin-review-photo-upload"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={submitting}
              />
              <label htmlFor="admin-review-photo-upload">
                <DropzoneBox>
                  <CloudUpload sx={{ fontSize: 32, color: "#1976D2", mb: 0.5 }} />
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    Загрузить скриншоты переписки или фото от клиента
                  </Typography>
                </DropzoneBox>
              </label>

              {filePreviews.length > 0 && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
                  {filePreviews.map((previewUrl, idx) => (
                    <PreviewThumb key={idx}>
                      <img src={previewUrl} alt={`Скриншот ${idx + 1}`} />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(idx)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          color: "#fff",
                          p: "2px",
                          "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.8)" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </PreviewThumb>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
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
              px: 3,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1565C0" },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Опубликовать отзыв"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
