import React, { useEffect, useState, memo, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Pagination,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Link, useNavigate, useParams } from "react-router-dom";
import useProductStore from "../../../store/productStore";
import useBascketStore from "../../../store/bascketStore";
import { urlPictures } from "../../../constants/constants";
import SidebarFilter from "./SidebarFilter";

const ProductCard = memo(({ e, hendleAddProductThithBascket }) => {
  const navigate = useNavigate();
  return (
    <Link to={`/product/certificate/${e.id}`}>
      <Card
        sx={{
          width: { xs: "167px", md: "261px" },
          height: { xs: "485px", md: "550px" },
          background: "#F5FCFF",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: " 0 8px 30px rgba(0, 0, 0, 0.2)",
          },
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            borderBottom: "1px solid #E0E0E0",
          }}
          onClick={() => {
            navigate(`/product/certificate/${e.id}`);
          }}
        >
          <CardMedia
            component="img"
            image={`${urlPictures}/${e.images[0].name}`}
            alt={e.name}
            sx={{
              width: "100%",
              height: { xs: "200px", md: "300px" },
              objectFit: "contain",
            }}
            loading="lazy"
          />
        </Box>

        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.8rem", md: "1rem" },
              fontWeight: "bold",
              mb: 1,
            }}
            onClick={() => {
              navigate(`/product/certificate/${e.id}`);
            }}
          >
            {e.name}
          </Typography>

          {/* Прочий контент */}

          <Box sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                backgroundColor: "#00B3A4",
                color: "#FFFFFF",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#00B3A4",
                },
              }}
              onClick={() => {
                navigate(`/product/certificate/${e.id}`);
              }}
            >
              Подробнее
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
});

const CatalogDynamicCertificatePage = () => {
  const { id } = useParams();
  const { fetchProducts, products } = useProductStore();
  const { addProductThisBascket } = useBascketStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(null);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [ProductsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const category_id = id;
  // const catalogs = 2;

  useEffect(() => {
    const offset = (currentPage - 1) * ProductsPerPage;
    setLoading(true);
    fetchProducts(category_id, filters, offset, ProductsPerPage)
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  }, [category_id, fetchProducts, filters, currentPage]);

  useEffect(() => {
    if (products?.data) {
      let normalizedProducts = Array.isArray(products.data)
        ? products.data
        : [products.data];
      setCurrentProducts(normalizedProducts);
    } else {
      setCurrentProducts([]);
    }
  }, [products]);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const hendleAddProductThithBascket = useCallback(
    async (id) => {
      const product_id = id;
      await addProductThisBascket(product_id, 1);
    },
    [addProductThisBascket]
  );

  return (
    <Box sx={{ mt: 1, mb: 5 }}>
      <Box sx={{ mb: 5 }}>
        <SidebarFilter setFilters={setFilters} />
      </Box>
      <Grid
        container
        spacing={{ xs: 1, md: 3 }}
        columns={{ xs: 4, sm: 4, md: 4 }}
        sx={{ pt: 2, pb: 2 }}
      >
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : error ? (
          <Typography color="error">Ошибка: {error}</Typography>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((e) => (
            <Grid item={"true"} key={e.id} xs={6} sm={4} md={3}>
              <ProductCard
                e={e}
                hendleAddProductThithBascket={hendleAddProductThithBascket}
              />
            </Grid>
          ))
        ) : (
          <Typography>Нет данных для отображения</Typography>
        )}
      </Grid>
      {currentProducts.length > 0 && (
        <Pagination
          count={Math.ceil((products.count || 0) / ProductsPerPage)}
          page={currentPage}
          onChange={handleChangePage}
          sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "center" }}
        />
      )}
    </Box>
  );
};

export default CatalogDynamicCertificatePage;
