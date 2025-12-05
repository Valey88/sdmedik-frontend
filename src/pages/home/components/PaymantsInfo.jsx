import React, { useEffect, useState } from "react";
import { Box, Button, CardMedia, Typography, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import api from "../../../configs/axiosConfig"; // Убедитесь, что путь верный
import MainSlider from "@/global/components/MainSlider"; // Импортируем созданный слайдер

export default function PaymantsInfo() {
  const navigate = useNavigate();
  const [sliderData, setSliderData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Получаем данные для страницы (предположим, что это главная страница '/')
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Запрашиваем данные для главной страницы (или той, где находится блок)
        const response = await api.get("/page/main");
        const elements = response.data?.data?.elements || [];

        // Ищем элемент с ID 'main-slider'
        const sliderElement = elements.find(
          (el) => el.element_id === "main-slider"
        );

        if (sliderElement && sliderElement.value) {
          try {
            // Парсим JSON строку в массив объектов
            const parsedSlides = JSON.parse(sliderElement.value);
            setSliderData(parsedSlides);
          } catch (e) {
            console.error("Ошибка парсинга данных слайдера", e);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных страницы", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ y: -1000 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.2 }}
    >
      <Helmet>
        <title>Оплата электронным сертификатом</title>
        <meta
          name="description"
          content="Теперь оплачивать покупки на нашем сайте вы можете и электронным сертификатом."
        />
        <meta
          name="keywords"
          content="оплата, электронный сертификат, покупки"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Блок слайдера вместо статичной картинки */}
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderRadius: "10px",
          mb: "40px",
          minHeight: { xs: "215px", lg: "550px" },
        }}
      >
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: "10px" }}
          />
        ) : sliderData.length > 0 ? (
          <MainSlider slides={sliderData} />
        ) : (
          // Фоллбэк, если слайдов нет (старая картинка)
          <CardMedia
            component="img"
            image="/Remont.jpg"
            alt="Ремонт"
            sx={{
              width: "100%",
              height: { xs: "215px", sm: "400px", md: "500px", lg: "550px" },
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        )}
      </Box>

      {/* Второй блок (остался без изменений, кроме логики навигации) */}
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          background: `linear-gradient(280.17deg, #00B3A4 -56.17%, #66D1C6 100%)`,
          borderRadius: "10px",
          padding: { xs: "20px", lg: "70px" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "unset" },
            justifyContent: { xs: "unset", md: "space-between" },
            gridGap: { xs: "40px", md: 60, lg: 0 },
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", md: "100%", lg: "50%" },
              display: "flex",
              flexDirection: "column",
              gridGap: 20,
            }}
          >
            <Typography
              variant="h2"
              color="white"
              sx={{ fontSize: { xs: "40px", lg: "60px" } }}
            >
              Оплата электронным сертификатом
            </Typography>
            <Typography variant="h6" color="white" component="p">
              Теперь оплачивать покупки на нашем сайте вы можете и электронным
              сертификатом
            </Typography>
            <Button
              sx={{
                display: "flex",
                justifyContent: "left",
                background: `linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)`,
                width: "max-content",
                padding: "13px 39px",
                color: "white",
                fontSize: "18px",
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/certificate");
              }}
            >
              Подробнее
            </Button>
          </Box>
          <Box sx={{ width: { xs: "100%", md: "100%", lg: "50%" } }}>
            <CardMedia
              component="img"
              image="/Group31.png"
              alt="Изображение"
              sx={{
                width: { xs: "100%", sm: "50%", md: "80%", lg: "100%" },
                height: { xs: "300px", sm: "300px", md: "350px", lg: "400px" },
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
