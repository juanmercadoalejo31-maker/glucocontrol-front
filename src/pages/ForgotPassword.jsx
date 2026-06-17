import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Link,
  Snackbar,
  Fade,
  alpha,
  IconButton,
  InputAdornment
} from "@mui/material";
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {

  const navigate = useNavigate();
  
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Validar formato de email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "El correo es requerido";
    if (!regex.test(email)) return "Ingresa un correo válido";
    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setCorreo(value);
    if (emailError) {
      setEmailError("");
    }
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async () => {
    // Validar email
    const emailValidationError = validateEmail(correo);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // IMPORTANTE: Siempre responder con éxito por seguridad
      // No importa si el correo existe o no
      await api.post("/auth/forgot-password", {
        correo: correo
      });

      // Siempre mostrar éxito para no revelar si el correo existe
      setEnviado(true);
      
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      
      // Por seguridad, incluso si hay error, mostramos el mismo mensaje de éxito
      // Esto evita que alguien pueda verificar qué correos existen
      setEnviado(true);
      
      // Opcional: Solo mostrar error si es un problema técnico real
      if (error.response?.status === 429) {
        setError("Demasiados intentos. Por favor, espera unos minutos.");
        setEnviado(false);
      } else if (error.code === "ERR_NETWORK") {
        setError("Error de conexión. Verifica tu internet.");
        setEnviado(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && !enviado) {
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 5,
              background: alpha("#fff", 0.95),
              backdropFilter: "blur(10px)"
            }}
          >
            {/* Botón de volver */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/login")}
              sx={{
                mb: 3,
                color: "#667eea",
                "&:hover": {
                  bgcolor: alpha("#667eea", 0.1)
                }
              }}
            >
              Volver al inicio de sesión
            </Button>

            {/* Título */}
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}
            >
              {enviado ? "¡Revisa tu correo!" : "¿Olvidaste tu contraseña?"}
            </Typography>

            <Typography
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              {enviado
                ? "Si el correo existe en nuestro sistema, recibirás las instrucciones para restablecer tu contraseña"
                : "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña"}
            </Typography>

            {/* Estado de éxito */}
            {enviado ? (
              <Box sx={{ textAlign: "center" }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 80,
                    color: "#4caf50",
                    mb: 2
                  }}
                />
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: alpha("#4caf50", 0.1)
                  }}
                >
                  <Typography variant="body2" align="left">
                    <strong>✅ Solicitud recibida</strong>
                    <br />
                    {correo && (
                      <>
                        Hemos enviado un enlace de recuperación a <strong>{correo}</strong>
                        <br />
                        <small style={{ color: "#666" }}>
                          (Si el correo está registrado, recibirás las instrucciones en unos minutos)
                        </small>
                      </>
                    )}
                  </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  📧 Revisa tu bandeja de entrada y también la carpeta de spam.
                  <br />
                  El enlace expirará en 1 hora.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: 3,
                    borderColor: "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderColor: "#764ba2",
                      bgcolor: alpha("#667eea", 0.1)
                    }
                  }}
                >
                  Volver al inicio de sesión
                </Button>
              </Box>
            ) : (
              <>
                {/* Mensaje de error solo para problemas técnicos */}
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      bgcolor: alpha("#f44336", 0.1)
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Campo de correo */}
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  value={correo}
                  onChange={handleEmailChange}
                  onKeyPress={handleKeyPress}
                  error={!!emailError}
                  helperText={emailError}
                  disabled={loading}
                  margin="normal"
                  placeholder="tu@email.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2
                    }
                  }}
                />

                {/* Botón de enviar */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading || !correo}
                  endIcon={!loading && <SendIcon />}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a67d8, #6b46a0)"
                    },
                    "&.Mui-disabled": {
                      background: alpha("#667eea", 0.5)
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: "white" }} />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>

                {/* Información adicional */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  sx={{ display: "block", mt: 3 }}
                >
                  🔒 Te enviaremos un enlace seguro para restablecer tu contraseña
                </Typography>
              </>
            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}