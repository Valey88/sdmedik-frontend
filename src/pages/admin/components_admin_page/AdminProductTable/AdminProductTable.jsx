import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Typography,
  Select,
  MenuItem,
  TextField,
  Container,
} from "@mui/material";
import useProductStore from "../../../../store/productStore";
import { urlPictures } from "../../../../constants/constants";
import useCategoryStore from "../../../../store/categoryStore";

const AdminProductTable = () => {
  const { fetchProducts, products, deleteProduct } = useProductStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedCategory, setSelectedCategory] = useState("");
  const { fetchCategory, category } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchArcticle, setSearchArcticle] = useState("");

  // Загрузка данных при изменении страницы или категории
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    fetchProducts(selectedCategory, null, offset, itemsPerPage);
  }, [currentPage, selectedCategory]);

  // Обновление filteredProducts при изменении products
  useEffect(() => {
    if (products.data) {
      // Если products.data — это объект, оборачиваем его в массив
      const dataArray = Array.isArray(products.data)
        ? products.data
        : [products.data];
      setFilteredProducts(dataArray);
    }
  }, [products]);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setCurrentPage(1); // Сброс страницы при изменении категории
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    const offset = (currentPage - 1) * itemsPerPage;
    fetchProducts(selectedCategory, null, offset, itemsPerPage);
  };

  const handleSearchName = async () => {
    try {
      // Выполняем поиск
      await fetchProducts(null, null, null, null, null, searchTerm);
      // После успешного поиска, filteredProducts обновится автоматически
      // благодаря useEffect, который отслеживает изменения products
    } catch (error) {
      console.error("Ошибка при поиске товаров:", error);
    }
  };
  const handleSearchArcticle = async () => {
    try {
      // Выполняем поиск
      await fetchProducts(null, null, null, null, null, null, searchArcticle);
      // После успешного поиска, filteredProducts обновится автоматически
      // благодаря useEffect, который отслеживает изменения products
    } catch (error) {
      console.error("Ошибка при поиске товаров:", error);
    }
  };

  // Загрузка категорий
  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <Container sx={{ padding: 2 }}>
      <Typography sx={{ fontSize: "20px", mb: 2, mt: 2 }}>
        Таблица с Продуктами
      </Typography>
      <Box sx={{ display: "flex", gridGap:20 }}>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          displayEmpty
          sx={{ mb: 2, minWidth: 200 }}
        >
          <MenuItem value="">
            <em>Все категории</em>
          </MenuItem>
          {category.data &&
            category.data.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
        </Select>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию"
          />
          <Button
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              handleSearchName();
            }}
          >
            Найти
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <TextField
            value={searchArcticle}
            onChange={(e) => setSearchArcticle(e.target.value)}
            placeholder="Поиск по арктиклу"
          />
          <Button
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              handleSearchArcticle();
            }}
          >
            Найти
          </Button>
        </Box>
      </Box>
      <Paper sx={{ width: "100%" }}>
        <TableContainer sx={{ overflowX: "auto", height: "600px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id товара</TableCell>
                <TableCell>Фото</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Цена</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Категория
                </TableCell>
                <TableCell>Управление</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {product.images &&
                        product.images.map((image) => (
                          <img
                            key={image.id}
                            src={`${urlPictures}/${image.name}`}
                            alt="product"
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "4px",
                            }}
                          />
                        ))}
                    </Box>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {product.categories
                      ? product.categories
                          .map((category) => category.name)
                          .join(", ")
                      : "Нет категории"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Удалить
                      </Button>
                      <Button
                        variant="contained"
                        color="info"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/admin/update_product/${product.id}`;
                        }}
                      >
                        Редактировать
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
          <Pagination
            count={Math.ceil((products.count || 0) / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ mt: 2, mb: 2 }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminProductTable;
