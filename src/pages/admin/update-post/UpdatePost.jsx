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
  Input,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../configs/axiosConfig"; // Убедитесь, что путь верный
import useBlogStore from "../../../store/blogStore"; // Убедитесь, что путь верный

// --- ОБЩИЕ КОМПОНЕНТЫ И ФУНКЦИИ ---

// 1. Вспомогательные функции
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);
const decodeHtml = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
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

// 2. Кастомный обработчик изображений для Quill
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
    img.setAttribute("alt", value.alt || "Изображение");
    if (value.width) img.style.width = `${parseFloat(value.width)}px`;
    wrapper.appendChild(img);
    return wrapper;
  }
  static value(node) {
    const img = node.querySelector("img");
    return {
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      width: img.style.width ? img.style.width.replace("px", "") : null,
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
Quill.register(CustomImageBlot);

// 3. Модальное окно для загрузки изображений
const ImageUploadModal = ({ open, onClose, quillRef, setValue }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState("370");

  const handleClose = () => {
    setFile(null);
    setImageUrl("");
    setIsUploading(false);
    setWidth("370");
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Сначала выберите файл");
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
      toast.success("Изображение успешно загружено");
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
      toast.error("Сначала загрузите изображение");
      return;
    }
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "customImage", {
      src: imageUrl,
      alt: "Изображение поста",
      width: width || null,
      align: "center",
    });
    setValue(quill.root.innerHTML);
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
        >
          {isUploading ? (
            <CircularProgress size={24} />
          ) : (
            "Загрузить с компьютера"
          )}
        </Button>
        <TextField
          label="Или вставьте URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          sx={{ my: 2 }}
        />
        <TextField
          label="Ширина (px)"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          type="number"
          fullWidth
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
            disabled={!imageUrl}
          >
            Вставить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// 4. Переиспользуемый компонент-редактор
const EditableHtmlField = ({
  value,
  setValue,
  toolbarId,
  minHeight = 400,
  isPreview = false,
}) => {
  const quillRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageHandler = useCallback(() => setIsModalOpen(true), []);

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
                attributes: undefined,
              }));
              return delta;
            },
          ],
        ],
      },
    }),
    [toolbarId, imageHandler]
  );

  const toolbarOptions = isPreview ? (
    <span className="ql-formats">
      <button className="ql-image" />
    </span>
  ) : (
    <>
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
      </span>
      <span className="ql-formats">
        <button className="ql-link" />
        <button className="ql-image" />
      </span>
      <span className="ql-formats">
        <button className="ql-clean" />
      </span>
    </>
  );

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 1, overflow: "hidden" }}>
      <Box
        id={toolbarId}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ccc",
          p: "4px",
        }}
      >
        {toolbarOptions}
      </Box>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={(content, delta, source, editor) => {
          if (source === "user") setValue(editor.getHTML());
        }}
        modules={modules}
        theme="snow"
        style={{ minHeight: `${minHeight}px`, backgroundColor: "#fff" }}
      />
      <ImageUploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quillRef={quillRef}
        setValue={setValue}
      />
    </Box>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ "РЕДАКТИРОВАНИЕ ПОСТА" ---
export default function EditPost() {
  const { id } = useParams();

  // ИЗМЕНЕНИЕ 1: Используем `loading` из стора, убираем локальный `isSaving`
  const { post, fetchBlogById, updatePost, loading } = useBlogStore();

  const [postFormat, setPostFormat] = useState({
    heading: "",
    prewiew: "",
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
        prewiew: post.data.prewiew || "",
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

    // ИЗМЕНЕНИЕ 2: Логика сохранения упрощена, т.к. стор управляет загрузкой
    try {
      const postData = {
        heading: sanitizeContent(postFormat.heading),
        prewiew: sanitizeContent(postFormat.prewiew),
        text: sanitizeContent(postFormat.text),
        hex: postFormat.hex,
      };
      await updatePost(id, postData);
      toast.success("Пост успешно обновлен!");
    } catch (error) {
      toast.error("Ошибка при обновлении: " + error.message);
    }
  };

  // ИЗМЕНЕНИЕ 3: Индикатор загрузки для всей страницы при первоначальной загрузке
  if (loading && !post) {
    return (
      <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />
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
              {/* ИЗМЕНЕНИЕ 4: Кнопка "Сохранить" теперь зависит от `loading` из стора */}
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
            <EditableHtmlField
              value={postFormat.prewiew}
              setValue={(value) => handleChange("prewiew", value)}
              toolbarId="toolbar-preview-edit"
              minHeight={200}
              isPreview={true}
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
              toolbarId="toolbar-main-edit"
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
      <ToastContainer position="bottom-right" autoClose={5000} />
    </>
  );
}
