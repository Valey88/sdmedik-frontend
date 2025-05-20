import { Outlet } from "react-router-dom";
import useUserStore from "../../store/userStore";
import { Box, Container } from "@mui/material";
import NavBar from "./components_admin_page/Navbar/NavBar";
import { Routes, Navigate, Route } from "react-router-dom";
import CreateProduct from "./create_product/CreateProduct";
import CreateCategory from "./create_category/CreateCategory";
import AdminCategoriesTable from "./components_admin_page/AdminCategoriesTable/AdminCategoriesTable";
import AdminProductTable from "./components_admin_page/AdminProductTable/AdminProductTable";
import AdminUserTable from "./components_admin_page/AdminUserTable/AdminUserTable";
import MainContent from "./components_admin_page/MainContent/MainContent";
import UpdateProduct from "./update_product/UpdateProduct";
import { useEffect, useState } from "react";
import CreatePromotion from "./create_promotion/CreatePromotion";
import AdminPromotionTable from "./components_admin_page/AdminPromotionTable/AdminPromotionTable";
import UpdateCategory from "./update_category/UpdateCategory";

function ProtectedRoute({ element }) {
  const { getUserInfo, user } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      await getUserInfo();
      setLoading(false);
    };
    fetchUserInfo();
  }, [getUserInfo]);

  useEffect(() => {
    if (user?.data) {
      setIsAdmin(user.data.role_id === 1);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Можно добавить индикатор загрузки
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default function AdminDashboard() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <NavBar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<MainContent />}></Route>
          <Route
            path="/create_product"
            element={<ProtectedRoute element={<CreateProduct />} />}
          />
          <Route
            path="/create_category"
            element={<ProtectedRoute element={<CreateCategory />} />}
          />
          <Route
            path="/create_promotion"
            element={<ProtectedRoute element={<CreatePromotion />} />}
          />
          <Route
            path="/table_promotion"
            element={<ProtectedRoute element={<AdminPromotionTable />} />}
          />
          <Route
            path="/table_category"
            element={<ProtectedRoute element={<AdminCategoriesTable />} />}
          />
          <Route
            path="/table_product"
            element={<ProtectedRoute element={<AdminProductTable />} />}
          />
          <Route
            path="/table_user"
            element={<ProtectedRoute element={<AdminUserTable />} />}
          />
          <Route
            path="/update_product/:id"
            element={<ProtectedRoute element={<UpdateProduct />} />}
          />
          <Route
            path="/update_category/:id"
            element={<ProtectedRoute element={<UpdateCategory />} />}
          />
        </Routes>
      </Container>
    </Box>
  );
}
