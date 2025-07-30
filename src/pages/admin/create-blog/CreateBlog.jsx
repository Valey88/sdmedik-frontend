import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Modal,
  Input,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Helmet } from "react-helmet";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../configs/axiosConfig"; // Adjust path
import useUserStore from "../../../store/userStore"; // Adjust path

// Custom CSS for images
const styles = `
    .custom-image {
      display: block;
      margin: 0 auto;
    }
    .custom-image-left {
      float: left;
      margin-right: 10px;
    }
    .custom-image-right {
      float: right;
      margin-left: 10px;
    }
    .custom-image-center {
      display: block;
      margin: 0 auto;
    }
    .custom-image img {
      object-fit: contain !important;
      max-width: 100% !important;
    }
  `;

// Inject styles into document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Custom Quill Blot for images with parameters
const BlockEmbed = Quill.import("blots/block/embed");
class CustomImageBlot extends BlockEmbed {
  static create(value) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("custom-image", `custom-image-${value.align}`);
    const img = document.createElement("img");
    img.setAttribute("src", value.src);
    img.setAttribute("alt", value.alt || "");
    if (value.width) {
      img.style.width = `${parseFloat(value.width)}px`;
    }
    if (value.height) {
      img.style.height = `${parseFloat(value.height)}px`;
    }
    img.style.border = value.border || "none";
    img.style.objectFit = "contain";
    wrapper.appendChild(img);
    return wrapper;
  }

  static value(node) {
    const img = node.querySelector("img");
    return {
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      width: img.style.width || null,
      height: img.style.height || null,
      border: img.style.border || null,
      align: node.classList.contains("custom-image-left")
        ? "left"
        : node.classList.contains("custom-image-right")
        ? "right"
        : "center",
    };
  }
}
CustomImageBlot.blotName = "customImage";
CustomImageBlot.tagName = "div";
CustomImageBlot.className = "custom-image";
Quill.register(CustomImageBlot);

// Sanitize HTML content
const sanitizeContent = (html) => {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "img",
      "video",
      "br",
      "span",
      "a",
      "div",
    ],
    allowedAttributes: {
      img: ["src", "alt", "style"],
      div: ["class", "style"],
      video: ["src", "controls"],
      a: ["href", "target"],
      span: ["style"],
    },
    transformTags: {
      img: (tagName, attribs) => {
        const style = attribs.style || "";
        const styles = style
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s);
        if (!styles.includes("object-fit: contain")) {
          styles.push("object-fit: contain");
        }
        return {
          tagName: "img",
          attribs: {
            ...attribs,
            alt: attribs.alt !== undefined ? attribs.alt : "",
            style: styles.join("; "),
          },
        };
      },
      div: (tagName, attribs) => {
        if (attribs.class && attribs.class.includes("custom-image")) {
          return { tagName: "div", attribs };
        }
        return { tagName: "div", attribs: {} };
      },
    },
  });
};

// Validate hex color
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

// Validate border style
const isValidBorder = (border) => {
  if (!border) return true;
  const borderRegex = /^\d+px\s+(solid|dashed|dotted)\s+#?[0-9A-Fa-f]{6}$/;
  return borderRegex.test(border);
};

// Extract image URL from HTML
const extractImageUrl = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  return img ? img.getAttribute("src") : "";
};

