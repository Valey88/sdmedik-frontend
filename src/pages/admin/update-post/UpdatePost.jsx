import React, { useState, useEffect, useCallback } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  GlobalStyles,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  FormatQuote,
  FormatListBulleted,
  FormatListNumbered,
  Title,
  FormatColorText,
  FormatClear,
  ArrowDropDown,
} from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Mark } from "@tiptap/core";
import sanitizeHtml from "sanitize-html";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from "react-dropzone";
import { Rnd } from "react-rnd";
import { Extension } from "@tiptap/core";

import api from "../../../configs/axiosConfig";
import useBlogStore from "../../../store/blogStore";

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

// Функция для извлечения URL из тега img (нужна для редактирования)
const extractImageUrl = (html) => {
  if (!html) return "";
  const match = html.match(/<img src="([^"]+)"/);
  return match ? match[1] : "";
};

const sanitizeContent = (html) => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "div",
      "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      img: ["src", "alt", "width", "height"],
      a: ["href", "target", "rel"],
    },
    allowedStyles: {
      "*": {
        "font-size": [/^\d+(?:px|em|%|rem)$/], // ВАЖНО: Разрешаем font-size
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        "background-color": [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
        ],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        float: [/^left$/, /^right$/],
        margin: [/^\d+(?:px|em|%|auto)$/],
        "margin-left": [/^\d+(?:px|em|%|auto)$/],
        "margin-right": [/^\d+(?:px|em|%|auto)$/],
        display: [/^block$/, /^inline-block$/],
        width: [/^\d+(?:px|em|%)$/],
        height: [/^\d+(?:px|em|%)$/],
        "white-space": [/^pre-wrap$/, /^nowrap$/, /^pre$/],
      },
    },
  });
};

const SimpleTabExtension = Extension.create({
  name: "simpleTab",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Вставляем 4 пробела и говорим редактору, что событие обработано (true)
        return this.editor.commands.insertContent("\u00A0\u00A0\u00A0\u00A0");
      },
    };
  },
});

// --- КОМПОНЕНТЫ ЗАГРУЗКИ (Идентичны созданию) ---
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
        onChange(response.data.data);
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
    onChange("");
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

