import React, { useEffect, useState, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  TextField,
  CircularProgress,
  Tooltip,
  TableSortLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import XLSX from "xlsx";
import useOrderStore from "../../../../store/orderStore";

Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

const AdminOrdersTable = () => {
  const { fetchOrders, orders, changeStatus } = useOrderStore();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Increased default to show more rows
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        await fetchOrders();
      } catch (err) {
        setError("Ошибка загрузки заказов");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (Array.isArray(orders.data)) {
      let filtered = orders.data;

      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (order) =>
            order.fio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.phone.includes(searchQuery)
        );
      }

      // Apply sorting
      filtered = [...filtered].sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === "asc" ? 1 : -1;
        if (key === "created_at") {
          return direction * (new Date(a[key]) - new Date(b[key]));
        }
        return direction * String(a[key]).localeCompare(String(b[key]));
      });

      setFilteredOrders(filtered);
    }
  }, [orders, statusFilter, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (order_id, status) => {
    setLoading(true);
    try {
      await changeStatus(order_id, status);
      fetchOrders();
    } catch (err) {
      setError(`Ошибка изменения статуса заказа ${order_id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChatNavigation = (order) => {
    if (!order.fragment_link) {
      setError("Отсутствует ссылка на чат для заказа");
      return;
    }
    try {
      const url = new URL(order.fragment_link);
      const fragmentId = url.searchParams.get("fragment");
      const chatId = url.searchParams.get("chat_id");
      if (!chatId || !fragmentId) {
        setError("Некорректная ссылка на чат");
        return;
      }
      navigate(`/admin/admin_chat?chat_id=${chatId}&fragment=${fragmentId}`);
    } catch (err) {
      setError("Ошибка парсинга ссылки на чат");
    }
  };

  const statusStats = useMemo(
    () =>
      filteredOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}),
    [filteredOrders]
  );

  const statusData = [
    { status: "В ожидании", count: statusStats["pending"] || 0 },
    { status: "Рассмотрен", count: statusStats["processing"] || 0 },
    { status: "Оплачен", count: statusStats["paid"] || 0 },
    { status: "Завершен", count: statusStats["completed"] || 0 },
    { status: "Отменен", count: statusStats["cancelled"] || 0 },
  ];

  const statusTranslations = {
    pending: "В ожидании",
    paid: "Оплачен",
    processing: "Рассмотрен",
    completed: "Завершен",
    cancelled: "Отменен",
  };

  const statusColors = {
    pending: "#ff9800",
    paid: "#4caf50",
    processing: "#2196f3",
    completed: "#2e7d32",
    cancelled: "#f44336",
  };

  const totalOrders = filteredOrders.length;
  const totalProfit = filteredOrders.reduce(
    (acc, order) => acc + order.total_price,
    0
  );

  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      ФИО: order.fio,
      Email: order.email,
      Телефон: order.phone,
      Статус: statusTranslations[order.status],
      "Общая стоимость": `${order.total_price} ₽`,
      Дата: new Date(order.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  return (
    <Container sx={{ padding: 1 }}>
      <Typography variant="h6" sx={{ mb: 0.5, fontSize: "0.9rem" }}>
        Управление заказами
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 0.5, fontSize: "0.8rem" }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        

        <TextField
          placeholder="Поиск"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flex: 1, minWidth: 120, fontSize: "0.7rem", height: 24 }}
          InputProps={{ sx: { fontSize: "0.7rem", height: 24, py: 0 } }}
          InputLabelProps={{ sx: { fontSize: "0.7rem" } }}
        />

        <FormControl variant="outlined" sx={{ minWidth: 80, height: 24 }}>
          <InputLabel sx={{ fontSize: "0.7rem", lineHeight: "0.8rem" }}>
            На странице
          </InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="На странице"
            sx={{ fontSize: "0.7rem", height: 24, py: 0 }}
          >
            <MenuItem value={10} sx={{ fontSize: "0.7rem" }}>
              10
            </MenuItem>
            <MenuItem value={20} sx={{ fontSize: "0.7rem" }}>
              20
            </MenuItem>
            <MenuItem value={50} sx={{ fontSize: "0.7rem" }}>
              50
            </MenuItem>
            <MenuItem value={100} sx={{ fontSize: "0.7rem" }}>
              100
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={exportToExcel}
          sx={{ fontSize: "0.7rem", py: 0.2, px: 1, minWidth: 80, height: 24 }}
        >
          Excel
        </Button>
      </Box>

      {selectedOrder ? (
        <Box sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "0.9rem", mb: 0.5 }}>
            Заказ #{selectedOrder.id}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Email: {selectedOrder.email}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Телефон: {selectedOrder.phone}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            ФИО: {selectedOrder.fio}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Адрес: {selectedOrder.address}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Статус: {statusTranslations[selectedOrder.status]}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Стоимость: {selectedOrder.total_price} ₽
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Дата: {new Date(selectedOrder.created_at).toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 0.5, display: "flex", gap: 0.5 }}>
            <Tooltip title="Чат с покупателем">
              <Button
                variant="contained"
                onClick={() => handleChatNavigation(selectedOrder)}
                disabled={!selectedOrder.fragment_link || loading}
                sx={{ fontSize: "0.7rem", py: 0.2, px: 1, height: 20 }}
              >
                {loading ? <CircularProgress size={12} /> : "Чат"}
              </Button>
            </Tooltip>
            <Button
              variant="outlined"
              onClick={handleBackToOrders}
              sx={{ fontSize: "0.7rem", py: 0.2, px: 1, height: 20 }}
            >
              Назад
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
            Товары
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 0.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    Название
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    Опции
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    Кол-во
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    Цена
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    Итог
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                      {item.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                      {item.selected_options.map((i, index) => (
                        <div key={index} style={{ fontSize: "0.7rem" }}>
                          {i.name}: {i.value}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                      {item.price} ₽
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                      {item.total_price} ₽
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Paper sx={{ width: "100%", mb: 1 }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 150px)" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    <TableSortLabel
                      active={sortConfig.key === "fio"}
                      direction={
                        sortConfig.key === "fio" ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSort("fio")}
                      sx={{ fontSize: "0.7rem" }}
                    >
                      ФИО
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    Телефон
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    Статус
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    <TableSortLabel
                      active={sortConfig.key === "total_price"}
                      direction={
                        sortConfig.key === "total_price"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("total_price")}
                      sx={{ fontSize: "0.7rem" }}
                    >
                      Стоимость
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    <TableSortLabel
                      active={sortConfig.key === "created_at"}
                      direction={
                        sortConfig.key === "created_at"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("created_at")}
                      sx={{ fontSize: "0.7rem" }}
                    >
                      Дата
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    Действия
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}>
                    Статус
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 0.2 }}>
                      <CircularProgress size={16} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((order) => (
                      <TableRow key={order.id} hover sx={{ height: 24 }}>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          {order.fio}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          {order.email}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          {order.phone}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          <Box
                            sx={{
                              width: "80px",
                              color: statusColors[order.status],
                              fontSize: "0.7rem",
                            }}
                          >
                            {statusTranslations[order.status] || "Неизвестный"}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          {order.total_price} ₽
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          <Tooltip title="Товары в заказе">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOrderSelect(order)}
                              sx={{
                                fontSize: "0.7rem",
                                py: 0.2,
                                px: 0.5,
                                minWidth: 50,
                                height: 20,
                              }}
                            >
                              Корзина
                            </Button>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 0.5 }}
                        >
                          <Select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 20,
                              py: 0,
                              backgroundColor: statusColors[order.status],
                              color: "#fff",
                              "& .MuiSelect-icon": { color: "#fff" },
                            }}
                            disabled={loading}
                          >
                            {Object.entries(statusTranslations).map(
                              ([key, value]) => (
                                <MenuItem
                                  key={key}
                                  value={key}
                                  sx={{ fontSize: "0.7rem" }}
                                >
                                  {value}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", p: 0.5 }}>
            <Pagination
              count={Math.ceil(filteredOrders.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "0.7rem",
                  minWidth: 24,
                  height: 24,
                },
              }}
            />
          </Box>
        </Paper>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: "0.8rem" }}>
          Статистика
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 100,}}>
          <InputLabel sx={{ fontSize: "0.7rem", lineHeight: "0.8rem" }}>
            Статус
          </InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Статус"
            sx={{ fontSize: "0.7rem", height: 45, py: 0 }}
          >
            <MenuItem value="" sx={{ fontSize: "0.7rem" }}>
              <em>Все</em>
            </MenuItem>
            {Object.entries(statusTranslations).map(([key, value]) => (
              <MenuItem key={key} value={key} sx={{ fontSize: "0.7rem" }}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TableContainer component={Paper} sx={{ mt: 0.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                  Статус
                </TableCell>
                <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                  Кол-во
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusData.map((row) => (
                <TableRow key={row.status}>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    {row.status}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.7rem", py: 0.2 }}>
                    {row.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontSize: "0.8rem" }}>
          Итоги
        </Typography>
        <Typography sx={{ fontSize: "0.7rem" }}>
          Заказов: {totalOrders}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem" }}>
          Прибыль: {totalProfit.toFixed(2)} ₽
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminOrdersTable;
