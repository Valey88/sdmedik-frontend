import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  // Варианты анимации для текста "404"
  const numberVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Варианты анимации для текста "Sdmedik"
  const logoVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // Варианты анимации для сообщения
  const messageVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay: 0.5, ease: "easeOut" },
    },
  };

  // Варианты анимации для кнопки
  const buttonVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 1, ease: "easeOut" },
    },
    hover: {
      scale: 1.1,
      boxShadow: "0px 4px 20px rgba(44, 192, 179, 0.5)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #F5FCFF 0%, #A5DED1 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Анимированные круги на заднем плане */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, #2CC0B3, transparent)",
          borderRadius: "50%",
          top: "10%",
          left: "20%",
          zIndex: 0,
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, #00B3A4, transparent)",
          borderRadius: "50%",
          bottom: "15%",
          right: "25%",
          zIndex: 0,
        }}
      />

      {/* Основной контент */}
      <motion.div
        variants={numberVariants}
        initial="hidden"
        animate="visible"
        style={{ zIndex: 1 }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "8rem" },
            fontWeight: "bold",
            color: "#2CC0B3",
            textShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          404
        </Typography>
      </motion.div>

      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        style={{ zIndex: 1 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", md: "3.5rem" },
            fontWeight: "bold",
            color: "#00B3A4",
            letterSpacing: "2px",
          }}
        >
          Sdmedik.ru
        </Typography>
      </motion.div>

      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        style={{ zIndex: 1 }}
      >
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            color: "#333",
            textAlign: "center",
            maxWidth: "500px",
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          Ой! Кажется, мы заблудились. Страница, которую вы ищете, не найдена.
        </Typography>
      </motion.div>

      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          mt: 4,
          backgroundColor: "#2CC0B3",
          color: "#fff",
          padding: "10px 30px",
          borderRadius: "25px",
          fontSize: "1.1rem",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#00B3A4",
          },
        }}
      >
        Вернуться на главную
      </Button>
    </Box>
  );
};

export default NotFound;
