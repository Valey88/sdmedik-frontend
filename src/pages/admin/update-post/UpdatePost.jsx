import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Modal,
  Input,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { toast, ToastContainer } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import api from "../../../configs/axiosConfig";
import useBlogStore from "../../../store/blogStore";

// Валидация цвета hex
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

// Валидация стиля обводки
const isValidBorder = (border) => {
  if (!border) return true;
  const borderRegex = /^\d+px\s+(solid|dashed|dotted)\s+#?[0-9A-Fa-f]{6}$/;
  return borderRegex.test(border);
};

// Декодирование HTML для удаления лишних слэшей и HTML-сущностей
const decodeHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

// Санитизация HTML-контента
const sanitizeContent = (html) => {
  if (!html) return "";
  const sanitized = sanitizeHtml(html, {
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
            src: decodeHtml(attribs.src || ""),
            alt: attribs.alt !== undefined ? attribs.alt : "",
            style: styles.join("; "),
          },
        };
      },
      div: (tagName, attribs) => {
        if (attribs.class && attribs.class.includes("custom-image")) {
          return {
            tagName: "div",
            attribs: { ...attribs, class: decodeHtml(attribs.class) },
          };
        }
        return { tagName: "div", attribs: {} };
      },
    },
  });
  return decodeHtml(sanitized);
};

// Кастомный Quill Blot для изображений
const BlockEmbed = Quill.import("blots/block/embed");
class CustomImageBlot extends BlockEmbed {
  static create(value) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
      "custom-image",
      `custom-image-${value.align || "center"}`
    );
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

// Компонент модального окна для загрузки изображений
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
    const updatedContent = decodeHtml(sanitizeContent(quill.root.innerHTML));
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
          error={
            !!(width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0))
          }
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
            !!(height && (isNaN(parseFloat(height)) || parseFloat(height) <= 0))
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
          error={!!(border && !isValidBorder(border))}
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

// Компонент модального окна для загрузки изображения превью
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
    const quill = quillRef.current.getEditor();
    quill.deleteText(0, quill.getLength()); // Очищаем содержимое
    quill.insertEmbed(0, "customImage", {
      src: imageUrl,
      alt: "",
      width: parsedWidth,
      height: parsedHeight,
      border: border || null,
      align,
    });
    const updatedContent = decodeHtml(sanitizeContent(quill.root.innerHTML));
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
        <TextField
          label="Ширина (px)"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          error={
            !!(width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0))
          }
          helperText={
            width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0)
              ? "Введите положительное число"
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

// Компонент для редактирования HTML-полей
const EditableHtmlField = ({ value, setValue, isEditing }) => {
  const quillRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const isMounted = useRef(false);

  const imageHandler = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleQuillChange = useCallback(
    (content) => {
      if (isMounted.current) {
        const decodedContent = decodeHtml(sanitizeContent(content));
        if (decodedContent !== value) {
          setValue(decodedContent);
        }
      }
    },
    [setValue, value]
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
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

  return (
    <>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleQuillChange}
        modules={modules}
        theme={isEditing ? "snow" : "bubble"}
        readOnly={!isEditing}
        style={{ minHeight: 300, marginBottom: 16 }}
      />
      <ImageUploadModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        quillRef={quillRef}
        setValue={setValue}
      />
    </>
  );
};

// Компонент для редактирования превью
const PreviewFile = ({ value, setValue, isEditing }) => {
  const quillRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const isMounted = useRef(false);

  const imageHandler = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleQuillChange = useCallback(
    (content) => {
      if (isMounted.current) {
        const decodedContent = decodeHtml(sanitizeContent(content));
        if (decodedContent !== value) {
          setValue(decodedContent);
        }
      }
    },
    [setValue, value]
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
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
        onChange={handleQuillChange}
        modules={previewModules}
        theme={isEditing ? "snow" : "bubble"}
        readOnly={!isEditing}
        style={{ minHeight: 100, marginBottom: 16 }}
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

export default function EditPost() {
  const { id } = useParams();
  const { post, fetchBlogById, updatePost } = useBlogStore();
  const [postFormat, setPostFormat] = useState({
    heading: "",
    prewiew: "",
    text: "",
    hex: "#fcf5f5ff",
  });

  useEffect(() => {
    fetchBlogById(id);
  }, [id, fetchBlogById]);

  useEffect(() => {
    if (post && post.data) {
      console.log("Raw post.data:", post.data);
      const newPostFormat = {
        heading: decodeHtml(post.data.heading || ""),
        prewiew: decodeHtml(post.data.prewiew || ""),
        text: decodeHtml(post.data.text || ""),
        hex: post.data.hex || "#fcf5f5ff",
      };
      console.log("Decoded postFormat:", newPostFormat);
      setPostFormat((prev) => {
        if (
          prev.heading !== newPostFormat.heading ||
          prev.prewiew !== newPostFormat.prewiew ||
          prev.text !== newPostFormat.text ||
          prev.hex !== newPostFormat.hex
        ) {
          return newPostFormat;
        }
        return prev;
      });
    }
  }, [post]);

  const handleChange = useCallback(
    (field) => (value) => {
      setPostFormat((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    if (!postFormat.heading || !postFormat.prewiew || !postFormat.text) {
      toast.error("Заполните все обязательные поля!");
      return;
    }
    if (!isValidHex(postFormat.hex)) {
      toast.error("Неверный формат цвета (например, #FFFFFF)");
      return;
    }
    const postData = {
      heading: decodeHtml(postFormat.heading),
      prewiew: decodeHtml(postFormat.prewiew),
      text: decodeHtml(postFormat.text),
      hex: postFormat.hex,
    };

    console.log("Post data before sending:", postData);

    try {
      await updatePost(id, postData);
    } catch (error) {
      toast.error(
        "Ошибка сохранения поста: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <Button variant="outlined" component={Link} to="/admin">
            Назад к админ-панели
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Сохранить изменения
          </Button>
        </Box>

        <Box
          sx={{
            border: `2px solid ${postFormat.hex}`,
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Редактирование поста
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Заголовок
            </Typography>
            <EditableHtmlField
              value={postFormat.heading}
              setValue={handleChange("heading")}
              isEditing={true}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Превью (изображение)
            </Typography>
            <PreviewFile
              value={postFormat.prewiew}
              setValue={handleChange("prewiew")}
              isEditing={true}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Содержимое
            </Typography>
            <EditableHtmlField
              value={postFormat.text}
              setValue={handleChange("text")}
              isEditing={true}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Цвет обводки
            </Typography>
            <TextField
              type="color"
              value={postFormat.hex}
              onChange={(e) => handleChange("hex")(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ maxWidth: 200 }}
              error={!!(postFormat.hex && !isValidHex(postFormat.hex))}
              helperText={
                postFormat.hex && !isValidHex(postFormat.hex)
                  ? "Формат: #FFFFFF"
                  : ""
              }
            />
          </Box>
        </Box>
      </Container>
      <ToastContainer />
    </Box>
  );
}
