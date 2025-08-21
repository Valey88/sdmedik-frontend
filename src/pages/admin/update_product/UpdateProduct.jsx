import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Delete as DeleteIcon } from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useCategoryStore from "../../../store/categoryStore";
import useProductStore from "../../../store/productStore";
import { useParams } from "react-router-dom";
import { urlPictures } from "../../../constants/constants";
import { toast } from "react-toastify";

export default function UpdateProduct() {
  const { fetchCategory, category } = useCategoryStore();
  const { updateProduct, fetchProductById, products } = useProductStore();
  const { id } = useParams();

  // Состояние формы
  const [product, setProduct] = useState({
    article: "",
    category_ids: [],
    characteristic_values: [],
    description: "",
    name: "",
    images: [],
    price: 0,
    del_images: [],
    tru: "",
  });
  const [originalCharacteristics, setOriginalCharacteristics] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [characteristicValues, setCharacteristicValues] = useState({});
  const [catalogs, setCatalogs] = useState([]);
  const [delImages, setDelImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isElectronicCertificate, setIsElectronicCertificate] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [isNameplate, setIsNameplate] = useState(false);
  const [nameplateText, setNameplateText] = useState("");

  const VALID_CATALOG_IDS = [1, 2];

  // Загрузка категорий и данных продукта
  useEffect(() => {
    setIsFetching(true);
    fetchCategory();
    fetchProductById(id)
      .then(() => setIsFetching(false))
      .catch((error) => {
        console.error("Ошибка загрузки продукта:", error);
        toast.error("Не удалось загрузить данные продукта");
        setIsFetching(false);
      });
  }, [id, fetchCategory, fetchProductById]);

  // Инициализация формы данными из products.data
  useEffect(() => {
    if (products.data && !isFetching) {
      setProduct({
        article: products.data.article || "",
        category_ids: products.data.categories?.map((cat) => cat.id) || [],
        characteristic_values: products.data.characteristic || [],
        description: products.data.description || "",
        name: products.data.name || "",
        images: products.data.images || [],
        price: products.data.price || 0,
        del_images: [],
        tru: products.data.tru || "",
        catalogs: products.data.tru || "",
      });

      setSelectedCategories(
        products.data.categories?.map((cat) => cat.id) || []
      );

      const catalogValue = products.data.catalogs;
      const initialCatalogs =
        catalogValue && VALID_CATALOG_IDS.includes(catalogValue)
          ? [catalogValue]
          : [];
      setCatalogs(initialCatalogs);

      const initialCharValues = {};
      products.data.characteristic?.forEach((char) => {
        const isSizeCharacteristic = char.name.toLowerCase() === "размер";
        initialCharValues[char.id] = {
          value: Array.isArray(char.value)
            ? char.value.join(", ")
            : String(char.value),
          prices: isSizeCharacteristic ? char.prices || [] : [],
        };
      });
      setCharacteristicValues(initialCharValues);
      setOriginalCharacteristics(products.data.characteristic || []);

      const selectedCats = products.data.categories?.map((cat) => cat.id) || [];
      const allCharacteristics = category.data
        ?.filter((cat) => selectedCats.includes(cat.id))
        .flatMap((cat) => cat.characteristic || []);
      setCharacteristics([...new Set(allCharacteristics)] || []);

      const hasPreview =
        products.data.preview && products.data.preview.trim() !== "";
      setIsElectronicCertificate(hasPreview);
      setPreviewText(hasPreview ? products.data.preview : "");

      const hasNameplate =
        products.data.nameplate && products.data.nameplate.trim() !== "";
      setIsNameplate(hasNameplate);
      setNameplateText(hasNameplate ? products.data.nameplate : "");
    }
  }, [products.data, isFetching, category.data]);

  // Обработчик изменения каталогов
  const handleCatalogChange = (event) => {
    const { value, checked } = event.target;
    const catalogId = Number(value);

    if (!VALID_CATALOG_IDS.includes(catalogId)) {
      console.warn(`Недопустимое значение catalogId: ${catalogId}`);
      toast.error(`Недопустимый каталог: ${catalogId}`);
      return;
    }

    setCatalogs((prevCatalogs) => {
      let updatedCatalogs = [...prevCatalogs];
      if (checked) {
        if (!updatedCatalogs.includes(catalogId)) {
          updatedCatalogs.push(catalogId);
        }
      } else {
        updatedCatalogs = updatedCatalogs.filter((log) => log !== catalogId);
      }
      updatedCatalogs = updatedCatalogs.filter((id) =>
        VALID_CATALOG_IDS.includes(id)
      );
      return updatedCatalogs;
    });
  };

  // Обработчик изменения чекбокса "Электронный сертификат"
  const handleElectronicCertificateChange = (event) => {
    setIsElectronicCertificate(event.target.checked);
    if (!event.target.checked) {
      setPreviewText("");
    }
  };

  // Обработчик изменения текста в поле preview
  const handlePreviewTextChange = (event) => {
    setPreviewText(event.target.value);
  };

  // Обработчик изменения чекбокса "Nameplate"
  const handleNameplateChange = (event) => {
    setIsNameplate(event.target.checked);
    if (!event.target.checked) {
      setNameplateText("");
    }
  };

  // Обработчик изменения текста в поле nameplate
  const handleNameplateTextChange = (event) => {
    setNameplateText(event.target.value);
  };

  // Обработчик изменения категорий
  const handleCheckboxChange = (id) => {
    setSelectedCategories((prevSelected) => {
      const isSelected = prevSelected.includes(id);
      const newSelected = isSelected
        ? prevSelected.filter((categoryId) => categoryId !== id)
        : [...prevSelected, id];

      setProduct((prevProduct) => ({
        ...prevProduct,
        category_ids: newSelected,
      }));

      const selected = category.data.find((item) => item.id === id);
      if (selected) {
        setCharacteristics((prevCharacteristics) => {
          const newCharacteristics = selected.characteristic || [];
          if (isSelected) {
            return prevCharacteristics.filter(
              (char) =>
                !newCharacteristics.some((newChar) => newChar.id === char.id)
            );
          } else {
            return [
              ...new Set([...prevCharacteristics, ...newCharacteristics]),
            ];
          }
        });
      }

      return newSelected;
    });
  };

  // Обработчик изменения значений характеристик и цен
  const handleValueChange = (id, field, value) => {
    setCharacteristicValues((prevValues) => ({
      ...prevValues,
      [id]: {
        ...prevValues[id],
        [field]:
          field === "value"
            ? value
            : value
                .split(",")
                .map(Number)
                .filter((v) => !isNaN(v)),
      },
    }));
  };

  // Обработчик изменения описания
  const handleDescriptionChange = (value) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      description: value,
    }));
  };

  // Обработчик загрузки файлов
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: [...prevProduct.images, ...files],
    }));
  };

  // Обработчик удаления изображений
  const handleRemoveImage = (image) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: prevProduct.images.filter((img) => img !== image),
      del_images: [
        ...prevProduct.del_images,
        { id: image.id, name: image.name },
      ],
    }));
    setDelImages((prevDelImages) => ({
      ...prevDelImages,
      [image.id]: true,
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!product.name || !product.price || !product.description) {
      toast.error("Заполните все обязательные поля: название, цена, описание");
      setLoading(false);
      return;
    }

    const formattedCharacteristics = Object.entries(characteristicValues)
      .filter(([id]) => characteristics.some((char) => char.id === Number(id)))
      .map(([id, data]) => {
        const originalChar = originalCharacteristics.find(
          (c) => c.id === Number(id)
        );
        const char = characteristics.find((c) => c.id === Number(id));

        const originalValue = Array.isArray(originalChar?.value)
          ? originalChar.value.join(", ")
          : String(originalChar?.value);
        const isSizeCharacteristic = char?.name.toLowerCase() === "размер";

        const values =
          char?.data_type === "bool"
            ? [String(data.value)]
            : String(data.value)
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v);

        const result = {
          characteristic_id: Number(id),
          value: values,
        };

        if (isSizeCharacteristic) {
          const prices = values.map((_, index) =>
            data.prices && data.prices[index] !== undefined
              ? data.prices[index]
              : 0
          );
          result.prices = prices;
        }

        return result;
      });

    const productData = {
      name: product.name,
      price: Number(product.price),
      description: product.description,
      category_ids: product.category_ids,
      characteristic_values: formattedCharacteristics,
      catalogs: catalogs.filter((id) => VALID_CATALOG_IDS.includes(id)),
      del_images: product.del_images,
      tru: product.tru,
      preview: isElectronicCertificate ? previewText : "",
      nameplate: isNameplate ? nameplateText : "",
    };

    const formData = new FormData();
    formData.append("json", JSON.stringify(productData));
    product.images.forEach((file) => {
      if (file instanceof File) {
        formData.append("files", file);
      }
    });

    try {
      await updateProduct(id, formData);
      toast.success("Продукт успешно обновлен");
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      toast.error(
        "Ошибка при обновлении продукта: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 5, mb: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Редактирование продукта
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gridGap: 20 }}>
              {/* Основная информация */}
              <Box>
                <TextField
                  label="Название"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                  required
                />
              </Box>
              <Box>
                <TextField
                  label="Артикул"
                  value={product.article}
                  onChange={(e) =>
                    setProduct({ ...product, article: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  label="ТРУ код"
                  value={product.tru}
                  onChange={(e) =>
                    setProduct({ ...product, tru: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                  placeholder="Введите 30 цифр"
                  inputProps={{
                    maxLength: 30,
                  }}
                />
              </Box>
              <Box>
                <TextField
                  label="Цена"
                  value={product.price}
                  onChange={(e) => {
                    const priceValue = parseFloat(e.target.value);
                    setProduct({
                      ...product,
                      price: isNaN(priceValue) ? 0 : priceValue,
                    });
                  }}
                  fullWidth
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₽</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Описание
                </Typography>
                <ReactQuill
                  value={product.description}
                  onChange={handleDescriptionChange}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "list",
                    "bullet",
                  ]}
                  style={{ height: "200px", marginBottom: "40px" }}
                />
              </Box>

              {/* Управление изображениями */}
              <Box>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", mt: 2 }}>
                  {product.images.map((image, index) => (
                    <Box
                      key={image.id || index}
                      sx={{ position: "relative", mr: 1, mb: 1 }}
                    >
                      <Avatar
                        src={
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : `${urlPictures}/${image.name}`
                        }
                        alt="preview"
                        sx={{
                          width: 100,
                          height: 100,
                          position: "relative",
                          opacity: delImages[image.id] ? 0.5 : 1,
                          "&::before": delImages[image.id]
                            ? {
                                content: '""',
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                right: 0,
                                height: "2px",
                                backgroundColor: "red",
                                transform: "rotate(-45deg)",
                              }
                            : null,
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveImage(image)}
                        sx={{ position: "absolute", top: 0, right: 0 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Категории */}
              <Box>
                <Typography variant="h6">Категории</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {Array.isArray(category.data) && category.data.length > 0 ? (
                    category.data.map((item) => (
                      <FormControlLabel
                        key={item.id}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
                          />
                        }
                        label={item.name}
                      />
                    ))
                  ) : (
                    <p>Данных нет</p>
                  )}
                </Box>
              </Box>

              {/* Каталоги */}
              <Box>
                <Typography variant="h6">Каталоги</Typography>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={1}
                        checked={catalogs.includes(1)}
                        onChange={handleCatalogChange}
                      />
                    }
                    label="Каталог"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={2}
                        checked={catalogs.includes(2)}
                        onChange={handleCatalogChange}
                      />
                    }
                    label="Каталог по электронному сертификату"
                  />
                </Box>
              </Box>

              {/* Preview */}
              <Box>
                <Typography variant="h6">Шильд</Typography>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isElectronicCertificate}
                        onChange={handleElectronicCertificateChange}
                      />
                    }
                    label="Шильд для карточки товара"
                  />
                  {isElectronicCertificate && (
                    <TextField
                      label="Текст для шильда"
                      value={previewText}
                      onChange={handlePreviewTextChange}
                      fullWidth
                      margin="normal"
                      placeholder="Введите текст"
                    />
                  )}
                </Box>
              </Box>

              {/* Nameplate */}
              <Box>
                <Typography variant="h6">Nameplate</Typography>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isNameplate}
                        onChange={handleNameplateChange}
                      />
                    }
                    label="Nameplate для карточки товара"
                  />
                  {isNameplate && (
                    <TextField
                      label="Текст для превью"
                      value={nameplateText}
                      onChange={handleNameplateTextChange}
                      fullWidth
                      margin="normal"
                      placeholder="Введите текст для превью"
                    />
                  )}
                </Box>
              </Box>

              {/* Характеристики */}
              <Box>
                <Typography variant="h6">Характеристики</Typography>
                {Array.isArray(characteristics) &&
                  characteristics.map((char) => {
                    const isSizeCharacteristic =
                      char.name.toLowerCase() === "размер";

                    return (
                      <Box key={char.id} sx={{ mb: 2 }}>
                        <Typography>{char.name}:</Typography>
                        {char.data_type === "bool" ? (
                          <Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={
                                    characteristicValues[char.id]?.value ===
                                      "true" ||
                                    characteristicValues[char.id]?.value ===
                                      true
                                  }
                                  onChange={() =>
                                    handleValueChange(char.id, "value", "true")
                                  }
                                />
                              }
                              label="Да"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={
                                    characteristicValues[char.id]?.value ===
                                      "false" ||
                                    characteristicValues[char.id]?.value ===
                                      false
                                  }
                                  onChange={() =>
                                    handleValueChange(char.id, "value", "false")
                                  }
                                />
                              }
                              label="Нет"
                            />
                          </Box>
                        ) : (
                          <>
                            <TextField
                              label={
                                isSizeCharacteristic
                                  ? "Значения размера (через запятую, например: XL,S,L)"
                                  : `Значения для ${char.name} (через запятую)`
                              }
                              value={characteristicValues[char.id]?.value || ""}
                              onChange={(e) =>
                                handleValueChange(
                                  char.id,
                                  "value",
                                  e.target.value
                                )
                              }
                              fullWidth
                              margin="normal"
                              inputProps={{
                                inputMode: "text",
                              }}
                            />
                            {isSizeCharacteristic && (
                              <TextField
                                label="Цены для размеров (через запятую, например: 300,200,100)"
                                value={
                                  characteristicValues[char.id]?.prices?.join(
                                    ", "
                                  ) || ""
                                }
                                onChange={(e) =>
                                  handleValueChange(
                                    char.id,
                                    "prices",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                margin="normal"
                                inputProps={{
                                  inputMode: "numeric",
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      ₽
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            )}
                          </>
                        )}
                      </Box>
                    );
                  })}
              </Box>
            </Box>

            {/* Кнопки управления */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setProduct({
                    article: products.data?.article || "",
                    category_ids:
                      products.data?.categories?.map((cat) => cat.id) || [],
                    characteristic_values: products.data?.characteristic || [],
                    description: products.data?.description || "",
                    name: products.data?.name || "",
                    images: products.data?.images || [],
                    price: products.data?.price || 0,
                    del_images: [],
                    tru: products.data?.tru || "",
                  });
                  setSelectedCategories(
                    products.data?.categories?.map((cat) => cat.id) || []
                  );
                  const catalogValue = products.data?.catalogs;
                  setCatalogs(
                    catalogValue && VALID_CATALOG_IDS.includes(catalogValue)
                      ? [catalogValue]
                      : []
                  );
                  const initialCharValues = {};
                  products.data?.characteristic?.forEach((char) => {
                    const isSizeCharacteristic =
                      char.name.toLowerCase() === "размер";
                    initialCharValues[char.id] = {
                      value: Array.isArray(char.value)
                        ? char.value.join(", ")
                        : String(char.value),
                      prices: isSizeCharacteristic ? char.prices || [] : [],
                    };
                  });
                  setCharacteristicValues(initialCharValues);
                  setOriginalCharacteristics(
                    products.data?.characteristic || []
                  );
                  setDelImages({});
                  const hasPreview =
                    products.data?.preview &&
                    products.data?.preview.trim() !== "";
                  setIsElectronicCertificate(hasPreview);
                  setPreviewText(hasPreview ? products.data?.preview : "");
                  const hasNameplate =
                    products.data?.nameplate &&
                    products.data?.nameplate.trim() !== "";
                  setIsNameplate(hasNameplate);
                  setNameplateText(
                    hasNameplate ? products.data?.nameplate : ""
                  );
                }}
              >
                Сбросить
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
