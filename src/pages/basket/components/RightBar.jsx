import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import useBascketStore from "../../../store/bascketStore";
import { useNavigate } from "react-router-dom";

export default function RightBar() {
  const { basket } = useBascketStore();
  const basketData = basket.data || {};
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: { xs: 3, md: "75px" }, width: { xs: "100%", md: "25%" } }}>
      <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Оформление заказа
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Товаров: {basketData.quantity || 0}
          </Typography>
          {basketData.total_price_with_promotion > 0 && (
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Скидка:{" "}
              {basketData.total_price - basketData.total_price_with_promotion} ₽
            </Typography>
          )}
          <Typography variant="h6" sx={{ color: "#00B3A4", mt: 1 }}>
            Итого:{" "}
            {basketData.total_price_with_promotion > 0
              ? basketData.total_price_with_promotion
              : basketData.total_price || 0}{" "}
            ₽
          </Typography>
        </Box>
        <Button
          variant="contained"
          fullWidth
          sx={{
            background: "#00B3A4",
            "&:hover": {
              background: "#009B8A",
            },
            py: 1.5,
            mt: 2,
          }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/paymants");
          }}
        >
          Перейти к оплате
        </Button>
      </Paper>
    </Box>
  );
}
