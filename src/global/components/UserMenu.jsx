import { IconButton, Menu, MenuItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";

const UserMenu = () => {
  const [menuLk, setMenuLk] = useState(null);
  const { isAuthenticated, user, logout } = useUserStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const openLk = Boolean(menuLk);

  const handleClickLk = (event) => setMenuLk(event.currentTarget);
  const handleCloseLk = () => setMenuLk(null);

  useEffect(() => {
    if (user?.data) {
      setIsAdmin(user.data.role_id === 1);
    }
  }, [user]);

  // Определяем, является ли пользователь администратором
  // Используем метод из хранилища

  // const profileText = isAdmin()
  //   ? "Администратор"
  //   : user?.data?.fio || "Профиль";
  // const profilePath = isAdmin() ? "/admin" : "/profile"; // Используем единую проверку
  const profileText = isAdmin ? "Администратор" : user?.data?.fio || "Профиль";
  const profilePath = isAdmin ? "/admin" : "/profile";

  return (
    <>
      <IconButton
        id="lk-button"
        aria-controls={openLk ? "lk-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openLk ? "true" : undefined}
        onClick={handleClickLk}
      >
        <img src="/Profile.png" alt="profile" />
      </IconButton>
      <Menu
        id="lk-menu"
        anchorEl={menuLk}
        open={openLk}
        onClose={handleCloseLk}
        MenuListProps={{ "aria-labelledby": "lk-button" }}
      >
        {isAuthenticated
          ? [
              <MenuItem key="profile" onClick={handleCloseLk}>
                <Link style={{ color: "#26BDB8" }} to={profilePath}>
                  {profileText}
                </Link>
              </MenuItem>,
              <MenuItem
                key="logout"
                onClick={() => {
                  logout();
                  handleCloseLk();
                }}
              >
                <Link style={{ color: "#26BDB8" }} to="/">
                  Выйти
                </Link>
              </MenuItem>,
            ]
          : [
              <MenuItem key="login" onClick={handleCloseLk}>
                <Link style={{ color: "#26BDB8" }} to="/auth">
                  Войти
                </Link>
              </MenuItem>,
              <MenuItem key="register" onClick={handleCloseLk}>
                <Link style={{ color: "#26BDB8" }} to="/register">
                  Регистрация
                </Link>
              </MenuItem>,
            ]}
      </Menu>
      <IconButton
        onClick={(e) => {
          e.preventDefault();
          navigate("/basket");
        }}
      >
        <img src="/basket_header.png" alt="basket" />
      </IconButton>
    </>
  );
};

export default UserMenu;
