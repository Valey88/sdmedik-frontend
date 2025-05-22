import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import AdminProductTable from "../AdminProductTable/AdminProductTable";
import AdminCategoriesTable from "../AdminCategoriesTable/AdminCategoriesTable";
import AdminUserTable from "../AdminUserTable/AdminUserTable";
import AdminUsersDiagramm from "../AdminUsersDiagramm/AdminUsersDiagramm";
import AdminOrdersTable from "../AdminOrdersTable/AdminOrdersTable";
import AdminChat from "../chat/AdminChat";

const MainContent = () => {
  return (
    <Box>
      <Box>
        <AdminOrdersTable />
      </Box>
      <Box sx={{ mt: 5 }}>
        <AdminUsersDiagramm />
      </Box>
    </Box>
  );
};
export default MainContent;
