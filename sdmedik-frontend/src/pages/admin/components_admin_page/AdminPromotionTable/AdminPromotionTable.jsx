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
} from "@mui/material";
import usePromotionStore from "../../../../store/promotionStore";
import { urlPictures } from "../../../../constants/constants";
import useCategoryStore from "../../../../store/categoryStore";

const AdminPromotionTable = () => {
  const { fetchPromotion, promotions, deletePromotion } = usePromotionStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchPromotion();
  }, []);

  useEffect(() => {
    if (promotions && Array.isArray(promotions.data)) {
      setFilteredProducts(promotions.data);
    } else {
      setFilteredProducts([]); // Если данных нет, устанавливаем пустой массив
    }
  }, [promotions]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDeletePromotion = async (id) => {
    await deletePromotion(id);
    fetchPromotion();
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography sx={{ fontSize: "30px", mb: 2, mt: 2 }}>
        Таблица с Акциями
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <TableContainer
          sx={{
            overflowX: "auto",
            display: { xs: "none", sm: "block" },
            height: "600px",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название акции</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Дата начала акции</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Дата конца акции
                </TableCell>
                <TableCell>Управление</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {promotion.name}
                      </Box>
                    </TableCell>
                    <TableCell>{promotion.description}</TableCell>
                    <TableCell>{promotion.start_date}</TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      {promotion.end_date}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeletePromotion(promotion.id)}
                        >
                          удалить
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Нет доступных акций
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
          <Pagination
            count={Math.ceil(filteredProducts.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ mt: 2, mb: 2 }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPromotionTable;
