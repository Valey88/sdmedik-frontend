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
  Switch,
  FormControlLabel,
  Grid,
  InputAdornment,
  Tooltip,
} from "@mui/material";

// Иконки
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Иконка загрузки
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

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

// === КОМПОНЕНТ ОДНОГО СЛАЙДА (с логикой загрузки) ===
const SlideItem = ({ slide, index, onChange, onRemove }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Обработка загрузки файла
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Используем тот же эндпоинт, что и в постах
      const response = await api.post("/blog/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Автоматическая вставка ссылки
      onChange(index, "url", response.data.data);
      toast.success("Изображение загружено!");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка загрузки изображения");
    } finally {
      setIsUploading(false);
      // Сбрасываем инпут, чтобы можно было загрузить тот же файл повторно если нужно
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card sx={{ mb: 2, position: "relative", overflow: "visible" }}>
      <IconButton
        onClick={() => onRemove(index)}
        size="small"
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          bgcolor: "error.main",
          color: "white",
          zIndex: 10,
          "&:hover": { bgcolor: "error.dark" },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип</InputLabel>
              <Select
                value={slide.type}
                label="Тип"
                onChange={(e) => onChange(index, "type", e.target.value)}
              >
                <MenuItem value="image">Картинка</MenuItem>
                <MenuItem value="video">Видео</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={9}>
            {/* Скрытый инпут для файла */}
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
              value={slide.url}
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
              />
            </Grid>
          )}
        </Grid>

        {/* Превью */}
        {slide.url && (
          <Box
            sx={{
              mt: 2,
              height: 100,
              bgcolor: "#f0f0f0",
              borderRadius: 1,
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
                style={{ maxHeight: "100%" }}
                controls
                muted
              />
            ) : (
              <img
                src={slide.url}
                alt="preview"
                style={{ maxHeight: "100%" }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// === ОБЩИЙ РЕДАКТОР СЛАЙДЕРОВ ===
const SliderEditor = ({ value, onChange }) => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) setSlides(parsed);
      } else {
        setSlides([]);
      }
    } catch (e) {
      setSlides([]);
    }
  }, []);

  const updateParent = (newSlides) => {
    setSlides(newSlides);
    onChange(JSON.stringify(newSlides));
  };

  const addSlide = () => {
    updateParent([...slides, { type: "image", url: "", alt: "" }]);
  };

  const removeSlide = (index) => {
    updateParent(slides.filter((_, i) => i !== index));
  };

  const handleChangeSlide = (index, field, val) => {
    const newSlides = [...slides];
    newSlides[index][field] = val;
    updateParent(newSlides);
  };

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        p: 2,
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
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          📸 Управление слайдами
        </Typography>
      </Box>

      {slides.length === 0 && (
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 2 }}
        >
          Слайдов пока нет. Добавьте первый.
        </Typography>
      )}

      {slides.map((slide, i) => (
        <SlideItem
          key={i}
          index={i}
          slide={slide}
          onChange={handleChangeSlide}
          onRemove={removeSlide}
        />
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addSlide}
        fullWidth
        sx={{ borderStyle: "dashed" }}
      >
        Добавить слайд
      </Button>
    </Box>
  );
};

// === КОМПОНЕНТ TIPTAP ===
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

// === ГЛАВНЫЙ КОМПОНЕНТ ===
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
  // Добавляем флаг isSliderMode в состояние элементов
  const [pageContent, setPageContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [originalContent, setOriginalContent] = useState([]);

  useEffect(() => {
    if (!pagePath) {
      setPageContent([]);
      setOriginalContent([]);
      return;
    }

    const fetchPageContent = async () => {
      setIsFetching(true);
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
            ? data.map((item) => {
                // Определяем, является ли контент слайдером
                // 1. По ID "main-slider"
                // 2. Или если value успешно парсится как JSON массив
                let isSlider = item.element_id === "main-slider";
                if (!isSlider && item.value) {
                  try {
                    const parsed = JSON.parse(item.value);
                    if (
                      Array.isArray(parsed) &&
                      parsed.length > 0 &&
                      parsed[0].url !== undefined
                    ) {
                      isSlider = true;
                    }
                  } catch (e) {}
                }

                return {
                  id: item.id || "",
                  element_id: item.element_id || "",
                  page_path: item.page_path || pageName,
                  value: item.value || "",
                  isSliderMode: isSlider, // Состояние тумблера
                };
              })
            : [
                {
                  id: "",
                  element_id: "",
                  page_path: pageName,
                  value: "",
                  isSliderMode: false,
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
            isSliderMode: false,
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

  const handleToggleSliderMode = (index) => {
    setPageContent((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isSliderMode: !item.isSliderMode } : item
      )
    );
  };

  const handleAddElement = () => {
    if (!pagePath) return;
    const pageName = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
    setPageContent((prev) => [
      ...prev,
      {
        id: "",
        element_id: "",
        page_path: pageName,
        value: "",
        isSliderMode: false,
      },
    ]);
  };

  const handleDeleteElement = (index) => {
    const newContent = pageContent.filter((_, i) => i !== index);
    setPageContent(newContent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
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
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
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
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {pageContent.map((item, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{ mb: 4, p: 2, border: "1px solid #eee", borderRadius: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    Элемент #{index + 1}
                  </Typography>
                  <Box>
                    {/* ТУМБЛЕР ПЕРЕКЛЮЧЕНИЯ РЕЖИМА */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={item.isSliderMode}
                          onChange={() => handleToggleSliderMode(index)}
                          color="primary"
                        />
                      }
                      label={
                        item.isSliderMode
                          ? "Режим: Слайдер"
                          : "Режим: Текст (HTML)"
                      }
                      sx={{
                        mr: 2,
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        pr: 2,
                        pl: 1,
                      }}
                    />

                    <IconButton
                      color="error"
                      onClick={() => handleDeleteElement(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <TextField
                  label="ID элемента"
                  value={item.element_id}
                  onChange={(e) =>
                    handleFieldChange(index, "element_id", e.target.value)
                  }
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  size="small"
                  helperText={
                    item.isSliderMode
                      ? "В режиме слайдера сохраняется массив JSON"
                      : "Стандартный HTML текст"
                  }
                />

                <Box sx={{ mt: 2 }}>
                  {/* УСЛОВНЫЙ РЕНДЕРИНГ ПО ТУМБЛЕРУ */}
                  {item.isSliderMode ? (
                    <SliderEditor
                      value={item.value}
                      onChange={(val) => handleFieldChange(index, "value", val)}
                    />
                  ) : (
                    <TiptapEditor
                      value={item.value}
                      onChange={(val) => handleFieldChange(index, "value", val)}
                    />
                  )}
                </Box>
              </Paper>
            ))}

            <Button
              variant="dashed"
              startIcon={<AddIcon />}
              onClick={handleAddElement}
              disabled={!pagePath}
              sx={{ mb: 3, border: "1px dashed grey", width: "100%" }}
            >
              Добавить новый блок
            </Button>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                onClick={() => setPageContent([...originalContent])}
                color="inherit"
              >
                Отменить
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
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
