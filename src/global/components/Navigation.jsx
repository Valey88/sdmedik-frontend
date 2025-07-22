import { Box, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const Navigation = () => {
  const navItems = [
    { text: "Доставка", href: "/delivery" },
    { text: "Реквизиты", href: "/deteils" },
    { text: "Возврат", href: "/returnpolicy" },
    { text: "О нас", href: "/about" },
    { text: "Контакты", href: "/contacts" },
  ];

  return (
    <Box
      sx={{
        width: "max-content",
        // background: "#FAFAFA",
        borderRadius: "15px",
        display: { xs: "none", sm: "none", md: "", lg: "flex" },
        alignItems: "center",
        padding: "10px 5px",
        // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Link to="/delivery">Доставка</Link>
      <Link to="/deteils">Реквизиты</Link>
      <Link to="/certificate">Сертификат</Link>
      <Link to="/returnpolicy">Возврат</Link>
      <Link to="/about">О нас</Link>
      <Link to="/contacts">Контакты</Link>
    </Box>
  );
};

export default Navigation;
