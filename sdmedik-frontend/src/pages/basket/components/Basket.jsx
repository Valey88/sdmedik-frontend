import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Grid,
  Button,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useBascketStore from "../../../store/bascketStore";
import { urlPictures } from "../../../constants/constants";

export default function Basket() {
  const {
    fetchUserBasket,
    basket,
    deleteProductThithBasket,
    editCountProductBascket,
  } = useBascketStore();

  const [currentProducts, setCurrentProducts] = useState([]);

  useEffect(() => {
    fetchUserBasket();
  }, []);

  useEffect(() => {
    if (basket.data?.items) {
      let normalizedProducts = Array.isArray(basket.data.items)
        ? basket.data.items
        : [basket.data.items];
      setCurrentProducts(normalizedProducts);
    }
  }, [basket]);

  const handleDeleteProductBasket = async (id) => {
    await deleteProductThithBasket(id);
    setCurrentProducts(currentProducts.filter((product) => product.id !== id));
    fetchUserBasket();
  };

  const handleClick = async (product_id, action, iso) => {
    try {
      await editCountProductBascket(
        product_id,
        action === "plus" ? 1 : -1,
        iso
      );
      setCurrentProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.product_id === product_id
            ? {
                ...product,
                quantity:
                  action === "plus"
                    ? product.quantity + 1
                    : Math.max(product.quantity - 1, 1),
              }
            : product
        )
      );
      await fetchUserBasket();
    } catch (error) {
      console.error("Ошибка при изменении количества товара:", error);
    }
  };

  const handleQuantityChange = (product_id, value) => {
    // Разрешаем любое значение, включая пустую строку
    setCurrentProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.product_id === product_id
          ? { ...product, quantity: value }
          : product
      )
    );
  };

  const handleQuantityBlur = async (product_id, iso) => {
    const currentProduct = currentProducts.find(
      (p) => p.product_id === product_id
    );
    if (currentProduct) {
      let newQuantity = parseInt(currentProduct.quantity, 10);
      // Если значение пустое, NaN или меньше 1, устанавливаем 1
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
        setCurrentProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.product_id === product_id ? { ...p, quantity: 1 } : p
          )
        );
      } else {
        // Если значение корректное, обновляем состояние числом
        setCurrentProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.product_id === product_id ? { ...p, quantity: newQuantity } : p
          )
        );
      }

      const originalProduct = basket.data.items.find(
        (p) => p.product_id === product_id
      );
      if (originalProduct) {
        const difference = newQuantity - originalProduct.quantity;
        if (difference !== 0) {
          try {
            await editCountProductBascket(product_id, difference, iso);
            await fetchUserBasket();
          } catch (error) {
            console.error("Ошибка при обновлении количества:", error);
          }
        }
      }
    }
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "70%" }, mb: 4, minHeight: 379 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Корзина
      </Typography>
      <Grid container spacing={3}>
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <Grid item key={product.product_id} xs={12}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <CardMedia
                  component="img"
                  image={`${urlPictures}/${product.image}`}
                  alt={product.title}
                  sx={{
                    width: { xs: "100%", md: 150 },
                    height: { xs: 200, md: 150 },
                    objectFit: "contain",
                    borderRadius: 1,
                  }}
                />
                <Box
                  sx={{
                    flexGrow: 1,
                    paddingLeft: { xs: 0, md: 2 },
                    mt: { xs: 2, md: 0 },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {product.brand}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: "#00B3A4" }}>
                    {product.total_price} ₽
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      onClick={() =>
                        handleClick(product.product_id, "minus", product.iso)
                      }
                      disabled={product.quantity <= 1}
                      sx={{
                        minWidth: 50,
                        padding: 0.5,
                        fontSize: "22px",
                        borderRadius: "50%",
                      }}
                    >
                      -
                    </Button>
                    <TextField
                      type="text" // Изменяем type на text для большей гибкости
                      value={product.quantity}
                      onChange={(e) =>
                        handleQuantityChange(product.product_id, e.target.value)
                      }
                      onBlur={() =>
                        handleQuantityBlur(product.product_id, product.iso)
                      }
                      sx={{ width: 60, mx: 2 }}
                    />
                    <Button
                      onClick={() =>
                        handleClick(product.product_id, "plus", product.iso)
                      }
                      sx={{
                        minWidth: 50,
                        padding: 0.5,
                        fontSize: "22px",
                        borderRadius: "50%",
                      }}
                    >
                      +
                    </Button>
                    <IconButton
                      onClick={() => handleDeleteProductBasket(product.id)}
                      color="error"
                      sx={{ ml: "auto" }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="h6" sx={{ mt: 3 }}>
            Ваша корзина пуста
          </Typography>
        )}
      </Grid>
    </Box>
  );
}
