import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  List,
  ListItem,
  Typography,
  Divider,
} from "@mui/material";
import { Helmet } from "react-helmet";
import api from "../../configs/axiosConfig";

export default function Details() {
  const [content, setContent] = useState({
    "page-title": "Реквизиты компании СД-МЕД - Полная информация о компании",
    "meta-description":
      "Узнайте полные реквизиты компании СД-МЕД, включая ИНН, КПП, адрес и контактные данные. Мы предоставляем качественные медицинские услуги.",
    "meta-keywords":
      "реквизиты СД-МЕД, ИНН СД-МЕД, контактные данные СД-МЕД, адрес СД-МЕД",
    "main-heading": "<h1>Реквизиты</h1>",
    "section-heading":
      "<h2>ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «СД-МЕД»</h2>",
    "detail-1":
      "<p>ИНН 5609198444, КПП 560901001 ОГРН 1225600000361 460005, Оренбургская область, г. Оренбург, ул. Шевченко д. 20В, этаж 1, офис 1</p>",
    "detail-2": "<p>БИК 042202824</p>",
    "detail-3": "<p>К/с 30101810200000000824</p>",
    "detail-4": "<p>Р/с 40702810529250005622</p>",
    "detail-5": "<p>E-mail: Sd2-info@yandex.ru | www.sdmedik.ru</p>",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/page/deteils");
        console.log("Details API Response:", response.data); // Отладка
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
    <Box sx={{ mb: 5, backgroundColor: "#F9F9F9", padding: "20px" }}>
      <Helmet>
        <title>{content["page-title"] || "Реквизиты компании СД-МЕД"}</title>
        <meta name="description" content={content["meta-description"] || ""} />
        <meta name="keywords" content={content["meta-keywords"] || ""} />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: "bold", color: "#333" ,fontSize: "24px"}}
            dangerouslySetInnerHTML={{
              __html: content["main-heading"] || "<h1>Реквизиты</h1>",
            }}
          />
          <Divider
            sx={{
              my: 2,
              borderColor: "#00B3A4",
              width: "50%",
              margin: "0 auto",
            }}
          />
        </Box>
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography
            component="h2"
            variant="h5"
            sx={{ fontWeight: "bold", color: "#00B3A4", fontSize:"22px" }}
            dangerouslySetInnerHTML={{
              __html:
                content["section-heading"] ||
                "<h2>ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «СД-МЕД»</h2>",
            }}
          />
        </Box>
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: 2,
          }}
        >
          <List>
            {["detail-1", "detail-2", "detail-3", "detail-4", "detail-5"].map(
              (id) => (
                <ListItem key={id}>
                  <Typography
                    variant="body1"
                    sx={{ color: "#555" }}
                    dangerouslySetInnerHTML={{
                      __html: content[id] || "<p>Нет данных</p>",
                    }}
                  />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Container>
    </Box>
  );
}