// Image Upload Modal for text field
const ImageUploadModal = ({ open, onClose, quillRef, setValue }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [align, setAlign] = useState("center");
  const [border, setBorder] = useState("2px solid #1976d2");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setImageUrl("");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Выберите файл");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/blog/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(response.data.data);
      toast.success("Изображение загружено");
    } catch (error) {
      toast.error(
        "Ошибка загрузки изображения: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    if (!imageUrl) {
      toast.error("Нет URL для копирования");
      return;
    }
    navigator.clipboard.writeText(imageUrl);
    toast.success("URL скопирован");
  };

  const handleInsert = () => {
    if (!imageUrl) {
      toast.error("Сначала загрузите изображение");
      return;
    }
    const parsedWidth = width ? parseFloat(width) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    if (parsedWidth && (isNaN(parsedWidth) || parsedWidth <= 0)) {
      toast.error("Ширина должна быть положительным числом");
      return;
    }
    if (parsedHeight && (isNaN(parsedHeight) || parsedHeight <= 0)) {
      toast.error("Высота должна быть положительным числом");
      return;
    }
    if (!isValidBorder(border)) {
      toast.error(
        "Обводка должна быть в формате 'Xpx solid/dashed/dotted #RRGGBB'"
      );
      return;
    }
    console.log("Inserting image with params:", {
      src: imageUrl,
      width: parsedWidth,
      height: parsedHeight,
      border,
      align,
    });
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection() || { index: 0 };
    quill.insertEmbed(range.index, "customImage", {
      src: imageUrl,
      alt: "",
      width: parsedWidth,
      height: parsedHeight,
      border: border || null,
      align,
    });
    const updatedContent = sanitizeContent(quill.root.innerHTML);
    console.log("Sanitized content:", updatedContent);
    setValue(updatedContent);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          width: 400,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Загрузка изображения
        </Typography>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="URL изображения"
          value={imageUrl}
          InputProps={{
            readOnly: true,
            endAdornment: imageUrl && (
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            ),
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Ширина (px)"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          error={width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0)}
          helperText={
            width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0)
              ? "Введите положительное число"
              : ""
          }
        />
        <TextField
          label="Высота (px)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          error={
            height && (isNaN(parseFloat(height)) || parseFloat(height) <= 0)
          }
          helperText={
            height && (isNaN(parseFloat(height)) || parseFloat(height) <= 0)
              ? "Введите положительное число"
              : ""
          }
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Выравнивание</InputLabel>
          <Select value={align} onChange={(e) => setAlign(e.target.value)}>
            <MenuItem value="left">Слева</MenuItem>
            <MenuItem value="center">По центру</MenuItem>
            <MenuItem value="right">Справа</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Обводка (например, 2px solid #1976d2)"
          value={border}
          onChange={(e) => setBorder(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          error={border && !isValidBorder(border)}
          helperText={
            border && !isValidBorder(border)
              ? "Формат: Xpx solid/dashed/dotted #RRGGBB"
              : ""
          }
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={isUploading || !file}
            startIcon={isUploading ? <CircularProgress size={24} /> : null}
          >
            Загрузить
          </Button>
          <Button
            variant="contained"
            onClick={handleInsert}
            disabled={!imageUrl}
          >
            Вставить
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Отменить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Preview Image Modal for preview field
const PreviewImageModal = ({ open, onClose, quillRef, setValue }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState("370");
  const [height, setHeight] = useState("");
  const [align, setAlign] = useState("center");
  const [border, setBorder] = useState("2px solid #1976d2");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setImageUrl("");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Выберите файл");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/blog/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(response.data.data);
      toast.success("Изображение загружено");
    } catch (error) {
      toast.error(
        "Ошибка загрузки изображения: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    if (!imageUrl) {
      toast.error("Нет URL для копирования");
      return;
    }
    navigator.clipboard.writeText(imageUrl);
    toast.success("URL скопирован");
  };

  const handleInsert = () => {
    if (!imageUrl) {
      toast.error("Сначала загрузите изображение");
      return;
    }
    const parsedWidth = width ? parseFloat(width) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    if (parsedWidth && (isNaN(parsedWidth) || parsedWidth <= 0)) {
      toast.error("Ширина должна быть положительным числом");
      return;
    }
    console.log("Inserting preview image with params:", {
      src: imageUrl,
      width: parsedWidth,
    });
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection() || { index: 0 };
    quill.insertEmbed(range.index, "customImage", {
      src: imageUrl,
      alt: "",
      width: parsedWidth,
    });
    const updatedContent = sanitizeContent(quill.root.innerHTML);
    console.log("Sanitized preview content:", updatedContent);
    setValue(updatedContent);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          width: 400,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Загрузка изображения для превью
        </Typography>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="URL изображения"
          value={imageUrl}
          InputProps={{
            readOnly: true,
            endAdornment: imageUrl && (
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            ),
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={isUploading || !file}
            startIcon={isUploading ? <CircularProgress size={24} /> : null}
          >
            Загрузить
          </Button>
          <Button
            variant="contained"
            onClick={handleInsert}
            disabled={!imageUrl}
          >
            Вставить
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Отменить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Editable HTML field with ReactQuill
const EditableHtmlField = ({
  value,
  setValue,
  isEditing,
  isPreview = false,
}) => {
  const quillRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);

  const imageHandler = useCallback(() => {
    setOpenModal(true);
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["image", "link"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };
  const previewModules = {
    toolbar: {
      container: [["image", "link"]],
      handlers: {
        image: imageHandler,
      },
    },
  };

  return (
    <>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={setValue}
        modules={modules}
        theme={isEditing ? "snow" : "bubble"}
        readOnly={!isEditing}
        style={{ marginBottom: "16px" }}
      />
      {isPreview ? (
        <PreviewImageModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          quillRef={quillRef}
          setValue={setValue}
        />
      ) : (
        <ImageUploadModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          quillRef={quillRef}
          setValue={setValue}
        />
      )}
    </>
  );
};
const PreviewFile = ({ value, setValue, isEditing }) => {
  const quillRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);

  const imageHandler = useCallback(() => {
    setOpenModal(true);
  }, []);
  const previewModules = {
    toolbar: {
      container: [["image", "link"]],
      handlers: {
        image: imageHandler,
      },
    },
  };

  return (
    <>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={setValue}
        modules={previewModules}
        theme={isEditing ? "snow" : "bubble"}
        readOnly={!isEditing}
        style={{ marginBottom: "16px" }}
      />
      <PreviewImageModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        quillRef={quillRef}
        setValue={setValue}
      />
    </>
  );
};

export default function BlogAdminPanel() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    prewiew: "",
    heading: "",
    text: "",
    hex: "#ffffff",
  });
  const [editingPost, setEditingPost] = useState(null);
  const [editedPost, setEditedPost] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user, isAuthenticated, getUserInfo, logout } = useUserStore();
  const isAdmin = isAuthenticated && user?.data?.role === "admin";
  const navigate = useNavigate();

  useEffect(() => {
    getUserInfo();
    if (!isAuthenticated || user?.data?.role !== "admin") {
      setError("Доступ только для администраторов");
      navigate("/login");
    }
  }, []);

  const handleCreatePost = async () => {
    if (!isAdmin) {
      setError("Только администраторы могут создавать посты");
      return;
    }
    if (!newPost.prewiew || !newPost.text || !isValidHex(newPost.hex)) {
      setError(
        "Заполните все поля корректно (hex должен быть в формате #RRGGBB)"
      );
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post("/blog", {
        prewiew: sanitizeContent(newPost.prewiew),
        heading: sanitizeContent(newPost.heading),
        text: sanitizeContent(newPost.text),
        hex: newPost.hex,
      });
      setPosts([...posts, response.data.data]);
      setNewPost({ prewiew: "", text: "", hex: "#000000" });
      setSuccess("Пост создан");
      toast.success("Пост успешно создан");
    } catch (error) {
      setError(
        "Ошибка создания поста: " +
          (error.response?.data?.message || error.message)
      );
      toast.error("Ошибка создания поста");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Box>
      <Container sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          sx={{
            mb: 4,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Создать новый пост
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Превью
          </Typography>
          <PreviewFile
            value={newPost.prewiew}
            setValue={(value) => setNewPost({ ...newPost, prewiew: value })}
            isEditing={true}
            isPreview={true}
          />
          <Typography variant="subtitle1" gutterBottom>
            Заголовок
          </Typography>
          <EditableHtmlField
            value={newPost.heading}
            setValue={(value) => setNewPost({ ...newPost, heading: value })}
            isEditing={true}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Цвет окантовки (hex, #RRGGBB)"
            value={newPost.hex}
            onChange={(e) => setNewPost({ ...newPost, hex: e.target.value })}
            fullWidth
            error={newPost.hex && !isValidHex(newPost.hex)}
            helperText={
              newPost.hex && !isValidHex(newPost.hex)
                ? "Введите корректный hex-цвет (#RRGGBB)"
                : ""
            }
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Описание
          </Typography>
          <EditableHtmlField
            value={newPost.text}
            setValue={(value) => setNewPost({ ...newPost, text: value })}
            isEditing={true}
            isPreview={false}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePost}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
            sx={{ mt: 2 }}
          >
            Создать пост
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
