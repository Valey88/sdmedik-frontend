import React, { useEffect, useState } from "react"; // Импортируйте React
import { createBrowserRouter } from "react-router-dom"; // Убедитесь, что импортируете правильно
import HomePage from "../pages/home/HomePage";
import СategoriesPage from "../pages/categories/СategoriesPage";
import CatalogsLayout from "../pages/catalog/CatalogsLayout";
import BasketLayout from "../pages/basket/BasketLayout";
import Delivery from "../pages/delivery/Delivery";
import About from "../pages/about/About";
import Return_policy from "../pages/return_policy/Return_policy";
import Deteils from "../pages/deteils/Deteils";
import Auth from "../pages/account/Auth";
import Register from "../pages/account/Register";
import UserAccount from "../pages/account/UserAccount";
import Electronic_certificate from "../pages/electronic_certificate/Electronic_certificate";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import CreateProduct from "../pages/admin/create_product/CreateProduct";
import Contacts from "../pages/contacts/Contacts";
import CreateCategory from "../pages/admin/create_category/CreateCategory";
import AdminDashboard from "../pages/admin/AdminLayout";
import UpdateProduct from "../pages/admin/update_product/UpdateProduct";
import AdminCategoriesTable from "../pages/admin/components_admin_page/AdminCategoriesTable/AdminCategoriesTable";
import axios from "axios";
import useUserStore from "../store/userStore";
import MainContent from "../pages/admin/components_admin_page/MainContent/MainContent";
import AdminUserTable from "../pages/admin/components_admin_page/AdminUserTable/AdminUserTable";
import AdminProductTable from "../pages/admin/components_admin_page/AdminProductTable/AdminProductTable";
import Paymants from "../pages/paymants/Paymants";
import PayOnclick from "../pages/pay_onclick/PayOnclick";
import CategoriesForCertificate from "../pages/categories_for_certificate/CategoriesForCertificate";
import CatalogsCertificateLayout from "../pages/catalog/CatalogsCertificateLayout";
import ProductDynamicCertificatePage from "../pages/Product/ProductDynamicCertificatePage";
import LayoutWrapper from "../global/LayoutWrapper";
import NotFound from "../pages/notfound/NotFound";
import RessetPassword from "../global/components/RessetPassword";
import BlogList from "../pages/blog-list/BlogList";
import Post from "../pages/post/Post";

// const UsersRoute = ({ children }) => {
//   const isLoggedIn = Cookies.get("logged_in") === "true";

//   if (!isLoggedIn) {
//     return <Navigate to="/" replace />;
//   }
//   return children;
// };

// export default UsersRoute;

// export const AdminRoute = ({ children }) => {
//   const { isAdmin, isLoadingUser } = useUserStore();

//   if (isLoadingUser) return <div>Проверка прав доступа...</div>;

//   return isAdmin() ? children : <Navigate to="/" replace />;
// };

const UsersRoute = ({ children }) => {
  const isLoggedIn = Cookies.get("logged_in") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default UsersRoute;

export const AdminRoute = ({ children }) => {
  const { getUserInfo, user } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getUserInfo();
    setLoading(false);
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
  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LayoutWrapper>
        <HomePage />
      </LayoutWrapper>
    ),
  },
  {
    path: "/blog-list",
    element: (
      <LayoutWrapper>
        <BlogList />
      </LayoutWrapper>
    ),
  },
  {
    path: "/post/:id",
    element: (
      <LayoutWrapper>
        <Post />
      </LayoutWrapper>
    ),
  },
  {
    path: "/catalog",
    element: (
      <LayoutWrapper>
        <СategoriesPage />
      </LayoutWrapper>
    ),
  },
  {
    path: "/catalog/certificate",
    element: (
      <LayoutWrapper>
        <CategoriesForCertificate />
      </LayoutWrapper>
    ),
  },
  {
    path: "/products/:id", // динамический маршрут
    element: (
      <LayoutWrapper>
        <CatalogsLayout />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/products/certificate/:id", // динамический маршрут
    element: (
      <LayoutWrapper>
        <CatalogsCertificateLayout />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/product/certificate/:id", // динамический маршрут
    element: (
      <LayoutWrapper>
        <ProductDynamicCertificatePage />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/basket", // динамический маршрут
    element: (
      <LayoutWrapper>
        <BasketLayout />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/delivery", // динамический маршрут
    element: (
      <LayoutWrapper>
        <Delivery />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/about", // динамический маршрут
    element: (
      <LayoutWrapper>
        <About />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/returnpolicy", // динамический маршрут
    element: (
      <LayoutWrapper>
        <Return_policy />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/deteils", // динамический маршрут
    element: (
      <LayoutWrapper>
        <Deteils />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/certificate", // динамический маршрут
    element: (
      <LayoutWrapper>
        <Electronic_certificate />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },
  {
    path: "/contacts", // динамический маршрут
    element: (
      <LayoutWrapper>
        <Contacts />
      </LayoutWrapper>
    ), // Исправлено имя компонента
  },

  {
    path: "/auth",
    element: (
      <LayoutWrapper>
        <Auth />
      </LayoutWrapper>
    ),
  },
  {
    path: "/register",
    element: (
      <LayoutWrapper>
        <Register />
      </LayoutWrapper>
    ),
  },
  {
    path: "/paymants",
    element: (
      <LayoutWrapper>
        <Paymants />
      </LayoutWrapper>
    ),
  },
  {
    path: "/paymants/:id",
    element: (
      <LayoutWrapper>
        <PayOnclick />
      </LayoutWrapper>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <LayoutWrapper>
        <RessetPassword />
      </LayoutWrapper>
    ),
  },
  {
    path: "/profile",
    element: (
      <UsersRoute>
        <LayoutWrapper>
          <UserAccount />
        </LayoutWrapper>
      </UsersRoute>
    ),
  },
  {
    path: `/admin/*`,
    element: (
      <AdminRoute>
        <LayoutWrapper>
          <AdminDashboard />
        </LayoutWrapper>
      </AdminRoute>
    ),
  },
  {
    path: "*",
    element: (
      <LayoutWrapper>
        <NotFound />
      </LayoutWrapper>
    ),
  },
]);
