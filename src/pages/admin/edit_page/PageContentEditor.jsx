import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Container,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  InputAdornment,
  Tooltip,
  Chip,
  Alert,
  AlertTitle,
  Stack,
} from "@mui/material";

// Иконки
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LinkIcon from "@mui/icons-material/Link";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import MapIcon from "@mui/icons-material/Map";

// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Toast & API
import { toast } from "react-toastify";
import api from "../../../configs/axiosConfig";

// === Стили для TipTap ===
const editorStyles = {
  border: "1px solid #c4c4c4",
  borderRadius: "4px",
  padding: "16px",
  minHeight: "150px",
  "& .ProseMirror": {
    outline: "none",
    minHeight: "150px",
  },
  "& .ProseMirror p.is-editor-empty:first-child::before": {
    content: "attr(data-placeholder)",
    float: "left",
    color: "#adb5bd",
    pointerEvents: "none",
    height: 0,
  },
};

// =========================================================================
// === КОМПОНЕНТ ДЛЯ ОДНОГО СЛАЙДА ===
// =========================================================================
const SlideItem = ({
  slide,
  index,
  totalSlides,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/blog/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(index, "url", response.data.data);
      toast.success("Изображение загружено!");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка загрузки изображения");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      sx={{
        mb: 2.5,
        position: "relative",
        overflow: "hidden",
        border: isDragOver ? "2px dashed #00B3A4" : "1px solid #e0e0e0",
        backgroundColor: isDragging ? "#f0fbf9" : "#ffffff",
        opacity: isDragging ? 0.5 : 1,
        transition: "border 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
        boxShadow: isDragging
          ? "0 8px 24px rgba(0, 179, 164, 0.25)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
          bgcolor: "#f8f9fa",
          borderBottom: "1px solid #eee",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="Зажмите и перетащите для изменения порядка">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "grab",
                "&:active": { cursor: "grabbing" },
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
          </Tooltip>
          <Chip
            label={`Слайд #${index + 1}`}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
          />
          {slide.link && (
            <Tooltip title={`Ссылка: ${slide.link}`}>
              <Chip
                icon={<LinkIcon fontSize="small" />}
                label={slide.link}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{
                  maxWidth: 220,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Переместить выше">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                color="primary"
                sx={{
                  bgcolor: index === 0 ? "transparent" : "rgba(0, 179, 164, 0.08)",
                  "&:hover": { bgcolor: "rgba(0, 179, 164, 0.2)" },
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Переместить ниже">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveDown(index)}
                disabled={index === totalSlides - 1}
                color="primary"
                sx={{
                  bgcolor:
                    index === totalSlides - 1
                      ? "transparent"
                      : "rgba(0, 179, 164, 0.08)",
                  "&:hover": { bgcolor: "rgba(0, 179, 164, 0.2)" },
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Удалить слайд">
            <IconButton
              onClick={() => onRemove(index)}
              size="small"
              color="error"
              sx={{
                bgcolor: "rgba(211, 47, 47, 0.08)",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.2)" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ pt: 2, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип</InputLabel>
              <Select
                value={slide.type || "image"}
                label="Тип"
                onChange={(e) => onChange(index, "type", e.target.value)}
              >
                <MenuItem value="image">Картинка</MenuItem>
                <MenuItem value="video">Видео</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={9}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*,video/*"
              onChange={handleFileChange}
            />

            <TextField
              fullWidth
              size="small"
              label="URL файла"
              value={slide.url || ""}
              onChange={(e) => onChange(index, "url", e.target.value)}
              placeholder="/images/banner.jpg"
              disabled={isUploading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isUploading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Tooltip title="Загрузить файл с компьютера">
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <CloudUploadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {slide.type === "image" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Alt текст (описание)"
                value={slide.alt || ""}
                onChange={(e) => onChange(index, "alt", e.target.value)}
                placeholder="Например: Баннер акции или описание картинки"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Ссылка при клике на слайд (URL)"
              value={slide.link || ""}
              onChange={(e) => onChange(index, "link", e.target.value)}
              placeholder="Например: /certificate или /catalog или https://..."
              helperText="Куда перенаправлять пользователя при нажатии на слайд"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {slide.url && (
          <Box
            sx={{
              mt: 2,
              height: 120,
              bgcolor: "#f7f9fa",
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "1px dashed #ccc",
            }}
          >
            {slide.type === "video" ? (
              <video
                src={slide.url}
                style={{ maxHeight: "100%", maxWidth: "100%" }}
                controls
                muted
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.alt || "preview"}
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// =========================================================================
// === ОБЩИЙ РЕДАКТОР СЛАЙДЕРОВ ===
// =========================================================================
const SliderEditor = ({ value, onChange }) => {
  const [slides, setSlides] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    try {
      if (value) {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (Array.isArray(parsed)) setSlides(parsed);
      } else {
        setSlides([]);
      }
    } catch (e) {
      setSlides([]);
    }
  }, [value]);

  const updateParent = (newSlides) => {
    setSlides(newSlides);
    onChange(JSON.stringify(newSlides));
  };

  const addSlide = () => {
    updateParent([...slides, { type: "image", url: "", alt: "", link: "" }]);
  };

  const removeSlide = (index) => {
    updateParent(slides.filter((_, i) => i !== index));
  };

  const handleChangeSlide = (index, field, val) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: val };
    updateParent(newSlides);
  };

  const moveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= slides.length || fromIndex === toIndex) return;
    const updated = [...slides];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    updateParent(updated);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveSlide(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        p: 2.5,
        borderRadius: 2,
        bgcolor: "#fcfcfc",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ViewCarouselIcon /> 📸 Управление слайдами
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Всего слайдов: <strong>{slides.length}</strong>
        </Typography>
      </Box>

      {slides.length === 0 && (
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 2, py: 2 }}
        >
          Слайдов пока нет. Добавьте первый слайд.
        </Typography>
      )}

      {slides.map((slide, i) => (
        <SlideItem
          key={i}
          index={i}
          totalSlides={slides.length}
          slide={slide}
          onChange={handleChangeSlide}
          onRemove={removeSlide}
          onMoveUp={(idx) => moveSlide(idx, idx - 1)}
          onMoveDown={(idx) => moveSlide(idx, idx + 1)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          isDragging={draggedIndex === i}
          isDragOver={dragOverIndex === i}
        />
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addSlide}
        fullWidth
        sx={{
          borderStyle: "dashed",
          py: 1.2,
          fontWeight: 600,
          "&:hover": { borderStyle: "dashed" },
        }}
      >
        Добавить слайд
      </Button>
    </Box>
  );
};

// =========================================================================
// === РЕДАКТОР СПИСКА НОМЕРОВ ТЕЛЕФОНОВ (PhoneListEditor) ===
// =========================================================================
const PhoneListEditor = ({ value, onChange }) => {
  const [phones, setPhones] = useState([]);

  useEffect(() => {
    try {
      if (value) {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (Array.isArray(parsed)) {
          setPhones(
            parsed.map((p, idx) =>
              typeof p === "string"
                ? { id: `phone-${idx}`, phone: p, label: "", note: "" }
                : {
                    id: p.id || `phone-${idx}`,
                    phone: p.phone || "",
                    label: p.label || "",
                    note: p.note || "",
                  }
            )
          );
          return;
        }
      }
      setPhones([]);
    } catch (e) {
      setPhones([]);
    }
  }, [value]);

  const updateParent = (newPhones) => {
    setPhones(newPhones);
    onChange(JSON.stringify(newPhones));
  };

  const addPhone = () => {
    const newPhones = [
      ...phones,
      {
        id: `phone-${Date.now()}`,
        phone: "",
        label: "",
        note: "",
      },
    ];
    updateParent(newPhones);
  };

  const removePhone = (index) => {
    updateParent(phones.filter((_, i) => i !== index));
  };

  const handleChangePhone = (index, field, val) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: val };
    updateParent(newPhones);
  };

  const movePhone = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= phones.length || fromIndex === toIndex) return;
    const updated = [...phones];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateParent(updated);
  };

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        p: 2.5,
        borderRadius: 2,
        bgcolor: "#fcfcfc",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ContactPhoneIcon /> 📞 Номера телефонов (Контакты)
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Всего телефонов: <strong>{phones.length}</strong>
        </Typography>
      </Box>

      {phones.length === 0 && (
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 2, py: 2 }}
        >
          Номеров телефонов пока нет. Добавьте первый номер.
        </Typography>
      )}

      {phones.map((item, index) => (
        <Card
          key={item.id || index}
          sx={{
            mb: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 0.8,
              bgcolor: "#f8f9fa",
              borderBottom: "1px solid #eee",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`Телефон #${index + 1}`}
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
              {item.label && (
                <Chip
                  label={item.label}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Выше">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => movePhone(index, index - 1)}
                    disabled={index === 0}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Ниже">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => movePhone(index, index + 1)}
                    disabled={index === phones.length - 1}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Удалить номер">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removePhone(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Номер телефона"
                  value={item.phone || ""}
                  onChange={(e) =>
                    handleChangePhone(index, "phone", e.target.value)
                  }
                  placeholder="+7 (903) 086 3091"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Подпись / Назначение (опционально)"
                  value={item.label || ""}
                  onChange={(e) =>
                    handleChangePhone(index, "label", e.target.value)
                  }
                  placeholder="Например: Единая справочная, Отдел продаж, Оренбург"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addPhone}
        fullWidth
        sx={{
          borderStyle: "dashed",
          py: 1.2,
          fontWeight: 600,
          "&:hover": { borderStyle: "dashed" },
        }}
      >
        Добавить номер телефона
      </Button>
    </Box>
  );
};

// =========================================================================
// === РЕДАКТОР СПИСКА АДРЕСОВ И ТОЧЕК САМОВЫВОЗА (AddressListEditor) ===
// =========================================================================
const AddressListEditor = ({ value, onChange }) => {
  const [addresses, setAddresses] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    try {
      if (value) {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (Array.isArray(parsed)) {
          setAddresses(
            parsed.map((item, idx) => {
              let coords = [55.751574, 37.573856];
              if (Array.isArray(item.coords) && item.coords.length >= 2) {
                coords = [Number(item.coords[0]) || 0, Number(item.coords[1]) || 0];
              } else if (item.lat !== undefined && item.lng !== undefined) {
                coords = [Number(item.lat) || 0, Number(item.lng) || 0];
              }
              return {
                id: item.id || `addr-${idx}`,
                city: item.city || "",
                title: item.title || "",
                address: item.address || "",
                phone: item.phone || "",
                schedule: item.schedule || "",
                coords: coords,
              };
            })
          );
          return;
        }
      }
      setAddresses([]);
    } catch (e) {
      setAddresses([]);
    }
  }, [value]);

  const updateParent = (newAddresses) => {
    setAddresses(newAddresses);
    onChange(JSON.stringify(newAddresses));
  };

  const addAddress = () => {
    const newAddresses = [
      ...addresses,
      {
        id: `addr-${Date.now()}`,
        city: "",
        title: "",
        address: "",
        phone: "",
        schedule: "",
        coords: [55.751574, 37.573856],
      },
    ];
    updateParent(newAddresses);
  };

  const removeAddress = (index) => {
    updateParent(addresses.filter((_, i) => i !== index));
  };

  const handleChangeField = (index, field, val) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: val };
    updateParent(newAddresses);
  };

  const handleChangeCoord = (index, coordIndex, val) => {
    const newAddresses = [...addresses];
    const coords = [...(newAddresses[index].coords || [55.751574, 37.573856])];
    coords[coordIndex] = parseFloat(val) || 0;
    newAddresses[index] = { ...newAddresses[index], coords };
    updateParent(newAddresses);
  };

  const moveAddress = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= addresses.length || fromIndex === toIndex)
      return;
    const updated = [...addresses];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateParent(updated);
  };

  // Drag and drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveAddress(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        p: 2.5,
        borderRadius: 2,
        bgcolor: "#fcfcfc",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <MapIcon /> 📍 Адреса и пункты выдачи (Яндекс.Карта)
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Всего адресов: <strong>{addresses.length}</strong>
        </Typography>
      </Box>

      {addresses.length === 0 && (
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 2, py: 2 }}
        >
          Адресов пока нет. Нажмите кнопку ниже, чтобы добавить первый адрес.
        </Typography>
      )}

      {addresses.map((item, index) => (
        <Card
          key={item.id || index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={() => {
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          sx={{
            mb: 2.5,
            border:
              dragOverIndex === index
                ? "2px dashed #00B3A4"
                : "1px solid #e0e0e0",
            backgroundColor: draggedIndex === index ? "#f0fbf9" : "#ffffff",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* Заголовок карточки адреса */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
              bgcolor: "#f8f9fa",
              borderBottom: "1px solid #eee",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Tooltip title="Зажмите и перетащите мышкой для сортировки">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "grab",
                    "&:active": { cursor: "grabbing" },
                    color: "text.secondary",
                  }}
                >
                  <DragIndicatorIcon fontSize="small" />
                </Box>
              </Tooltip>
              <Chip
                label={`Адрес #${index + 1}`}
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
              {item.city && (
                <Chip
                  label={item.city}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ fontWeight: 600 }}
                />
              )}
              {item.title && (
                <Chip
                  label={item.title}
                  size="small"
                  variant="outlined"
                  color="default"
                />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Переместить выше">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => moveAddress(index, index - 1)}
                    disabled={index === 0}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Переместить ниже">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => moveAddress(index, index + 1)}
                    disabled={index === addresses.length - 1}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Удалить этот адрес">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeAddress(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Город / Населенный пункт"
                  value={item.city || ""}
                  onChange={(e) =>
                    handleChangeField(index, "city", e.target.value)
                  }
                  placeholder="Например: г. Оренбург"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Название филиала / Тип"
                  value={item.title || ""}
                  onChange={(e) =>
                    handleChangeField(index, "title", e.target.value)
                  }
                  placeholder="Например: Магазин - Склад"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Телефон филиала"
                  value={item.phone || ""}
                  onChange={(e) =>
                    handleChangeField(index, "phone", e.target.value)
                  }
                  placeholder="+7 (3532) 93-52-41"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  label="Улица, дом, строение, ориентир"
                  value={item.address || ""}
                  onChange={(e) =>
                    handleChangeField(index, "address", e.target.value)
                  }
                  placeholder="ул. Шевченко д. 20 «В»"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Режим работы"
                  value={item.schedule || ""}
                  onChange={(e) =>
                    handleChangeField(index, "schedule", e.target.value)
                  }
                  placeholder="с пн по пт с 9 до 18:00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Координаты для карты */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f9fbfb",
                    borderRadius: 1.5,
                    border: "1px dashed #b2dfdb",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block", mb: 1, fontWeight: "bold" }}
                  >
                    🎯 Координаты для Яндекс.Карты (Широта и Долгота):
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ step: "any" }}
                        label="Широта (Latitude)"
                        value={item.coords ? item.coords[0] : 55.751574}
                        onChange={(e) =>
                          handleChangeCoord(index, 0, e.target.value)
                        }
                        placeholder="51.798286"
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ step: "any" }}
                        label="Долгота (Longitude)"
                        value={item.coords ? item.coords[1] : 37.573856}
                        onChange={(e) =>
                          handleChangeCoord(index, 1, e.target.value)
                        }
                        placeholder="55.111328"
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        Текущие: [{item.coords ? item.coords[0] : 0},{" "}
                        {item.coords ? item.coords[1] : 0}]
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addAddress}
        fullWidth
        sx={{
          borderStyle: "dashed",
          py: 1.2,
          fontWeight: 600,
          "&:hover": { borderStyle: "dashed" },
        }}
      >
        Добавить новый адрес
      </Button>
    </Box>
  );
};

// =========================================================================
// === КОМПОНЕНТ TIPTAP ===
// =========================================================================
const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <Box sx={{ border: "1px solid #c4c4c4", borderRadius: 1 }}>
      <Box
        sx={{
          borderBottom: "1px solid #e0e0e0",
          p: 1,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          bgcolor: "#f8f9fa",
        }}
      >
        <ToggleButtonGroup size="small" exclusive>
          <ToggleButton
            value="bold"
            selected={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon />
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon />
          </ToggleButton>
          <ToggleButton
            value="h2"
            selected={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <TitleIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <ToggleButtonGroup size="small" exclusive>
          <ToggleButton
            value="bulletList"
            selected={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulletedIcon />
          </ToggleButton>
          <ToggleButton
            value="orderedList"
            selected={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumberedIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <HorizontalRuleIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <RedoIcon />
        </IconButton>
      </Box>

      <Box sx={editorStyles}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

// =========================================================================
// === ГЛАВНЫЙ КОМПОНЕНТ РЕДАКТОРА СТРАНИЦ ===
// =========================================================================
const pages = [
  { path: "/main", name: "Главная" },
  { path: "/certificate", name: "Электронные сертификаты" },
  { path: "/contacts", name: "Контакты" },
  { path: "/deteils", name: "Реквизиты" },
  { path: "/about", name: "О нас" },
  { path: "/delivery", name: "Доставка" },
  { path: "/returnpolicy", name: "Политика возврата" },
];

export default function PageContentEditor() {
  const [pagePath, setPagePath] = useState("");
  const [pageContent, setPageContent] = useState([]);
  const [deletedElementIds, setDeletedElementIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [originalContent, setOriginalContent] = useState([]);

  // Определение режима редактора
  const detectEditorMode = (elementId, value) => {
    if (elementId === "contacts-addresses" || elementId === "addresses") {
      return "addresses";
    }
    if (elementId === "contacts-phones" || elementId === "phones") {
      return "phones";
    }
    if (elementId === "main-slider" || elementId === "slider") {
      return "slider";
    }

    if (value && typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          if (first.url !== undefined) return "slider";
          if (first.phone !== undefined && first.address === undefined)
            return "phones";
          if (
            first.city !== undefined ||
            first.address !== undefined ||
            first.coords !== undefined
          )
            return "addresses";
        }
      } catch (e) {}
    }

    return "text";
  };

  useEffect(() => {
    if (!pagePath) {
      setPageContent([]);
      setOriginalContent([]);
      setDeletedElementIds([]);
      return;
    }

    const fetchPageContent = async () => {
      setIsFetching(true);
      setDeletedElementIds([]);
      try {
        const response = await api.get(`/page${pagePath}`);
        const data = Array.isArray(response.data?.data?.elements)
          ? response.data.data.elements
          : [];
        const pageName = pagePath.startsWith("/")
          ? pagePath.slice(1)
          : pagePath;

        const newContent =
          data.length > 0
            ? data.map((item) => ({
                id: item.id || "",
                element_id: item.element_id || "",
                page_path: item.page_path || pageName,
                value: item.value || "",
                editorMode: detectEditorMode(item.element_id, item.value),
              }))
            : [
                {
                  id: "",
                  element_id: "",
                  page_path: pageName,
                  value: "",
                  editorMode: "text",
                },
              ];

        setPageContent(newContent);
        setOriginalContent(newContent);
      } catch (error) {
        console.error(error);
        setPageContent([
          {
            id: "",
            element_id: "",
            page_path: pagePath.startsWith("/") ? pagePath.slice(1) : pagePath,
            value: "",
            editorMode: "text",
          },
        ]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPageContent();
  }, [pagePath]);

  const handleFieldChange = (index, field, value) => {
    setPageContent((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleChangeEditorMode = (index, newMode) => {
    setPageContent((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        let newValue = item.value;
        // Если переключаем на слайдер/списки, а там была пустая строка или html
        if (newMode === "slider" && (!newValue || !newValue.startsWith("["))) {
          newValue = JSON.stringify([]);
        } else if (
          newMode === "phones" &&
          (!newValue || !newValue.startsWith("["))
        ) {
          newValue = JSON.stringify([]);
        } else if (
          newMode === "addresses" &&
          (!newValue || !newValue.startsWith("["))
        ) {
          newValue = JSON.stringify([]);
        }
        return { ...item, editorMode: newMode, value: newValue };
      })
    );
  };

  const handleAddElement = (type = "text", customId = "") => {
    if (!pagePath) return;
    const pageName = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
    setPageContent((prev) => [
      ...prev,
      {
        id: "",
        element_id: customId,
        page_path: pageName,
        value: type === "text" ? "" : JSON.stringify([]),
        editorMode: type,
      },
    ]);
  };

  const handleDeleteElement = (index) => {
    const itemToDelete = pageContent[index];
    if (itemToDelete && itemToDelete.element_id) {
      setDeletedElementIds((prev) => [...prev, itemToDelete.element_id]);
    }
    const newContent = pageContent.filter((_, i) => i !== index);
    setPageContent(newContent);
  };

  // Проверка наличия старых контактов для миграции
  const hasLegacyContacts =
    pagePath === "/contacts" &&
    pageContent.some(
      (item) =>
        item.element_id.startsWith("address-") ||
        item.element_id.startsWith("coords-") ||
        item.element_id.startsWith("phone-")
    ) &&
    !pageContent.some((item) => item.element_id === "contacts-addresses");

  // Функция конвертации старых полей контактов в динамические списки
  const handleMigrateContacts = () => {
    const pageName = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;

    // Собираем координаты
    const coordsMap = {};
    pageContent.forEach((item) => {
      if (item.element_id.startsWith("coords-")) {
        try {
          coordsMap[item.element_id.replace("coords-", "")] = JSON.parse(
            item.value
          );
        } catch (e) {}
      }
    });

    // Собираем адреса
    const addresses = [];
    const legacyIdsToDelete = [];

    pageContent.forEach((item) => {
      if (item.element_id.startsWith("address-")) {
        legacyIdsToDelete.push(item.element_id);
        const idx = item.element_id.replace("address-", "");
        const rawHtml = item.value || "";
        const parts = rawHtml.split("<br>").map((s) => s.replace(/<[^>]+>/g, "").trim());
        const fullAddress = parts[0] || "";
        const phone = parts[1] || "";

        let city = "";
        let addr = fullAddress;
        let title = "";

        if (fullAddress.includes(",")) {
          const splitAddr = fullAddress.split(",");
          city = splitAddr[0]?.trim() || "";
          addr = splitAddr.slice(1).join(",").trim();
        }

        addresses.push({
          id: `addr-${idx}`,
          city: city,
          title: title,
          address: addr,
          phone: phone,
          schedule: fullAddress.includes("режим работы") ? "с пн по пт с 9 до 18:00" : "",
          coords: coordsMap[idx] || [55.751574, 37.573856],
        });
      } else if (item.element_id.startsWith("coords-")) {
        legacyIdsToDelete.push(item.element_id);
      }
    });

    // Собираем телефоны
    const phones = [];
    pageContent.forEach((item) => {
      if (item.element_id.startsWith("phone-")) {
        legacyIdsToDelete.push(item.element_id);
        const cleanPhone = (item.value || "").replace(/<[^>]+>/g, "").trim();
        if (cleanPhone) {
          phones.push({
            id: `phone-${phones.length + 1}`,
            phone: cleanPhone,
            label: phones.length === 0 ? "Единая справочная" : "Отдел продаж",
            note: "",
          });
        }
      }
    });

    // Оставляем остальные элементы (page-title, main-heading, meta-*)
    const remainingElements = pageContent.filter(
      (item) => !legacyIdsToDelete.includes(item.element_id)
    );

    // Добавляем новые элементы
    const newBlocks = [
      ...remainingElements,
      {
        id: "",
        element_id: "contacts-phones",
        page_path: pageName,
        value: JSON.stringify(phones),
        editorMode: "phones",
      },
      {
        id: "",
        element_id: "contacts-addresses",
        page_path: pageName,
        value: JSON.stringify(addresses),
        editorMode: "addresses",
      },
    ];

    setDeletedElementIds((prev) => [...prev, ...legacyIdsToDelete]);
    setPageContent(newBlocks);
    toast.info("Старые контакты преобразованы в динамические списки. Нажмите «Сохранить все», чтобы применить.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const pageName = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;

    try {
      // 1. Удаляем удаленные элементы из БД
      if (deletedElementIds.length > 0) {
        await Promise.all(
          deletedElementIds.map((elementId) =>
            api.delete(`/page/${pageName}/${elementId}`).catch((err) => {
              console.warn("Failed to delete element:", elementId, err);
            })
          )
        );
      }

      // 2. Сохраняем актуальные элементы
      const updatePromises = pageContent.map((item) => {
        if (!item.element_id) return Promise.resolve();
        return api.post("/page", {
          element_id: item.element_id,
          page_path: item.page_path,
          value: item.value,
        });
      });
      await Promise.all(updatePromises);

      toast.success("Изменения успешно сохранены!");
      setDeletedElementIds([]);
      setOriginalContent([...pageContent]);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 5, mb: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#2c3e50" }}
          >
            Редактор страниц
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Выберите страницу</InputLabel>
              <Select
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                label="Выберите страницу"
              >
                <MenuItem value="">
                  <em>Выберите страницу</em>
                </MenuItem>
                {pages.map((p) => (
                  <MenuItem key={p.path} value={p.path}>
                    {p.name} ({p.path})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Подсказка/баннер для миграции старых контактов */}
            {hasLegacyContacts && (
              <Alert
                severity="info"
                icon={<AutoFixHighIcon />}
                action={
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={handleMigrateContacts}
                    sx={{ textTransform: "none", fontWeight: "bold" }}
                  >
                    Преобразовать сейчас
                  </Button>
                }
                sx={{ mt: 2, mb: 3, borderRadius: 2 }}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  Обнаружены старые поля контактов
                </AlertTitle>
                На странице найдены старые разрозненные элементы (
                <code>address-1..6</code>, <code>phone-1..2</code>). Вы можете в
                один клик объединить их в удобные динамические списки адресов и
                телефонов.
              </Alert>
            )}

            {pagePath && (
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Быстрое добавление специальных блоков для этой страницы:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContactPhoneIcon />}
                    onClick={() => handleAddElement("phones", "contacts-phones")}
                    disabled={pageContent.some(
                      (item) => item.element_id === "contacts-phones"
                    )}
                  >
                    + Блок телефонов
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={() =>
                      handleAddElement("addresses", "contacts-addresses")
                    }
                    disabled={pageContent.some(
                      (item) => item.element_id === "contacts-addresses"
                    )}
                  >
                    + Блок адресов
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewCarouselIcon />}
                    onClick={() => handleAddElement("slider", "main-slider")}
                  >
                    + Слайдер
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TextFieldsIcon />}
                    onClick={() => handleAddElement("text")}
                  >
                    + Текстовый блок
                  </Button>
                </Stack>
              </Box>
            )}

            {pageContent.map((item, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  mb: 4,
                  p: 2.5,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2.5,
                  bgcolor: "#ffffff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#333", fontSize: "1.1rem" }}
                    >
                      Блок #{index + 1}
                    </Typography>
                    {item.element_id && (
                      <Chip
                        label={item.element_id}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМА БЛОКА */}
                    <FormControl size="small" sx={{ minWidth: 170 }}>
                      <InputLabel>Тип блока</InputLabel>
                      <Select
                        value={item.editorMode || "text"}
                        label="Тип блока"
                        onChange={(e) =>
                          handleChangeEditorMode(index, e.target.value)
                        }
                      >
                        <MenuItem value="text">📝 Текст (HTML)</MenuItem>
                        <MenuItem value="slider">📸 Слайдер</MenuItem>
                        <MenuItem value="phones">📞 Список телефонов</MenuItem>
                        <MenuItem value="addresses">📍 Список адресов</MenuItem>
                      </Select>
                    </FormControl>

                    <Tooltip title="Удалить этот блок целиком">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteElement(index)}
                        sx={{
                          bgcolor: "rgba(211, 47, 47, 0.06)",
                          "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <TextField
                  label="ID элемента (element_id)"
                  value={item.element_id}
                  onChange={(e) =>
                    handleFieldChange(index, "element_id", e.target.value)
                  }
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  placeholder="например: page-title, contacts-phones, contacts-addresses, main-heading"
                  helperText={
                    item.editorMode === "phones"
                      ? "Рекомендуемый ID: contacts-phones"
                      : item.editorMode === "addresses"
                      ? "Рекомендуемый ID: contacts-addresses"
                      : item.editorMode === "slider"
                      ? "Рекомендуемый ID: main-slider"
                      : "Уникальный идентификатор блока на странице"
                  }
                />

                <Box sx={{ mt: 2 }}>
                  {/* УСЛОВНЫЙ РЕНДЕРИНГ РЕДАКТОРА */}
                  {item.editorMode === "slider" && (
                    <SliderEditor
                      value={item.value}
                      onChange={(val) => handleFieldChange(index, "value", val)}
                    />
                  )}

                  {item.editorMode === "phones" && (
                    <PhoneListEditor
                      value={item.value}
                      onChange={(val) => handleFieldChange(index, "value", val)}
                    />
                  )}

                  {item.editorMode === "addresses" && (
                    <AddressListEditor
                      value={item.value}
                      onChange={(val) => handleFieldChange(index, "value", val)}
                    />
                  )}

                  {item.editorMode === "text" && (
                    <TiptapEditor
                      value={item.value}
                      onChange={(val) => handleFieldChange(index, "value", val)}
                    />
                  )}
                </Box>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleAddElement("text")}
              disabled={!pagePath}
              sx={{
                mb: 3,
                borderStyle: "dashed",
                py: 1.5,
                fontWeight: "bold",
                width: "100%",
                "&:hover": { borderStyle: "dashed" },
              }}
            >
              Добавить новый блок
            </Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
                pt: 2,
                borderTop: "1px solid #eee",
              }}
            >
              <Button
                onClick={() => {
                  setPageContent([...originalContent]);
                  setDeletedElementIds([]);
                }}
                color="inherit"
              >
                Сбросить изменения
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !pagePath}
                sx={{
                  background:
                    "linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)",
                  fontWeight: "bold",
                  px: 4,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Сохранить все"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
