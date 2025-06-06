import { Box, Typography, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

export default function Info() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* <Helmet>
        <title>График работы в праздничные дни - Samedik.ru</title>
        <meta
          name="description"
          content="Узнайте график работы Samedik.ru в праздничные дни, важные уведомления и поздравление от коллектива."
        />
        <meta
          name="keywords"
          content="Samedik, график работы, праздничные дни, интернет-магазин, медицинские товары"
        />
        <meta name="robots" content="index, follow" />
      </Helmet> */}
      <Box
        component={motion.section}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{
          background: `linear-gradient(135deg, #00B3A4 0%, #66D1C6 50%, #A5DED1 100%)`,
          borderRadius: "20px",
          padding: { xs: "24px", lg: "48px" },
          margin: { xs: "16px", lg: "32px" },
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 70%)`,
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            color: "white",
            gap: "28px",
          }}
        >
          {/* <Typography
            variant="h4"
            component={motion.h4}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            sx={{
              fontSize: { xs: "28px", lg: "44px" },
              fontWeight: "bold",
              textShadow: "0 3px 6px rgba(0,0,0,0.3)",
              lineHeight: 1.2,
              color: "red",
            }}
          >
            Важное объявление!
          </Typography>
          <Divider
            sx={{
              width: "70%",
              borderColor: "rgba(255,255,255,0.6)",
              borderWidth: "3px",
              borderRadius: "2px",
            }}
          />
          <Typography
            variant="h5"
            component={motion.h5}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            sx={{
              fontSize: { xs: "20px", lg: "30px" },
              fontWeight: "medium",
              letterSpacing: "0.5px",
            }}
          >
            График работы в майские праздники
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: { xs: "20px", lg: "24px" },
              width: { xs: "100%", lg: "85%" },
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "22px" },
                fontWeight: "bold",
                lineHeight: 1.6,
              }}
            >
              1 и 9 мая — выходные дни
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "22px" },
                lineHeight: 1.6,
              }}
            >
              <strong>2, 3, 4, 8, 10, 11 мая</strong> — пункты выдачи и
              выставочные залы работают в обычном режиме
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "22px" },
                lineHeight: 1.6,
              }}
            >
              <strong>С 1 по 4 и с 8 по 11 мая</strong> — выходные у
              специалистов сайта
              <br />
              (обработка заказов осуществляется только в рабочие дни)
            </Typography>
          </Box> */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: { xs: "20px", lg: "24px" },
              width: { xs: "100%", lg: "85%" },
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "30px" },
                fontWeight: "bold",
                lineHeight: 1.6,
                color: "#fff",
              }}
            >
              Уважаемые клиенты Обращаем Ваше внимание на график работы в
              праздничные дни:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "20px" },
                lineHeight: 1.6,
              }}
            >
              11.06.2025 - сокращенный рабочий день до 18:30 12.06.2025 -
              выходной день Остальные дни в соответствии с графиком работы
              магазина.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: { xs: "20px", lg: "24px" },
              width: { xs: "100%", lg: "85%" },
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "30px" },
                fontWeight: "bold",
                lineHeight: 1.6,
                color: "#fff",
              }}
            >
              Важно
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "20px" },
                lineHeight: 1.6,
              }}
            >
              Имеются медицинские противопоказания. Перед использованием
              продукции обязательно проконсультируйтесь со специалистом.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: { xs: "20px", lg: "24px" },
              width: { xs: "100%", lg: "85%" },
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "30px" },
                fontWeight: "bold",
                lineHeight: 1.6,
                color: "#fff",
              }}
            >
              Уведомление о продукции и ценах
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", lg: "20px" },
                lineHeight: 1.6,
              }}
            >
              Информация и цены, указанные на сайте, не являются публичной
              офертой, определяемой положениями статьи 437 Гражданского кодекса
              Российской Федерации. Товар на фото может отличаться от оригинала.
              Для получения подробной информации о модели, характеристиках,
              комплектации, стоимости, сроках и условиях поставки просьба
              уточнять через форму обратной связи или по телефону.
            </Typography>
          </Box>
          {/* <Typography
            variant="h6"
            component={motion.h6}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            sx={{
              fontSize: { xs: "18px", lg: "26px" },
              fontStyle: "italic",
              mt: 3,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              lineHeight: 1.4,
            }}
          >
            Команда интернет-магазина SDMEDIK.RU поздравляет вас с майскими
            праздниками!
          </Typography>
          <Button
            component={motion.button}
            whileHover={{
              scale: 1.12,
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}
            whileTap={{ scale: 0.95 }}
            sx={{
              background: `linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)`,
              color: "white",
              padding: { xs: "14px 40px", lg: "16px 56px" },
              fontSize: { xs: "16px", lg: "20px" },
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: "medium",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              letterSpacing: "0.5px",
            }}
            onClick={() => navigate("/")}
          >
            На главную страницу
          </Button> */}
        </Box>
      </Box>
    </Box>
  );
}
