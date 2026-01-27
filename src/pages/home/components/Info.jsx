import { Box, Typography, Divider } from "@mui/material";
import { motion } from "framer-motion";

export default function Info() {
  return (
    <Box>
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
            gap: { xs: 3, md: 4 },
            maxWidth: "900px",
            mx: "auto", // Центрирование контента
          }}
        >
          {/* ЗАГОЛОВОК */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Typography
              variant="h4"
              component={motion.h4}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              sx={{
                fontSize: { xs: "24px", lg: "40px" },
                fontWeight: "bold",
                textShadow: "0 3px 6px rgba(0,0,0,0.3)",
                lineHeight: 1.2,
              }}
            >
              Уважаемые посетители!
            </Typography>

            <Divider
              sx={{
                width: "40%",
                borderColor: "rgba(255,255,255,0.6)",
                borderWidth: "2px",
                borderRadius: "2px",
              }}
            />
          </Box>

          {/* ОСНОВНОЕ СООБЩЕНИЕ - ОРЕНБУРГ */}
          <Box
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            sx={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(5px)",
              borderRadius: "16px",
              padding: { xs: "24px", lg: "40px" },
              width: "100%",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "20px", lg: "28px" },
                fontWeight: "bold",
                mb: 2,
                color: "#fff",
              }}
            >
              28 и 29 января
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "16px", lg: "22px" },
                lineHeight: 1.5,
                mb: 1,
              }}
            >
              Выставочный зал и ПВЗ <br />
              <strong>
                г. Оренбург, Шевченко 20 В; г. Орск, проспект Мира. 15 Д;
                <br></br>г. Уфа, ул. Степана Кувыкина; 41, г. Екатеринбург,
                пр-т. Ленина 79 Б
              </strong>
            </Typography>

            <Box
              sx={{
                display: "inline-block",
                background: "rgba(0,0,0,0.15)",
                padding: "8px 16px",
                borderRadius: "8px",
                mt: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "16px", lg: "20px" },
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Закрыты на учёт
              </Typography>
            </Box>
          </Box>

          {/* ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
          <Box
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "18px", lg: "22px" },
                fontWeight: "medium",
                mb: 3,
              }}
            >
              Интернет-магазин работает в штатном режиме.
            </Typography>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", mb: 3 }} />

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "14px", lg: "18px" },
                fontStyle: "italic",
                opacity: 0.9,
              }}
            >
              Извините за доставленные неудобства. <br />
              Спасибо за понимание!
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
