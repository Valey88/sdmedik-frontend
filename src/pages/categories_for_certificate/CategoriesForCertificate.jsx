import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect } from "react";
import useCategoryStore from "../../store/categoryStore";
import { urlPictures } from "../../constants/constants";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

export default function CategoriesPage() {
  const { fetchCategory, category } = useCategoryStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return (
    <Box sx={{ mt: 5, mb: 5 }}>
      <Helmet>
        <title>Категории товаров | Sdmedik.ru</title>
        <meta
          name="description"
          content="Ознакомьтесь с нашими категориями товаров. Мы предлагаем широкий ассортимент продукции для ваших нужд."
        />
        <meta
          name="keywords"
          content="категории, товары, ассортимент, продукция"
        />
      </Helmet>
      <Container>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Категории товаров
        </Typography>
        <Grid
          container
          spacing={{ xs: 1, md: 3, lg: 3 }}
          columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
        >
          {Array.isArray(category.data) && category.data.length > 0 ? (
            category.data.map((item) => (
              <Grid item xs={1} sm={1} md={1} lg={1} key={item.id}>
                <Link to={`/products/certificate/${item.id}`}>
                  <Card
                    sx={{
                      width: { xs: "340px", md: "221px" },
                      height: "336px", // Фиксированная высота карточки
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      p: { xs: 0.5, md: 2 },
                    }}
                    // onClick={() => {
                    //   navigate(`/products/certificate/${item.id}`);
                    // }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        borderRadius: "12px",
                        height: "200px",
                      }}
                    >
                      <img
                        src={`${urlPictures}/${item.images[0].name}`}
                        alt={`Изображение категории ${item.name}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <CardContent
                      sx={{
                        textAlign: "center",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1, // Занимает всё доступное пространство
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: isMobile ? "1rem" : "1.1rem",
                          mt: "auto", // Прижимает текст к нижней части CardContent
                        }}
                      >
                        {item.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))
          ) : (
            <Typography variant="h6">Нет данных</Typography>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
