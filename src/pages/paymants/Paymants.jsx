import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import useOrderStore from "../../store/orderStore";
import useUserStore from "../../store/userStore"; // Импортируем хранилище пользователя

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

export default function Payments() {
  const {
    email,
    setEmail,
    fio,
    delivery_address,
    setFio,
    phone_number,
    setPhone_number,
    setDelivery_address,
    payOrder,
  } = useOrderStore();
  const { user, isAuthenticated, getUserInfo } = useUserStore(); // Получаем данные пользователя
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [error, setError] = useState(null);
  const [isAnotherRecipient, setIsAnotherRecipient] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isOfferAccepted, setIsOfferAccepted] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [isHealthDataAccepted, setIsHealthDataAccepted] = useState(false);
  const [isMarketingAccepted, setIsMarketingAccepted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const loadUserData = async () => {
        try {
          await getUserInfo();
        } catch (error) {
          console.error("Ошибка загрузки данных пользователя:", error);
        }
      };
      loadUserData();
    }
  }, [isAuthenticated, getUserInfo]);

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (isAuthenticated && user?.data && !isAnotherRecipient) {
      setEmail(user.data.email || "");
      setFio(user.data.fio || "");
      setPhone_number(user.data.phone_number || "");

      // Устанавливаем значения для react-hook-form
      setValue("email", user.data.email || "");
      setValue("fio", user.data.fio || "");
      setValue("phone_number", user.data.phone_number || "");
    }
  }, [
    user,
    isAuthenticated,
    isAnotherRecipient,
    setEmail,
    setFio,
    setPhone_number,
    setValue,
  ]);

  const handlePay = async (data) => {
    setLoading(true);
    try {
      await payOrder({
        email:
          isAuthenticated && !isAnotherRecipient
            ? user?.data?.email || email
            : data.email,
        fio:
          isAuthenticated && !isAnotherRecipient
            ? user?.data?.fio || fio
            : data.fio,
        phone_number:
          isAuthenticated && !isAnotherRecipient
            ? user?.data?.phone_number || phone_number
            : data.phone_number,
        delivery_address: data.delivery_address,
      });
    } catch (error) {
      setError(error.message);
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
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
        <Paper sx={{ p: 4, mt: 5, mb: 5, width: { xs: 320, md: 500 } }}>
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
                  gridGap: 20,
                  marginTop: "10px",
                }}
              >
                {(!isAuthenticated || isAnotherRecipient) && (
                  <>
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
                  </>
                )}

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

                {isAuthenticated && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAnotherRecipient}
                        onChange={(e) =>
                          setIsAnotherRecipient(e.target.checked)
                        }
                        sx={{
                          color: "#2CC0B3",
                          "&.Mui-checked": {
                            color: "#2CC0B3",
                          },
                        }}
                      />
                    }
                    label="Указать другого получателя"
                    sx={{ mt: 2, mb: 2 }}
                  />
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isOfferAccepted}
                        onChange={(e) => setIsOfferAccepted(e.target.checked)}
                        sx={{ color: "#2CC0B3", "&.Mui-checked": { color: "#2CC0B3" }, padding: "4px 9px" }}
                      />
                    }
                    label={<Typography sx={{ fontSize: "14px" }}>Я принимаю условия Публичной оферты.</Typography>}
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
                    label={<Typography sx={{ fontSize: "14px" }}>Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.</Typography>}
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
                    label={<Typography sx={{ fontSize: "14px" }}>Я даю согласие на обработку персональных данных о состоянии здоровья и инвалидности (при оплате электронным сертификатом СФР).</Typography>}
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isMarketingAccepted}
                        onChange={(e) => setIsMarketingAccepted(e.target.checked)}
                        sx={{ color: "#2CC0B3", "&.Mui-checked": { color: "#2CC0B3" }, padding: "4px 9px" }}
                      />
                    }
                    label={<Typography sx={{ fontSize: "14px", color: "text.secondary" }}>Я согласен на получение рекламно-информационных сообщений.</Typography>}
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
