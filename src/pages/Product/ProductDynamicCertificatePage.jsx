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
  Tabs,
  Tab,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import React, { useEffect, useState, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import useProductStore from "../../store/productStore";
import { useParams } from "react-router-dom";
import useBascketStore from "../../store/bascketStore";
import Regions from "../../constants/regionsData/regions";
import { urlPictures } from "../../constants/constants";
import { Helmet } from "react-helmet";
import ChatWindow from "../../global/components/ChatWindow";

// Компонент TabPanel для отображения содержимого вкладки
const TabPanel = memo(({ children, value, index, ...other }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    sx={{ mt: 2 }}
    {...other}
  >
    {value === index && <Box>{children}</Box>}
  </Box>
));

export default function ProductDynamicCertificatePage() {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const { fetchProductById, products } = useProductStore();
  const { addProductThisBascket } = useBascketStore();
  const [quantity, setQuantity] = useState(1);
  const [newRegion, setNewRegion] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams();

  // Категории, требующие выбора размера
  const SIZE_CATEGORIES = [
    "Кресла-коляски",
    "Специальная одежда",
    "Бандажи, корсеты, ортопедия",
    "Катетеры, функция выделения",
  ];

  // Проверка принадлежности к категориям с размерами
  const isSizeRequired = products.data?.categories?.some((category) =>
    SIZE_CATEGORIES.includes(category.name)
  );

  // Проверка типа каталога
  const isCatalog1 = products.data?.catalogs === 1;
  const isCatalog2 = products.data?.catalogs === 2;

  useEffect(() => {
    const loadProduct = async () => {
      await fetchProductById(id);
      if (products.data?.characteristic) {
        const sizes = products.data.characteristic
          .filter((c) => c.name.toLowerCase() === "размер")
          .map((c) => c.value);
        setSelectedSize(sizes[0] || "");
      }
    };
    loadProduct();
  }, [id, fetchProductById]);

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

    const iso = isCatalog1 ? null : newRegion?.value;
    const sizeCharacteristic = products.data?.characteristic?.find(
      (c) => c.name.toLowerCase() === "размер"
    );
    const dynamicOptions = isSizeRequired
      ? [
          {
            id: sizeCharacteristic?.id || 0,
            value: selectedSize,
          },
        ]
      : [];
    await addProductThisBascket(productId, quantity, iso, dynamicOptions);
  };

  const handleChangeRegion = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
      setNewRegion(null);
      fetchProductById(id);
      return;
    }
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

  const showAddToCartButton = isCatalog1
    ? products.data?.price !== undefined && products.data?.price !== null
    : newRegion &&
      products.data?.certificate_price !== undefined &&
      products.data?.certificate_price !== null;

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
              alt={`Изображение продукта ${mainImageIndex + 1}`}
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
              aria-label="Предыдущее изображение"
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={handleNextImage}
              sx={{ position: "absolute", right: 0, top: "50%" }}
              aria-label="Следующее изображение"
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
                  alt={`Миниатюра ${index + 1}`}
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
          {/* Выбор региона (отображается только для catalogs:2) */}
          {isCatalog2 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Выберите регион:
              </Typography>
              <Select
                value={newRegion?.value || ""}
                onChange={handleChangeRegion}
                displayEmpty
                sx={{ minWidth: 200 }}
                aria-label="Выбор региона"
              >
                <MenuItem value="">
                  <em>Не выбран</em>
                </MenuItem>
                {Regions.map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
          {/* Выбор размера */}
          {isSizeRequired && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Выберите размер:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
                role="radiogroup"
                aria-label="Выбор размера"
              >
                {products.data?.characteristic
                  ?.filter((c) => c.name.toLowerCase() === "размер")
                  .flatMap((size) => size.value)
                  .map((individualSize, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedSize(individualSize)}
                      sx={{
                        width: "max-content",
                        height: 40,
                        border:
                          selectedSize === individualSize
                            ? "2px solid #00B3A4"
                            : "1px solid #E0E0E0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backgroundColor:
                          selectedSize === individualSize
                            ? "#00B3A4"
                            : "transparent",
                        color:
                          selectedSize === individualSize
                            ? "#FFFFFF"
                            : "text.primary",
                        "&:hover": {
                          borderColor: "#009B8A",
                          backgroundColor:
                            selectedSize === individualSize
                              ? "#009B8A"
                              : "#F5F5F5",
                        },
                        pl: 1,
                        pr: 1,
                      }}
                      role="radio"
                      aria-checked={selectedSize === individualSize}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedSize(individualSize);
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "medium" }}
                      >
                        {individualSize}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
          )}
          {/* Цена и кнопки */}
          <Box sx={{ mb: 2 }}>
            {isCatalog1 && products.data?.price ? (
              <Typography
                variant="h5"
                sx={{ color: "#00B3A4", fontWeight: "bold" }}
              >
                {products.data.price} ₽
              </Typography>
            ) : isCatalog2 && newRegion && products.data?.certificate_price ? (
              <Typography
                variant="h5"
                sx={{ color: "#00B3A4", fontWeight: "bold" }}
              >
                {products.data.certificate_price} ₽
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {isCatalog2
                    ? "Пожалуйста, выберите регион для просмотра цены"
                    : "Уточнить стоимость товара можно у менеджера"}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    color: "#00B3A4",
                    borderColor: "#00B3A4",
                    "&:hover": { borderColor: "#009B8A" },
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                  }}
                  aria-label="Открыть чат поддержки"
                >
                  Открыть чат поддержки
                </Button>
                {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
              </>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {showAddToCartButton && (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#00B3A4",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#009B8A" },
                }}
                onClick={() => handleAddProductToBasket(products.data.id)}
                disabled={isSizeRequired && !selectedSize}
                aria-label="Добавить в корзину"
              >
                В корзину
              </Button>
            )}
          </Box>
          {/* Вкладки */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: "1px solid #E0E0E0",
              "& .MuiTabs-indicator": {
                backgroundColor: "#00B3A4",
              },
            }}
            aria-label="Вкладки описания и характеристик"
          >
            <Tab
              label="Описание"
              sx={{
                color: "#00B3A4",
                "&.Mui-selected": {
                  color: "#00B3A4",
                  fontWeight: "bold",
                },
                "&:hover": {
                  color: "#009B8A",
                },
                textTransform: "none",
                fontSize: "1rem",
              }}
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              label="Характеристики"
              sx={{
                color: "#00B3A4",
                "&.Mui-selected": {
                  color: "#00B3A4",
                  fontWeight: "bold",
                },
                "&:hover": {
                  color: "#009B8A",
                },
                textTransform: "none",
                fontSize: "1rem",
              }}
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <Typography
              sx={{
                wordBreak: "break-all",
                overflowWrap: "break-word",
                whiteSpace: "normal",
                mt: 2,
              }}
            >
              {products.data?.description || "Описание отсутствует"}
            </Typography>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
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
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}
