import {
  Box,
  Button,
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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import useBlogStore from "../../../../store/blogStore";

// Стили для улучшения внешнего вида
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: "calc(100vh - 150px)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  fontSize: "0.875rem",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.75rem",
    padding: theme.spacing(0.5),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  height: 48,
  [theme.breakpoints.down("sm")]: {
    height: 36,
  },
}));

export default function AdminBlogTable() {
  const { blog, fetchBlog, deleteBlogPost } = useBlogStore();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("heading");

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Обработчик сортировки
  const handleSort = (property) => () => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Сортировка данных
  const sortedData = blog?.data
    ? [...blog.data].sort((a, b) => {
        if (orderBy === "heading") {
          return order === "asc"
            ? a.heading.localeCompare(b.heading)
            : b.heading.localeCompare(a.heading);
        }
        return 0;
      })
    : [];

  // Проверка состояний
  if (!blog) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (blog.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Ошибка загрузки постов: {blog.error}
        </Alert>
      </Box>
    );
  }

  if (!blog.data || !Array.isArray(blog.data) || blog.data.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Нет данных для отображения
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader size="small" aria-label="Таблица постов блога">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "heading"}
                  direction={orderBy === "heading" ? order : "asc"}
                  onClick={handleSort("heading")}
                >
                  Заголовок поста
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell align="right">Действия</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((post) => (
              <StyledTableRow key={post.id}>
                <StyledTableCell>{post.title || post.heading}</StyledTableCell>
                <StyledTableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        window.location.href = `/admin/update_post/${post.id}`;
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteBlogPost(post.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Container>
  );
}
