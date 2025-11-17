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
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from "react-dropzone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../../../configs/axiosConfig"; // Убедитесь, что путь верный
import useBlogStore from "../../../store/blogStore"; // Убедитесь, что путь верный

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

/**
 * Функция для извлечения URL изображения из HTML-строки.
 * Это нужно, чтобы передать чистый URL в наш новый компонент PreviewImageUploader.
 */
const extractImageUrl = (html) => {
  if (!html) return "";
  const match = html.match(/<img src="([^"]+)"/);
  return match ? match[1] : "";
};

/**
 * Обновленная функция sanitizeHtml.
 * Разрешает стили для выравнивания и изменения размеров изображений.
 */
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
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        "background-color": [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
        ],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
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

// --- ОБЩИЕ КОМПОНЕНТЫ ---

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
            width: "370px",
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
              <Typography>Перетащите изображение сюда или кликните</Typography>
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
      setPreview(null);
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
        modules: ["Resize", "DisplaySize", "Toolbar"],
        toolbar: { alignments: ["left", "center", "right"] },
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

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ "РЕДАКТИРОВАНИЕ ПОСТА" ---
export default function EditPost() {
  const { id } = useParams();
  const { post, fetchBlogById, updatePost, loading } = useBlogStore();

  const [postFormat, setPostFormat] = useState({
    heading: "",
    previewUrl: "",
    text: "",
    hex: "#ffffff",
  });

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  useEffect(() => {
    if (post && post.data) {
      setPostFormat({
        heading: post.data.heading || "",
        previewUrl: extractImageUrl(post.data.prewiew),
        text: post.data.text || "",
        hex: post.data.hex || "#ffffff",
      });
    }
  }, [post]);

  const handleChange = useCallback((field, value) => {
    setPostFormat((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!postFormat.heading || !postFormat.text) {
      toast.warn("Заголовок и текст поста не могут быть пустыми.");
      return;
    }

    try {
      // Готовим данные для отправки
      const postData = {
        prewiew: `<img src="${postFormat.previewUrl}" alt="${postFormat.heading}" style="width: 100%;" />`,
        heading: postFormat.heading,
        text: sanitizeContent(postFormat.text),
        hex: postFormat.hex,
      };

      // 1. Сначала вызываем ТОЛЬКО обновление.
      // Если здесь будет ошибка, мы сразу перейдем в catch.
      await updatePost(id, postData);

      // 2. Если предыдущая строка выполнилась без ошибок, значит все УСПЕШНО.
      // Показываем пользователю позитивный результат НЕМЕДЛЕННО.
      toast.success("Пост успешно обновлен!");

      // 3. И только теперь, когда все сохранено и пользователь уведомлен,
      // запускаем фоновую задачу по обновлению данных на странице.
      fetchBlogById(id);
    } catch (error) {
      // Этот блок сработает ТОЛЬКО в том случае, если updatePost не удался.
      toast.error("Ошибка при обновлении: " + error.message);
    }
  };

  if (loading && !post) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Редактирование: {postFormat.heading || "поста"}</title>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              Редактирование поста
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                component={Link}
                to="/admin"
                variant="outlined"
                disabled={loading}
              >
                К админ-панели
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Сохранить"
                )}
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              1. Превью
            </Typography>
            <PreviewImageUploader
              value={postFormat.previewUrl}
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
              value={postFormat.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              3. Основное содержимое
            </Typography>
            <EditableHtmlField
              value={postFormat.text}
              setValue={(value) => handleChange("text", value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              4. Цвет окантовки
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <input
                type="color"
                value={postFormat.hex}
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
                value={postFormat.hex}
                onChange={(e) => handleChange("hex", e.target.value)}
                error={!isValidHex(postFormat.hex)}
                helperText={
                  !isValidHex(postFormat.hex) ? "Неверный формат" : ""
                }
              />
            </Box>
          </Box>
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
