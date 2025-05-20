import {
  Box,
  Container,
  List,
  ListItem,
  Typography,
  Divider,
} from "@mui/material";
import { Helmet } from "react-helmet";
import React from "react";

export default function Details() {
  return (
    <Box sx={{ mb: 5, backgroundColor: "#F9F9F9", padding: "20px" }}>
      <Helmet>
        <title>Реквизиты компании СД-МЕД - Полная информация о компании</title>
        <meta
          name="description"
          content="Узнайте полные реквизиты компании СД-МЕД, включая ИНН, КПП, адрес и контактные данные. Мы предоставляем качественные медицинские услуги."
        />
        <meta
          name="keywords"
          content="реквизиты СД-МЕД, ИНН СД-МЕД, контактные данные СД-МЕД, адрес СД-МЕД"
        />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Реквизиты
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
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            component="h2"
            variant="h5"
            sx={{ fontWeight: "bold", color: "#00B3A4" }}
          >
            ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «СД-МЕД»
          </Typography>
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
            <ListItem>
              <Typography variant="body1" sx={{ color: "#555" }}>
                ИНН 5609198444, КПП 560901001 ОГРН 1225600000361 460005,
                Оренбургская область, г. Оренбург, ул. Шевченко д. 20В, этаж 1,
                офис 1
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1" sx={{ color: "#555" }}>
                БИК 042202824
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1" sx={{ color: "#555" }}>
                К/с 30101810200000000824
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1" sx={{ color: "#555" }}>
                Р/с 40702810529250005622
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1" sx={{ color: "#555" }}>
                E-mail: Sd2-info@yandex.ru | www.sdmedik.ru
              </Typography>
            </ListItem>
          </List>
        </Box>
      </Container>
    </Box>
  );
}
