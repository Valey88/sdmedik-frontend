import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Container,
  Paper,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import api from "../../../configs/axiosConfig";

// Предопределённые страницы для выпадающего меню
const pages = [
  { path: "/certificate", name: "Электронные сертификаты" },
  { path: "/contacts", name: "Контакты" },
  { path: "/deteils", name: "Реквизиты" },
  { path: "/about", name: "О нас" },
  { path: "/delivery", name: "Доставка" },
  { path: "/returnpolicy", name: "Политика возврата" },
];

export default function PageContentEditor() {
  const [pagePath, setPagePath] = useState(""); // Выбранный путь страницы (например, /delivery)
  const [pageContent, setPageContent] = useState([]); // Содержимое страницы, всегда массив
  const [loading, setLoading] = useState(false); // Состояние загрузки при сохранении
  const [isFetching, setIsFetching] = useState(false); // Состояние загрузки при получении
  const [originalContent, setOriginalContent] = useState([]); // Исходное содержимое

  // Получение содержимого страницы при изменении pagePath
  useEffect(() => {
    if (!pagePath) {
      setPageContent([]); // Сбрасываем содержимое, если путь не выбран
      setOriginalContent([]);
      return;
    }

    const fetchPageContent = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/page${pagePath}`);
        console.log("API Response:", response.data); // Отладка
        // Нормализация данных: извлекаем массив elements из response.data.data
        const data = Array.isArray(response.data?.data?.elements)
          ? response.data.data.elements
          : [];
        const pageName = pagePath.startsWith("/")
          ? pagePath.slice(1)
          : pagePath;
        // Устанавливаем содержимое
        const newContent =
          data.length > 0
            ? data.map((item) => ({
                id: item.id || "",
                element_id: item.element_id || "",
                page_path: item.page_path || pageName,
                value: item.value || "",
              }))
            : [{ id: "", element_id: "", page_path: pageName, value: "" }];
        console.log("Processed pageContent:", newContent); // Отладка
        setPageContent(newContent);
        setOriginalContent(newContent);
      } catch (error) {
        console.error("Ошибка при получении содержимого страницы:", error);
        toast.error("Не удалось загрузить содержимое страницы");
        // Инициализация с пустым элементом при ошибке
        const pageName = pagePath.startsWith("/")
          ? pagePath.slice(1)
          : pagePath;
        const newContent = [
          { id: "", element_id: "", page_path: pageName, value: "" },
        ];
        setPageContent(newContent);
        setOriginalContent(newContent);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPageContent();
  }, [pagePath]);

  // Обработка изменения пути страницы
  const handlePagePathChange = (e) => {
    setPagePath(e.target.value);
  };

  // Обработка изменения поля
  const handleFieldChange = (index, field, value) => {
    setPageContent((prevContent) =>
      prevContent.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // Добавление нового элемента
  const handleAddElement = () => {
    if (!pagePath) {
      toast.warn("Сначала выберите страницу");
      return;
    }
    const pageName = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
    setPageContent((prevContent) => [
      ...prevContent,
      { id: "", element_id: "", page_path: pageName, value: "" },
    ]);
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Валидация: проверка заполненности всех полей
    const hasInvalidFields = pageContent.some(
      (item) => !item.element_id || !item.page_path || !item.value
    );
    if (hasInvalidFields) {
      toast.warn(
        "Все поля (ID элемента, путь страницы, содержимое) должны быть заполнены"
      );
      setLoading(false);
      return;
    }

    try {
      // Отправка обновлений для каждого элемента
      const updatePromises = pageContent.map((item) =>
        api.post("/page", {
          element_id: item.element_id,
          page_path: item.page_path,
          value: item.value,
        })
      );
      await Promise.all(updatePromises);
      toast.success("Содержимое страницы успешно обновлено");
      setOriginalContent([...pageContent]);
    } catch (error) {
      console.error("Ошибка при обновлении содержимого страницы:", error);
      toast.error(
        `Не удалось обновить содержимое страницы: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Обработка сброса изменений
  const handleReset = () => {
    setPageContent([...originalContent]);
    toast.info("Изменения сброшены");
  };

  // Отображение состояния загрузки
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
            Редактирование содержимого страницы
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Выпадающее меню для выбора страницы */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Выберите страницу</InputLabel>
                  <Select
                    value={pagePath}
                    onChange={handlePagePathChange}
                    label="Выберите страницу"
                  >
                    <MenuItem value="">
                      <em>Выберите страницу</em>
                    </MenuItem>
                    {pages.map((page) => (
                      <MenuItem key={page.path} value={page.path}>
                        {page.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Проверка, что pageContent является массивом */}
              {Array.isArray(pageContent) && pageContent.length > 0 ? (
                pageContent.map((item, index) => (
                  <Grid item xs={12} key={item.id || `element-${index}`}>
                    <Typography variant="h6" gutterBottom>
                      Элемент {index + 1}
                    </Typography>
                    <TextField
                      label="ID элемента"
                      value={item.element_id || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "element_id", e.target.value)
                      }
                      fullWidth
                      margin="normal"
                      placeholder="например, header-title"
                      required
                    />
                    <TextField
                      label="Путь страницы"
                      value={item.page_path || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "page_path", e.target.value)
                      }
                      fullWidth
                      margin="normal"
                      placeholder="например, delivery"
                      required
                    />
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Содержимое:
                    </Typography>
                    <ReactQuill
                      value={item.value || ""}
                      onChange={(value) =>
                        handleFieldChange(index, "value", value)
                      }
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, false] }],
                          ["bold", "italic", "underline"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["clean"],
                        ],
                      }}
                      formats={[
                        "header",
                        "bold",
                        "italic",
                        "underline",
                        "list",
                        "bullet",
                      ]}
                      style={{ height: "200px", marginBottom: "40px" }}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography>
                    Редактируемое содержимое для этой страницы не найдено.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddElement}
                    sx={{ mt: 2 }}
                    disabled={!pagePath}
                  >
                    Добавить элемент
                  </Button>
                </Grid>
              )}

              {/* Кнопка для добавления нового элемента */}
              {Array.isArray(pageContent) && pageContent.length > 0 && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddElement}
                    sx={{ mb: 2 }}
                    disabled={!pagePath}
                  >
                    Добавить элемент
                  </Button>
                </Grid>
              )}

              {/* Кнопки управления */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Сбросить
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !pagePath || !pageContent.length}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Сохранить изменения"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
