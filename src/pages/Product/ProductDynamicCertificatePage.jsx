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
  Breadcrumbs,
  Link,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Home,
  Add,
  Remove,
} from "@mui/icons-material";
import React, { useEffect, useState, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import useProductStore from "../../store/productStore";
import { useParams, Link as RouterLink } from "react-router-dom";
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
  const { addProductThisBascket, fetchUserBasket } = useBascketStore();
  const [quantity, setQuantity] = useState(1);
  const [newRegion, setNewRegion] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams();

  // Maximum quantity allowed in cart
  const MAX_QUANTITY = 999;

  // Категории, требующие выбора размера
  const SIZE_CATEGORIES = [
    "Кресла-коляски",
    "Специальная одежда",
    "Бандажи, корсеты, ортопедия",
    "Катетеры, функция выделения",
    "Калоприемники, уроприемники",
    "Подгузники",
    "Трости, костыли",
    "Кресла стулья санитарные",
    "Протезы, ортезы, туторты",
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
          .filter(
            (c) =>
              c.name.toLowerCase() === "размер" ||
              c.name.toLowerCase() === "объем/размер"
          )
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

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= MAX_QUANTITY) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    if (quantity < MAX_QUANTITY) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddProductToBasket = async (productId) => {
    const iso = isCatalog1 ? null : newRegion?.value;
    let dynamicOptions = null;

    // Добавляем dynamicOptions только если размер выбран и требуется
    if (isSizeRequired && selectedSize) {
      const sizeCharacteristic = products.data?.characteristic?.find(
        (c) => c.name.toLowerCase() === "размер"
      );
      dynamicOptions = [
        {
          id: sizeCharacteristic?.id || 0,
          value: selectedSize,
        },
      ];
    }

    await addProductThisBascket(productId, quantity, iso, dynamicOptions);
    fetchUserBasket();
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

  const category = products.data?.categories?.[0];
  const categoryLink = category
    ? `/products/certificate/${category.id}`
    : "/catalog/certificate";
  const categoryName = category ? category.name : "Каталог";

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

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/"
          sx={{ display: "flex", alignItems: "center", color: "#00B3A4" }}
        >
          Главная
        </Link>
        <Link
          sx={{ color: "#00B3A4" }}
          component={RouterLink}
          to="/catalog/certificate"
        >
          Каталог
        </Link>
        <Link
          component={RouterLink}
          to={categoryLink}
          sx={{ color: "#00B3A4" }}
        >
          {categoryName}
        </Link>
        <Typography color="text.primary">
          {products.data?.name || "Товар"}
        </Typography>
      </Breadcrumbs>

      <Paper
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          p: 3,
          gap: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: 2,
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
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": { backgroundColor: "#FFFFFF" },
              }}
              aria-label="Предыдущее изображение"
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": { backgroundColor: "#FFFFFF" },
              }}
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
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#00B3A4",
                    transform: "scale(1.05)",
                  },
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
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: "30px",
              color: "#212121",
            }}
          >
            {products.data?.name}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2, fontSize: "0.9rem" }}
          >
            Артикул: {products.data?.article}
          </Typography>
          {/* Выбор региона (отображается только для catalogs:2) */}
          {isCatalog2 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 1, color: "#212121" }}
              >
                Выберите регион:
              </Typography>
              <Select
                value={newRegion?.value || ""}
                onChange={handleChangeRegion}
                displayEmpty
                sx={{
                  minWidth: 200,
                  borderRadius: 1,
                  border: "1px solid #E0E0E0",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00B3A4",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00B3A4",
                    borderWidth: 2,
                  },
                  backgroundColor: "#FFFFFF",
                  "&:hover": { backgroundColor: "#F5F5F5" },
                }}
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
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 1, color: "#212121" }}
              >
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
                        transition: "all 0.2s ease",
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
                    borderRadius: 1,
                    padding: "8px 16px",
                    "&:hover": {
                      borderColor: "#009B8A",
                      backgroundColor: "#E0F7FA",
                    },
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
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    onClick={handleDecrement}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "#009B8A",
                        color: "#FFFFFF",
                      },
                    }}
                    disabled={quantity <= 1}
                    aria-label="Уменьшить количество"
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <TextField
                    value={quantity}
                    on
                    Ascending
                    onChange={handleQuantityChange}
                    inputProps={{
                      min: 1,
                      max: MAX_QUANTITY,
                      step: 1,
                      style: { textAlign: "center" },
                    }}
                    sx={{
                      width: 50,
                      "& .MuiInputBase-root": {
                        borderRadius: 1,
                        backgroundColor: "#F5F5F5",
                      },
                      "& input": {
                        fontWeight: "medium",
                        padding: "8px 0",
                      },
                    }}
                    size="small"
                    aria-label="Количество товара"
                  />
                  <IconButton
                    onClick={handleIncrement}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "#009B8A",
                        color: "#FFFFFF",
                      },
                    }}
                    disabled={quantity >= MAX_QUANTITY}
                    aria-label="Увеличить количество"
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#00B3A4",
                    color: "#FFFFFF",
                    borderRadius: 1,
                    padding: "10px 24px",
                    fontWeight: "medium",
                    "&:hover": {
                      backgroundColor: "#009B8A",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    },
                  }}
                  onClick={() => handleAddProductToBasket(products.data.id)}
                  aria-label="Добавить в корзину"
                >
                  Добавить в корзину
                </Button>
              </>
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
                padding: "12px 24px",
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
                padding: "12px 24px",
              }}
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mt: 2 }}>
              {products.data?.description ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: products.data.description,
                  }}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: 1.5,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    color: "#424242",
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ color: "#424242" }}>
                  Описание отсутствует
                </Typography>
              )}
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Box
              sx={{
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
                p: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <List sx={{ p: 0 }}>
                {products.data?.characteristic
                  ?.filter((c) => c.name.toLowerCase() !== "размер")
                  .map((feature, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        py: 1,
                        px: 2,
                        borderBottom:
                          index <
                          (products.data?.characteristic?.filter(
                            (c) => c.name.toLowerCase() !== "размер"
                          )?.length || 0) -
                            1
                            ? "1px solid #E0E0E0"
                            : "none",
                        "&:hover": {
                          backgroundColor: "#ECEFF1",
                          borderRadius: 1,
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "medium",
                            color: "#212121",
                            fontSize: "0.95rem",
                          }}
                        >
                          {feature.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#424242",
                            fontSize: "0.95rem",
                            fontWeight: "normal",
                          }}
                        >
                          {renderFeatureValue(feature.value)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}
