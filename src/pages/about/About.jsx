import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Helmet } from "react-helmet";
import React from "react";

export default function About() {
  return (
    <Box sx={{ backgroundColor: "#F9F9F9", padding: "20px" }}>
      <Helmet>
        <title>О нас - Средства реабилитации и медицинская техника</title>
        <meta
          name="description"
          content="Мы предлагаем широкий выбор средств реабилитации, медицинских товаров и техники с 2000 года. Консультации и доставка."
        />
        <meta
          name="keywords"
          content="реабилитация, медицинские товары, медицинская техника, коляски, калоприемники, катетеры"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yourwebsite.com/about" />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            О нас
          </Typography>
        </Box>
        <Divider
          sx={{ my: 2, borderColor: "#00B3A4", width: "50%", margin: "0 auto" }}
        />
        <Box sx={{ width: "100%", mb: 4 }}>
          <img
            style={{ width: "100%", borderRadius: "8px" }}
            src="/about.png"
            alt="О нас"
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gridGap: "40px" }}>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: "20px", md: "30px" },
              fontWeight: "medium",
              color: "#00B3A4",
            }}
            component="h2"
          >
            Средства реабилитации, Товары медицинского назначения и медицинская
            техника
          </Typography>
          <Accordion sx={{ background: "#90E0D4", color: "#fff" }}>
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon fontSize="medium" sx={{ color: "#fff" }} />
              }
              sx={{ fontSize: "20px" }}
            >
              Здоровье
            </AccordionSummary>
            <AccordionDetails sx={{ maxHeight: 200, overflow: "auto" }}>
              <Typography variant="body1" component="p">
                Хрупкая вещь, его нужно поддерживать и восстанавливать. Людям с
                хроническими заболеваниями, в периоды послеоперационной
                реабилитации, при уходе за больными на дому требуются
                специализированные изделия медицинского назначения: но где их
                купить, если в стандартный ассортимент аптек эти позиции не
                входят?
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ background: "#90E0D4", color: "#fff" }}>
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon fontSize="medium" sx={{ color: "#fff" }} />
              }
              sx={{ fontSize: "20px" }}
            >
              Наш опыт работы с 2000 года.
            </AccordionSummary>
            <AccordionDetails sx={{ maxHeight: 200, overflow: "auto" }}>
              <Typography variant="body1" component="p">
                Мы предлагаем большой выбор СРЕДСТВ РЕАБИЛИТАЦИИ (коляски
                инвалидные, калоприемники, катетеры, уроприемники и другие
                средства по уходу).
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ background: "#90E0D4", color: "#fff" }}>
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon fontSize="medium" sx={{ color: "#fff" }} />
              }
              sx={{ fontSize: "20px" }}
            >
              Наши преимущества
            </AccordionSummary>
            <AccordionDetails sx={{ maxHeight: 200, overflow: "auto" }}>
              <Typography variant="body1" component="p">
                Предоставим консультации менеджеров с медицинским образованием.
                <br />
                Доставим ваш заказ или отгрузим его со склада магазина
                самостоятельно.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
    </Box>
  );
}
