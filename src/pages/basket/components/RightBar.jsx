import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Modal,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
import useBascketStore from "../../../store/bascketStore";
import { useNavigate } from "react-router-dom";

export default function RightBar() {
  const { basket } = useBascketStore();
  const basketData = basket.data || {};
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ mt: { xs: 3, md: "75px" }, width: { xs: "100%", md: "25%" } }}>
      <Paper
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#F5F6F5",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Оформление заказа
          </Typography>
          <IconButton onClick={handleOpen} sx={{ color: "#00B3A4" }}>
            <InfoIcon />
          </IconButton>
        </Box>
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
            borderRadius: 2,
          }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/paymants");
          }}
        >
          Перейти к оплате
        </Button>
      </Paper>

      {/* Modal with iOS 19-style floating sheet */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "right",
        }}
      >
        <Box
          sx={{
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxWidth: 600,
            height: 350,
            backgroundColor: "rgba(245, 246, 245, 0.95)", // White with slight transparency
            borderRadius: "16px",
            p: 3,
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            borderTop: "2px solid #00B3A4",
            maxHeight: "80vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#00B3A4",
              borderRadius: "4px",
            },
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            sx={{ fontWeight: "bold", color: "#00B3A4", mb: 2 }}
          >
            Информация о стоимости заказа
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.6 }}>
            Стоимость заказа включает в себя стоимость заказанных товаров и
            стоимость почтовой/курьерской доставки до региона получателя – ПРИ
            ОФОРМЛЕНИИ ПОЛНОГО СЕРТИФИКАТА на выдачу ТСР. ПРИ заказе отдельных
            ТСР – стоимость доставки УТОЧНЯЙТЕ у специалиста в чате!
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#333", lineHeight: 1.6, mt: 2 }}
          >
            Способы доставки: ПЭК, СДЭК, Курьеры, Почта РФ, собственная
            логистика и транспорт, другое.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#333", lineHeight: 1.6, mt: 2 }}
          >
            Стоимость доставки зависит от региона получателя (при доставке
            компанией СДЭК на стоимость доставки влияет также общий вес заказа).
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: "#00B3A4",
              "&:hover": {
                background: "#009B8A",
              },
              mt: 3,
              borderRadius: 2,
            }}
            onClick={handleClose}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
