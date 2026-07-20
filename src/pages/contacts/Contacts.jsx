import React, { useEffect, useState } from "react";
import { Box, Container, List, ListItem, Typography } from "@mui/material";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import { Helmet } from "react-helmet";
import api from "../../configs/axiosConfig";

export default function Contacts() {
  const [content, setContent] = useState({
    "page-title": "Контакты - Компании СД-МЕД",
    "meta-description": "Контактная информация нашей компании",
    "meta-keywords": "контакты, адрес, телефон",
    "main-heading": "<h1>Контакты</h1>",
    "phone-1": "+7 (903) 086 3091",
    "phone-2": "+7 (353) 293 5241",
    "address-1":
      "г. Оренбург, ул. Шевченко д. 20 «В» Магазин - Склад<br>+7 3532 93-52-41",
    "address-2":
      "г. Орск, проспект Мира. 15 «Д», ТД Яшма, магазин «Памперсы»<br>+7 905 896-23-23",
    "address-3":
      "г. Уфа, ул. Степана Кувыкина, 41, Магазин-Склад<br>+7 961 366-82-46",
    "address-4":
      "г. Екатеринбург, пр-т. Ленина 79 «Б», Центр обучения и обеспечения техническими средствами реабилитации<br>+7 903 086-34-11",
    "address-5":
      "125412, Москва, Коровинское ш., 17А, метро Селигерская<br>8 (499) 488-00-83, 8 (800) 234-57-20",
    "address-6":
      "г. Оренбург, Просторная 13/1<br>8 909-611-20-55, режим работы: с пн по пт с 9 до 18.00",
    "coords-1": "[51.798286, 55.111328]",
    "coords-2": "[51.230507, 58.485481]",
    "coords-3": "[54.711229, 56.000041]",
    "coords-4": "[56.841763, 60.628368]",
    "coords-5": "[55.864388, 37.545722]",
    "coords-6": "[51.838324, 55.156641]",
  });

  const stripHtml = (html) => {
    return html.replace(/<[^>]+>/g, "");
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/page/contacts");
        console.log("Contacts API Response:", response.data); // Debugging
        const newContent = {};
        const elements = Array.isArray(response.data?.data?.elements)
          ? response.data.data.elements
          : Array.isArray(response.data?.elements)
          ? response.data.elements
          : [];
        elements.forEach((item) => {
          newContent[item.element_id] = item.value;
        });
        console.log("Processed content:", newContent); // Debugging
        setContent((prev) => ({ ...prev, ...newContent }));
      } catch (error) {
        console.error("Error fetching page content:", error);
      }
    };
    fetchContent();
  }, []);

  // Parse coordinates for Yandex Maps
  const addresses = Object.keys(content)
    .filter((key) => key.startsWith("address-"))
    .map((key) => {
      const index = key.split("-")[1];
      const coordsKey = `coords-${index}`;
      
      let coords = [55.751574, 37.573856];
      try {
        if (content[coordsKey]) {
          coords = JSON.parse(content[coordsKey]);
        }
      } catch (e) {
        console.error("Error parsing coords for", key, e);
      }
      
      return {
        id: parseInt(index),
        address: content[key],
        coords,
      };
    })
    .sort((a, b) => a.id - b.id);

  return (
    <Box sx={{ mb: 5 }}>
      <Helmet>
        <title>{content["page-title"] || "Контакты - Компании СД-МЕД"}</title>
        <meta name="description" content={content["meta-description"] || ""} />
        <meta name="keywords" content={content["meta-keywords"] || ""} />
      </Helmet>
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              __html: content["main-heading"] || "<h1>Контакты</h1>",
            }}
          />
        </Box>
        <Box sx={{ width: "100%" }}>
          <img
            style={{ width: "100%" }}
            src="/Line 1.png"
            alt="Линия разделения"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "unset" },
            gridGap: 20,
            mt: 2,
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "60%" } }}>
            <YMaps>
              <Map
                defaultState={{ center: [55.751574, 37.573856], zoom: 4 }}
                style={{ width: "100%", height: "600px" }}
              >
                {addresses.map((item, index) => (
                  <Placemark
                    key={index}
                    geometry={item.coords}
                    properties={{
                      balloonContent: item.address,
                    }}
                  />
                ))}
              </Map>
            </YMaps>
          </Box>
          <Box
            sx={{
              width: { xs: "100%", md: "40%" },
              display: "flex",
              flexDirection: "column",
              gridGap: 30,
            }}
          >
            <Box sx={{ display: "flex", gridGap: 20 }}>
              <Box>
                <img src="/Phone.png" alt="Телефон" />
              </Box>
              <Box>
                <Typography>
                  {stripHtml(content["phone-1"] || "+7 (903) 086 3091")}
                </Typography>
                <Typography>
                  {stripHtml(content["phone-2"] || "+7 (353) 293 5241")}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gridGap: 20 }}>
              <Box>
                <img src="/mark.png" alt="Адрес" />
              </Box>
              <Box>
                <List>
                  <Typography sx={{ fontSize: "20px" }}>
                    Пункты выдачи заказов:
                  </Typography>
                  {addresses.map((item, index) => (
                    <ListItem key={index}>
                      <Typography
                        dangerouslySetInnerHTML={{
                          __html: item.address || "<p>Нет данных</p>",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
