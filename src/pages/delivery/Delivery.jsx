import React from "react";
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

export default function Delivery() {
  return (
    <Box sx={{ backgroundColor: "#F9F9F9", padding: "20px" }}>
      <Helmet>
        <title>Доставка - СД-МЕД</title>
        <meta
          name="description"
          content="Узнайте о доставке по Оренбургу и другим городам России. Бесплатная доставка по Оренбургу и информация о стоимости доставки в другие регионы."
        />
        <meta
          name="keywords"
          content="доставка, Оренбург, бесплатная доставка, доставка по России, курьерская доставка"
        />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Доставка
          </Typography>
          <Divider
            sx={{
              my: 2,
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
            mt: 5,
            mb: 5,
            flexDirection: { xs: "column", md: "unset" },
          }}
        >
          <Box sx={{ display: "flex", width: "50%", justifyContent: "center" }}>
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
          <Box sx={{ width: "70%" }}>
            <Paper
              elevation={3}
              sx={{
                padding: "20px",
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#00B3A4", mb: 2 }}
              >
                Условия доставки
              </Typography>
              <List>
                <ListItem>
                  <Typography variant="body1" sx={{ color: "#555" }}>
                    Стоимость заказа включает в себя стоимость заказанных
                    товаров и стоимость почтовой/курьерской доставки до региона
                    получателя – ПРИ ОФОРМЛЕНИИ ПОЛНОГО СЕРТИФИКАТА на выдачу
                    ТСР.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body1" sx={{ color: "#555" }}>
                    ПРИ заказе отдельных ТСР – стоимость доставки УТОЧНЯЙТЕ у
                    специалиста в чате!
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body1" sx={{ color: "#555" }}>
                    Способы доставки: ПЭК, СДЭК, Курьеры, Почта РФ, собственная
                    логистика и транспорт, другое.
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="body1" sx={{ color: "#555" }}>
                    Стоимость доставки зависит от региона получателя (при
                    доставке компанией СДЭК на стоимость доставки влияет также
                    общий вес заказа).
                  </Typography>
                </ListItem>
                {/* <ListItem>
                  <Typography variant="body1" sx={{ color: "#555" }}>
                    Стоимость доставки зависит от региона получателя. При
                    доставке через СДЭК учитывается также общий вес заказа.
                    Точную стоимость можно узнать на странице оформления заказа
                    после выбора региона.
                  </Typography>
                </ListItem> */}
              </List>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
