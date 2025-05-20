import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Link,
} from "@mui/material";
import { useState } from "react";

const NavBar = () => {
  const [menuCategories, setMenuCategories] = useState(null);
  const [menuUsers, setMenuUsers] = useState(null);
  const [menuProducts, setMenuProducts] = useState(null);
  const [menuPromotion, setMenuPromotion] = useState(null);

  const openCategories = Boolean(menuCategories);
  const openProducts = Boolean(menuProducts);
  const openUsers = Boolean(menuUsers);
  const openPromotion = Boolean(menuPromotion);

  const handleCloseCategoryMenu = () => {
    setMenuCategories(null);
  };
  const handleClickCategoryMenu = (event) => {
    setMenuCategories(event.currentTarget);
  };
  const handleCloseUsersMenu = () => {
    setMenuUsers(null);
  };
  const handleClickUsersMenu = (event) => {
    setMenuUsers(event.currentTarget);
  };
  const handleCloseProductMenu = () => {
    setMenuProducts(null);
  };
  const handleClickProductMenu = (event) => {
    setMenuProducts(event.currentTarget);
  };
  const handleClickPromotionMenu = (event) => {
    setMenuPromotion(event.currentTarget);
  };
  const handleClosePromotionMenu = () => {
    setMenuPromotion(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Link
          href="/admin"
          sx={{ flexGrow: 1, color: "#fff", cursor: "pointer" }}
        >
          Админ панель
        </Link>
        <Button
          color="inherit"
          id="basic-button"
          aria-controls={openPromotion ? "promotion-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openPromotion ? "true" : undefined}
          onClick={handleClickPromotionMenu}
        >
          Акции
        </Button>
        <Menu
          id="promotion-menu"
          anchorEl={menuPromotion}
          open={openPromotion}
          onClose={handleClosePromotionMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem>
            <Link href="/admin/create_promotion">Создать Акцию</Link>
          </MenuItem>
          <MenuItem onClick={handleClosePromotionMenu}>
            <Link href="/admin/table_promotion">Таблица с Акциями</Link>
          </MenuItem>
        </Menu>
        <Button
          color="inherit"
          id="basic-button"
          aria-controls={openCategories ? "category-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openCategories ? "true" : undefined}
          onClick={handleClickCategoryMenu}
        >
          Категории
        </Button>
        <Menu
          id="category-menu"
          anchorEl={menuCategories}
          open={openCategories}
          onClose={handleCloseCategoryMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem>
            <Link href="/admin/create_category">Создать категорию</Link>
          </MenuItem>
          <MenuItem onClick={handleCloseCategoryMenu}>
            <Link href="/admin/table_category">Таблица с категориями</Link>
          </MenuItem>
        </Menu>
        <Button
          color="inherit"
          id="basic-button"
          aria-controls={openProducts ? "products-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openProducts ? "true" : undefined}
          onClick={handleClickProductMenu}
        >
          Товары
        </Button>
        <Menu
          id="products-menu"
          anchorEl={menuProducts}
          open={openProducts}
          onClose={handleCloseProductMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleCloseProductMenu}>
            <Link href="/admin/create_product">Создать товар</Link>
          </MenuItem>
          <MenuItem onClick={handleCloseProductMenu}>
            <Link href="/admin/table_product">Таблица с товарами</Link>
          </MenuItem>
        </Menu>
        <Button
          color="inherit"
          id="basic-button"
          aria-controls={openUsers ? "users-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openUsers ? "true" : undefined}
          onClick={handleClickUsersMenu}
        >
          Пользователи
        </Button>
        <Menu
          id="users-menu"
          anchorEl={menuUsers}
          open={openUsers}
          onClose={handleCloseUsersMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleCloseUsersMenu}>
            <Link href="/admin/table_user">Таблица с пользователями</Link>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
export default NavBar;
