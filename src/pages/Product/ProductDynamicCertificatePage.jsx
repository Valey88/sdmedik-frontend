import { Box, Container, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import useProductStore from "../../store/productStore";
import useBascketStore from "../../store/bascketStore";
import { useParams } from "react-router-dom";
import { urlPictures } from "../../constants/constants";
import ProductBreadcrumbs from "../../global/components/ProductBreadcrumbs";
import ImageGallery from "../../global/components/ImageGallery";
import ImageZoomDialog from "../../global/components/ImageZoomDialog";
import RegionSelector from "../../global/components/RegionSelector";
import CharacteristicSelector from "../../global/components/CharacteristicSelector";
import PriceAndCartActions from "../../global/components/PriceAndCartActions";
import ProductTabs from "../../global/components/ProductTabs";

export default function ProductDynamicCertificatePage() {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [newRegion, setNewRegion] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedHeight, setSelectedHeight] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(0);
  const { id } = useParams();
  const { fetchProductById, products } = useProductStore();
  const { addProductThisBascket, fetchUserBasket } = useBascketStore();

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
          .flatMap((c) => c.value);
        setSelectedSize(sizes[0] || "");

        const colors = products.data.characteristic
          .filter((c) => c.name.toLowerCase() === "цвет")
          .flatMap((c) => c.value);
        setSelectedColor(colors[0] || "");

        const heights = products.data.characteristic
          .filter((c) => c.name.toLowerCase() === "рост")
          .flatMap((c) => c.value);
        setSelectedHeight(heights[0] || "");
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

  const handleAddProductToBasket = async (productId) => {
    const iso = isCatalog1 ? null : newRegion?.value;
    const dynamicOptions = [];

    if (
      products.data?.characteristic?.some(
        (c) =>
          c.name.toLowerCase() === "размер" ||
          c.name.toLowerCase() === "объем/размер"
      ) &&
      selectedSize
    ) {
      const sizeCharacteristic = products.data?.characteristic?.find(
        (c) =>
          c.name.toLowerCase() === "размер" ||
          c.name.toLowerCase() === "объем/размер"
      );
      dynamicOptions.push({
        id: sizeCharacteristic?.id || 0,
        value: selectedSize,
      });
    }

    if (
      products.data?.characteristic?.some(
        (c) => c.name.toLowerCase() === "цвет"
      ) &&
      selectedColor
    ) {
      const colorCharacteristic = products.data?.characteristic?.find(
        (c) => c.name.toLowerCase() === "цвет"
      );
      dynamicOptions.push({
        id: colorCharacteristic?.id || 0,
        value: selectedColor,
      });
    }

    if (
      products.data?.characteristic?.some(
        (c) => c.name.toLowerCase() === "рост"
      ) &&
      selectedHeight
    ) {
      const heightCharacteristic = products.data?.characteristic?.find(
        (c) => c.name.toLowerCase() === "рост"
      );
      dynamicOptions.push({
        id: heightCharacteristic?.id || 0,
        value: selectedHeight,
      });
    }

    await addProductThisBascket(
      productId,
      quantity,
      iso,
      dynamicOptions.length > 0 ? dynamicOptions : null
    );
    fetchUserBasket();
  };

  const handleImageClick = () => {
    setZoomedImageIndex(mainImageIndex);
    setZoomOpen(true);
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

      <ProductBreadcrumbs product={products.data} />

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
        <ImageGallery
          images={images}
          mainImageIndex={mainImageIndex}
          setMainImageIndex={setMainImageIndex}
          onImageClick={handleImageClick}
        />

        <ImageZoomDialog
          open={zoomOpen}
          onClose={() => setZoomOpen(false)}
          images={images}
          zoomedImageIndex={zoomedImageIndex}
          setZoomedImageIndex={setZoomedImageIndex}
        />

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

          {isCatalog2 && (
            <RegionSelector
              newRegion={newRegion}
              setNewRegion={setNewRegion}
              fetchProductById={fetchProductById}
              productId={id}
            />
          )}

          <CharacteristicSelector
            label="Выберите размер"
            characteristicName="размер"
            characteristics={products.data?.characteristic}
            selectedValue={selectedSize}
            setSelectedValue={setSelectedSize}
          />

          <CharacteristicSelector
            label="Выберите цвет"
            characteristicName="цвет"
            characteristics={products.data?.characteristic}
            selectedValue={selectedColor}
            setSelectedValue={setSelectedColor}
          />

          <CharacteristicSelector
            label="Выберите рост"
            characteristicName="рост"
            characteristics={products.data?.characteristic}
            selectedValue={selectedHeight}
            setSelectedValue={setSelectedHeight}
          />

          <PriceAndCartActions
            product={products.data}
            isCatalog1={isCatalog1}
            isCatalog2={isCatalog2}
            newRegion={newRegion}
            addProductToBasket={handleAddProductToBasket}
            quantity={quantity}
            setQuantity={setQuantity}
          />

          <ProductTabs
            product={products.data}
            tabValue={tabValue}
            setTabValue={setTabValue}
          />
        </Box>
      </Paper>
    </Container>
  );
}
