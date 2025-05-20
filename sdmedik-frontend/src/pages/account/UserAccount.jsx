import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Button,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  AccountCircle,
  LocalOffer,
  Settings,
  ExitToApp,
} from "@mui/icons-material";
import useUserStore from "../../store/userStore";
import useOrderStore from "../../store/orderStore";
import { useLocation } from "react-router-dom";

export default function UserAccount() {
  const { getUserInfo, user, logout } = useUserStore();
  const { fetchUserOrders, userOrders } = useOrderStore();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    // Очищаем историю, заменяя текущую запись
    window.history.replaceState({}, document.title, location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = () => {
      getUserInfo();
      fetchUserOrders();
      setLoading(false);
    };

    fetchData();
  }, [getUserInfo, fetchUserOrders]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const statusStyles = {
    pending: { color: "orange", backgroundColor: "#fff3e0" },
    processing: { color: "blue", backgroundColor: "#e3f2fd" },
    completed: { color: "green", backgroundColor: "#e8f5e9" },
    canceled: { color: "red", backgroundColor: "#ffebee" },
  };

  const statusTranslations = {
    pending: "В ожидании",
    processing: "Рассмотрен",
    completed: "Завершен",
    canceled: "Отменен",
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingTop: 3 }}>
      <Container>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Боковая панель */}
          <Box sx={{ width: { xs: "100%", md: "350px" } }}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <List>
                <ListItem>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <AccountCircle sx={{ fontSize: 40, color: "#00B3A4" }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {user?.data?.fio || "Пользователь"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.data?.email}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
                <ListItem button onClick={() => setCurrentTab(0)}>
                  <ListItemIcon>
                    <ShoppingCart />
                  </ListItemIcon>
                  <ListItemText primary="Мои заказы" />
                </ListItem>
                {/* <ListItem button onClick={() => setCurrentTab(1)}>
                  <ListItemIcon>
                    <Favorite />
                  </ListItemIcon>
                  <ListItemText primary="Избранное" />
                  <Badge badgeContent={favorites?.length} color="success" />
                </ListItem> */}
                {/* <ListItem button onClick={() => setCurrentTab(2)}>
                  <ListItemIcon>
                    <LocalOffer />
                  </ListItemIcon>
                  <ListItemText primary="Бонусы и скидки" />
                </ListItem> */}
                <ListItem button onClick={() => setCurrentTab(3)}>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="Настройки" />
                </ListItem>
                <Divider />
                <ListItem
                  sx={{ cursor: "pointer" }}
                  button
                  onClick={() => {
                    logout();
                  }}
                >
                  <ListItemIcon>
                    <ExitToApp />
                  </ListItemIcon>
                  <ListItemText primary="Выйти" />
                </ListItem>
              </List>
            </Card>
          </Box>

          {/* Основной контент */}
          <Box sx={{ flexGrow: 1 }}>
            {currentTab === 0 && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                  Мои заказы
                </Typography>
                <Grid container spacing={3}>
                  {userOrders.data?.map((order) => (
                    <Grid item key={order.id} xs={12}>
                      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Заказ №{order.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Дата заказа:{" "}
                            {new Date(order.created_at).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold" }}
                            >
                              Статус заказа
                            </Typography>
                            <Box
                              sx={{
                                ...statusStyles[order.status],
                                padding: "5px",
                                borderRadius: "4px",
                                display: "inline-block",
                              }}
                            >
                              <Typography variant="body2">
                                {statusTranslations[order.status] ||
                                  "Неизвестный статус"}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold" }}
                            >
                              Товары:
                            </Typography>
                            <List>
                              {order.items.map((item) => (
                                <ListItem key={item.id}>
                                  <ListItemText
                                    primary={item.name}
                                    secondary={`Количество: ${item.quantity}, Цена: ${item.price} руб`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {currentTab === 1 && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                  Избранное
                </Typography>
                <Grid container spacing={3}>
                  {favorites.map((item) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4}>
                      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Цена: {item.price} руб
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {currentTab === 2 && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                  Бонусы и скидки
                </Typography>
                <Typography>
                  Здесь будет информация о бонусах и скидках.
                </Typography>
              </Box>
            )}

            {currentTab === 3 && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                  Настройки
                </Typography>
                <Typography>Здесь будут настройки аккаунта.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
