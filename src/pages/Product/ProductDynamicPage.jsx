import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  CardMedia,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import useProductStore from "../../store/productStore";
import { useNavigate, useParams } from "react-router-dom";
import useBascketStore from "../../store/bascketStore";
import Regions from "../../constants/regionsData/regions";
import { urlPictures } from "../../constants/constants";
import { Helmet } from "react-helmet";

export default function ProductDetailPage() {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const { fetchProductById, products } = useProductStore();
  const { addProductThisBascket } = useBascketStore();
  const [quantity, setQuantity] = useState(1);
  const [newRegion, setNewRegion] = useState(null); // Изначально регион не выбран
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductById(id);
  }, [id]);

  // Обновление изображений при изменении данных о продукте
  useEffect(() => {
    if (products.data && products.data.images) {
      const fetchedImages = products.data.images.map(
        (image) => `${urlPictures}/${image.name}`
      );
      setImages(fetchedImages);
    }
  }, [products.data]);

  // Обработчик изменения региона через Select
  const handleChangeRegion = (event) => {
    const selectedValue = event.target.value; // Получаем значение региона (например, "RU-MOS")
    const selectedRegion = Regions.find(
      (region) => region.value === selectedValue
    );

    if (selectedRegion) {
      setNewRegion(selectedRegion); // Обновляем состояние региона
      // Автоматически отправляем запрос на сервер с новым регионом
      fetchProductById(id, selectedRegion.value);
    }
  };

  // Остальные функции (handleNextImage, handlePrevImage, handleAddProductToBasket и т.д.)
  const handleNextImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setMainImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleAddProductToBasket = async (id) => {
    await addProductThisBascket(id, quantity);
  };

  const renderFeatureValue = (value) => {
    if (value === "true") {
      return "Есть";
    } else if (value === "false") {
      return "Нет";
    } else if (value === null || value === undefined || value === "") {
      return "Нет данных";
    }
    return value;
  };

  return (
    <Container sx={{ mt: 5, mb: 5 }}>
      <Helmet>
        <title>{products.data ? products.data.name : "Загрузка..."}</title>
        <meta
          name="description"
          content={
            products.data ? products.data.description : "Описание товара"
          }
        />
        <meta
          name="keywords"
          content={
            products.data
              ? `${products.data.name}, ${products.data.article}, купить ${products.data.name}`
              : "товар, артикул"
          }
        />
        <meta
          property="og:title"
          content={products.data ? products.data.name : "Загрузка..."}
        />
        <meta
          property="og:description"
          content={
            products.data ? products.data.description : "Описание товара"
          }
        />
        <meta property="og:image" content={images[mainImageIndex]} />
        <meta
          property="og:url"
          content={`https://yourwebsite.com/products/${id}`}
        />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Your Website Name" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={products.data ? products.data.name : "Загрузка..."}
        />
        <meta
          name="twitter:description"
          content={
            products.data ? products.data.description : "Описание товара"
          }
        />
        <meta name="twitter:image" content={images[mainImageIndex]} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: products.data ? products.data.name : "Загрузка...",
            image: images[mainImageIndex],
            description: products.data
              ? products.data.description
              : "Описание товара",
            sku: products.data ? products.data.article : "Неизвестно",
            offers: {
              "@type": "Offer",
              url: `https://yourwebsite.com/products/${id}`,
              priceCurrency: "RUB",
              price: products.data ? products.data.price : "0",
              itemCondition: "https://schema.org/NewCondition",
              availability: "https://schema.org/InStock",
            },
          })}
        </script>
      </Helmet>

      {/* Основной блок с изображением и информацией */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          p: 3,
          gap: 3,
        }}
      >
        {/* Блок с изображениями */}
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              image={images[mainImageIndex]}
              alt={`Product Image ${mainImageIndex + 1}`}
              sx={{
                width: { xs: "100%", md: "400px" },
                height: { xs: "300px", md: "400px" },
                borderRadius: 2,
                objectFit: "contain",
              }}
            />
            <IconButton
              onClick={handlePrevImage}
              sx={{ position: "absolute", left: 0, top: "50%" }}
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={handleNextImage}
              sx={{ position: "absolute", right: 0, top: "50%" }}
            >
              <ArrowForward />
            </IconButton>
          </Box>

          {/* Миниатюры */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                onClick={() => setMainImageIndex(index)}
                sx={{
                  border:
                    mainImageIndex === index
                      ? "2px solid #00B3A4"
                      : "1px solid #E0E0E0",
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  width: "60px",
                  height: "60px",
                }}
              >
                <CardMedia
                  component="img"
                  image={image}
                  alt={`Thumbnail ${index + 1}`}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Блок с информацией о товаре */}
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {products.data?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Артикул: {products.data?.article}
          </Typography>

          {/* Цена */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ color: "#00B3A4", fontWeight: "bold" }}
            >
              {products.data?.price} ₽
            </Typography>
          </Box>

          {/* Кнопки покупки */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#00B3A4",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#009B8A",
                },
              }}
              onClick={() => handleAddProductToBasket(products.data.id)}
            >
              В корзину
            </Button>
            <Button
              variant="outlined"
              sx={{
                border: "2px solid #00B3A4",
                color: "#00B3A4",
              }}
              onClick={() => navigate(`/paymants/${products.data.id}`)}
            >
              Купить в 1 клик
            </Button>
          </Box>

          {/* Выбор региона */}
          <Box sx={{ mb: 3 }}>
            <Select
              value={newRegion ? newRegion.value : "Выберите регион"} // Используем newRegion.value, если регион выбран
              onChange={handleChangeRegion}
              sx={{ minWidth: 200, mr: 2 }}
            >
              <MenuItem value="Выберите регион">
                <em>Выберите регион</em>
              </MenuItem>
              {Regions.map((region) => (
                <MenuItem key={region.value} value={region.value}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Характеристики */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Характеристики:
            </Typography>
            <List>
              {products.data?.characteristic?.map((feature, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <Typography>
                    <strong>{feature.name}:</strong>{" "}
                    {renderFeatureValue(feature.value)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Paper>

      {/* Описание товара */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Описание товара:
        </Typography>
        <Typography>{products.data?.description}</Typography>
      </Paper>
    </Container>
  );
}
