import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import useCategoryStore from "../../../../store/categoryStore";
import { urlPictures } from "../../../../constants/constants";

export default function AdminCategoriesTable() {
  const { fetchCategory, category, deleteCategory } = useCategoryStore();

  useEffect(() => {
    fetchCategory();
    console.log(category);
  }, []);

  const handleDeleteProduct = async (id) => {
    await deleteCategory(id);
    fetchCategory();
  };

  return (
    <Box>
      <Typography sx={{ fontSize: "30px", mb: 2, mt: 2 }}>
        Таблица с категориями
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Фото</TableCell>
              <TableCell align="left">Название Категори</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(category.data) &&
              category.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <img
                        key={item.id}
                        src={`${urlPictures}/${item.images[0].name}`}
                        alt="product"
                        style={{ width: 50, height: 50, borderRadius: "4px" }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="left">{item.name}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteProduct(item.id)}
                    >
                      Удалить
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/admin/update_category/${item.id}`;
                      }}
                    >
                      Редактировать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
