import { Box, Typography, Divider, Grid } from "@mui/material";
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
              График работы в праздничные дни
            </Typography>

            <Divider
              sx={{
                width: "60%",
                borderColor: "rgba(255,255,255,0.6)",
                borderWidth: "2px",
                borderRadius: "2px",
              }}
            />

            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "18px", lg: "24px" },
                fontWeight: "medium",
                opacity: 0.9,
              }}
            >
              Новый год и Рождество 2025-2026
            </Typography>
          </Box>

          {/* СЕТКА ГОРОДОВ */}
          <Grid
            container
            spacing={3}
            rowSpacing={{ xs: 3, md: 3 }}
            sx={{ justifyContent: "center", width: "100%" }}
          >
            {/* ОРЕНБУРГ */}
            <Grid item xs={12} md={6} lg={4}>
              <InfoCard title="Оренбург" delay={0.3}>
                <ScheduleRow date="26.12" text="до 13:00" />
                <ScheduleRow date="31.12 — 04.01" text="Выходные" />
                <ScheduleRow date="05.01" text="с 10:00 до 17:00" />
                <ScheduleRow date="06.01 — 11.01" text="Выходные" />
              </InfoCard>
            </Grid>

            {/* ОРСК */}
            <Grid item xs={12} md={6} lg={4}>
              <InfoCard title="Орск" delay={0.4}>
                <ScheduleRow date="26.12, 27.12" text="Выходные" />
                <ScheduleRow date="31.12 — 04.01" text="Выходные" />
                <ScheduleRow date="05.01" text="с 10:00 до 17:00" />
                <ScheduleRow date="06.01 — 11.01" text="Выходные" />
              </InfoCard>
            </Grid>

            {/* УФА И ЕКАТЕРИНБУРГ */}
            <Grid item xs={12} md={6} lg={4}>
              <InfoCard title="Уфа, Екатеринбург" delay={0.5}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                    py: 2,
                  }}
                >
                  <ScheduleRow date="31.12 — 11.01" text="Выходные дни" />
                </Box>
              </InfoCard>
            </Grid>
          </Grid>

          {/* ОНЛАЙН МАГАЗИН */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "16px",
              padding: { xs: "24px", lg: "32px" },
              width: { xs: "100%", lg: "95%" },
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              marginTop: { xs: 2, md: 4 },
            }}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "18px", lg: "22px" },
                fontWeight: "bold",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Тех. поддержка и Онлайн-магазин
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-around",
                gap: { xs: 3, md: 2 },
              }}
            >
              <Box>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ fontSize: "18px" }}
                >
                  26.12.2025
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "16px" }}>
                  до 13:00
                </Typography>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  display: { xs: "none", md: "block" },
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              />

              <Divider
                orientation="horizontal"
                flexItem
                sx={{
                  display: { xs: "block", md: "none" },
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />

              <Box>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ fontSize: "18px" }}
                >
                  27-28.12
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "16px" }}>
                  Выходные дни
                </Typography>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  display: { xs: "none", md: "block" },
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              />
              <Divider
                orientation="horizontal"
                flexItem
                sx={{
                  display: { xs: "block", md: "none" },
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />

              <Box>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ fontSize: "18px" }}
                >
                  31.12 — 11.01
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "16px" }}>
                  Выходные дни
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="h6"
            component={motion.h6}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            sx={{
              fontSize: { xs: "16px", lg: "20px" },
              fontStyle: "italic",
              mt: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            Поздравляем вас с наступающими праздниками!
            <br />
            Все заявки, поступившие в выходные дни, будут обработаны в первый
            рабочий день.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// === ИСПРАВЛЕННЫЙ КОМПОНЕНТ СТРОКИ ===
const ScheduleRow = ({ date, text }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start", // Выравнивание по верху на случай переноса строк
      width: "100%",
      textAlign: "left",
      gap: "10px", // Гарантированный отступ между датой и временем
    }}
  >
    <Typography
      sx={{
        fontWeight: "bold",
        fontSize: { xs: "14px", sm: "15px", lg: "17px" }, // Чуть уменьшил шрифт на мобильных
        width: "45%", // Зафиксировал ширину даты
        flexShrink: 0, // Запретил сжимать дату
      }}
    >
      {date}
    </Typography>
    <Typography
      sx={{
        fontSize: { xs: "14px", sm: "15px", lg: "17px" },
        width: "55%", // Отдал больше места под текст
        textAlign: "right",
        // Убрал whiteSpace: "nowrap", чтобы текст мог переноситься
        lineHeight: 1.2,
      }}
    >
      {text}
    </Typography>
  </Box>
);

const InfoCard = ({ title, children, delay }) => (
  <Box
    component={motion.div}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: delay, duration: 0.5 }}
    sx={{
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(5px)",
      borderRadius: "16px",
      padding: { xs: "20px", md: "24px" },
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: "bold",
        mb: 2,
        borderBottom: "2px solid rgba(255,255,255,0.3)",
        pb: 1,
        width: "100%",
        fontSize: { xs: "18px", md: "20px" },
      }}
    >
      {title}
    </Typography>
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}
    >
      {children}
    </Box>
  </Box>
);
