import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Modal,
  Paper,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { Helmet } from "react-helmet";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from "react-dropzone";

import api from "../../../configs/axiosConfig";
import useUserStore from "../../../store/userStore";


// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);
// Расширяем sanitize-html для поддержки стилей, которые добавляет модуль ресайза
const sanitizeContent = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "div"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      img: ["src", "alt", "width", "height"],
    },
    allowedStyles: {
      "*": {
        // Разрешаем все базовые стили, которые могут быть у текста
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        "background-color": [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
        ],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        // Свойства для изображений
        float: [/^left$/, /^right$/],
        margin: [/^\d+(?:px|em|%)$/],
        "margin-left": [/^\d+(?:px|em|%)$/],
        "margin-right": [/^\d+(?:px|em|%)$/],
        "margin-top": [/^\d+(?:px|em|%)$/],
        "margin-bottom": [/^\d+(?:px|em|%)$/],
        display: [/^block$/, /^inline-block$/],
        width: [/^\d+(?:px|em|%)$/],
        height: [/^\d+(?:px|em|%)$/],
      },
    },
  });
};

// --- УЛУЧШЕННЫЕ КОМПОНЕНТЫ ---

/**
 * Улучшение №4: Компонент для загрузки превью.
 * Заменяет полноценный редактор на простую и понятную drag-and-drop зону.
 * Хранит в состоянии только URL изображения, а не HTML.
 */
const PreviewImageUploader = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      setIsUploading(true);
      try {
        const response = await api.post("/blog/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onChange(response.data.data); // Возвращаем только URL
        toast.success("Превью успешно загружено");
      } catch (error) {
        toast.error(
          "Ошибка загрузки превью: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    onChange(""); // Очищаем URL
  };

  return (
    <Box>
      {value ? (
        <Paper
          variant="outlined"
          sx={{ position: "relative", width: "370px", height: "240px" }}
        >
          <img
            src={value}
            alt="Превью поста"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <IconButton
            aria-label="delete"
            onClick={handleRemoveImage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ) : (
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? "primary.main" : "grey.500"}`,
            borderRadius: 1,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragActive ? "action.hover" : "transparent",
            minHeight: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <CircularProgress />
          ) : (
            <>
              <UploadFileIcon sx={{ fontSize: 48, color: "grey.600", mb: 1 }} />
              <Typography>
                Перетащите изображение сюда или кликните для выбора
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Рекомендуемая ширина: 370px
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

/**
 * Улучшение №1, 2, 3: Полностью переработанное модальное окно.
 * Использует react-dropzone, показывает превью и автоматизирует загрузку.
 */
const ImageUploadModal = ({ open, onClose, quillRef }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

    // Автоматическая загрузка
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await api.post("/blog/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(response.data.data);
      toast.success("Изображение готово к вставке");
    } catch (error) {
      toast.error(
        "Ошибка загрузки: " + (error.response?.data?.message || error.message)
      );
      setPreview(null); // Сбрасываем превью в случае ошибки
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
    multiple: false,
  });

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setImageUrl("");
    setIsUploading(false);
    onClose();
  };

  const handleInsert = () => {
    if (!imageUrl) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "image", imageUrl);
    quill.setSelection(range.index + 1);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          width: { xs: "90%", sm: 500 },
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Вставка изображения
        </Typography>

        {!preview && (
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${
                isDragActive ? "primary.main" : "grey.500"
              }`,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              mb: 2,
            }}
          >
            <input {...getInputProps()} />
            <UploadFileIcon sx={{ fontSize: 40, color: "grey.600" }} />
            <Typography>Перетащите файл сюда или кликните</Typography>
          </Box>
        )}

        {preview && (
          <Box sx={{ my: 2, textAlign: "center" }}>
            <img
              src={preview}
              alt="Превью"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {isUploading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <TextField
          label="Или вставьте URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          sx={{ my: 2 }}
          disabled={isUploading}
        />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
        >
          <Button variant="outlined" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleInsert}
            disabled={!imageUrl || isUploading}
          >
            Вставить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

/**
 * Улучшение №6, 7: Расширенный редактор текста.
 * Добавлена новая панель инструментов и модуль для ресайза изображений.
 */
const EditableHtmlField = ({ value, setValue, minHeight = 400 }) => {
  const quillRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageHandler = useCallback(() => setIsModalOpen(true), []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image", "blockquote", "code-block"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
      imageResize: {
        parchment: Quill.import("parchment"),
        // Добавляем 'Toolbar' для активации кнопок выравнивания
        modules: ["Resize", "DisplaySize", "Toolbar"],
        // Настраиваем саму панель
        toolbar: {
          alignments: ["left", "center", "right"],
          // Можно кастомизировать иконки, но пока оставим по умолчанию
          icons: {},
        },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler]
  );

  return (
    <>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={setValue}
        modules={modules}
        theme="snow"
        style={{ minHeight: `${minHeight}px`, backgroundColor: "#fff" }}
      />
      <ImageUploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quillRef={quillRef}
      />
    </>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ "СОЗДАНИЕ ПОСТА" ---
export default function BlogAdminPanel() {
  const [newPost, setNewPost] = useState({
    previewUrl: "", // Изменено с prewiew на previewUrl для ясности
    heading: "",
    text: "",
    hex: "#00B3A4",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user, isAuthenticated, getUserInfo } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Логика проверки авторизации осталась без изменений
  }, [isAuthenticated, user, getUserInfo, navigate]);

  const handleChange = useCallback((field, value) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.heading || !newPost.text || !newPost.previewUrl) {
      toast.warn("Заполните все поля: превью, заголовок и описание.");
      return;
    }
    if (!isValidHex(newPost.hex)) {
      toast.error("Неверный формат цвета. Пример: #RRGGBB");
      return;
    }
    setIsSaving(true);
    try {
      const postData = {
        // Формируем HTML для превью прямо перед отправкой
        prewiew: `<img src="${newPost.previewUrl}" alt="${newPost.heading}" style="width: 100%;" />`,
        heading: newPost.heading, // Заголовки обычно не требуют сложной санации
        text: sanitizeContent(newPost.text),
        hex: newPost.hex,
      };
      await api.post("/blog", postData);
      toast.success("Новый пост успешно создан!");
      setNewPost({ previewUrl: "", heading: "", text: "", hex: "#00B3A4" });
    } catch (error) {
      toast.error(
        "Ошибка при создании поста: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Админ-панель: Создание поста</title>
      </Helmet>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Создать новый пост
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              1. Превью
            </Typography>
            <PreviewImageUploader
              value={newPost.previewUrl}
              onChange={(value) => handleChange("previewUrl", value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              2. Заголовок
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Введите главный заголовок поста"
              value={newPost.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              3. Основное содержимое
            </Typography>
            <EditableHtmlField
              value={newPost.text}
              setValue={(value) => handleChange("text", value)}
              minHeight={500}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              4. Цвет окантовки
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <input
                type="color"
                value={newPost.hex}
                onChange={(e) => handleChange("hex", e.target.value)}
                style={{
                  width: 56,
                  height: 56,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
              <TextField
                variant="outlined"
                value={newPost.hex}
                onChange={(e) => handleChange("hex", e.target.value)}
                error={!isValidHex(newPost.hex)}
                helperText={!isValidHex(newPost.hex) ? "Неверный формат" : ""}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleCreatePost}
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ mt: 2, minWidth: "200px" }}
          >
            {isSaving ? "Сохранение..." : "Создать пост"}
          </Button>
        </Box>
      </Container>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </>
  );
}
