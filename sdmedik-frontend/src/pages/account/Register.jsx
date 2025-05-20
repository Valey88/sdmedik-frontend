import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  Modal,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import useUserStore from "../../store/userStore";

const scaleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 25 },
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

export default function Register() {
  const {
    email,
    setEmail,
    fio,
    setFio,
    phone_number,
    setPhone_number,
    password,
    setPassword,
    registerFunc,
    showConfirmation,
    setShowConfirmation,
    code,
    setCode,
    verifyFunc,
  } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      email: email || "",
      phone_number: phone_number || "",
      fio: fio || "",
      password: password || "",
    },
  });

  const [error, setError] = useState(null);
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const navigate = useNavigate();

  // Синхронизация полей со store
  React.useEffect(() => {
    const subscription = watch((value) => {
      setEmail(value.email);
      setPhone_number(value.phone_number);
      setFio(value.fio);
      setPassword(value.password);
    });
    return () => subscription.unsubscribe();
  }, [watch, setEmail, setPhone_number, setFio, setPassword]);

  const handleRegister = async () => {
    await registerFunc();
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleVerify = async () => {
    if (!code) {
      setError("Код подтверждения обязателен");
      return;
    }
    await verifyFunc(navigate);
  };

  const handlePhoneNumberChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setValue("phone_number", formattedPhoneNumber);
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
              sx={{ display: "flex", alignItems: "center", gridGap: 15, mb: 4 }}
            >
              <img src="/previwLogo.svg" alt="" />
              <Typography variant="h6" sx={{ color: "#2CC0B3" }}>
                Sdmedik
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gridGap: 30 }}>
              <Typography variant="h4">Регистрация</Typography>
              <form
                onSubmit={handleSubmit(handleRegister)}
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
                    required: "Это поле обязательно",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Неправильный формат email",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  onChange={(e) => setValue("email", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": { color: "#2CC0B3" },
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Телефон"
                  placeholder="+7 (___) ___-__-__"
                  {...register("phone_number", {
                    required: "Это поле обязательно",
                    pattern: {
                      value: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
                      message: "Неправильный формат номера телефона",
                    },
                  })}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  onChange={handlePhoneNumberChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": { color: "#2CC0B3" },
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  label="ФИО"
                  placeholder="Иванов Дмитрий Сергеевич"
                  {...register("fio", {
                    required: "Это поле обязательно",
                  })}
                  error={!!errors.fio}
                  helperText={errors.fio?.message}
                  onChange={(e) => setValue("fio", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": { color: "#2CC0B3" },
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Пароль"
                  type="password"
                  {...register("password", {
                    required: "Это поле обязательно",
                    minLength: {
                      value: 6,
                      message: "Пароль должен быть не короче 6 символов",
                    },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  onChange={(e) => setValue("password", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
                    },
                    "& .MuiInputLabel-root": {
                      "&.Mui-focused": { color: "#2CC0B3" },
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isConsentGiven}
                      onChange={(e) => setIsConsentGiven(e.target.checked)}
                      sx={{
                        color: "#2CC0B3",
                        "&.Mui-checked": {
                          color: "#2CC0B3",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: { xs: "14px", md: "16px" } }}>
                      Я согласен на обработку персональных данных в соответствии
                      с{" "}
                      <Link
                        href="/privacy-policy.pdf"
                        target="_blank"
                        sx={{ color: "#2CC0B3" }}
                      >
                        политикой конфиденциальности
                      </Link>
                    </Typography>
                  }
                />
                <Button
                  variant="contained"
                  sx={{ background: "#2CC0B3" }}
                  type="submit"
                  disabled={!isConsentGiven}
                >
                  Зарегистрироваться
                </Button>
              </form>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gridGap: 10,
                mt: 3,
                mb: 3,
                flexDirection: { xs: "column", md: "unset" },
              }}
            >
              <Typography>У вас есть аккаунт?</Typography>
              <Link href="/auth" sx={{ color: "#2CC0B3" }}>
                Войти
              </Link>
            </Box>
          </Container>
        </Paper>
      </motion.div>

      <Modal
        open={showConfirmation}
        onClose={handleConfirmationClose}
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        sx={{
          width: { xs: "350px", md: "500px" },
          position: "absolute",
          top: 400,
          left: { xs: 13, md: "37%" },
        }}
        disableRestoreFocus
        disableAutoFocus
        hideBackdrop={true}
      >
        <Box sx={{ p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gridGap: 15,
              mb: 2,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gridGap: 15 }}>
              <img src="/previwLogo.svg" alt="" />
              <Typography variant="h6" sx={{ color: "#2CC0B3" }}>
                Sdmedik
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ mt: 2, background: "#2CC0B3" }}
              onClick={handleConfirmationClose}
            >
              <CloseIcon />
            </Button>
          </Box>
          <Typography id="confirmation-modal-title" variant="h6">
            Подтверждение почты
          </Typography>
          <TextField
            variant="outlined"
            label="Введите код подтверждения"
            placeholder="Код"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{
              mt: 2,
              width: "100%",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#2CC0B3" },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": { color: "#2CC0B3" },
              },
            }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2, background: "#2CC0B3" }}
            onClick={handleVerify}
          >
            Подтвердить
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
