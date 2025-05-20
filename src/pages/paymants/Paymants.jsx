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
    formState: { errors },
  } = useForm();

  const [error, setError] = useState(null);
  const [isAnotherRecipient, setIsAnotherRecipient] = useState(false);
  const [loading, setLoading] = useState(false);

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserInfo = async () => {
        try {
          const userInfo = await getUserInfo();
          if (userInfo && userInfo.data) {
            setEmail(userInfo.data.email);
            setFio(userInfo.data.fio);
            setPhone_number(userInfo.data.phone_number);
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      };

      fetchUserInfo();
    }
  }, [isAuthenticated, getUserInfo, setEmail, setFio, setPhone_number]);

  const handlePay = async (data) => {
    setLoading(true);
    try {
      if (isAuthenticated && !isAnotherRecipient) {
        // If user is authenticated and not specifying another recipient
        await payOrder({
          email: user?.data?.email || email,
          fio: user?.data?.fio || fio,
          phone_number: user?.data?.phone_number || phone_number,
          delivery_address: data.delivery_address,
        });
      } else {
        // If user is not authenticated or specifying another recipient
        await payOrder(data);
      }
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

                <Button
                  type="submit"
                  variant="contained"
                  sx={{ background: "#2CC0B3", mt: 2 }}
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
