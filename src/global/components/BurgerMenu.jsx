import { Drawer, Box, List, ListItem, IconButton, Badge } from "@mui/material";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";
import useBascketStore from "../../store/bascketStore";

const BurgerMenu = ({ toggleDrawer }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { fetchUserBasket, basket } = useBascketStore();

  useEffect(() => {
    fetchUserBasket();
  }, []);

  const handleLinkClick = () => {
    toggleDrawer(false);
  };

  // const handleBasketClick = (e) => {
  //   e.preventDefault();
  //   navigate("/basket");
  // };

  return (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/delivery"
            onClick={toggleDrawer(false)}
          >
            Доставка
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/deteils"
            onClick={toggleDrawer(false)}
          >
            Реквизиты
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/returnpolicy"
            onClick={toggleDrawer(false)}
          >
            Возврат
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/blog-list"
            onClick={toggleDrawer(false)}
          >
            Блог
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/certificate"
            onClick={toggleDrawer(false)}
          >
            Электронный сертификат
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/about"
            onClick={toggleDrawer(false)}
          >
            О нас
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/contacts"
            onClick={toggleDrawer(false)}
          >
            Контакты
          </Link>
        </ListItem>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
          <Link
            style={{
              fontSize: "18px",
              marginLeft: "16px",
              marginTop: "16px",
              marginBottom: "12px",
              textDecoration: "none",
              color: "#26BDB8",
            }}
            to="/catalog/certificate"
            onClick={toggleDrawer(false)}
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
          {isAuthenticated ? (
            <Link
              style={{ color: "#26BDB8" }}
              to="/profile"
              onClick={handleLinkClick}
            >
              Личный кабинет
            </Link>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gridGap: 10,
              }}
            >
              <Link
                style={{ color: "#26BDB8" }}
                to="/auth"
                onClick={toggleDrawer(false)}
              >
                Войти
              </Link>
              <Link
                style={{ color: "#26BDB8" }}
                to="/register"
                onClick={toggleDrawer(false)}
              >
                Регистрация
              </Link>
            </Box>
          )}

          <Box>
            <Link to="/basket">
              <IconButton onClick={toggleDrawer(false)}>
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
            </Link>
          </Box>
        </Box>
      </List>
    </Box>
  );
};

export default BurgerMenu;