const ImageUploadModal = ({ open, onClose, onInsert }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
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
    setPreview(null);
    setImageUrl("");
    setIsUploading(false);
    onClose();
  };
  const handleInsert = () => {
    if (!imageUrl) return;
    onInsert(imageUrl);
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

// --- РАСШИРЕНИЯ И КОМПОНЕНТЫ ДЛЯ TIPTAP ---
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

const ResizableImageComponent = (props) => {
  const { updateAttributes } = props;
  const { width, height, float } = props.node.attrs;

  const handleAlign = (align) => {
    updateAttributes({ float: align });
  };

  return (
    <NodeViewWrapper
      style={{
        float: float === "center" ? "none" : float,
        margin: float === "center" ? "1em auto" : "1em",
        display: "block",
      }}
    >
      <Rnd
        size={{ width, height }}
        style={{
          position: "relative",
          border: props.selected ? "2px solid #00B3A4" : "none",
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
          });
        }}
        lockAspectRatio
      >
        <img {...props.node.attrs} style={{ width: "100%", height: "100%" }} />
      </Rnd>
      {props.selected && (
        <Box
          contentEditable={false}
          sx={{
            position: "absolute",
            top: 5,
            right: 5,
            zIndex: 1,
            background: "rgba(255,255,255,0.8)",
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <ToggleButtonGroup size="small" exclusive value={float}>
            <ToggleButton value="left" onClick={() => handleAlign("left")}>
              <FormatAlignLeft />
            </ToggleButton>
            <ToggleButton value="center" onClick={() => handleAlign("center")}>
              <FormatAlignCenter />
            </ToggleButton>
            <ToggleButton value="right" onClick={() => handleAlign("right")}>
              <FormatAlignRight />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
    </NodeViewWrapper>
  );
};

const ResizableImageExtension = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: "auto" },
      height: { default: "auto" },
      float: { default: "center" },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

const TiptapToolbar = ({ editor, onImageUpload }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);

  const openLinkEditor = useCallback(() => {
    const prevUrl = editor.getAttributes("link").href;
    setLinkUrl(prevUrl || "");
    setIsLinkEditorOpen(true);
  }, [editor]);

  const saveLink = useCallback(() => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkEditorOpen(false);
  }, [editor, linkUrl]);

  if (!editor) return null;
  const currentFontSize = editor.getAttributes("textStyle").fontSize;

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        p: 1,
        mb: "1px",
        gap: 1,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bold"
          selected={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          value="underline"
          selected={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlined />
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <FormatStrikethrough />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton
          value="h2"
          selected={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Typography variant="button" sx={{ fontWeight: "bold" }}>
            H2
          </Typography>
        </ToggleButton>
        <ToggleButton
          value="h3"
          selected={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Typography variant="button" sx={{ fontWeight: "bold" }}>
            H3
          </Typography>
        </ToggleButton>
        <ToggleButton
          value="h4"
          selected={editor.isActive("heading", { level: 4 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
        >
          <Typography variant="button" sx={{ fontWeight: "bold" }}>
            H4
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Управление размером (P, Large, XL) */}
      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton
          value="p-normal"
          selected={editor.isActive("paragraph") && !currentFontSize}
          onClick={() => {
            editor.chain().focus().setParagraph().run();
            editor.chain().focus().unsetFontSize().run();
          }}
          title="Обычный текст"
        >
          <Typography variant="body2">Normal</Typography>
        </ToggleButton>
        <ToggleButton
          value="18px"
          selected={currentFontSize === "18px"}
          onClick={() => {
            editor.chain().focus().setParagraph().run();
            editor.chain().focus().setFontSize("18px").run();
          }}
          title="Крупный текст"
        >
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            Large
          </Typography>
        </ToggleButton>
        <ToggleButton
          value="22px"
          selected={currentFontSize === "22px"}
          onClick={() => {
            editor.chain().focus().setParagraph().run();
            editor.chain().focus().setFontSize("22px").run();
          }}
          title="Очень крупный"
        >
          <Typography variant="h6" sx={{ fontSize: "1.2rem" }}>
            XL
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <FormControl size="small" sx={{ minWidth: 80 }}>
        <Select
          value={currentFontSize || "default"}
          onChange={(e) => {
            if (e.target.value === "default") {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(e.target.value).run();
            }
          }}
          displayEmpty
          IconComponent={ArrowDropDown}
          sx={{ height: 40 }}
        >
          <MenuItem value="default">Auto</MenuItem>
          <MenuItem value="14px">14px</MenuItem>
          <MenuItem value="16px">16px</MenuItem>
          <MenuItem value="18px">18px</MenuItem>
          <MenuItem value="20px">20px</MenuItem>
          <MenuItem value="24px">24px</MenuItem>
          <MenuItem value="30px">30px</MenuItem>
        </Select>
      </FormControl>

      <Divider orientation="vertical" flexItem />

      <IconButton component="label" size="small">
        <FormatColorText
          sx={{ color: editor.getAttributes("textStyle").color || "grey" }}
        />
        <input
          type="color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          style={{ visibility: "hidden", width: 0, height: 0 }}
        />
      </IconButton>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton
          value="left"
          selected={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <FormatAlignLeft />
        </ToggleButton>
        <ToggleButton
          value="center"
          selected={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <FormatAlignCenter />
        </ToggleButton>
        <ToggleButton
          value="right"
          selected={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <FormatAlignRight />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />
      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton
          value="bulletList"
          selected={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Маркированный список"
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Нумерованный список"
        >
          <FormatListNumbered />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButton value="image" onClick={onImageUpload} size="small">
        <ImageIcon />
      </ToggleButton>

      {isLinkEditorOpen ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
          <TextField
            size="small"
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="url..."
            onKeyDown={(e) => e.key === "Enter" && saveLink()}
            sx={{ width: 150 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={saveLink}
            sx={{ minWidth: "auto", p: 1 }}
          >
            OK
          </Button>
        </Box>
      ) : (
        <ToggleButton
          value="link"
          selected={editor.isActive("link")}
          onClick={openLinkEditor}
          size="small"
        >
          <LinkIcon />
        </ToggleButton>
      )}
    </Paper>
  );
};

const EditableHtmlField = ({ value, onChange }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      SimpleTabExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapLink.configure({ openOnClick: false }),
      ResizableImageExtension,
      Color,
      TextStyle,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: { attributes: { class: "tiptap-editor-field" } },
  });
  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);
  const handleInsertImage = (url) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url, width: "50%" }).run();
    }
    setIsImageModalOpen(false);
  };
  return (
    <>
      <GlobalStyles
        styles={{
          ".tiptap-editor-field": {
            maxHeight: "400px",
            padding: "16px",
            "&:focus": { outline: "none" },
            whiteSpace: "pre-wrap",
            "& p": { margin: "0 0 1em 0" },
            "& ul, & ol": {
              paddingLeft: "1.5rem",
              margin: "0 0 1em 0",
            },
            "& li": {
              marginBottom: "0.5em",
            },
            "& img": { maxWidth: "100%", height: "auto" },
            '& img[data-float="left"]': { float: "left", marginRight: "1em" },
            '& img[data-float="right"]': { float: "right", marginLeft: "1em" },
            '& img[data-float="center"]': {
              display: "block",
              margin: "1em auto",
            },
            overflowY: "scroll",
          },
        }}
      />
      <Box sx={{ border: "1px solid #ccc", borderRadius: 1 }}>
        <TiptapToolbar
          editor={editor}
          onImageUpload={() => setIsImageModalOpen(true)}
        />
        <EditorContent editor={editor} />
      </Box>
      <ImageUploadModal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
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
    prewiewText: "",
    text: "",
    hex: "#ffffff",
  });

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  // Заполнение формы данными из Store
  useEffect(() => {
    if (post && post.data) {
      setPostFormat({
        heading: post.data.heading || "",
        // Извлекаем только URL картинки из HTML строки для Uploader'а
        previewUrl: extractImageUrl(post.data.prewiew),
        prewiewText: post.data.prewiew_text || "",
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
      // Готовим данные для отправки, идентично созданию
      const postData = {
        // Заворачиваем URL обратно в тег img для базы данных
        prewiew: `<img src="${postFormat.previewUrl}" alt="${postFormat.heading}" style="width: 100%;" />`,
        prewiew_text: postFormat.prewiewText,
        heading: postFormat.heading,
        text: sanitizeContent(postFormat.text), // Санитизация с поддержкой font-size
        hex: postFormat.hex,
      };

      await updatePost(id, postData);
      toast.success("Пост успешно обновлен!");
      fetchBlogById(id); // Обновляем данные на странице
    } catch (error) {
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
              2. Текст для превью картинки
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={postFormat.prewiewText}
              onChange={(e) => handleChange("prewiewText", e.target.value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              3. Заголовок
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
              4. Основное содержимое
            </Typography>
            {/* Используем наш Tiptap компонент вместо ReactQuill */}
            <EditableHtmlField
              value={postFormat.text}
              onChange={(value) => handleChange("text", value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              5. Цвет окантовки
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
