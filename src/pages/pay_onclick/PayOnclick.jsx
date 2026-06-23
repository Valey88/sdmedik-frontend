import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import useOrderStore from "../../store/orderStore";

const scaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 25,
    },
  },
};

const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
  if (!match) return "+7 (";
  const [, areaCode, firstPart, secondPart, thirdPart] = match;
  return `+7 (${areaCode}${areaCode ? ")" : ""}${
    firstPart ? ` ${firstPart}` : ""
  }${secondPart ? `-${secondPart}` : ""}${thirdPart ? `-${thirdPart}` : ""}`;
};

export default function PayOnclick() {
  const {
    email,
    setEmail,
    fio,
    setFio,
    phone_number,
    delivery_address,
    setPhone_number,
    setDelivery_address,
    payOrderById,
  } = useOrderStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { id } = useParams();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOfferAccepted, setIsOfferAccepted] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [isHealthDataAccepted, setIsHealthDataAccepted] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    await payOrderById(id, isPrivacyAccepted, isHealthDataAccepted);
  };

  const handlePhoneNumberChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhone_number(formattedPhoneNumber);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={scaleVariants}
        style={{ transformOrigin: "center" }}
      >
        <Paper sx={{ p: 2, mt: 5, mb: 5, width: { xs: 320, md: 500 } }}>
          <Container>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gridGap: 15,
                mb: 4,
              }}
            >
              <img src="/previwLogo.svg" alt="" />
              <Typography variant="h6" sx={{ color: "#2CC0B3" }}>
                Sdmedik
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gridGap: 30 }}>
              <Typography variant="h4">Укажите контактные данные</Typography>
              <form
                onSubmit={handleSubmit(handlePay)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gridGap: 30,
                  marginTop: "10px",
                }}
              >
                <TextField
                  variant="outlined"
                  label="Email"
                  placeholder="your@email.com"
                  {...register("email", {
                    required: "Это поле обязательно для заполнения",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Неправильный формат email",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ""}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#2CC0B3",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": {
                        color: "#2CC0B3",
                      },
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Телефон"
                  placeholder="+7 (___) ___-__-__"
                  {...register("phone_number", {
                    required: "Это поле обязательно для заполнения",
                    pattern: {
                      value: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
                      message: "Неправильный формат номера телефона",
                    },
                  })}
                  error={!!errors.phone_number}
                  helperText={
                    errors.phone_number ? errors.phone_number.message : ""
                  }
                  value={phone_number}
                  onChange={handlePhoneNumberChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#2CC0B3",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": {
                        color: "#2CC0B3",
                      },
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  label="ФИО"
                  placeholder="Иванов Дмитрий Сергеевич"
                  value={fio}
                  {...register("fio", {
                    required: "Это поле обязательно для заполнения",
                  })}
                  error={!!errors.fio}
                  helperText={errors.fio ? errors.fio.message : ""}
                  onChange={(e) => setFio(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#2CC0B3",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": {
                        color: "#2CC0B3",
                      },
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Адрес доставки"
                  placeholder="ул. Примерная, д. 1"
                  {...register("delivery_address", {
                    required: "Это поле обязательно для заполнения",
                  })}
                  error={!!errors.delivery_address}
                  helperText={
                    errors.delivery_address
                      ? errors.delivery_address.message
                      : ""
                  }
                  onChange={(e) => setDelivery_address(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#2CC0B3",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": {
                        color: "#2CC0B3",
                      },
                    },
                  }}
                />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isOfferAccepted}
                        onChange={(e) => setIsOfferAccepted(e.target.checked)}
                        sx={{ color: "#2CC0B3", "&.Mui-checked": { color: "#2CC0B3" }, padding: "4px 9px" }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "14px" }}>
                        Я принимаю условия{" "}
                        <Link href="/Публичная_оферта_обновлённая_по_рекомендациям_ТПП_2026.pdf" target="_blank" sx={{ color: "#2CC0B3", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                          Публичной оферты
                        </Link>.
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPrivacyAccepted}
                        onChange={(e) => setIsPrivacyAccepted(e.target.checked)}
                        sx={{ color: "#2CC0B3", "&.Mui-checked": { color: "#2CC0B3" }, padding: "4px 9px" }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "14px" }}>
                        Я даю согласие на обработку персональных данных в
                        соответствии с{" "}
                        <Link
                          href="/Согласие_на_обработку_персональных_данных.pdf"
                          target="_blank"
                          sx={{ color: "#2CC0B3", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                          Политикой конфиденциальности
                        </Link>
                        .
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isHealthDataAccepted}
                        onChange={(e) => setIsHealthDataAccepted(e.target.checked)}
                        sx={{ color: "#2CC0B3", "&.Mui-checked": { color: "#2CC0B3" }, padding: "4px 9px" }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "14px" }}>
                        Я даю согласие на обработку персональных данных,
                        относящихся к состоянию здоровья и инвалидности, в
                        соответствии с{" "}
                        <Link
                          href="/Согласие_на_обработку_персональных_данных.pdf"
                          target="_blank"
                          sx={{ color: "#2CC0B3", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                          разделом 7 документа
                        </Link>
                        .
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isOfferAccepted || !isPrivacyAccepted || !isHealthDataAccepted || loading}
                  sx={{ background: "#2CC0B3", mt: 2, "&.Mui-disabled": { background: "#ccc", color: "#fff" } }}
                >
                  {loading ? (
                    <CircularProgress sx={{ color: "#fff" }} size={24} />
                  ) : (
                    "Перейти к оплате"
                  )}
                </Button>
              </form>
            </Box>
          </Container>
        </Paper>
      </motion.div>
    </Box>
  );
}
