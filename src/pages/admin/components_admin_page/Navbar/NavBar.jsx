import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Link,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

const NavBar = () => {
  const [menuCategories, setMenuCategories] = useState(null);
  const [menuUsers, setMenuUsers] = useState(null);
  const [menuProducts, setMenuProducts] = useState(null);
  const [menuPromotion, setMenuPromotion] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuBlogs, setMenuBlogs] = useState(null);

  const openCategories = Boolean(menuCategories);
  const openProducts = Boolean(menuProducts);
  const openUsers = Boolean(menuUsers);
  const openPromotion = Boolean(menuPromotion);
  const openBlog = Boolean(menuBlogs);

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
  const handleCloseBlogMenu = () => {
    setMenuBlogs(null);
  };
  const handleClickBlogMenu = (event) => {
    setMenuBlogs(event.currentTarget);
  };
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    {
      label: "Админ панель",
      href: "/admin",
      isButton: false,
    },
    {
      label: "Чат с админом",
      href: "/admin/admin_chat",
      isButton: false,
    },
    {
      label: "Акции",
      items: [
        { label: "Создать акцию", href: "/admin/create_promotion" },
        { label: "Таблица акций", href: "/admin/table_promotion" },
      ],
      menuState: menuPromotion,
      open: openPromotion,
      handleClick: handleClickPromotionMenu,
      handleClose: handleClosePromotionMenu,
      id: "promotion-menu",
    },
    {
      label: "Категории",
      items: [
        { label: "Создать категорию", href: "/admin/create_category" },
        { label: "Таблица категорий", href: "/admin/table_category" },
      ],
      menuState: menuCategories,
      open: openCategories,
      handleClick: handleClickCategoryMenu,
      handleClose: handleCloseCategoryMenu,
      id: "category-menu",
    },
    {
      label: "Товары",
      items: [
        { label: "Создать товар", href: "/admin/create_product" },
        { label: "Таблица товаров", href: "/admin/table_product" },
      ],
      menuState: menuProducts,
      open: openProducts,
      handleClick: handleClickProductMenu,
      handleClose: handleCloseProductMenu,
      id: "products-menu",
    },
    {
      label: "Пользователи",
      items: [{ label: "Таблица пользователей", href: "/admin/table_user" }],
      menuState: menuUsers,
      open: openUsers,
      handleClick: handleClickUsersMenu,
      handleClose: handleCloseUsersMenu,
      id: "users-menu",
    },
    {
      label: "Редактор страниц",
      href: "/admin/edit_page",
      isButton: false,
    },
    {
      label: "Блог",
      items: [
        { label: "Создать Пост", href: "/admin/create-blog" },
        { label: "Таблица Постов", href: "/admin/table_blog" },
      ],
      menuState: menuBlogs,
      open: openBlog,
      handleClick: handleClickBlogMenu,
      handleClose: handleCloseBlogMenu,
      id: "blog-menu",
    },
  ];

  return (
    <AppBar position="static" sx={{ bgcolor: "#1976D2" }}>
      <Toolbar sx={{ minHeight: { xs: 48, sm: 34 }, px: { xs: 1, sm: 2 } }}>
        {/* Desktop Menu */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            width: "100%",
          }}
        >
          {menuItems.map((item, index) => (
            <Box key={index} sx={{ mx: 1 }}>
              {item.isButton !== false ? (
                <>
                  <Button
                    color="inherit"
                    id={`basic-button-${item.id}`}
                    aria-controls={item.open ? item.id : undefined}
                    aria-haspopup="true"
                    aria-expanded={item.open ? "true" : undefined}
                    onClick={item.handleClick}
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      textTransform: "none",
                    }}
                  >
                    {item.label}
                  </Button>
                  <Menu
                    id={item.id}
                    anchorEl={item.menuState}
                    open={item.open}
                    onClose={item.handleClose}
                    MenuListProps={{
                      "aria-labelledby": `basic-button-${item.id}`,
                    }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    sx={{
                      "& .MuiMenu-paper": {
                        minWidth: 150,
                        animation: !/iPhone|iPad|iPod/.test(navigator.userAgent)
                          ? "inherit"
                          : "none",
                      },
                    }}
                  >
                    {item.items?.map((subItem, subIndex) => (
                      <MenuItem key={subIndex} onClick={item.handleClose}>
                        <Link
                          href={subItem.href}
                          sx={{
                            color: "#000",
                            textDecoration: "none",
                            fontSize: "0.875rem",
                          }}
                        >
                          {subItem.label}
                        </Link>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Link
                  href={item.href}
                  sx={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    mx: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Link>
              )}
            </Box>
          ))}
        </Box>

        {/* Mobile Menu Icon */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            width: "100%",
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              color: "#fff",
            }}
          >
            Админ панель
          </Typography>
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "75%", sm: 260 },
            bgcolor: "#F4F4F5",
            WebkitOverflowScrolling: "touch",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#1976D2" }}>
            Меню
          </Typography>
          <List>
            {menuItems.map((item, index) => (
              <Box key={index}>
                {item.isButton !== false ? (
                  <>
                    <ListItem button onClick={item.handleClick}>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.875rem",
                          color: "#1976D2",
                        }}
                      />
                    </ListItem>
                    {item.items?.map((subItem, subIndex) => (
                      <ListItem
                        key={subIndex}
                        button
                        onClick={handleMobileMenuToggle}
                        sx={{ pl: 4 }}
                      >
                        <Link
                          href={subItem.href}
                          sx={{
                            textDecoration: "none",
                            color: "#000",
                            fontSize: "0.85rem",
                          }}
                        >
                          {subItem.label}
                        </Link>
                      </ListItem>
                    ))}
                  </>
                ) : (
                  <ListItem button onClick={handleMobileMenuToggle}>
                    <Link
                      href={item.href}
                      sx={{
                        textDecoration: "none",
                        color: "#1976D2",
                        fontSize: "0.875rem",
                      }}
                    >
                      {item.label}
                    </Link>
                  </ListItem>
                )}
                {index < menuItems.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default NavBar;
