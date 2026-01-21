import React, { useEffect, useState, memo, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Pagination,
  Typography,
  IconButton,
  Chip,
  Grid,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import useProductStore from "../../../store/productStore";
import useBascketStore from "../../../store/bascketStore";
import { urlPictures } from "../../../constants/constants";
import SidebarFilter from "./SidebarFilter";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const ProductCard = memo(({ e, hendleAddProductThithBascket }) => {
  const isCatalog1 = e?.catalogs === 1;
  const navigate = useNavigate();

  return (
    <Link to={`/product/certificate/${e.id}`}>
      <Card
        sx={{
          width: { xs: "167px", md: "281px" },
          height: { xs: "600px", md: "580px" },
          background: "#F5FCFF",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          transition: "transform 0.2s, box-shadow 0.2s",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {e.preview && e.preview.trim() !== "" && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#FFA500",
              color: "#FFFFFF",
              padding: "4px 12px",
              borderRadius: "0 0 8px 0",
              zIndex: 1,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              maxWidth: "80%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "0.7rem", md: "0.9rem" },
              }}
            >
              {e.preview}
            </Typography>
          </Box>
        )}
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
              fontSize: { xs: "0.65rem", md: "0.8rem" },
              fontWeight: "bold",
              mb: 1,
            }}
            onClick={() => {
              navigate(`/product/certificate/${e.id}`);
            }}
          >
            {e.name}
          </Typography>
          {e.nameplate && e.nameplate.trim() !== "" && (
            <Box
              sx={{
                backgroundColor: "red",
                color: "#FFFFFF",
                padding: "4px 12px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                maxWidth: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "0.7rem", md: "0.9rem" },
                }}
              >
                {e.nameplate}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: "auto" }}>
            {isCatalog1 && (
              <Box sx={{ mb: 1, display: "flex", justifyContent: "left" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#00B3A4",
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", md: "1.2rem" },
                  }}
                >
                  {e.price} ₽
                </Typography>
              </Box>
            )}
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

export default function CatalogDynamicCertificatePage() {
  const { id } = useParams();
  const { fetchProducts, products } = useProductStore();
  const { addProductThisBascket } = useBascketStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(null);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [ProductsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [catalogs, setCatalogs] = useState("1,2"); // State for catalogs

  const category_id = id;

  useEffect(() => {
    const offset = (currentPage - 1) * ProductsPerPage;
    setLoading(true);
    fetchProducts(category_id, filters, offset, ProductsPerPage, catalogs)
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  }, [category_id, fetchProducts, filters, currentPage, catalogs]);

  useEffect(() => {
    if (products?.data) {
      let normalizedProducts = Array.isArray(products.data)
        ? products.data
        : [products.data];
      let sortedProducts = [...normalizedProducts];
      if (sortOrder === "priceAsc") {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (sortOrder === "priceDesc") {
        sortedProducts.sort((a, b) => b.price - a.price);
      }
      setCurrentProducts(sortedProducts);
    } else {
      setCurrentProducts([]);
    }
  }, [products, sortOrder]);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page on sort change
    setCatalogs("1,2"); // Reset catalogs when sorting changes
  };

  const handleFSSCertificateClick = () => {
    setCatalogs("2"); // Set catalogs to 2 for FSS certificate
    setCurrentPage(1); // Reset to first page
    setSortOrder("default"); // Reset sort order
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const hendleAddProductThithBascket = useCallback(
    async (id) => {
      const product_id = id;
      await addProductThisBascket(product_id, 1);
    },
    [addProductThisBascket],
  );

  return (
    <Box sx={{ mt: 1, mb: 5 }}>
      <Box
        sx={{
          mb: 3,
          mt: 3,
          display: "flex",
          justifyContent: "flex-start",
          gap: 1,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <SidebarFilter setFilters={setFilters} />
        <Button
          variant={
            sortOrder === "default" && catalogs === "1,2"
              ? "contained"
              : "outlined"
          }
          onClick={() => handleSortChange("default")}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: " Magnesium",
            px: { xs: 2, sm: 3 },
            backgroundColor:
              sortOrder === "default" && catalogs === "1,2"
                ? "#00B3A4"
                : "transparent",
            color:
              sortOrder === "default" && catalogs === "1,2"
                ? "#FFFFFF"
                : "#00B3A4",
            borderColor: "#00B3A4",
            "&:hover": {
              backgroundColor:
                sortOrder === "default" && catalogs === "1,2"
                  ? "#00B3A4"
                  : "rgba(0, 179, 164, 0.1)",
              borderColor: "#00B3A4",
            },
          }}
        >
          По умолчанию
        </Button>
        <Button
          variant={sortOrder === "priceDesc" ? "contained" : "outlined"}
          onClick={() => handleSortChange("priceDesc")}
          endIcon={<ArrowUpwardIcon />}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: "medium",
            px: { xs: 2, sm: 3 },
            backgroundColor:
              sortOrder === "priceDesc" ? "#00B3A4" : "transparent",
            color: sortOrder === "priceDesc" ? "#FFFFFF" : "#00B3A4",
            borderColor: "#00B3A4",
            "&:hover": {
              backgroundColor:
                sortOrder === "priceDesc"
                  ? "#00B3A4"
                  : "rgba(0, 179, 164, 0.1)",
              borderColor: "#00B3A4",
            },
          }}
        >
          Цена
        </Button>
        <Button
          variant={sortOrder === "priceAsc" ? "contained" : "outlined"}
          onClick={() => handleSortChange("priceAsc")}
          endIcon={<ArrowDownwardIcon />}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: "medium",
            px: { xs: 2, sm: 3 },
            backgroundColor:
              sortOrder === "priceAsc" ? "#00B3A4" : "transparent",
            color: sortOrder === "priceAsc" ? "#FFFFFF" : "#00B3A4",
            borderColor: "#00B3A4",
            "&:hover": {
              backgroundColor:
                sortOrder === "priceAsc" ? "#00B3A4" : "rgba(0, 179, 164, 0.1)",
              borderColor: "#00B3A4",
            },
          }}
        >
          Цена
        </Button>
        <Button
          variant={catalogs === "2" ? "contained" : "outlined"}
          onClick={handleFSSCertificateClick}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: "medium",
            px: { xs: 2, sm: 3 },
            backgroundColor: catalogs === "2" ? "#00B3A4" : "transparent",
            color: catalogs === "2" ? "#FFFFFF" : "#00B3A4",
            borderColor: "#00B3A4",
            "&:hover": {
              backgroundColor:
                catalogs === "2" ? "#00B3A4" : "rgba(0, 179, 164, 0.1)",
              borderColor: "#00B3A4",
            },
          }}
        >
          Сертификат ФСС
        </Button>
      </Box>
      <Grid
        container
        spacing={{ xs: 1, md: 1 }}
        columns={{ xs: 4, sm: 4, md: 4 }}
        sx={{ pt: 2, pb: 2 }}
      >
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : error ? (
          <Typography color="error">Ошибка: {error}</Typography>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((e) => (
            <Grid item key={e.id} xs={6} sm={4} md={3}>
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
}
