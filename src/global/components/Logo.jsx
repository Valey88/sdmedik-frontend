import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Logo = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Определяем, соответствует ли экран breakpoint'ам
  // const isSmUp = useMediaQuery(theme.breakpoints.up("sm")); // >= sm
  // const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // >= md

  // Логика выбора изображения:
  // - Если экран >= md, используем /Logo_Header.png
  // - Если экран < md (включая sm и xs), используем /medi_logo2.png
  // const logoSrc = isMdUp ? "/Logo_Header.png" : "/medi_logo2.png";

  return (
    <Box
      onClick={(e) => {
        e.preventDefault();
        navigate("/");
      }}
      sx={{
        width: { xs: "150px", sm: "150px", md: "150px", lg: "225px" },
        cursor: "pointer",
      }}
    >
      <img style={{ width: "100%" }} src={"/logo.png"} alt="logo" />
    </Box>
  );
};

export default Logo;
