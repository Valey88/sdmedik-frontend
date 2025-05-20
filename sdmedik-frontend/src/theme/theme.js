import { Button, createTheme, styled } from "@mui/material";

export const theme = createTheme({
  typography: {
    fontFamily: '"Exo 2", sans-serif',
  },
});

export const GlobalButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#F8C41D",
  borderRadius: 30,
  border: 0,
  color: "white",
  height: 48,
  padding: "13px 40px",
  fontSize: "20px",
  width: "224px",
  height: "52px",
}));
