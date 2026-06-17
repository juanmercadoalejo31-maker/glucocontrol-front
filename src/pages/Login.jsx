import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
  alpha,
  Snackbar
} from "@mui/material";

import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { keyframes } from "@mui/system";

import api from "../services/api";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export default function Login() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [errorSnackbar, setErrorSnackbar] = useState({
    open: false,
    message: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }

  };

  const validateForm = () => {

    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El correo es requerido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    return newErrors;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {

      setLoading(true);

      const response = await api.post(
        "/auth/login",
        {
          correo: formData.email,
          password: formData.password
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "usuario",
        JSON.stringify(
          response.data.usuario
        )
      );

      setLoading(false);

      navigate("/dashboard");

    } catch (error) {

      setLoading(false);

      setErrorSnackbar({
        open: true,
        message:
          error.response?.data?.mensaje ||
          "Error al iniciar sesión"
      });

    }

  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",

        "&::before": {
          content: '""',
          position: "absolute",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          animation: `${float} 20s linear infinite`
        }
      }}
    >

      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 2
        }}
      >

        <Fade in timeout={1000}>

          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 5,
              background: alpha("#fff", 0.95),
              backdropFilter: "blur(10px)"
            }}
          >

            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 900,
                mb: 1,
                background:
                  "linear-gradient(135deg,#667eea,#764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}
            >
              GlucoControl
            </Typography>

            <Typography
              align="center"
              color="text.secondary"
              mb={4}
            >
              Inicia sesión para continuar
            </Typography>

            <form onSubmit={handleSubmit}>

              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                name="password"
                label="Contraseña"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment position="end">

                      <IconButton
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {
                          showPassword
                            ? <VisibilityOffIcon />
                            : <VisibilityIcon />
                        }

                      </IconButton>

                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                endIcon={<LoginIcon />}
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg,#667eea,#764ba2)"
                }}
              >
                {
                  loading
                    ? "Iniciando..."
                    : "Entrar"
                }
              </Button>

            </form>

            <Typography
              align="center"
              sx={{ mt: 3 }}
            >

              {/* ✅ Enlace corregido - Ahora navega a /forgot-password */}
              <Link
                component="button"
                underline="hover"
                onClick={() =>
                  navigate("/forgot-password")
                }
              >
                ¿Olvidaste tu contraseña?
              </Link>

            </Typography>

            <Typography
              align="center"
              sx={{ mt: 2 }}
            >
              ¿No tienes cuenta?{" "}

              <Link
                component="button"
                underline="hover"
                onClick={() =>
                  navigate("/register")
                }
              >
                Regístrate aquí
              </Link>

            </Typography>

          </Paper>

        </Fade>

      </Container>

      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setErrorSnackbar({
            ...errorSnackbar,
            open: false
          })
        }
      >
        <Alert
          severity="error"
          variant="filled"
        >
          {errorSnackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}