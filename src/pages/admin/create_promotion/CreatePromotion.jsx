import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from "@mui/material";
import usePromotionStore from "../../../store/promotionStore";

export default function CreatePromotion() {
  const { createPromotion } = usePromotionStore();

  // Состояния для каждого поля формы
  const [type, setType] = useState("product_discount");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetId, setTargetId] = useState("");
  const [conditionType, setConditionType] = useState("min_quantity");
  const [conditionValue, setConditionValue] = useState("");
  const [rewardType, setRewardType] = useState("percentage");
  const [rewardValue, setRewardValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Формирование объекта для отправки
    const payload = {
      condition: {
        type: conditionType,
        value: conditionValue,
      },
      description: description,
      end_date: formatDateTime(endDate), // Преобразование даты
      name: name,
      reward: {
        type: rewardType,
        value: parseFloat(rewardValue), // Приведение к числу
      },
      start_date: formatDateTime(startDate), // Преобразование даты
      target_id: targetId,
      type: type,
    };

    // Вызов функции createPromotion с объектом payload
    await createPromotion(payload);
  };

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    const currentTime = new Date();
    const formattedDateTime = `${date} ${String(
      currentTime.getHours()
    ).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(
      2,
      "0"
    )}:${String(currentTime.getSeconds()).padStart(2, "0")}`;
    setStartDate(formattedDateTime);
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    const currentTime = new Date();
    const formattedDateTime = `${date} ${String(
      currentTime.getHours()
    ).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(
      2,
      "0"
    )}:${String(currentTime.getSeconds()).padStart(2, "0")}`;
    setEndDate(formattedDateTime);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Создать Акцию
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Тип акции</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <MenuItem value="product_discount">Скидка на товар</MenuItem>
            <MenuItem value="category_discount">Скидка на категорию</MenuItem>
            <MenuItem value="buy_n_get_m">Купи N, получи M</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          Условия и вознаграждения
        </Typography>
        <TextField
          fullWidth
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="ID товара или категории"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Тип условия</InputLabel>
          <Select
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            required
          >
            <MenuItem value="min_quantity">Минимальное количество</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Минимальное количество"
          type="number"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Тип вознаграждения</InputLabel>
          <Select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value)}
            required
          >
            <MenuItem value="percentage">Процент</MenuItem>
            <MenuItem value="fixed">Фиксированная сумма</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Значение вознаграждения"
          type="number"
          value={rewardValue}
          onChange={(e) => setRewardValue(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Дата начала"
          type="date"
          onChange={handleStartDateChange}
          required
          sx={{ mb: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          label="Дата окончания"
          type="date"
          onChange={handleEndDateChange}
          required
          sx={{ mb: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button type="submit" variant="contained" color="primary">
          Создать Акцию
        </Button>
      </form>
    </Container>
  );
}
