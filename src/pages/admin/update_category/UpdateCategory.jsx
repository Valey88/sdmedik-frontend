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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import useCategoryStore from "../../../store/categoryStore";

export default function UpdateCategory() {
  const { id } = useParams();
  const { fetchCategoryId, updateCategory, categoryId } = useCategoryStore();
  const [category, setCategory] = useState({
    name: "",
    characteristics: [],
    images: [],
  });

  // Загрузка данных категории
  useEffect(() => {
    if (id) {
      fetchCategoryId(id).then(() => {
        if (categoryId && categoryId.data) {
          const categoryData = categoryId.data;
          setCategory({
            name: categoryData.name || "",
            characteristics: categoryData.characteristic || [], // Используем characteristic
            images: [],
          });
          console.log(response.data);
        }
      });
    }
  }, [id, fetchCategoryId]);

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
  const handleSubmit = (e) => {
    e.preventDefault();

    const categoryData = {
      name: category.name,
      characteristics: category.characteristics.map((characteristic) => ({
        category_id: parseInt(id),
        data_type: characteristic.data_type,
        id: characteristic.id || 0,
        name: characteristic.name,
      })),
    };

    const jsonData = JSON.stringify(categoryData);
    const formData = new FormData();
    formData.append("json", jsonData);
    category.images.forEach((file) => {
      formData.append("file", file);
    });

    updateCategory(id, formData);
  };

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
          >
            Обновить категорию
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
