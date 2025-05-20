import { Box, Container, Link, Typography } from "@mui/material";
import React from "react";

const menuItems = [
  { text: "Доставка", href: "/delivery" },
  { text: "Реквизиты", href: "/deteils" },
  { text: "Возврат", href: "/returnpolicy" },
  { text: "О нас", href: "/about" },
  { text: "Контакты", href: "/contacts" },
];

const addresses = [
  {
    text: "г. Оренбург, ул. Шевченко д. 20 «В» Магазин - Склад",
    phone: "+ 7 3532 93-52-41",
  },
  {
    text: "г. Орск, проспект Мира. 15 «Д», ТД Яшма, магазин «Памперсы»",
    phone: "+7 905 896-23-23",
  },
  {
    text: "г. Уфа, ул. Степана Кувыкина, 41, Магазин-Склад",
    phone: "+7 961 366-82-46",
  },
  {
    text: "г. Екатеринбург, пр-т. Ленина 79 «Б», Центр обучения и обеспечения техническими средствами реабилитации",
    phone: "+7 903 086-34-11",
  },
  {
    text: "респ. Чечня, г. Гудермес, ул. Нагорная, 2",
    phone: "+7 928 002-34-19",
  },
  {
    text: "респ. Чечня, г. Грозный, ул. Маты Кишиева, 142",
    phone: "+7 928 002-34-19",
  },
  // {
  //   text: "г. Нижний Новгород, ул Дежнëва, 2",
  //   phone: "+7 960 181-03-50",
  // },
];

export default function Footer() {
  return (
    <Box sx={{ background: "#E7FFFC" }}>
      <Container
        sx={{
          pt: 6,
          pb: 6,
          display: "flex",
          flexDirection: { xs: "column", md: "column", lg: "unset" },
          gridGap: "5%",
        }}
      >
        <Box sx={{ width: { xs: "100%", lg: "100%" } }}>
          <Box>
            <Link href="/">
              <img src="/medi_logo2.png" alt="" />
            </Link>
            <Box
              sx={{
                display: "flex",
                justifyContent: {
                  xs: "center",
                  md: "center",
                  lg: "space-between",
                },
                flexDirection: { xs: "column", md: "column", lg: "unset" },
                mt: 2,
                gridGap: { xs: "20px", lg: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "unset" },
                  justifyContent: "center",
                  alignItems: "center",
                  gridGap: "20px",
                }}
              >
                {menuItems.map((item, index) => (
                  <Link
                    key={index} // Use index or a unique identifier if available
                    sx={{ fontSize: "20px" }}
                    underline="none"
                    color="black"
                    href={item.href}
                  >
                    {item.text}
                  </Link>
                ))}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gridGap: 20,
                  flexDirection: { xs: "column", md: "unset" },
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">+7 (903) 086 3091</Typography>
                <Typography variant="h6">+7 (353) 293 5241</Typography>
                {/* <Link sx={{ mt: 6 }} variant="h6" color="primary" href="/">
                  olimp1-info@yandex.ru
                </Link> */}
              </Box>
            </Box>
          </Box>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
            width: { xs: "100%", lg: "50%" },
            flexDirection: "column",
            mt: { xs: 3, lg: 0 },
          }}
        >
          <Typography variant="h4">Адреса магазина</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gridGap: "25px",
              mt: 3,
            }}
          >
            {addresses.map((address, index) => (
              <Box key={index} sx={{ width: "250px" }}>
                <Typography variant="h6">{address.text}</Typography>
                <Typography variant="h6" color="text.secondary">
                  {address.phone}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box> */}
      </Container>
      <Box
        sx={{
          background: `linear-gradient(270.06deg, #66D1C6 -78.07%, #B2EBE0 94.73%)`,
          height: "60px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography color="#6E8CA9" variant="body">
            ©️ 2024 ООО “Sdmedik”. Все права защищены.
          </Typography>
          <Typography color="#6E8CA9" variant="body">
            Политика кондефициальных данных
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
