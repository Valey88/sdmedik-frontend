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
  const [itemsPerPage, setItemsPerPage] = useState(20);
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
    <Container sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Управление заказами
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Фильтр по статусу</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Фильтр по статусу"
          >
            <MenuItem value="">
              <em>Все</em>
            </MenuItem>
            {Object.entries(statusTranslations).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Поиск по ФИО, email или телефону"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flex: 1, minWidth: 200 }}
        />

        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>На странице</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="На странице"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={exportToExcel}>
          Экспорт в Excel
        </Button>
      </Box>

      {selectedOrder ? (
        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Детали заказа #{selectedOrder.id}
          </Typography>
          <Typography>Email: {selectedOrder.email}</Typography>
          <Typography>Телефон: {selectedOrder.phone}</Typography>
          <Typography>ФИО: {selectedOrder.fio}</Typography>
          <Typography>Адрес доставки: {selectedOrder.address}</Typography>
          <Typography>
            Статус: {statusTranslations[selectedOrder.status]}
          </Typography>
          <Typography>
            Общая стоимость: {selectedOrder.total_price} ₽
          </Typography>
          <Typography>
            Дата создания:{" "}
            {new Date(selectedOrder.created_at).toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Tooltip title="Открыть чат с покупателем">
              <Button
                variant="contained"
                onClick={() => handleChatNavigation(selectedOrder)}
                disabled={!selectedOrder.fragment_link || loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Диалог с покупателем"
                )}
              </Button>
            </Tooltip>
            <Button variant="outlined" onClick={handleBackToOrders}>
              Назад к списку
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 3 }}>
            Товары в заказе
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Опции</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Цена за штуку</TableCell>
                  <TableCell>Полная стоимость</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.selected_options.map((i, index) => (
                        <div key={index}>
                          {i.name}: {i.value}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.price} ₽</TableCell>
                    <TableCell>{item.total_price} ₽</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Paper sx={{ width: "100%", mb: 3 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "fio"}
                      direction={
                        sortConfig.key === "fio" ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSort("fio")}
                    >
                      ФИО
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "total_price"}
                      direction={
                        sortConfig.key === "total_price"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("total_price")}
                    >
                      Общая стоимость
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "created_at"}
                      direction={
                        sortConfig.key === "created_at"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("created_at")}
                    >
                      Дата
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Действия</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.fio}</TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: "100px",
                              color: statusColors[order.status],
                            }}
                          >
                            {statusTranslations[order.status] ||
                              "Неизвестный статус"}
                          </Box>
                        </TableCell>
                        <TableCell>{order.total_price} ₽</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Просмотреть товары в заказе">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOrderSelect(order)}
                            >
                              Корзина
                            </Button>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            size="small"
                            sx={{
                              backgroundColor: statusColors[order.status],
                              color: "#fff",
                              "& .MuiSelect-icon": { color: "#fff" },
                            }}
                            disabled={loading}
                          >
                            {Object.entries(statusTranslations).map(
                              ([key, value]) => (
                                <MenuItem key={key} value={key}>
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

          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={Math.ceil(filteredOrders.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Paper>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Статистика заказов</Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Статус</TableCell>
                <TableCell>Количество заказов</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusData.map((row) => (
                <TableRow key={row.status}>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6">Общая информация</Typography>
        <Typography>Всего заказов: {totalOrders}</Typography>
        <Typography>Общая прибыль: {totalProfit.toFixed(2)} ₽</Typography>
      </Box>
    </Container>
  );
};

export default AdminOrdersTable;
