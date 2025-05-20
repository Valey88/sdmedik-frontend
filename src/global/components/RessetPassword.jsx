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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

export default function RessetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    loginFunc,
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,

    chengePasswordReset,
  } = useUserStore();

  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams(); // Query-параметры
  const queryToken = searchParams.get("token"); // Если токен в query

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      //   email: email || "",
      password: password || "",
      confirmPassword: confirmPassword || "",
    },
  });

  // Синхронизация полей со store
  React.useEffect(() => {
    const subscription = watch((value) => {
      //   setEmail(value.email);
      setPassword(value.password);
      setConfirmPassword(value.confirmPassword);
    });
    return () => subscription.unsubscribe();
  }, [watch, setPassword, setConfirmPassword]);

  const handleResetPassword = async () => {
    setLoading(true);
    await chengePasswordReset(queryToken, confirmPassword);
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
              <Typography variant="h4">Востановление пороля</Typography>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gridGap: 30,
                  marginTop: "20px",
                }}
                onSubmit={handleSubmit(handleResetPassword)}
              >
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
                <TextField
                  variant="outlined"
                  label="Введите повторите пороль"
                  placeholder="Пароль"
                  type="password"
                  {...register("confirmPassword", {
                    required: "confirmPassword is required",
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  onChange={(e) => setValue("confirmPassword", e.target.value)}
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
                    "изменить пароль"
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
