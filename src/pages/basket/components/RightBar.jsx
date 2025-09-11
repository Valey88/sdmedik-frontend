import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Modal,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import InfoIcon from "@mui/icons-material/Info";
import useBascketStore from "../../../store/bascketStore";
import { useNavigate } from "react-router-dom";

export default function RightBar() {
  const { basket } = useBascketStore();
  const basketData = basket.data || {};
  const navigate = useNavigate();
  const [openDelivery, setOpenDelivery] = useState(false);
  const [openCertificate, setOpenCertificate] = useState(false);

  const handleOpenDelivery = () => setOpenDelivery(true);
  const handleCloseDelivery = () => setOpenDelivery(false);
  const handleOpenCertificate = () => setOpenCertificate(true);
  const handleCloseCertificate = () => setOpenCertificate(false);

  useEffect(() => {
    const totalPrice =
      basketData.total_price_with_promotion > 0
        ? basketData.total_price_with_promotion
        : basketData.total_price || 0;
    if (totalPrice < 5000 && totalPrice > 0) {
      setOpenDelivery(true);
    }
  }, [basketData.total_price_with_promotion, basketData.total_price]);

  return (
    <Box sx={{ mt: { xs: 3, md: "75px" }, width: { xs: "100%", md: "25%" } }}>
      <Paper
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#F5F6F5",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Оформление заказа
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body1">По сертификату</Typography>
            <IconButton
              onClick={handleOpenCertificate}
              sx={{ color: "#00B3A4" }}
            >
              <InfoIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body1">Доставка</Typography>
            <IconButton onClick={handleOpenDelivery} sx={{ color: "#00B3A4" }}>
              <InfoIcon />
            </IconButton>
          </Box>
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
              : basketData.total_price || 0}
            ₽
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "#333", ml: 1, fontStyle: "italic" }}
        >
          {basketData.total_price < 5000
            ? "Доставка платная (заказ < 5000 ₽)"
            : "Доставка бесплатная"}
        </Typography>
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

      {/* Delivery Modal */}
      <Modal
        open={openDelivery}
        onClose={handleCloseDelivery}
        aria-labelledby="delivery-modal-title"
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
            height: 220,
            backgroundColor: "rgba(245, 246, 245, 0.95)",
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
            id="delivery-modal-title"
            variant="h6"
            sx={{ fontWeight: "bold", color: "#00B3A4", mb: 2 }}
          >
            Условия доставки
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.6 }}>
            Доставка платная для заказов на сумму менее 5000 ₽. Для заказов на
            сумму 5000 ₽ и выше доставка бесплатная. Для уточнения стоимости
            доставки, задайте вопрос в чате специалисту. Также информация
            указана в разделе «Доставка».
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
            onClick={handleCloseDelivery}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>

      {/* Certificate Modal */}
      <Modal
        open={openCertificate}
        onClose={handleCloseCertificate}
        aria-labelledby="certificate-modal-title"
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
            height: 160,
            backgroundColor: "rgba(245, 246, 245, 0.95)",
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
            id="certificate-modal-title"
            variant="h6"
            sx={{ fontWeight: "bold", color: "#00B3A4", mb: 2 }}
          >
            По сертификату
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.6 }}>
            Пошаговая инструкция приобретения по сертификату есть в чате
            поддержки, по всем вопросам Вам также ответят наши специалисты.
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
            onClick={handleCloseCertificate}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
