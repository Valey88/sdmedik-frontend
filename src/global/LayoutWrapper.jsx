import { Box } from "@mui/material";
import Footer from "./footer";
import Header from "./header";

const LayoutWrapper = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutWrapper;
