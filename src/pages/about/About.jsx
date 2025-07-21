import React, { useEffect, useState } from "react";
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
import api from "../../configs/axiosConfig";

export default function About() {
  const [content, setContent] = useState({
    "page-title": "О нас - Средства реабилитации и медицинская техника",
    "meta-description":
      "Мы предлагаем широкий выбор средств реабилитации, медицинских товаров и техники с 2000 года. Консультации и доставка.",
    "meta-keywords":
      "реабилитация, медицинские товары, медицинская техника, коляски, калоприемники, катетеры",
    "meta-robots": "index, follow",
    "canonical-link": "https://yourwebsite.com/about",
    "main-heading": "<h1>О нас</h1>",
    "sub-heading":
      "<h2>Средства реабилитации, Товары медицинского назначения и медицинская техника</h2>",
    "accordion-1-title": "Здоровье",
    "accordion-1-content":
      "<p>Хрупкая вещь, его нужно поддерживать и восстанавливать. Людям с хроническими заболеваниями, в периоды послеоперационной реабилитации, при уходе за больными на дому требуются специализированные изделия медицинского назначения: но где их купить, если в стандартный ассортимент аптек эти позиции не входят?</p>",
    "accordion-2-title": "Наш опыт работы с 2000 года.",
    "accordion-2-content":
      "<p>Мы предлагаем большой выбор СРЕДСТВ РЕАБИЛИТАЦИИ (коляски инвалидные, калоприемники, катетеры, уроприемники и другие средства по уходу).</p>",
    "accordion-3-title": "Наши преимущества",
    "accordion-3-content":
      "<p>Предоставим консультации менеджеров с медицинским образованием.<br />Доставим ваш заказ или отгрузим его со склада магазина самостоятельно.</p>",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/page/about");
        console.log("About API Response:", response.data); // Отладка
        const newContent = {};
        // Извлекаем элементы из response.data.data.elements или response.data.elements
        const elements = Array.isArray(response.data?.data?.elements)
          ? response.data.data.elements
          : Array.isArray(response.data?.elements)
          ? response.data.elements
          : [];
        elements.forEach((item) => {
          newContent[item.element_id] = item.value;
        });
        console.log("Processed content:", newContent); // Отладка
        setContent((prev) => ({ ...prev, ...newContent }));
      } catch (error) {
        console.error("Error fetching page content:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#F9F9F9", padding: "20px" }}>
      <Helmet>
        <title>
          {content["page-title"] ||
            "О нас - Средства реабилитации и медицинская техника"}
        </title>
        <meta name="description" content={content["meta-description"] || ""} />
        <meta name="keywords" content={content["meta-keywords"] || ""} />
        <meta
          name="robots"
          content={content["meta-robots"] || "index, follow"}
        />
        <link
          rel="canonical"
          href={content["canonical-link"] || "https://yourwebsite.com/about"}
        />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: "#333",
              fontSize: "24px",
              textAlign: "center",
            }}
            dangerouslySetInnerHTML={{
              __html: content["main-heading"] || "<h1>О нас</h1>",
            }}
          />
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
              fontSize: { xs: "20px", md: "24px" },
              fontWeight: "medium",
              color: "#00B3A4",
            }}
            component="h2"
            dangerouslySetInnerHTML={{
              __html:
                content["sub-heading"] ||
                "<h2>Средства реабилитации, Товары медицинского назначения и медицинская техника</h2>",
            }}
          />
          {[
            { title: "accordion-1-title", content: "accordion-1-content" },
            { title: "accordion-2-title", content: "accordion-2-content" },
            { title: "accordion-3-title", content: "accordion-3-content" },
          ].map((item, index) => (
            <Accordion
              key={item.title}
              sx={{ background: "#90E0D4", color: "#fff" }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon fontSize="medium" sx={{ color: "#fff" }} />
                }
                sx={{ fontSize: "20px" }}
              >
                {content[item.title] || `Accordion ${index + 1}`}
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 200, overflow: "auto" }}>
                <Typography
                  variant="body1"
                  component="p"
                  dangerouslySetInnerHTML={{
                    __html: content[item.content] || "<p>Нет данных</p>",
                  }}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
