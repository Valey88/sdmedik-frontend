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
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload,
  Delete,
  AddLink,
  Star,
  CheckCircle,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import useUserStore from "../../../store/userStore";
import useReviewStore from "../../../store/reviewStore";
import ShortLink from "./ShortLink";
import { toast } from "react-toastify";

const DropzoneBox = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? "#26BDB8" : "#CBD5E1"}`,
  borderRadius: "14px",
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: isDragActive ? "rgba(38, 189, 184, 0.05)" : "#F8FAFC",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: "#26BDB8",
    backgroundColor: "rgba(38, 189, 184, 0.03)",
  },
}));

const PreviewThumb = styled(Box)(({ theme }) => ({
  width: "75px",
  height: "75px",
  borderRadius: "10px",
  overflow: "hidden",
  position: "relative",
  border: "1px solid #E2E8F0",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

export default function ReviewFormModal({ open, onClose, onSuccess }) {
  const { user } = useUserStore();
  const { createReview, uploadImage } = useReviewStore();

  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [authorContact, setAuthorContact] = useState("");
  const [text, setText] = useState("");
  const [currentLinkInput, setCurrentLinkInput] = useState("");
  const [links, setLinks] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Prepopulate author name if user is logged in
  useEffect(() => {
    if (user?.data?.fio) {
      setAuthorName(user.data.fio);
    } else if (user?.data?.email) {
      setAuthorName(user.data.email.split("@")[0]);
    }
  }, [user, open]);

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

  const handleRemoveLink = (indexToRemove) => {
    setLinks(links.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast.warning("Максимум 5 фотографий к отзыву");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create object URLs for previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(updatedPreviews);
  };

  const resetForm = () => {
    setRating(5);
    setText("");
    setLinks([]);
    setCurrentLinkInput("");
    setSelectedFiles([]);
    setFilePreviews([]);
    setConsent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorName.trim()) {
      toast.error("Пожалуйста, укажите ваше имя");
      return;
    }
    if (!text.trim() || text.trim().length < 3) {
      toast.error("Пожалуйста, напишите текст отзыва (минимум 3 символа)");
      return;
    }
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload files if any
      const uploadedImageUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadImage(file);
        if (url) {
          uploadedImageUrls.push(url);
        }
      }

      // 2. Submit review
      await createReview({
        author_name: authorName.trim(),
        author_contact: authorContact.trim() || undefined,
        rating,
        text: text.trim(),
        links,
        image_urls: uploadedImageUrls,
      });

      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Submit review error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!submitting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
        },
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
          Оставить отзыв
        </Typography>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 1.5 }}>
          {/* Star Rating Picker */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
              mb: 2,
              backgroundColor: "rgba(38, 189, 184, 0.05)",
              borderRadius: "14px",
              border: "1px solid rgba(38, 189, 184, 0.15)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} color="#334155" sx={{ mb: 1 }}>
              Ваша общая оценка:
            </Typography>
            <Rating
              name="review-rating"
              value={rating}
              onChange={(e, val) => setRating(val || 5)}
              size="large"
              sx={{
                fontSize: "2.3rem",
                color: "#FFB800",
                "& .MuiRating-iconFilled": { color: "#FFB800" },
              }}
            />
          </Box>

          <Stack spacing={2.2}>
            {/* Author Name */}
            <TextField
              label="Ваше имя *"
              variant="outlined"
              size="small"
              fullWidth
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Иван Иванов"
              required
            />

            {/* Author Contact */}
            <TextField
              label="Email или телефон (не публикуется)"
              variant="outlined"
              size="small"
              fullWidth
              value={authorContact}
              onChange={(e) => setAuthorContact(e.target.value)}
              placeholder="Для обратной связи"
              helperText="Контакт виден только администратору"
            />

            {/* Review Text */}
            <TextField
              label="Текст отзыва *"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Поделитесь вашим впечатлением о сервисе, покупке или доставке..."
              required
            />

            {/* Link Attachment Section */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: "block", mb: 0.8 }}>
                Прикрепить ссылки (сократятся автоматически):
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
                  sx={{
                    borderColor: "#26BDB8",
                    color: "#26BDB8",
                    textTransform: "none",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    "&:hover": { borderColor: "#1E9E9A", backgroundColor: "rgba(38, 189, 184, 0.05)" },
                  }}
                >
                  Добавить
                </Button>
              </Box>

              {/* Added links preview */}
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
                        borderRadius: "10px",
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

            {/* Photo Upload Section */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: "block", mb: 0.8 }}>
                Прикрепить фотографии (до 5 шт.):
              </Typography>
              <input
                type="file"
                id="review-photo-upload"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={submitting || selectedFiles.length >= 5}
              />
              <label htmlFor="review-photo-upload">
                <DropzoneBox>
                  <CloudUpload sx={{ fontSize: 36, color: "#26BDB8", mb: 0.5 }} />
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    Нажмите для выбора фотографий
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG, WebP до 10 МБ
                  </Typography>
                </DropzoneBox>
              </label>

              {/* File Previews */}
              {filePreviews.length > 0 && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
                  {filePreviews.map((previewUrl, idx) => (
                    <PreviewThumb key={idx}>
                      <img src={previewUrl} alt={`Превью ${idx + 1}`} />
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
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </PreviewThumb>
                  ))}
                </Stack>
              )}
            </Box>

            {/* FZ-152 Consent */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  color="primary"
                  sx={{ color: "#26BDB8", "&.Mui-checked": { color: "#26BDB8" } }}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности
                </Typography>
              }
            />
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
              background: "linear-gradient(135deg, #26BDB8 0%, #1E9E9A 100%)",
              color: "#FFFFFF",
              borderRadius: "10px",
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(38, 189, 184, 0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #1E9E9A 0%, #17837F 100%)",
              },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Отправить отзыв"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
