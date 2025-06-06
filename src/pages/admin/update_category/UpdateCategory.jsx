import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useCategoryStore from "../../../store/categoryStore";

export default function UpdateCategory() {
  const { id } = useParams();
  const { fetchCategoryId, updateCategory, categoryId } = useCategoryStore();
  const [category, setCategory] = useState({
    name: "",
    characteristics: [],
  });
  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Загрузка данных категории
  useEffect(() => {
    if (id) {
      setIsFetching(true);
      fetchCategoryId(id)
        .then(() => {
          setIsFetching(false);
        })
        .catch((error) => {
          console.error("Ошибка загрузки категории:", error);
          toast.error("Не удалось загрузить данные категории");
          setIsFetching(false);
        });
    }
  }, [id, fetchCategoryId]);

  // Инициализация формы данными из categoryId
  useEffect(() => {
    if (categoryId?.data && !isFetching) {
      const categoryData = categoryId.data;
      setCategory({
        name: categoryData.name || "",
        characteristics: categoryData.characteristic || [], // Или characteristics, если сервер возвращает так
      });
    }
  }, [categoryId, isFetching]);

  // Обработчик изменения имени
  const handleNameChange = (e) => {
    setCategory({ ...category, name: e.target.value });
  };

  // Обработчик изменения характеристик
  const handleCharacteristicChange = (index, value, type) => {
    const newCharacteristics = [...category.characteristics];
    if (type === "name") {
      newCharacteristics[index].name = value;
    } else if (type === "data_type") {
      newCharacteristics[index].data_type = value;
    }
    setCategory({ ...category, characteristics: newCharacteristics });
  };

  // Добавление новой характеристики
  const addCharacteristic = () => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      characteristics: [
        ...prevCategory.characteristics,
        { data_type: "string", name: "", id: 0 },
      ],
    }));
  };

  // Удаление характеристики
  const removeCharacteristic = (index) => {
    const newCharacteristics = category.characteristics.filter(
      (_, i) => i !== index
    );
    setCategory({ ...category, characteristics: newCharacteristics });
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Валидация обязательных полей
    if (!category.name) {
      toast.error("Заполните название категории");
      setLoading(false);
      return;
    }

    const categoryData = {
      name: category.name,
      characteristics: category.characteristics.map((characteristic) => ({
        category_id: parseInt(id),
        data_type: characteristic.data_type,
        id: characteristic.id || 0,
        name: characteristic.name,
      })),
    };

    try {
      await updateCategory(id, categoryData);
      toast.success("Категория успешно обновлена");
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      toast.error(
        "Ошибка при обновлении категории: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Отображение индикатора загрузки
  if (isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 4, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Редактировать категорию
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ padding: 2 }}>
          <TextField
            label="Название категории"
            variant="outlined"
            fullWidth
            value={category.name}
            onChange={handleNameChange}
            sx={{ mb: 2 }}
            required
          />

          {category.characteristics.length > 0 ? (
            category.characteristics.map((characteristic, index) => (
              <Grid
                container
                spacing={2}
                key={characteristic.id || `new-${index}`}
                sx={{ mb: 1 }}
              >
                <Grid item xs={7}>
                  <TextField
                    label="Название характеристики"
                    variant="outlined"
                    fullWidth
                    value={characteristic.name}
                    onChange={(e) =>
                      handleCharacteristicChange(index, e.target.value, "name")
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel>Тип данных</InputLabel>
                    <Select
                      value={characteristic.data_type}
                      onChange={(e) =>
                        handleCharacteristicChange(
                          index,
                          e.target.value,
                          "data_type"
                        )
                      }
                    >
                      <MenuItem value="string">Строковое значение</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => removeCharacteristic(index)}
                    color="warning"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))
          ) : (
            <Typography>Характеристики отсутствуют</Typography>
          )}

          <Button
            variant="outlined"
            onClick={addCharacteristic}
            startIcon={<AddIcon />}
            sx={{ mb: 2, mt: 2 }}
          >
            Добавить характеристику
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "#3f51b5", color: "#fff" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Обновить категорию"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
