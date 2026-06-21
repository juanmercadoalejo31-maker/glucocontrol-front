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
  Snackbar,
  FormHelperText
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

  const [touched, setTouched] = useState({
    email: false,
    password: false
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

  // ✅ VALIDACIÓN COMPLETA DE CORREO
  const isEmailValid = (email) => {
    // 1. No puede tener espacios
    if (email.includes(' ')) {
      return false;
    }
    
    // 2. Debe tener @
    if (!email.includes('@')) {
      return false;
    }
    
    // 3. Debe tener . después del @
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }
    
    const domain = parts[1];
    if (!domain.includes('.')) {
      return false;
    }
    
    // 4. No puede tener espacios en ninguna parte
    if (email.trim() !== email) {
      return false;
    }
    
    // 5. Validación completa con expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ FUNCIÓN PARA OBTENER EL MENSAJE DE AYUDA
  const getEmailHelperText = () => {
    const email = formData.email;
    
    // Campo vacío y no tocado
    if (!email && !touched.email) {
      return "📧 Ejemplo: usuario@correo.com";
    }
    
    // Campo vacío y tocado
    if (!email && touched.email) {
      return "⚠️ El correo electrónico es requerido";
    }
    
    // ✅ VALIDACIONES ESPECÍFICAS
    if (email) {
      // Tiene espacios
      if (email.includes(' ')) {
        return "❌ El correo NO puede contener espacios";
      }
      
      // No tiene @
      if (!email.includes('@')) {
        return "❌ El correo debe contener @ (ejemplo: usuario@correo.com)";
      }
      
      // Tiene @ pero no tiene . después del @
      const parts = email.split('@');
      if (parts.length === 2 && !parts[1].includes('.')) {
        return "❌ El correo debe tener .com, .org, etc. (ejemplo: usuario@correo.com)";
      }
      
      // Tiene espacios al inicio o final
      if (email.trim() !== email) {
        return "❌ El correo no puede tener espacios al inicio o final";
      }
      
      // Tiene caracteres extraños
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "❌ Formato inválido. Usa: usuario@dominio.com";
      }
      
      // ¡TODO BIEN!
      return "✅ Correo válido";
    }
    
    return "📧 Ingresa tu correo electrónico";
  };

  // ✅ FUNCIÓN PARA SABER SI EL EMAIL TIENE ERROR
  const hasEmailError = () => {
    const email = formData.email;
    if (!touched.email && !email) return false;
    if (!email) return true;
    return !isEmailValid(email);
  };

  // ✅ COLOR DEL MENSAJE
  const getEmailHelperColor = () => {
    const email = formData.email;
    
    if (!touched.email && !email) return 'text.secondary';
    if (!email) return 'error.main';
    if (email && isEmailValid(email)) return 'success.main';
    return 'error.main';
  };

  const validateForm = () => {

    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!isEmailValid(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    return newErrors;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setTouched({
      email: true,
      password: true
    });

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

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="email"
                  label="Correo Electrónico"
                  placeholder="usuario@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  error={hasEmailError()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color={hasEmailError() ? "error" : "primary"} />
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* ✅ MENSAJE DE AYUDA CON VALIDACIÓN DE ESPACIOS */}
                <FormHelperText 
                  sx={{ 
                    ml: 2,
                    mt: 0.5,
                    color: getEmailHelperColor(),
                    fontWeight: hasEmailError() ? 600 : 400
                  }}
                >
                  {getEmailHelperText()}
                </FormHelperText>
              </Box>

              <TextField
                fullWidth
                margin="normal"
                name="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={() => setTouched({ ...touched, password: true })}
                error={!!errors.password}
                helperText={errors.password || "🔑 Ingresa tu contraseña"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                  background: "linear-gradient(135deg,#667eea,#764ba2)"
                }}
              >
                {loading ? "Iniciando..." : "Entrar"}
              </Button>

            </form>

            <Typography align="center" sx={{ mt: 3 }}>
              <Link
                component="button"
                underline="hover"
                onClick={() => navigate("/forgot-password")}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Typography>

            <Typography align="center" sx={{ mt: 2 }}>
              ¿No tienes cuenta?{" "}
              <Link
                component="button"
                underline="hover"
                onClick={() => navigate("/register")}
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
        onClose={() => setErrorSnackbar({ ...errorSnackbar, open: false })}
      >
        <Alert severity="error" variant="filled">
          {errorSnackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}