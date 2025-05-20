import React, { useState } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import useCategoryStore from "../../../store/categoryStore";

export default function CreateCategory() {
  const [category, setCategory] = useState({
    name: "",
    characteristics: [{ data_type: "string", name: "" }],
    images: [],
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { createCategory } = useCategoryStore();

  const handleCharacteristicChange = (index, value, type) => {
    const newCharacteristics = [...category.characteristics];
    if (type === "name") {
      newCharacteristics[index].name = value;
    } else if (type === "data_type") {
      newCharacteristics[index].data_type = value;
    }
    setCategory({ ...category, characteristics: newCharacteristics });
  };

  const addCharacteristic = () => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      characteristics: [
        ...prevCategory.characteristics,
        { data_type: "string", name: "" },
      ],
    }));
  };

  const removeCharacteristic = (index) => {
    const newCharacteristics = category.characteristics.filter(
      (_, i) => i !== index
    );
    setCategory({ ...category, characteristics: newCharacteristics });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCategory((prevCategory) => ({
      ...prevCategory,
      images: files,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category.name || category.characteristics.some((char) => !char.name)) {
      setSnackbarMessage("Пожалуйста, заполните все обязательные поля.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const categoryData = {
      name: category.name,
      characteristics: category.characteristics.map((characteristic) => ({
        data_type: characteristic.data_type,
        name: characteristic.name,
      })),
    };

    const jsonData = JSON.stringify(categoryData);
    const formData = new FormData();
    formData.append("json", jsonData);
    category.images.forEach((file) => {
      formData.append("file", file);
    });

    createCategory(formData)
      .then(() => {
        setSnackbarMessage("Категория успешно создана!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setCategory({
          name: "",
          characteristics: [{ data_type: "string", name: "" }],
          images: [],
        });
      })
      .catch(() => {
        setSnackbarMessage("Ошибка при создании категории.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 4, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Создать категорию
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ padding: 2 }}>
          <TextField
            label="Название категории"
            variant="outlined"
            fullWidth
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            style={{ marginBottom: "16px" }}
          />
          {category.characteristics.map((characteristic, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
              <Grid item xs={7}>
                <TextField
                  label={`Характеристика ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  value={characteristic.name}
                  onChange={(e) =>
                    handleCharacteristicChange(index, e.target.value, "name")
                  }
                  required
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
                    required
                  >
                    <MenuItem value="string">Строковое значение</MenuItem>
                    <MenuItem value="int">Целочисленое значение</MenuItem>
                    <MenuItem value="float">Дробное значение</MenuItem>
                    <MenuItem value="bool">Есть/нету</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => removeCharacteristic(index)}
                  color="error"
                  sx={{ alignSelf: "flex-end" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Button
              variant="outlined"
              onClick={addCharacteristic}
              startIcon={<AddIcon />}
              sx={{ mb: 2 }}
            >
              Добавить характеристику
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: "#3f51b5", color: "#fff" }}
            >
              Сохранить категорию
            </Button>
          </Box>
        </Box>
      </CardContent>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}
