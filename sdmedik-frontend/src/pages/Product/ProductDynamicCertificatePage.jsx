import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  CardMedia,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import useProductStore from "../../store/productStore";
import { useParams } from "react-router-dom";
import useBascketStore from "../../store/bascketStore";
import Regions from "../../constants/regionsData/regions";
import { urlPictures } from "../../constants/constants";
import { Helmet } from "react-helmet";

export default function ProductDynamicCertificatePage() {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const { fetchProductById, products } = useProductStore();
  const { addProductThisBascket } = useBascketStore();
  const [quantity, setQuantity] = useState(1);
  const [newRegion, setNewRegion] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const { id } = useParams();

  // Категории, требующие выбора размера
  const SIZE_CATEGORIES = [
    "Кресла-коляски",
    "Специальная одежда",
    "Бандажи, корсеты, отртопедия",
    "Катетеры, функция выделения",
  ];

  // Проверка принадлежности к категориям с размерами
  const isSizeRequired = products.data?.categories?.some((category) =>
    SIZE_CATEGORIES.includes(category.name)
  );

  useEffect(() => {
    const loadProduct = async () => {
      await fetchProductById(id);
      // Инициализация размеров из характеристик
      if (products.data?.characteristic) {
        const sizes = products.data.characteristic
          .filter((c) => c.name.toLowerCase() === "размер")
          .map((c) => c.value);
        setSelectedSize(sizes[0] || ""); // Автовыбор первого размера
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (products.data && products.data.images) {
      const fetchedImages = products.data.images.map(
        (image) => `${urlPictures}/${image.name}`
      );
      setImages(fetchedImages);
    }
  }, [products.data]);

  const handleNextImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setMainImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleAddProductToBasket = async (productId) => {
    if (isSizeRequired && !selectedSize) {
      alert("Пожалуйста, выберите размер");
      return;
    }

    const iso = newRegion?.value;
    const sizeCharacteristic = products.data?.characteristic?.find(
      (c) => c.name.toLowerCase() === "размер"
    );
    const dynamicOptions = isSizeRequired
      ? [
          {
            id: sizeCharacteristic?.id || 0, // Используем id характеристики размера
            value: selectedSize,
          },
        ]
      : [];
    await addProductThisBascket(productId, quantity, iso, dynamicOptions);
  };

  const handleChangeRegion = (event) => {
    const selectedValue = event.target.value;
    const selectedRegion = Regions.find(
      (region) => region.value === selectedValue
    );

    if (selectedRegion) {
      setNewRegion(selectedRegion);
      fetchProductById(id, selectedRegion.value);
    }
  };

  const renderFeatureValue = (value) => {
    if (value === "true") return "Есть";
    if (value === "false") return "Нет";
    if (!value) return "Нет данных";
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
      </Helmet>

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

        {/* Блок с информацией */}
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {products.data?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Артикул: {products.data?.article}
          </Typography>

          {/* Выбор региона */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Выберите регион:
            </Typography>
            <Select
              value={newRegion?.value || "Выберите регион"}
              onChange={handleChangeRegion}
              sx={{ minWidth: 200 }}
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

          {/* Выбор размера */}
          {isSizeRequired && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Выберите размер:
              </Typography>
              <Select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                required
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="" disabled>
                  Выберите размер
                </MenuItem>
                {products.data?.characteristic
                  ?.filter((c) => c.name.toLowerCase() === "размер")
                  .flatMap((size) => size.value)
                  .map((individualSize, index) => (
                    <MenuItem key={index} value={individualSize}>
                      {individualSize}
                    </MenuItem>
                  ))}
              </Select>
            </Box>
          )}

          {/* Цена и кнопки */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ color: "#00B3A4", fontWeight: "bold" }}
            >
              {products.data?.certificate_price
                ? products.data?.certificate_price
                : products.data?.price}{" "}
              ₽
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#00B3A4",
                color: "#FFFFFF",
                "&:hover": { backgroundColor: "#009B8A" },
              }}
              onClick={() => handleAddProductToBasket(products.data.id)}
              disabled={isSizeRequired && !selectedSize}
            >
              В корзину
            </Button>
          </Box>

          {/* Характеристики */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Характеристики:
            </Typography>
            <List>
              {products.data?.characteristic
                ?.filter((c) => c.name.toLowerCase() !== "размер")
                .map((feature, index) => (
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
