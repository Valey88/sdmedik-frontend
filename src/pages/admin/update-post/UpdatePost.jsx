import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  CircularProgress,
  Modal,
  Input,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css"; // Стили для редактора
import sanitizeHtml from "sanitize-html";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Стили для уведомлений
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import api from "../../../configs/axiosConfig"; // Убедитесь, что путь правильный
import useBlogStore from "../../../store/blogStore"; // Убедитесь, что путь правильный

// --- Вспомогательные функции ---

const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);
const isValidBorder = (border) => {
  if (!border || border.trim() === "") return true;
  const borderRegex = /^\d+px\s+(solid|dashed|dotted)\s+#?[0-9A-Fa-f]{6}$/i;
  return borderRegex.test(border);
};
const decodeHtml = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
};
const sanitizeContent = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "strong",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "img",
      "br",
      "span",
      "a",
      "div",
      "h1",
      "h2",
      "h3",
      "pre",
    ],
    allowedAttributes: {
      "*": ["style", "class"],
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
  });
};

// --- Кастомный Blot для изображений ---

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
    if (value.width) img.style.width = `${parseFloat(value.width)}px`;
    if (value.height) img.style.height = `${parseFloat(value.height)}px`;
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
      width: img.style.width.replace("px", "") || null,
      height: img.style.height.replace("px", "") || null,
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

// --- Компонент модального окна для загрузки изображений ---

const ImageUploadModal = ({ open, onClose, quillRef }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [align, setAlign] = useState("center");
  const [border, setBorder] = useState("");

  const resetState = () => {
    setFile(null);
    setImageUrl("");
    setIsUploading(false);
    setWidth("");
    setHeight("");
    setAlign("center");
    setBorder("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Сначала выберите файл для загрузки");
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
      toast.success("Изображение успешно загружено!");
    } catch (error) {
      toast.error(
        "Ошибка загрузки: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsert = () => {
    if (!imageUrl) {
      toast.error("Сначала загрузите изображение или вставьте URL");
      return;
    }
    if (!isValidBorder(border)) {
      toast.error("Неверный формат обводки. Пример: 2px solid #000000");
      return;
    }
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true); // true для фокуса на редакторе
    quill.insertEmbed(range.index, "customImage", {
      src: imageUrl,
      alt: "Изображение",
      width: width || null,
      height: height || null,
      border: border || null,
      align,
    });
    quill.setSelection(range.index + 1); // Перемещаем курсор после вставленного изображения
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
          width: { xs: "90%", sm: 450 },
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Вставка изображения
        </Typography>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={isUploading || !file}
          fullWidth
          sx={{ mb: 2 }}
        >
          {isUploading ? (
            <CircularProgress size={24} />
          ) : (
            "Загрузить с компьютера"
          )}
        </Button>
        <TextField
          label="Или вставьте URL изображения"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Ширина (px)"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            type="number"
          />
          <TextField
            label="Высота (px)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            type="number"
          />
        </Box>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Выравнивание</InputLabel>
          <Select
            value={align}
            onChange={(e) => setAlign(e.target.value)}
            label="Выравнивание"
          >
            <MenuItem value="left">Слева</MenuItem>
            <MenuItem value="center">По центру</MenuItem>
            <MenuItem value="right">Справа</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Обводка (напр., 2px solid #000)"
          value={border}
          onChange={(e) => setBorder(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          error={!isValidBorder(border)}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleInsert}
            disabled={!imageUrl}
          >
            Вставить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// --- Переиспользуемый компонент редактора ---

const EditableHtmlField = ({ value, setValue, toolbarId, minHeight = 400 }) => {
  const quillRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageHandler = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: `#${toolbarId}`,
        handlers: { image: imageHandler },
      },
      clipboard: {
        matchVisual: false,
        matchers: [
          [
            "*",
            (node, delta) => {
              delta.ops = delta.ops.map((op) => ({
                ...op,
                attributes: undefined, // Удаляем ВСЕ атрибуты при вставке для чистоты
              }));
              return delta;
            },
          ],
        ],
      },
    }),
    [toolbarId, imageHandler]
  );

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 1 }}>
      <Box
        id={toolbarId}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ccc",
          p: "4px",
        }}
      >
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1" />
            <option value="2" />
            <option value="3" />
            <option value="" />
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-indent" value="-1" />
          <button className="ql-indent" value="+1" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
        </span>
        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats">
          <button className="ql-clean" />
        </span>
      </Box>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={(content, delta, source, editor) => {
          if (source === "user") {
            setValue(editor.getHTML());
          }
        }}
        modules={modules}
        theme="snow"
        style={{ minHeight: `${minHeight}px`, backgroundColor: "#fff" }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "list",
          "bullet",
          "indent",
          "link",
          "image",
          "color",
          "background",
          "customImage",
        ]}
      />
      <ImageUploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quillRef={quillRef}
      />
    </Box>
  );
};

// --- Основной компонент страницы ---

export default function EditPost() {
  const { id } = useParams();
  const { post, fetchBlogById, updatePost } = useBlogStore();
  const [isSaving, setIsSaving] = useState(false);
  const [postFormat, setPostFormat] = useState({
    heading: "",
    prewiew: "",
    text: "",
    hex: "#fcf5f5",
  });

  useEffect(() => {
    fetchBlogById(id);
  }, [id, fetchBlogById]);

  useEffect(() => {
    if (post && post.data) {
      setPostFormat({
        heading: decodeHtml(post.data.heading || ""),
        prewiew: decodeHtml(post.data.prewiew || ""),
        text: decodeHtml(post.data.text || ""),
        hex: post.data.hex || "#fcf5f5",
      });
    }
  }, [post]);

  const handleChange = useCallback((field, value) => {
    setPostFormat((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!postFormat.heading || !postFormat.text) {
      toast.error("Заголовок и содержимое поста не могут быть пустыми!");
      return;
    }
    if (!isValidHex(postFormat.hex)) {
      toast.error("Неверный формат цвета обводки. Пример: #RRGGBB");
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        heading: sanitizeContent(postFormat.heading),
        prewiew: sanitizeContent(postFormat.prewiew),
        text: sanitizeContent(postFormat.text),
        hex: postFormat.hex,
      };
      await updatePost(id, postData);
      // Уведомление об успехе будет обработано в `updatePost` внутри стора
    } catch (error) {
      toast.error(
        "Не удалось сохранить пост: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            Редактирование поста
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" component={Link} to="/admin">
              К админ-панели
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Сохранить"
              )}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            border: `3px solid ${postFormat.hex}`,
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Заголовок поста
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={postFormat.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
              placeholder="Введите главный заголовок"
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Превью (изображение для списка постов)
            </Typography>
            <EditableHtmlField
              value={postFormat.prewiew}
              setValue={(value) => handleChange("prewiew", value)}
              toolbarId="toolbar-preview"
              minHeight={200}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Основное содержимое
            </Typography>
            <EditableHtmlField
              value={postFormat.text}
              setValue={(value) => handleChange("text", value)}
              toolbarId="toolbar-main-content"
              minHeight={500}
            />
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Цвет обводки карточки
            </Typography>
            <TextField
              type="color"
              value={postFormat.hex}
              onChange={(e) => handleChange("hex", e.target.value)}
              variant="outlined"
              sx={{ width: 150, p: 0 }}
            />
            <TextField
              variant="outlined"
              value={postFormat.hex}
              onChange={(e) => handleChange("hex", e.target.value)}
              sx={{ ml: 2, verticalAlign: "middle" }}
              error={!isValidHex(postFormat.hex)}
            />
          </Box>
        </Box>
      </Container>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </Box>
  );
}
