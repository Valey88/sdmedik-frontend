import React, { useEffect, useState, useMemo } from "react";
import { create } from "zustand"; // Если useSearchStore в другом файле, импорт не нужен, но здесь для контекста
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Alert,
  Container,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search as SearchIcon,
  Clear as ClearIcon,
  PushPin,
  Article,
  Star,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import useBlogStore from "@/store/blogStore";
import useSearchStore from "@/store/searchStore"; // Убедитесь, что путь правильный

// --- Стили ---
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 50,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.3s",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    "&.Mui-focused": {
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  width: "100%",
  maxWidth: 400,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  transition: "background-color 0.2s",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  padding: theme.spacing(2),
  fontSize: "0.9rem",
}));

// --- Компонент ---
export default function AdminBlogTable() {
  // Сторонние сторы
  const { blog, fetchBlog, deletePost } = useBlogStore();
  const { search } = useSearchStore();

  // Локальное состояние
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("heading");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Загрузка данных при старте
  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Логика поиска с Debounce (задержкой)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          // Выполняем поиск с типом 'blog'
          const results = await search(searchQuery, "blog");
          setSearchResults(results);
        } catch (error) {
          console.error(error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null); // Сброс результатов, если строка пуста
      }
    }, 500); // Задержка 500мс

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, search]);

  // Обработчик сортировки
  const handleSort = (property) => () => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
      await deletePost(id);
      // Если мы в режиме поиска, нужно также обновить результаты поиска или сбросить его
      if (searchResults) {
        setSearchResults((prev) => prev.filter((item) => item.id !== id));
      }
      fetchBlog();
    }
  };

  // Определение данных для отображения (Поиск или Основной список)
  const rowsToDisplay =
    searchResults !== null ? searchResults : blog?.data || [];

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!Array.isArray(rowsToDisplay)) return [];

    return [...rowsToDisplay].sort((a, b) => {
      // Нормализация полей (так как API поиска отдает name, а блог heading)
      const aTitle = (a.heading || a.name || "").toLowerCase();
      const bTitle = (b.heading || b.name || "").toLowerCase();

      if (orderBy === "heading") {
        return order === "asc"
          ? aTitle.localeCompare(bTitle)
          : bTitle.localeCompare(aTitle);
      }
      return 0;
    });
  }, [rowsToDisplay, order, orderBy]);

  // --- Рендер состояний загрузки/ошибки (только для начальной загрузки) ---
  if (!blog && !searchResults) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          mb: 3,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Шапка с поиском */}
        <StyledHeader>
          <Box>
            <Typography variant="h5" fontWeight="700" color="text.primary">
              Управление блогом
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchResults
                ? `Результаты поиска: ${searchResults.length}`
                : `Всего постов: ${blog?.data?.length || 0}`}
            </Typography>
          </Box>

          <SearchField
            placeholder="Поиск по заголовку или тексту..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </StyledHeader>

        {isSearching ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={30} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Ищем посты...
            </Typography>
          </Box>
        ) : (
          <StyledTableContainer>
            <Table stickyHeader aria-label="Таблица постов">
              <TableHead>
                <TableRow>
                  <StyledTableCell width={80}>Превью</StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={orderBy === "heading"}
                      direction={orderBy === "heading" ? order : "asc"}
                      onClick={handleSort("heading")}
                    >
                      Заголовок / Имя
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell width={150} align="center">
                    Статус
                  </StyledTableCell>
                  <StyledTableCell width={120} align="right">
                    Действия
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((post) => {
                    // Нормализация данных из разных источников (Поиск vs Блог)
                    // Извлекаем URL картинки из HTML строки превью, если есть, или используем заглушку
                    const hasHtmlPreview =
                      post.prewiew && post.prewiew.includes("src=");
                    const imgSrcMatch = hasHtmlPreview
                      ? post.prewiew.match(/src="([^"]*)"/)
                      : null;
                    const imageUrl = imgSrcMatch ? imgSrcMatch[1] : null;

                    const title = post.heading || post.name;
                    const isPinned = post.pin_type === "pinned";
                    const isSearchItem = !post.heading; // Если нет heading, значит это результат поиска

                    return (
                      <StyledTableRow key={post.id}>
                        {/* Колонка: Превью */}
                        <StyledTableCell>
                          <Avatar
                            variant="rounded"
                            src={imageUrl}
                            sx={{ width: 56, height: 56, bgcolor: "grey.200" }}
                          >
                            <Article color="action" />
                          </Avatar>
                        </StyledTableCell>

                        {/* Колонка: Заголовок */}
                        <StyledTableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            noWrap
                            sx={{ maxWidth: 400 }}
                          >
                            {title}
                          </Typography>
                          {isSearchItem && post.snippet && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              noWrap
                              sx={{ maxWidth: 400 }}
                            >
                              {post.snippet}
                            </Typography>
                          )}
                        </StyledTableCell>

                        {/* Колонка: Статус/Тип */}
                        <StyledTableCell align="center">
                          {post.pin_type ? (
                            <Chip
                              // Выбор иконки: Скрепка для pinned, Звезда для main, ничего для остальных
                              icon={
                                post.pin_type === "pinned" ? (
                                  <PushPin fontSize="small" />
                                ) : post.pin_type === "main" ? (
                                  <Star fontSize="small" />
                                ) : undefined
                              }
                              // Текст лейбла
                              label={
                                post.pin_type === "pinned"
                                  ? "Закреплен"
                                  : post.pin_type === "main"
                                  ? "Главный"
                                  : "Обычный"
                              }
                              // Цвет: success (зеленый), info (синий/голубой), default (серый)
                              color={
                                post.pin_type === "pinned"
                                  ? "success"
                                  : post.pin_type === "main"
                                  ? "info"
                                  : "default"
                              }
                              // Стиль: заливка для важных, обводка для обычных
                              variant={
                                post.pin_type === "pinned" ||
                                post.pin_type === "main"
                                  ? "filled"
                                  : "outlined"
                              }
                              size="small"
                            />
                          ) : (
                            // Если pin_type нет (например, при поиске, если сервер его не отдает)
                            <Chip
                              label="Блог"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </StyledTableCell>

                        {/* Колонка: Действия */}
                        <StyledTableCell align="right">
                          <Stack
                            direction="row"
                            justifyContent="flex-end"
                            spacing={1}
                          >
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                sx={{
                                  color: "primary.main",
                                  bgcolor: alpha("#1976d2", 0.1),
                                }}
                                onClick={() =>
                                  (window.location.href = `/admin/update_post/${post.id}`)
                                }
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                sx={{
                                  color: "error.main",
                                  bgcolor: alpha("#d32f2f", 0.1),
                                }}
                                onClick={() => handleDelete(post.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchQuery
                          ? "По вашему запросу ничего не найдено"
                          : "Постов пока нет"}
                      </Typography>
                      {searchQuery && (
                        <Button
                          onClick={() => setSearchQuery("")}
                          sx={{ mt: 1 }}
                        >
                          Сбросить поиск
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </Paper>
    </Container>
  );
}
