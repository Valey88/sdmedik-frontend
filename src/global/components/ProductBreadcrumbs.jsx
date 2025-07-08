import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function ProductBreadcrumbs({ product }) {
  const category = product?.categories?.[0];
  const categoryLink = category
    ? `/products/certificate/${category.id}`
    : "/catalog/certificate";
  const categoryName = category ? category.name : "Каталог";

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      <Link
        component={RouterLink}
        to="/"
        sx={{ display: "flex", alignItems: "center", color: "#00B3A4" }}
      >
        Главная
      </Link>
      <Link
        sx={{ color: "#00B3A4" }}
        component={RouterLink}
        to="/catalog/certificate"
      >
        Каталог
      </Link>
      <Link component={RouterLink} to={categoryLink} sx={{ color: "#00B3A4" }}>
        {categoryName}
      </Link>
      <Typography color="text.primary">{product?.name || "Товар"}</Typography>
    </Breadcrumbs>
  );
}
