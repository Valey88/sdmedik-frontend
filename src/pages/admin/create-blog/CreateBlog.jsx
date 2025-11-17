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
import SaveIcon from "@mui/icons-material/Save";
import { Helmet } from "react-helmet";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../configs/axiosConfig"; // Убедитесь, что путь к вашему axios инстансу верный
import useUserStore from "../../../store/userStore"; // Убедитесь, что путь к вашему стору верный

// --- ОБЩИЕ КОМПОНЕНТЫ И ФУНКЦИИ ---

// 1. Вспомогательные функции
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);
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

// 3. Модальное окно для загрузки изображений (с исправлениями)
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
      // ИСПРАВЛЕНИЕ 1: Добавляем правильный заголовок для отправки файла
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

    // ИСПРАВЛЕНИЕ 2: Принудительно обновляем состояние React после вставки
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
      // ИСПРАВЛЕНИЕ 3: Очистка стилей при вставке текста
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
          if (source === "user") setValue(editor.getHTML()); // Защита от бесконечных циклов
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

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ "СОЗДАНИЕ ПОСТА" ---
export default function BlogAdminPanel() {
  const [newPost, setNewPost] = useState({
    prewiew: "",
    heading: "",
    text: "",
    hex: "#00B3A4",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user, isAuthenticated, getUserInfo } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        const userInfo = await getUserInfo();
        if (userInfo?.data?.role !== "admin") {
          toast.error("Доступ к этой странице есть только у администраторов.");
          navigate("/login");
        }
      } else if (user?.data?.role !== "admin") {
        toast.error("Доступ к этой странице есть только у администраторов.");
        navigate("/login");
      }
    };
    checkAuth();
  }, [isAuthenticated, user, getUserInfo, navigate]);

  const handleChange = useCallback((field, value) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.heading || !newPost.text || !newPost.prewiew) {
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
        prewiew: sanitizeContent(newPost.prewiew),
        heading: sanitizeContent(newPost.heading),
        text: sanitizeContent(newPost.text),
        hex: newPost.hex,
      };
      await api.post("/blog", postData);
      toast.success("Новый пост успешно создан!");
      setNewPost({ prewiew: "", heading: "", text: "", hex: "#00B3A4" }); // Сброс формы
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Вставьте одно изображение. Рекомендуемая ширина ~370px.
            </Typography>
            <EditableHtmlField
              value={newPost.prewiew}
              setValue={(value) => handleChange("prewiew", value)}
              toolbarId="toolbar-preview-create" // Уникальный ID для тулбара
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
              placeholder="Введите главный заголовок поста"
              value={newPost.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              3. Основное содержимое
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Напишите основной текст статьи. Форматирование при вставке будет
              очищено.
            </Typography>
            <EditableHtmlField
              value={newPost.text}
              setValue={(value) => handleChange("text", value)}
              toolbarId="toolbar-main-create" // Уникальный ID для тулбара
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
