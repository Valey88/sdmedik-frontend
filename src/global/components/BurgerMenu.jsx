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
    toggleDrawer(false)();
  };

  const handleBasketClick = (e) => {
    e.preventDefault();
    navigate("/basket");
    toggleDrawer(false)();
  };

  return (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/delivery"
            onClick={handleLinkClick}
          >
            Доставка
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/deteils"
            onClick={handleLinkClick}
          >
            Реквизиты
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/returnpolicy"
            onClick={handleLinkClick}
          >
            Возврат
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/blog-list"
            onClick={handleLinkClick}
          >
            Блог
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/certificate"
            onClick={handleLinkClick}
          >
            Электронный сертификат
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/about"
            onClick={handleLinkClick}
          >
            О нас
          </Link>
        </ListItem>
        <ListItem>
          <Link
            style={{ color: "#26BDB8", marginLeft: 2 }}
            to="/contacts"
            onClick={handleLinkClick}
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
            onClick={handleLinkClick}
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
                onClick={handleLinkClick}
              >
                Войти
              </Link>
              <Link
                style={{ color: "#26BDB8" }}
                to="/register"
                onClick={handleLinkClick}
              >
                Регистрация
              </Link>
            </Box>
          )}

          <Box>
            <IconButton onClick={handleBasketClick}>
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
