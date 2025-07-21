import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  Box,
  Container,
  List,
  ListItem,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import api from "../../configs/axiosConfig";

export default function Delivery() {
  const [content, setContent] = useState({
    "page-title": "Доставка - СД-МЕД",
    "meta-description":
      "Узнайте о доставке по Оренбургу и другим городам России. Бесплатная доставка по Оренбургу и информация о стоимости доставки в другие регионы.",
    "meta-keywords":
      "доставка, Оренбург, бесплатная доставка, доставка по России, курьерская доставка",
    "main-heading": "<h1>Доставка</h1>",
    "section-heading": "<h5>Условия доставки</h5>",
    "condition-1":
      "<p>Стоимость заказа включает в себя стоимость заказанных товаров и стоимость почтовой/курьерской доставки до региона получателя – ПРИ ОФОРМЛЕНИИ ПОЛНОГО СЕРТИФИКАТА на выдачу ТСР.</p>",
    "condition-2":
      "<p>ПРИ заказе отдельных ТСР – стоимость доставки УТОЧНЯЙТЕ у специалиста в чате!</p>",
    "condition-3":
      "<p>Способы доставки: ПЭК, СДЭК, Курьеры, Почта РФ, собственная логистика и транспорт, другое.</p>",
    "condition-4":
      "<p>Стоимость доставки зависит от региона получателя (при доставке компанией СДЭК на стоимость доставки влияет также общий вес заказа).</p>",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/page/delivery");
        console.log("Delivery API Response:", response.data); // Отладка
        const newContent = {};
        // Извлекаем элементы из response.data.data.elements
        const elements = Array.isArray(response.data?.data?.elements)
          ? response.data.data.elements
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
    <Box sx={{ backgroundColor: "#F9F9F9" }}>
      <Helmet>
        <title>{content["page-title"] || "Доставка - СД-МЕД"}</title>
        <meta name="description" content={content["meta-description"] || ""} />
        <meta name="keywords" content={content["meta-keywords"] || ""} />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: "bold", color: "#333", fontSize: "24px" }}
            dangerouslySetInnerHTML={{
              __html: content["main-heading"] || "<h1>Доставка</h1>",
            }}
          />
          <Divider
            sx={{
              borderColor: "#00B3A4",
              width: "50%",
              margin: "0 auto",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gridGap: "40px",
            mt: 2,
            mb: 2,
            flexDirection: { xs: "column", md: "unset" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", lg: "50%" },
              justifyContent: "center",
            }}
          >
            <img
              style={{
                borderRadius: "8px",
                objectFit: "contain",
                width: "100%",
              }}
              src="/delivery.png"
              alt="Доставка"
            />
          </Box>
          <Box sx={{ width: { xs: "100%", lg: "70%" } }}>
            <Paper
              elevation={3}
              sx={{
                padding: "10px",
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#00B3A4",
                  mb: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 30,
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    content["section-heading"] || "<h5>Условия доставки</h5>",
                }}
              />
              <List>
                {[
                  "condition-1",
                  "condition-2",
                  "condition-3",
                  "condition-4",
                ].map((id) => (
                  <ListItem key={id}>
                    <Typography
                      variant="body1"
                      sx={{ color: "#555" }}
                      dangerouslySetInnerHTML={{
                        __html: content[id] || "<p>Нет данных</p>",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
