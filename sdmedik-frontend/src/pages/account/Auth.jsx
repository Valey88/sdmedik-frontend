import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Modal,
} from "@mui/material";
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useUserStore from "../../store/userStore";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { EmailSharp } from "@mui/icons-material";

const scaleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 25 },
  },
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    loginFunc,
    email,
    setEmail,
    password,
    setPassword,
    checkPasswordResetEmail,
  } = useUserStore();
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [error, setError] = useState(null);

  const handleShowResetPasswordModalClose = () => {
    setShowResetPasswordModal(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      email: email || "",
      password: password || "",
    },
  });

  // Синхронизация полей со store
  React.useEffect(() => {
    const subscription = watch((value) => {
      setEmail(value.email);
      setPassword(value.password);
    });
    return () => subscription.unsubscribe();
  }, [watch, setEmail, setPassword]);

  const handleAuth = async () => {
    setLoading(true);
    await loginFunc(navigate);
  };
  const handleResetPassword = async () => {
    if (!email) {
      setError("Введите email");
      return;
    }
    setLoading(true);
    await checkPasswordResetEmail(email);
    setLoading(false);
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
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h4">Вход</Typography>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gridGap: 30,
                  marginTop: "20px",
                }}
                onSubmit={handleSubmit(handleAuth)}
              >
                <TextField
                  variant="outlined"
                  label="Email"
                  placeholder="your@email.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Неправильный или некорректный email",
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
                  label="Пароль"
                  placeholder="Пароль"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
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
                <Button
                  variant="contained"
                  sx={{ background: "#2CC0B3" }}
                  type="submit"
                >
                  {loading ? (
                    <CircularProgress sx={{ color: "#fff" }} size={24} />
                  ) : (
                    "Войти"
                  )}
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
              <Typography>У вас нету аккаунта?</Typography>
              <Link href="/register" sx={{ color: "#2CC0B3" }}>
                Зарегистрироваться
              </Link>
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
              <Typography>Забыли пороль?</Typography>
              <Link
                onClick={(e) => setShowResetPasswordModal(true)}
                sx={{ color: "#2CC0B3", cursor: "pointer" }}
              >
                Восстановить пароль
              </Link>
            </Box>
            <Modal
              open={showResetPasswordModal}
              onClose={handleShowResetPasswordModalClose}
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
              <Box
                sx={{ p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gridGap: 15,
                    mb: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gridGap: 15 }}
                  >
                    <img src="/previwLogo.svg" alt="" />
                    <Typography variant="h6" sx={{ color: "#2CC0B3" }}>
                      Sdmedik
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, background: "#2CC0B3" }}
                    onClick={handleShowResetPasswordModalClose}
                  >
                    <CloseIcon />
                  </Button>
                </Box>
                <Typography id="confirmation-modal-title" variant="h6">
                  Укажите ваш Email для востановления пароля
                </Typography>
                <TextField
                  variant="outlined"
                  label="Введите Email"
                  placeholder="email@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onClick={handleResetPassword}
                >
                  Подтвердить
                </Button>
              </Box>
            </Modal>
          </Container>
        </Paper>
      </motion.div>
    </Box>
  );
}
