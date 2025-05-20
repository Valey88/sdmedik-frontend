import { Drawer, Box, List, ListItem, IconButton } from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";

const BurgerMenu = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

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
              <img style={{ width: "50px" }} src="/basket_header.png" alt="" />
            </IconButton>
          </Box>
        </Box>
      </List>
    </Box>
  );
};

export default BurgerMenu;
