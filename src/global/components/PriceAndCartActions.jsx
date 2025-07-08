import { Box, Button, Typography, IconButton, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useState } from "react";
import ChatWindow from "../../global/components/ChatWindow";

export default function PriceAndCartActions({
  product,
  isCatalog1,
  isCatalog2,
  newRegion,
  addProductToBasket,
  quantity,
  setQuantity,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const MAX_QUANTITY = 999;

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= MAX_QUANTITY) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    if (quantity < MAX_QUANTITY) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const showAddToCartButton = isCatalog1
    ? product?.price !== undefined && product?.price !== null
    : newRegion &&
      product?.certificate_price !== undefined &&
      product?.certificate_price !== null;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        {isCatalog1 && product?.price ? (
          <Typography
            variant="h5"
            sx={{ color: "#00B3A4", fontWeight: "bold" }}
          >
            {product.price} ₽
          </Typography>
        ) : isCatalog2 && newRegion && product?.certificate_price ? (
          <Typography
            variant="h5"
            sx={{ color: "#00B3A4", fontWeight: "bold" }}
          >
            {product.certificate_price} ₽
          </Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {isCatalog2
                ? "Пожалуйста, выберите регион для просмотра цены"
                : "Уточнить стоимость товара можно у менеджера"}
            </Typography>
            <Button
              variant="outlined"
              sx={{
                color: "#00B3A4",
                borderColor: "#00B3A4",
                borderRadius: 1,
                padding: "8px 16px",
                "&:hover": {
                  borderColor: "#009B8A",
                  backgroundColor: "#E0F7FA",
                },
              }}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(true);
              }}
              aria-label="Открыть чат поддержки"
            >
              Открыть чат поддержки
            </Button>
            {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {showAddToCartButton && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={handleDecrement}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "#009B8A",
                    color: "#FFFFFF",
                  },
                }}
                disabled={quantity <= 1}
                aria-label="Уменьшить количество"
              >
                <Remove fontSize="small" />
              </IconButton>
              <TextField
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{
                  min: 1,
                  max: MAX_QUANTITY,
                  step: 1,
                  style: { textAlign: "center" },
                }}
                sx={{
                  width: 50,
                  "& .MuiInputBase-root": {
                    borderRadius: 1,
                    backgroundColor: "#F5F5F5",
                  },
                  "& input": {
                    fontWeight: "medium",
                    padding: "8px 0",
                  },
                }}
                size="small"
                aria-label="Количество товара"
              />
              <IconButton
                onClick={handleIncrement}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "#009B8A",
                    color: "#FFFFFF",
                  },
                }}
                disabled={quantity >= MAX_QUANTITY}
                aria-label="Увеличить количество"
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#00B3A4",
                color: "#FFFFFF",
                borderRadius: 1,
                padding: "10px 24px",
                fontWeight: "medium",
                "&:hover": {
                  backgroundColor: "#009B8A",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                },
              }}
              onClick={() => addProductToBasket(product.id)}
              aria-label="Добавить в корзину"
            >
              Добавить в корзину
            </Button>
          </>
        )}
      </Box>
    </>
  );
}
