import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Container,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useCategoryStore from "../../../store/categoryStore";
import useProductStore from "../../../store/productStore";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { urlPictures } from "../../../constants/constants";
import { toast } from "react-toastify";

export default function CreateProduct() {
  const { fetchCategory, category } = useCategoryStore();
  const { createProduct } = useProductStore();

  // Состояние формы
  const [product, setProduct] = useState({
    article: "",
    category_ids: [],
    characteristic_values: [],
    description: "",
    name: "",
    images: [],
    price: 0,
  });

  const [characteristics, setCharacteristics] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [characteristicValues, setCharacteristicValues] = useState({});
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Допустимые значения для catalogs
  const VALID_CATALOG_IDS = [1, 2];

  // Загрузка категорий
  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

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

  // Обработчик изменения значений характеристик
  const handleValueChange = (id, value) => {
    setCharacteristicValues((prevValues) => ({
      ...prevValues,
      [id]: value,
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
  const handleRemoveImage = (index) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: prevProduct.images.filter((_, i) => i !== index),
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Валидация обязательных полей
    if (!product.name || !product.price || !product.description) {
      toast.error("Заполните все обязательные поля: название, цена, описание");
      setLoading(false);
      return;
    }

    // Формируем characteristic_values
    const formattedCharacteristics = Object.entries(characteristicValues)
      .filter(([id]) => characteristics.some((char) => char.id === Number(id)))
      .map(([id, value]) => {
        const char = characteristics.find((c) => c.id === Number(id));

        return {
          characteristic_id: Number(id),
          value:
            char?.data_type === "bool"
              ? [String(value)]
              : String(value)
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v),
        };
      });

    const productData = {
      name: product.name,
      price: Number(product.price),
      description: product.description,
      article: product.article,
      category_ids: product.category_ids,
      characteristic_values: formattedCharacteristics,
      catalogs: catalogs.filter((id) => VALID_CATALOG_IDS.includes(id)),
    };

    const formData = new FormData();
    formData.append("json", JSON.stringify(productData));
    product.images.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await createProduct(formData);
      toast.success("Продукт успешно создан");
      // Сброс формы после успешного создания
      setProduct({
        article: "",
        category_ids: [],
        characteristic_values: [],
        description: "",
        name: "",
        images: [],
        price: 0,
      });
      setSelectedCategories([]);
      setCharacteristics([]);
      setCharacteristicValues({});
      setCatalogs([]);
    } catch (error) {
      console.error("Ошибка при создании продукта:", error);
      toast.error(
        "Ошибка при создании продукта: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 5, mb: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Создание продукта
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Основная информация */}
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Артикул"
                  value={product.article}
                  onChange={(e) =>
                    setProduct({ ...product, article: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
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
                  type="number"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₽</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Описание"
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              {/* Управление изображениями */}
              <Grid item xs={12}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", mt: 2 }}>
                  {product.images.map((file, index) => (
                    <Box
                      key={index}
                      sx={{ position: "relative", mr: 1, mb: 1 }}
                    >
                      <Avatar
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        sx={{ width: 100, height: 100 }}
                      />
                      <IconButton
                        onClick={() => handleRemoveImage(index)}
                        sx={{ position: "absolute", top: 0, right: 0 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Категории */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Каталоги */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Характеристики */}
              <Grid item xs={12}>
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
                                    characteristicValues[char.id] === "true" ||
                                    characteristicValues[char.id] === true
                                  }
                                  onChange={() =>
                                    handleValueChange(char.id, "true")
                                  }
                                />
                              }
                              label="Да"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={
                                    characteristicValues[char.id] === "false" ||
                                    characteristicValues[char.id] === false
                                  }
                                  onChange={() =>
                                    handleValueChange(char.id, "false")
                                  }
                                />
                              }
                              label="Нет"
                            />
                          </Box>
                        ) : (
                          <TextField
                            label={
                              isSizeCharacteristic
                                ? "Значения размера (через запятую)"
                                : `Значения для ${char.name} (через запятую)`
                            }
                            value={characteristicValues[char.id] || ""}
                            onChange={(e) =>
                              handleValueChange(char.id, e.target.value)
                            }
                            fullWidth
                            margin="normal"
                            inputProps={{
                              inputMode: "text",
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
              </Grid>
            </Grid>

            {/* Кнопки управления */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setProduct({
                    article: "",
                    category_ids: [],
                    characteristic_values: [],
                    description: "",
                    name: "",
                    images: [],
                    price: 0,
                  });
                  setSelectedCategories([]);
                  setCharacteristics([]);
                  setCharacteristicValues({});
                  setCatalogs([]);
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
                {loading ? <CircularProgress size={24} /> : "Создать продукт"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
