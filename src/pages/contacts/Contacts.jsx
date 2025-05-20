import {
  Box,
  Container,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import React from "react";
import { Helmet } from "react-helmet";

export default function Contacts() {
  const addresses = [
    {
      address: "г. Оренбург, ул. Шевченко д. 20 «В»",
      coords: [51.769, 55.096],
    },
    {
      address: "г. Орск, проспект Мира. 15 «Д», ТД Яшма, магазин «Памперсы»",
      coords: [51.227, 58.562],
    },
    {
      address: "г. Уфа, ул. Степана Кувыкина, 41, Магазин-Склад",
      coords: [54.738, 55.972],
    },
    {
      address: "г. Екатеринбург, пр-т. Ленина 79 «Б», Центр обучения",
      coords: [56.838, 60.597],
    },
    // {
    //   address: "респ. Чечня, г. Гудермес, ул. Нагорная, 2",
    //   coords: [43.307, 45.826],
    // },
    // {
    //   address: "респ. Чечня, г. Грозный, ул. Маты Кишиева, 142",
    //   coords: [43.317, 45.694],
    // },
    // { address: "г. Нижний Новгород, ул Дежнëва, 2", coords: [56.328, 44.002] },
  ];

  return (
    <Box sx={{ mb: 5 }}>
      <Helmet>
        <title>Контакты - Компании СД-МЕД</title>
        <meta
          name="description"
          content="Контактная информация нашей компании"
        />
        <meta name="keywords" content="контакты, адрес, телефон" />
      </Helmet>
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Контакты
          </Typography>
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
                <Typography>+7 (903) 086 3091</Typography>
                <Typography>+7 (909) 617 8196</Typography>
                <Typography>+7 (353) 293 5241</Typography>
              </Box>
            </Box>
            {/* <Box sx={{ display: "flex", gridGap: 20, alignItems: "center" }}>
              <Box>
                <img src="/mail.png" alt="Почта" />
              </Box>
              <Box>
                <Link>olimp1-info@yandex.ru</Link>
              </Box>
            </Box> */}
            <Box sx={{ display: "flex", gridGap: 20 }}>
              <Box>
                <img src="/mark.png" alt="Адрес" />
              </Box>
              <Box>
                <List>
                  <Typography sx={{ fontSize: "20px" }}>
                    Пункты выдачи заказов:
                  </Typography>
                  <ListItem>
                    г. Оренбург, ул. Шевченко д. 20 «В» Магазин - Склад{" "}
                    <br></br>+ 7 3532 93-52-41
                  </ListItem>
                  <ListItem>
                    г. Орск, проспект Мира. 15 «Д», ТД Яшма, магазин «Памперсы»
                    <br></br> +7 905 896-23-23
                  </ListItem>
                  <ListItem>
                    г. Уфа, ул. Степана Кувыкина, 41, Магазин-Склад<br></br> +7
                    961 366-82-46
                  </ListItem>
                  <ListItem>
                    г. Екатеринбург, пр-т. Ленина 79 «Б», Центр обучения и
                    обеспечения техническими средствами реабилитации<br></br> +7
                    903 086-34-11
                  </ListItem>
                  {/* <ListItem>
                    р . Чечня, г. Гудермес, ул. Нагорная, 2<br></br> +7 928
                    002-34-19
                  </ListItem> */}
                  {/* <ListItem>
                    респ. Чечня, г. Грозный, ул. Маты Кишиева, 142<br></br> +7
                    928 002-34-19
                  </ListItem> */}
                  {/* <ListItem>
                    г. Нижний Новгород, ул Дежнëва, 2<br></br> +7 960 181-03-50
                  </ListItem> */}
                </List>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
