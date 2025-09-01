import {
  AppBar,
  Container,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Button,
  Paper,
  Drawer,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import useUserStore from "../store/userStore";
import Logo from "./components/Logo";
import ContactMenu from "./components/ContactMenu";
import CatalogButtons from "./components/CatalogButtons";
import UserMenu from "./components/UserMenu";
import Search from "./components/Search";
import BurgerMenu from "./components/BurgerMenu";
import Navigation from "./components/Navigation";
import { Link, useNavigate } from "react-router-dom";
import useBascketStore from "../store/bascketStore";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { isAuthenticated, setIsAuthenticated, checkAuthStatus } =
    useUserStore();
  const { getUserInfo, user, logout } = useUserStore();
  const navigate = useNavigate();
  const { fetchUserBasket, basket } = useBascketStore();

  useEffect(() => {
    fetchUserBasket();
  }, []);

  useEffect(() => {
    checkAuthStatus();
    const intervalId = setInterval(checkAuthStatus, 300000);
    return () => clearInterval(intervalId);
  }, [setIsAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      await getUserInfo();
    };

    fetchData();
  }, [getUserInfo]);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <AppBar position="sticky" sx={{ background: "white" }}>
      <Container>
        <StyledToolbar>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gridGap: 20,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gridGap: 20 }}>
              <Logo />
            </Box>
            <Search />
            <Box sx={{ display: "flex", alignItems: "center", gridGap: 20 }}>
              <ContactMenu />
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "max-content",
                display: { xs: "none", sm: "none", md: "flex", lg: "flex" },
                alignItems: "center",
                gridGap: 10,
              }}
            >
              <CatalogButtons />
            </Box>
            <Box>
              <Navigation />
            </Box>
            <Box>
              <UserMenu />
            </Box>
          </Box>
        </StyledToolbar>
      </Container>
      <Toolbar
        sx={{
          display: { xs: "none", sm: "flex", md: "flex", lg: "none" },
          flexDirection: "column",
          gridGap: "20px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Logo />
          <Search />

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{
              display: {
                xs: "block",
                sm: "block",
                md: "block",
                lg: "none",
                color: "#26BDB8",
              },
            }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <BurgerMenu toggleDrawer={toggleDrawer} />
        </Drawer>
      </Toolbar>
      <Toolbar
        sx={{
          display: { xs: "flex", sm: "none", md: "none", lg: "none" },
          flexDirection: "column",
          gridGap: "20px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Logo />
          <Box sx={{ display: "flex" }}>
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
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{
                display: {
                  xs: "block",
                  sm: "block",
                  md: "block",
                  lg: "none",
                  color: "#26BDB8",
                },
              }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>

        <Search />

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <BurgerMenu toggleDrawer={toggleDrawer} />
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
