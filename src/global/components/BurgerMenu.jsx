import { Drawer, Box, List, ListItem, IconButton, Badge } from "@mui/material";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";
import useBascketStore from "../../store/bascketStore";

const BurgerMenu = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { fetchUserBasket, basket } = useBascketStore();
  useEffect(() => {
    fetchUserBasket();
  }, []);
  return (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/delivery">
            Доставка
          </Link>
        </ListItem>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/deteils">
            Реквизиты
          </Link>
        </ListItem>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/returnpolicy">
            Возврат
          </Link>
        </ListItem>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/blog-list">
            Блог
          </Link>
        </ListItem>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/certificate">
            Электронный сертификат
          </Link>
        </ListItem>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/about">
            О нас
          </Link>
        </ListItem>
        <ListItem>
          <Link style={{ color: "#26BDB8", marginLeft: 2 }} to="/contacts">
            Контакты
          </Link>
        </ListItem>        
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
          {/* {!shouldHideCatalogButton && ( // Условие для отображения кнопки "Каталог" в бургер-меню */}
          {/* <Link
            style={{
              fontSize: "18px",
              marginLeft: "16px",
              marginTop: "16px",
              textDicoration: "none",
              color: "#26BDB8",
            }}
            to="/catalog"
          >
            Каталог
          </Link> */}
          {/* )} */}
          <Link
            style={{
              fontSize: "18px",
              marginLeft: "16px",
              marginTop: "16px",
              marginBottom: "12px",
              textDicoration: "none",
              color: "#26BDB8",
            }}
            to="/catalog/certificate"
          >
            Каталог
          </Link>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: 4,
            mt: 2,
          }}
        >
          {isAuthenticated
            ? [
                <Link style={{ color: "#26BDB8" }} to="/profile" key="profile">
                  Личный кабинет
                </Link>,
              ]
            : [
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gridGap: 10,
                  }}
                  key="auth-links"
                >
                  <Link style={{ color: "#26BDB8" }} to="/auth">
                    Войти
                  </Link>
                  <Link style={{ color: "#26BDB8" }} to="/register">
                    Регистрация
                  </Link>
                </Box>,
              ]}

          <Box>
            <IconButton
              onClick={(e) => {
                e.preventDefault();
                navigate("/basket");
              }}
            >
              <Badge
                badgeContent={basket?.data?.quantity}
                color="primary"
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#26BDB8",
                    color: "white",
                  },
                }}
              >
                <img
                  style={{ width: 45, height: 45 }}
                  src="/basket_header.png"
                  alt="basket"
                />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </List>
    </Box>
  );
};

export default BurgerMenu;
