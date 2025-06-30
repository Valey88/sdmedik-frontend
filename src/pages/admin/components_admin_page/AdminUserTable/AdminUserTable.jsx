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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useUserStore from "../../../../store/userStore";

const AdminUserTable = () => {
  const { fetchUsers, allUsers } = useUserStore();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [userGrowthData, setUserGrowthData] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (allUsers && allUsers.data && Array.isArray(allUsers.data.allUsers)) {
      setFilteredUsers(allUsers.data.allUsers);
      // Обновляем данные для диаграммы
      const growthData = allUsers.data.allUsers.map((user, index) => ({
        name: `Пользователей  ${index + 1}`,
        count: index + 1,
      }));
      setUserGrowthData(growthData);
    }
  }, [allUsers]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography sx={{ fontSize: "30px", mb: 2, mt: 2 }}>
        Таблица с пользователями
      </Typography>
      <Paper sx={{ width: "100%" }}>
        <TableContainer
          sx={{ overflowX: "auto", display: { xs: "none", sm: "block" } }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>ФИО</TableCell>
                <TableCell>Номер телефона</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allUsers &&
                allUsers.data &&
                allUsers.data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.fio}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Карточки для мобильных устройств */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          {allUsers &&
            allUsers.data &&
            allUsers.data.users.map((user) => (
              <Paper key={user.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box>Email: {user.email}</Box>
                  <Box>ФИО: {user.fio}</Box>
                  <Box>Номер телефона: {user.phone_number}</Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteProduct(user.id)}
                    >
                      удалить
                    </Button>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/update_product/${user.id}`;
                      }}
                    >
                      редактировать
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
        </Box>

        {/* Пагинация */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / itemsPerPage)}
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

export default AdminUserTable;
