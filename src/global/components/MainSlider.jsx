import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  A11y,
  EffectFade,
} from "swiper/modules";
import {
  Box,
  CardMedia,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Иконки
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

// Подключение стилей Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// --- Умный компонент видео ---
const VideoSlide = ({ url, isActive }) => {
  const swiper = useSwiper(); // Получаем управление слайдером
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Логика переключения слайдов по окончанию видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !swiper) return;

    if (isActive) {
      // 1. Если слайд активен - останавливаем глобальный таймер слайдера
      swiper.autoplay.stop();

      // 2. Запускаем видео
      video.currentTime = 0;
      video
        .play()
        .catch((e) => console.log("Автоплей видео заблокирован браузером", e));
    } else {
      // Если слайд ушел - ставим на паузу
      video.pause();
    }
  }, [isActive, swiper]);

  // Когда видео заканчивается
  const handleVideoEnded = () => {
    if (swiper) {
      swiper.slideNext(); // Листаем дальше
      swiper.autoplay.start(); // Включаем таймер для следующего слайда (если там картинка)
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box
        component="video"
        ref={videoRef}
        src={url}
        muted={isMuted}
        playsInline
        onEnded={handleVideoEnded} // Самое важное событие
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Кнопка звука */}
      <IconButton
        onClick={toggleMute}
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
          zIndex: 10,
        }}
      >
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Box>
  );
};

// --- Основной компонент Слайдера ---
export default function MainSlider({ slides }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  if (!slides || slides.length === 0) return null;

  // Стили UI (стрелки, точки)
  const swiperStyles = {
    width: "100%",
    height: "100%",
    "& .swiper-pagination-bullet": {
      background: "white",
      opacity: 0.6,
      width: "10px",
      height: "10px",
      transition: "all 0.3s",
    },
    "& .swiper-pagination-bullet-active": {
      background: "#00B3A4",
      opacity: 1,
      width: "25px", // Делаем активную точку вытянутой
      borderRadius: "5px",
    },
    "& .swiper-button-next, & .swiper-button-prev": {
      color: "white",
      width: "44px",
      height: "44px",
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: "50%",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255,255,255,0.2)",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "#00B3A4",
        border: "1px solid #00B3A4",
      },
      "&::after": {
        fontSize: "20px",
        fontWeight: "bold",
      },
    },
    "& .swiper-button-next": {
      display: { xs: "none", md: "flex" },
      right: "20px",
    },
    "& .swiper-button-prev": {
      display: { xs: "none", md: "flex" },
      left: "20px",
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        // Адаптивная высота (для видео лучше побольше на десктопе)
        height: { xs: "250px", sm: "400px", md: "500px", lg: "550px" },
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
        ...swiperStyles,
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade" // Плавное затухание (fade) выглядит лучше для смешанного контента
        navigation
        pagination={{ clickable: true }}
        // Базовый автоплей для КАРТИНОК (5 секунд). Видео будет его останавливать.
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        style={{ width: "100%", height: "100%" }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            {({ isActive }) => (
              <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                {/* 1. КОНТЕНТ (ВИДЕО или КАРТИНКА) */}
                {slide.type === "video" ? (
                  // Передаем isActive, чтобы видео знало, когда играть
                  <VideoSlide url={slide.url} isActive={isActive} />
                ) : (
                  <CardMedia
                    component="img"
                    image={slide.url}
                    alt={slide.alt || "Slide"}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      // Небольшой эффект зума при появлении для динамики
                      transform: isActive ? "scale(1)" : "scale(1.1)",
                      transition: "transform 4s ease",
                    }}
                  />
                )}

                {/* 2. ГРАДИЕНТ (для читаемости текста) */}
                {(slide.title || slide.buttonText) && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* 3. ТЕКСТ И КНОПКИ */}
                {(slide.title || slide.subtitle || slide.buttonText) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: { xs: "20px", md: "60px" },
                      transform: "translateY(-50%)",
                      maxWidth: { xs: "90%", md: "550px" },
                      color: "white",
                      zIndex: 5,
                      textAlign: "left",
                    }}
                  >
                    <Box
                      sx={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive
                          ? "translateY(0)"
                          : "translateY(30px)",
                        transition: "all 0.8s ease-out 0.2s", // Анимация появления
                      }}
                    >
                      {slide.title && (
                        <Typography
                          variant={isMobile ? "h4" : "h2"}
                          sx={{
                            fontWeight: 800,
                            mb: 1.5,
                            lineHeight: 1.1,
                            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                          }}
                        >
                          {slide.title}
                        </Typography>
                      )}

                      {slide.subtitle && (
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 3,
                            fontWeight: 400,
                            opacity: 0.9,
                            fontSize: { xs: "0.9rem", md: "1.25rem" },
                            display: { xs: "none", sm: "block" },
                          }}
                        >
                          {slide.subtitle}
                        </Typography>
                      )}

                      {slide.link && (
                        <Button
                          variant="contained"
                          onClick={() => navigate(slide.link)}
                          sx={{
                            background:
                              "linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)",
                            color: "white",
                            padding: "12px 36px",
                            fontSize: "1rem",
                            borderRadius: "50px",
                            fontWeight: "bold",
                            textTransform: "none",
                            boxShadow: "0 4px 20px rgba(0, 179, 164, 0.4)",
                            "&:hover": {
                              background:
                                "linear-gradient(95.61deg, #00B3A4 4.71%, #00968a 97.25%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 25px rgba(0, 179, 164, 0.6)",
                            },
                          }}
                        >
                          {slide.buttonText || "Подробнее"}
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
