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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import XLSX from "xlsx";
import useOrderStore from "../../../../store/orderStore";

// Add the getWeek function to the Date prototype
Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

const AdminOrdersTable = () => {
  const { fetchOrders, orders, changeStatus, chats, fetchChats } =
    useOrderStore();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeFrame, setTimeFrame] = useState("month");
  const [newStatuses, setNewStatuses] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (Array.isArray(orders.data)) {
      setFilteredOrders(orders.data);
    }
  }, [orders]);

  const handleStatusFilterChange = (event) => {
    const value = event.target.value;
    setStatusFilter(value);
    if (value) {
      setFilteredOrders(orders.data.filter((order) => order.status === value));
    } else {
      setFilteredOrders(orders.data);
    }
    setCurrentPage(1);
  };

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (order_id) => {
    const status = newStatuses[order_id];
    if (status) {
      await changeStatus(order_id, status);
      setNewStatuses((prev) => ({ ...prev, [order_id]: "" }));
    }
    fetchOrders();
  };

  // Function to export table to Excel
  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      ФИО: order.fio,
      Email: order.email,
      Телефон: order.phone,
      Статус: order.status,
      "Общая стоимость": `${order.total_price} ₽`,
      Дата: new Date(order.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  // Подсчет количества заказов и прибыли по месяцам
  const orderStatsByMonth = filteredOrders.reduce((acc, order) => {
    const month = new Date(order.created_at).toLocaleString("default", {
      month: "long",
    });
    const year = new Date(order.created_at).getFullYear();
    const key = `${month} ${year}`;

    if (!acc[key]) {
      acc[key] = { count: 0, total: 0 };
    }
    acc[key].count += 1;
    acc[key].total += order.total_price;
    return acc;
  }, {});

  const orderDataByMonth = Object.keys(orderStatsByMonth).map((key) => ({
    month: key,
    count: orderStatsByMonth[key].count,
    total: orderStatsByMonth[key].total,
  }));

  // Подсчет количества заказов и прибыли по неделям
  const orderStatsByWeek = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    const week = `${date.getFullYear()}-W${date.getWeek()}`;

    if (!acc[week]) {
      acc[week] = { count: 0, total: 0 };
    }
    acc[week].count += 1;
    acc[week].total += order.total_price;
    return acc;
  }, {});

  const orderDataByWeek = Object.keys(orderStatsByWeek).map((key) => ({
    week: key,
    count: orderStatsByWeek[key].count,
    total: orderStatsByWeek[key].total,
  }));

  // Подсчет количества заказов и прибыли по дням
  const orderStatsByDay = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString();

    if (!acc[date]) {
      acc[date] = { count: 0, total: 0 };
    }
    acc[date].count += 1;
    acc[date].total += order.total_price;
    return acc;
  }, {});

  const orderDataByDay = Object.keys(orderStatsByDay).map((key) => ({
    date: key,
    count: orderStatsByDay[key].count,
    total: orderStatsByDay[key].total,
  }));

  // Выбор данных для отобржения
  let orderData;
  if (timeFrame === "month") {
    orderData = orderDataByMonth;
  } else if (timeFrame === "week") {
    orderData = orderDataByWeek;
  } else {
    orderData = orderDataByDay;
  }

  // Подсчет общей информации
  const totalOrders = filteredOrders.length;
  const totalProfit = filteredOrders.reduce(
    (acc, order) => acc + order.total_price,
    0
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Typography sx={{ fontSize: "30px", mb: 2, mt: 2 }}>
        Таблица заказов и аналитикаческих данных
      </Typography>

      {selectedOrder ? (
        <Box
          sx={{
            padding: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography variant="h6">Информация о заказе</Typography>
          <Typography>Email: {selectedOrder.email}</Typography>
          <Typography>Телефон: {selectedOrder.phone}</Typography>
          <Typography>ФИО: {selectedOrder.fio}</Typography>
          <Typography>Статус: {selectedOrder.status}</Typography>
          <Typography>
            Общая стоимость: {selectedOrder.total_price} ₽
          </Typography>
          <Typography>
            Дата создания:{" "}
            {new Date(selectedOrder.created_at).toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleBackToOrders}>
              Назад к списку заказов
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Товары в заказе
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Цена за штуку</TableCell>
                  <TableCell>Полная стоимость</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
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
        <Paper sx={{ width: "100%" }}>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={exportToExcel}>
              Экспорт в Excel
            </Button>
          </Box>
          <TableContainer sx={{ overflowX: "auto", height: "600px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Общая стоимость</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Действия</TableCell>
                  <TableCell>Изменить статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.fio}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.total_price} ₽</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleOrderSelect(order)}
                      >
                        Корзина
                      </Button>
                    </TableCell>
                    <TableCell
                      sx={{
                        display: "flex",
                        gridGap: 5,
                        flexDirection: "column",
                      }}
                    >
                      <Select
                        value={newStatuses[order.id] || order.status}
                        onChange={(e) =>
                          setNewStatuses((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        label="Статус"
                      >
                        <MenuItem value={order.status}>{order.status}</MenuItem>
                        <MenuItem value="pending">В ожидании</MenuItem>
                        <MenuItem value="processing">Рассмотрен</MenuItem>
                        <MenuItem value="completed">Завершен</MenuItem>
                        <MenuItem value="cancelled">Отменен</MenuItem>
                      </Select>
                      <Button
                        variant="contained"
                        onClick={() => handleStatusChange(order.id)}
                      >
                        Сохранить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              mb: 2,
              p: 1,
            }}
          >
            <Pagination
              count={Math.ceil(filteredOrders.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Paper>
      )}

      <FormControl variant="outlined" sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>Статус</InputLabel>
        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          label="Статус"
        >
          <MenuItem value="">
            <em>Все</em>
          </MenuItem>
          <MenuItem value="pending">В ожидании</MenuItem>
          <MenuItem value="processing">Рассмотрен</MenuItem>
          <MenuItem value="completed">Завершен</MenuItem>
          <MenuItem value="cancelled">Отменен</MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>Промежуток времени</InputLabel>
        <Select
          value={timeFrame}
          onChange={handleTimeFrameChange}
          label="Промежуток времени"
        >
          <MenuItem value="day">По дням</MenuItem>
          <MenuItem value="week">По неделям</MenuItem>
          <MenuItem value="month">По месяцам</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">
          Количество заказов по статусам и росту ({timeFrame})
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={orderData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis
              dataKey={
                timeFrame === "month"
                  ? "month"
                  : timeFrame === "week"
                  ? "week"
                  : "date"
              }
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              type="monotone"
              dataKey="count"
              fill="#4CAF50"
              strokeWidth={2}
              barSize={20}
              activeDot={{ r: 8 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">
          Прибыль по статусам и росту ({timeFrame})
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={orderData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis
              dataKey={
                timeFrame === "month"
                  ? "month"
                  : timeFrame === "week"
                  ? "week"
                  : "date"
              }
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              type="monotone"
              dataKey="total"
              fill="#82ca9d"
              strokeWidth={2}
              barSize={20}
              activeDot={{ r: 8 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Общая информация</Typography>
        <Typography>Всего заказов: {totalOrders}</Typography>
        <Typography>Общая прибыль: {totalProfit.toFixed(2)} ₽</Typography>
      </Box>
    </Box>
  );
};

export default AdminOrdersTable;
