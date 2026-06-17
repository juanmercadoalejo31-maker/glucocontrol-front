import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Alert,
  Stack,
  Box,
  InputAdornment,
  IconButton,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip
} from "@mui/material";

import {
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Email,
  Person,
  Cake,
  LocalHospital,
  Lock,
  CheckCircle,
  Cancel
} from "@mui/icons-material";

import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    edad: "",
    tipoDiabetes: ""
  });

  const [errors, setErrors] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    edad: "",
    tipoDiabetes: ""
  });

  const [touched, setTouched] = useState({
    nombre: false,
    correo: false,
    password: false,
    confirmarPassword: false,
    edad: false,
    tipoDiabetes: false
  });

  const diabetesTypes = [
    { value: "Tipo 1", label: "Tipo 1" },
    { value: "Tipo 2", label: "Tipo 2" },
    { value: "Gestacional", label: "Gestacional" },
    { value: "Prediabetes", label: "Prediabetes" },
    { value: "Otro", label: "Otro" }
  ];

  // Validaciones
  const validateNombre = (nombre) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    if (!nombre) return "El nombre es obligatorio";
    if (!regex.test(nombre)) return "Solo letras y espacios (2-50 caracteres)";
    return "";
  };

  const validateCorreo = (correo) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!correo) return "El correo es obligatorio";
    if (!regex.test(correo)) return "Formato inválido: ejemplo@dominio.com";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "La contraseña es obligatoria";
    
    const errors = [];
    if (password.length < 8) errors.push("mínimo 8 caracteres");
    if (!/[a-z]/.test(password)) errors.push("una minúscula");
    if (!/[A-Z]/.test(password)) errors.push("una mayúscula");
    if (!/\d/.test(password)) errors.push("un número");
    if (!/[@$!%*?&]/.test(password)) errors.push("un carácter especial (@$!%*?&)");
    
    if (errors.length > 0) {
      return `Requisitos: ${errors.join(", ")}`;
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Confirma tu contraseña";
    if (confirmPassword !== password) return "Las contraseñas no coinciden";
    return "";
  };

  const validateEdad = (edad) => {
    if (!edad) return "La edad es obligatoria";
    const numEdad = Number(edad);
    if (!Number.isInteger(numEdad) || numEdad < 1 || numEdad > 120) {
      return "Edad válida: 1-120 años";
    }
    return "";
  };

  const validateTipoDiabetes = (tipo) => {
    if (!tipo) return "Selecciona un tipo de diabetes";
    if (!diabetesTypes.some(t => t.value === tipo)) return "Selección inválida";
    return "";
  };

  // Validar todos los campos del paso actual
  const validateStep = (step) => {
    let stepErrors = {};
    let hasErrors = false;

    if (step === 0) {
      // Información personal
      const nombreError = validateNombre(formData.nombre);
      const edadError = validateEdad(formData.edad);
      const tipoError = validateTipoDiabetes(formData.tipoDiabetes);
      
      stepErrors = { nombre: nombreError, edad: edadError, tipoDiabetes: tipoError };
      hasErrors = nombreError || edadError || tipoError;
    } else if (step === 1) {
      // Credenciales
      const correoError = validateCorreo(formData.correo);
      const passError = validatePassword(formData.password);
      const confirmError = validateConfirmPassword(
        formData.confirmarPassword,
        formData.password
      );
      
      stepErrors = {
        correo: correoError,
        password: passError,
        confirmarPassword: confirmError
      };
      hasErrors = correoError || passError || confirmError;
    }

    // Marcar todos los campos como tocados
    const newTouched = {};
    Object.keys(stepErrors).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...stepErrors }));

    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });

    // Validación en tiempo real
    let errorMessage = "";
    switch (name) {
      case "nombre":
        errorMessage = validateNombre(value);
        break;
      case "correo":
        errorMessage = validateCorreo(value);
        break;
      case "password":
        errorMessage = validatePassword(value);
        // Validar confirmación si existe
        if (formData.confirmarPassword) {
          setErrors(prev => ({
            ...prev,
            confirmarPassword: validateConfirmPassword(formData.confirmarPassword, value)
          }));
        }
        break;
      case "confirmarPassword":
        errorMessage = validateConfirmPassword(value, formData.password);
        break;
      case "edad":
        errorMessage = validateEdad(value);
        break;
      case "tipoDiabetes":
        errorMessage = validateTipoDiabetes(value);
        break;
      default:
        break;
    }

    setErrors({ ...errors, [name]: errorMessage });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === 1) {
        handleRegister();
      } else {
        setActiveStep(prev => prev + 1);
        setError("");
      }
    } else {
      setError("Por favor, corrige los errores marcados");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError("");
  };

  const handleRegister = async () => {
    setError("");
    setSuccess(false);

    try {
      const response = await api.post("/auth/register", {
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        password: formData.password,
        edad: Number(formData.edad),
        tipoDiabetes: formData.tipoDiabetes
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "✅ Registro exitoso. Por favor, inicia sesión." } 
        });
      }, 2500);

    } catch (err) {
      const errorMsg = err.response?.data?.mensaje || 
                      "Error al registrar usuario. Intenta nuevamente.";
      setError(errorMsg);
      setActiveStep(1);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: "Sin contraseña", color: "default" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    const strengths = [
      { level: 1, label: "Débil", color: "error" },
      { level: 2, label: "Débil", color: "error" },
      { level: 3, label: "Media", color: "warning" },
      { level: 4, label: "Fuerte", color: "success" },
      { level: 5, label: "Muy Fuerte", color: "success" }
    ];
    
    return strengths[score - 1] || { level: 0, label: "Sin contraseña", color: "default" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Container maxWidth="md">
      <Paper
        elevation={10}
        sx={{
          mt: 3,
          mb: 3,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decoración de fondo */}
        <Box
          sx={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)",
            opacity: 0.05,
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #42a5f5 0%, #bbdefb 100%)",
            opacity: 0.04,
            zIndex: 0
          }}
        />

        <Stack spacing={4} sx={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Stack alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: "#1976d2",
                width: 90,
                height: 90,
                boxShadow: "0 8px 30px rgba(25, 118, 210, 0.3)",
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
              }}
            >
              <PersonAddIcon sx={{ fontSize: 45 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Crear Cuenta
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Únete a GlucoControl y comienza a monitorear tu salud
            </Typography>
          </Stack>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel>
            <Step>
              <StepLabel>Información Personal</StepLabel>
            </Step>
            <Step>
              <StepLabel>Credenciales</StepLabel>
            </Step>
          </Stepper>

          {/* Mensajes */}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="body1">
                ✅ Registro exitoso. Redirigiendo al inicio de sesión...
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="body1">{error}</Typography>
            </Alert>
          )}

          {/* Formulario - Paso 1 */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur("nombre")}
                  error={touched.nombre && !!errors.nombre}
                  helperText={touched.nombre ? errors.nombre : "Solo letras y espacios (2-50 caracteres)"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Edad *"
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  onBlur={() => handleBlur("edad")}
                  error={touched.edad && !!errors.edad}
                  helperText={touched.edad ? errors.edad : "Edad entre 1 y 120 años"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake color="primary" />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 120 }
                  }}
                  sx={{ borderRadius: 2 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tipo de Diabetes *"
                  name="tipoDiabetes"
                  select
                  value={formData.tipoDiabetes}
                  onChange={handleChange}
                  onBlur={() => handleBlur("tipoDiabetes")}
                  error={touched.tipoDiabetes && !!errors.tipoDiabetes}
                  helperText={touched.tipoDiabetes ? errors.tipoDiabetes : "Selecciona tu tipo de diabetes"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalHospital color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                  required
                >
                  <MenuItem value="">Selecciona una opción</MenuItem>
                  {diabetesTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          )}

          {/* Formulario - Paso 2 */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo Electrónico *"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={() => handleBlur("correo")}
                  error={touched.correo && !!errors.correo}
                  helperText={touched.correo ? errors.correo : "ejemplo@dominio.com"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  error={touched.password && !!errors.password}
                  helperText={
                    touched.password ? errors.password : 
                    "Mínimo 8 caracteres: mayúscula, minúscula, número y carácter especial"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                  required
                />
                {formData.password && (
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={passwordStrength.label}
                      color={passwordStrength.color}
                      size="small"
                    />
                    <Box sx={{ flex: 1, height: 4, bgcolor: "#e0e0e0", borderRadius: 2 }}>
                      <Box
                        sx={{
                          width: `${(passwordStrength.level / 5) * 100}%`,
                          height: "100%",
                          bgcolor: passwordStrength.color === "error" ? "#f44336" :
                                  passwordStrength.color === "warning" ? "#ff9800" :
                                  "#4caf50",
                          borderRadius: 2,
                          transition: "width 0.3s ease"
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Contraseña *"
                  name="confirmarPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmarPassword")}
                  error={touched.confirmarPassword && !!errors.confirmarPassword}
                  helperText={touched.confirmarPassword ? errors.confirmarPassword : "Vuelve a escribir tu contraseña"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                  required
                />
                {formData.confirmarPassword && formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={formData.confirmarPassword === formData.password ? 
                        <CheckCircle /> : <Cancel />}
                      label={formData.confirmarPassword === formData.password ? 
                        "Contraseñas coinciden" : "Las contraseñas no coinciden"}
                      color={formData.confirmarPassword === formData.password ? 
                        "success" : "error"}
                      size="small"
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* Botones de navegación */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || success}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={success}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                },
                "&:disabled": {
                  background: "#bdbdbd"
                }
              }}
            >
              {activeStep === 1 ? "Registrarse" : "Continuar"}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography color="text.secondary" display="inline">
              ¿Ya tienes cuenta?{" "}
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ 
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline"
                }
              }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}