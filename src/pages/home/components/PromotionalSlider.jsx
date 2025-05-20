import { Box, Button, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css"; // Импортируйте стили Swiper
import { Autoplay, Navigation } from "swiper/modules"; // Импортируйте необходимые модули
import usePromotionStore from "../../../store/promotionStore";

export default function PromotionalSlider() {
  const { fetchPromotion, promotions } = usePromotionStore();

  useEffect(() => {
    fetchPromotion();
  }, []);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Swiper
        modules={[Autoplay, Navigation]} // Подключите модули
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 10000 }} // Автоматическая прокрутка
      >
        {promotions && promotions.data && promotions.data.length > 0 ? (
          promotions.data.map((slide, index) => (
            <SwiperSlide key={index}>
              <Box
                component="section"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  background: `linear-gradient(280.17deg, rgba(0, 179, 164, 0.8), rgba(102, 209, 198, 0.8)), url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "10px",
                  padding: { xs: "20px", lg: "70px" },
                  height: { xs: "300px", lg: "400px" },
                  color: "white",
                  position: "relative",
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "24px", lg: "48px" },
                    textAlign: "center",
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
                  }}
                >
                  {slide.name}
                </Typography>
                <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
                  {slide.description}
                </Typography>
                <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
                  Акция действует с {formatDate(slide.start_date)} до
                  {formatDate(slide.end_date)}
                </Typography>
                <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
                  До: 
                  {formatDate(slide.end_date)}
                </Typography>
              </Box>
            </SwiperSlide>
          ))
        ) : (
          <Typography variant="h6" color="white" align="center">
            Нет доступных акций
          </Typography>
        )}
      </Swiper>
    </Box>
  );
}
