// Dashboard.jsx - Versión actualizada con acceso al chat y análisis Prolog
import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  List,
  Paper,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Badge,
  alpha,
  Tooltip,
  CircularProgress,
  Divider
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Medication as MedicationIcon,
  DirectionsRun as DirectionsRunIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  WaterDrop as WaterDropIcon,
  EmojiEvents as EmojiEventsIcon,
  Edit as EditIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  Fastfood as FastfoodIcon,
  FitnessCenter as FitnessCenterIcon,
  Logout as LogoutIcon,
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const CircularProgressWithLabel = ({ value, size = 80, color }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <svg width={size} height={size}>
        <circle
          stroke="#e0e0e0"
          fill="none"
          strokeWidth={4}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          stroke={color || "#1976d2"}
          fill="none"
          strokeWidth={4}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openMedDialog, setOpenMedDialog] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [openGlucosaDialog, setOpenGlucosaDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openPrologDialog, setOpenPrologDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [editingMed, setEditingMed] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  
  // Estados de datos
  const [usuario, setUsuario] = useState(null);
  const [glucosa, setGlucosa] = useState({ value: 0, mediciones: [] });
  const [medicamentos, setMedicamentos] = useState([]);
  const [comidas, setComidas] = useState([]);
  const [actividad, setActividad] = useState({ pasos: 0, minutos: 0, calorias: 0, metaPasos: 10000 });
  const [hidratacion, setHidratacion] = useState({ vasos: 0, metaVasos: 8 });
  
  // Estado para análisis Prolog
  const [analisisProlog, setAnalisisProlog] = useState(null);
  const [glucosaParaAnalizar, setGlucosaParaAnalizar] = useState("");
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  
  // Formularios
  const [newMedicamento, setNewMedicamento] = useState({ nombre: "", dosis: "", horario: "08:00" });
  const [newComida, setNewComida] = useState({ nombre: "", descripcion: "", calorias: "" });
  const [newActividad, setNewActividad] = useState({ tipo: "caminata", duracion: "" });
  const [glucosaInput, setGlucosaInput] = useState("");
  const [profileForm, setProfileForm] = useState({
    nombre: "",
    edad: "",
    peso: "",
    altura: "",
    tipoDiabetes: "",
    metaPasos: 10000,
    metaAgua: 8
  });

  // Cargar datos del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar perfil
      const profileRes = await api.get('/auth/profile');
      setUsuario(profileRes.data);
      setProfileForm({
        nombre: profileRes.data.nombre || "",
        edad: profileRes.data.edad || "",
        peso: profileRes.data.peso || "",
        altura: profileRes.data.altura || "",
        tipoDiabetes: profileRes.data.tipoDiabetes || "",
        metaPasos: profileRes.data.metaPasos || 10000,
        metaAgua: profileRes.data.metaAgua || 8
      });
      
      // Cargar glucosa
      const glucosaRes = await api.get('/glucosa');
      const ultimaGlucosa = glucosaRes.data.length > 0 ? glucosaRes.data[0].valor : 0;
      setGlucosa({
        value: ultimaGlucosa,
        mediciones: glucosaRes.data
      });
      
      // Cargar medicamentos
      const medicamentosRes = await api.get('/medicamentos');
      setMedicamentos(medicamentosRes.data);
      
      // Cargar comidas
      const comidasRes = await api.get('/comidas');
      setComidas(comidasRes.data);
      
      // Cargar actividades
      const actividadRes = await api.get('/actividades');
      setActividad({
        pasos: actividadRes.data.resumen?.pasos || 0,
        minutos: actividadRes.data.resumen?.minutos || 0,
        calorias: actividadRes.data.resumen?.calorias || 0,
        metaPasos: actividadRes.data.metaPasos || 10000,
        historial: actividadRes.data.historial || []
      });
      
      // Cargar hidratación
      const hidratacionRes = await api.get('/hidratacion');
      setHidratacion({
        vasos: hidratacionRes.data.vasos || 0,
        metaVasos: hidratacionRes.data.metaVasos || 8
      });
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showMessage(error.response?.data?.mensaje || 'Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // PASO 10: Función para analizar con Prolog
  const analizarConProlog = async () => {
    const valor = parseInt(glucosaParaAnalizar);
    if (isNaN(valor) || valor < 40 || valor > 600) {
      showMessage("⚠️ Ingresa un valor válido entre 40 y 600 mg/dL", "error");
      return;
    }

    setCargandoAnalisis(true);
    try {
      const response = await api.post("/prolog/analizar", {
        glucosa: valor
      });

      setAnalisisProlog({
        valor: valor,
        resultado: response.data.resultado,
        recomendacion: response.data.recomendacion || "Sin recomendación específica",
        timestamp: new Date().toISOString()
      });
      
      setOpenPrologDialog(true);
      showMessage("✅ Análisis completado con éxito");
    } catch (error) {
      console.error('Error al analizar con Prolog:', error);
      showMessage(error.response?.data?.mensaje || 'Error al realizar el análisis', 'error');
    } finally {
      setCargandoAnalisis(false);
    }
  };

  // Registrar glucosa
  const registrarGlucosaManual = async () => {
    const valor = parseInt(glucosaInput);
    if (isNaN(valor) || valor < 40 || valor > 600) {
      showMessage("⚠️ Ingresa un valor válido entre 40 y 600 mg/dL", "error");
      return;
    }
    
    try {
      await api.post('/glucosa', { valor });
      await cargarDatos();
      setGlucosaInput("");
      setOpenGlucosaDialog(false);
      showMessage(`✅ Glucosa registrada: ${valor} mg/dL`);
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.response?.data?.mensaje || 'Error al registrar glucosa', 'error');
    }
  };

  // CRUD Medicamentos
  const agregarMedicamento = async () => {
    if (!newMedicamento.nombre) {
      showMessage("⚠️ Ingresa el nombre del medicamento", "error");
      return;
    }
    
    try {
      if (editingMed) {
        await api.put(`/medicamentos/${editingMed._id}`, newMedicamento);
        showMessage(`✏️ ${newMedicamento.nombre} actualizado`);
      } else {
        await api.post('/medicamentos', newMedicamento);
        showMessage(`💊 ${newMedicamento.nombre} agregado`);
      }
      await cargarDatos();
      setEditingMed(null);
      setNewMedicamento({ nombre: "", dosis: "", horario: "08:00" });
      setOpenMedDialog(false);
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.response?.data?.mensaje || 'Error al guardar medicamento', 'error');
    }
  };

  const eliminarMedicamento = async (id, nombre) => {
    try {
      await api.delete(`/medicamentos/${id}`);
      await cargarDatos();
      showMessage(`🗑️ ${nombre} eliminado`, "error");
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al eliminar medicamento', 'error');
    }
  };

  const toggleMedicamento = async (id, tomado) => {
    try {
      await api.put(`/medicamentos/${id}`, { tomado: !tomado });
      await cargarDatos();
      const medicamento = medicamentos.find(m => m._id === id);
      const estado = !tomado ? "marcado como tomado" : "marcado como pendiente";
      showMessage(`💊 ${medicamento?.nombre} ${estado}`);
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al actualizar medicamento', 'error');
    }
  };

  // CRUD Comidas
  const agregarComida = async () => {
    if (!newComida.nombre) {
      showMessage("⚠️ Ingresa el nombre de la comida", "error");
      return;
    }
    
    try {
      if (editingMeal) {
        await api.put(`/comidas/${editingMeal._id}`, newComida);
        showMessage(`✏️ ${newComida.nombre} actualizado`);
      } else {
        await api.post('/comidas', newComida);
        showMessage(`🍽️ ${newComida.nombre} registrado`);
      }
      await cargarDatos();
      setEditingMeal(null);
      setNewComida({ nombre: "", descripcion: "", calorias: "" });
      setOpenMealDialog(false);
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.response?.data?.mensaje || 'Error al guardar comida', 'error');
    }
  };

  const eliminarComida = async (id, nombre) => {
    try {
      await api.delete(`/comidas/${id}`);
      await cargarDatos();
      showMessage(`🗑️ ${nombre} eliminado`, "error");
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al eliminar comida', 'error');
    }
  };

  const toggleComida = async (id, registrado) => {
    try {
      await api.put(`/comidas/${id}`, { registrado: !registrado });
      await cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al actualizar comida', 'error');
    }
  };

  // Registrar Actividad
  const registrarActividad = async () => {
    if (!newActividad.duracion || parseInt(newActividad.duracion) <= 0) {
      showMessage("⚠️ Ingresa una duración válida", "error");
      return;
    }
    
    try {
      await api.post('/actividades', newActividad);
      await cargarDatos();
      setNewActividad({ tipo: "caminata", duracion: "" });
      setOpenActivityDialog(false);
      showMessage(`🏃 Actividad registrada!`);
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.response?.data?.mensaje || 'Error al registrar actividad', 'error');
    }
  };

  // Registrar hidratación
  const registrarVasoAgua = async () => {
    try {
      await api.post('/hidratacion/vaso');
      await cargarDatos();
      showMessage("💧 ¡Vaso de agua registrado!");
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al registrar vaso', 'error');
    }
  };

  // Actualizar perfil
  const actualizarPerfil = async () => {
    try {
      await api.put('/auth/profile', profileForm);
      await cargarDatos();
      setOpenProfileDialog(false);
      showMessage('✅ Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.response?.data?.mensaje || 'Error al actualizar perfil', 'error');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const getGlucosaColor = () => {
    if (glucosa.value < 70) return "#ff9800";
    if (glucosa.value > 180) return "#f44336";
    return "#4caf50";
  };

  const getGlucosaStatus = () => {
    if (glucosa.value < 70) return "Baja ⚠️";
    if (glucosa.value > 180) return "Alta ⚠️";
    return "Normal ✓";
  };

  const porcentajeProgreso = Math.min((actividad.pasos / actividad.metaPasos) * 100, 100);
  const porcentajeHidratacion = Math.min((hidratacion.vasos / hidratacion.metaVasos) * 100, 100);

  // Obtener color según estado de glucosa para el análisis
  const getAnalisisColor = (estado) => {
    if (estado === "normal") return "#4caf50";
    if (estado === "baja") return "#ff9800";
    if (estado === "alta") return "#f44336";
    return "#1976d2";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      
      <AppBar position="sticky" sx={{ bgcolor: "#1976d2", boxShadow: 3 }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            GlucoControl
          </Typography>
          
          {/* Botón Análisis Prolog */}
          <Tooltip title="Análisis con Prolog">
            <Button
              variant="contained"
              onClick={() => setOpenPrologDialog(true)}
              sx={{ 
                mr: 1,
                bgcolor: "#ffffff",
                color: "#1976d2",
                '&:hover': {
                  bgcolor: "#e3f2fd",
                }
              }}
              startIcon={<PsychologyIcon />}
            >
              Analizar
            </Button>
          </Tooltip>

          {/* Botón del Asistente IA */}
          <Tooltip title="Asistente IA">
            <Button
              variant="contained"
              onClick={() => navigate("/chat")}
              sx={{ 
                mr: 1,
                bgcolor: "#ffffff",
                color: "#1976d2",
                '&:hover': {
                  bgcolor: "#e3f2fd",
                }
              }}
              startIcon={<SmartToyIcon />}
            >
              Asistente IA
            </Button>
          </Tooltip>
          
          <Tooltip title="Notificaciones">
            <IconButton color="inherit">
              <Badge badgeContent={medicamentos.filter(m => !m.tomado).length + comidas.filter(c => !c.registrado).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Mi Perfil">
            <IconButton color="inherit" onClick={() => setOpenProfileDialog(true)}>
              <PersonIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cerrar Sesión">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 4, 
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          boxShadow: 4
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                ¡Hola {usuario?.nombre || "Usuario"}! 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {medicamentos.filter(m => !m.tomado).length + comidas.filter(c => !c.registrado).length > 0 
                  ? `Tienes ${medicamentos.filter(m => !m.tomado).length + comidas.filter(c => !c.registrado).length} tareas pendientes` 
                  : "¡Todo al día! Buen trabajo"}
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => setOpenPrologDialog(true)}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#1976d2",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: "#e3f2fd",
                    transform: "scale(1.05)",
                  },
                  transition: "transform 0.2s",
                }}
                startIcon={<PsychologyIcon />}
              >
                Análisis Prolog
              </Button>
              
              <Button
                variant="contained"
                onClick={() => navigate("/chat")}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#1976d2",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: "#e3f2fd",
                    transform: "scale(1.05)",
                  },
                  transition: "transform 0.2s",
                }}
                startIcon={<SmartToyIcon />}
              >
                Hablar con mi Asistente
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ borderRadius: 4, mb: 3, boxShadow: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
            <Tab icon={<DashboardIcon />} label="Resumen" />
            <Tab icon={<MedicationIcon />} label="Medicamentos" />
            <Tab icon={<RestaurantIcon />} label="Comidas" />
            <Tab icon={<BarChartIcon />} label="Estadísticas" />
          </Tabs>
        </Paper>

        {/* Panel Resumen */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, borderTop: `4px solid ${getGlucosaColor()}`, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">Glucosa Actual</Typography>
                      <Typography variant="h2" fontWeight="bold" sx={{ color: getGlucosaColor() }}>
                        {glucosa.value || "--"} <span style={{ fontSize: "16px" }}>mg/dL</span>
                      </Typography>
                      <Chip label={getGlucosaStatus()} size="small" sx={{ mt: 1, bgcolor: getGlucosaColor(), color: "white" }} />
                    </Box>
                    <Avatar sx={{ bgcolor: getGlucosaColor(), width: 70, height: 70 }}>
                      <FavoriteIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button fullWidth variant="contained" onClick={() => setOpenGlucosaDialog(true)}>
                      Registrar Manual
                    </Button>
                    <Button fullWidth variant="outlined" onClick={() => setOpenPrologDialog(true)}>
                      Analizar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#1e88e5", mr: 2 }}><DirectionsRunIcon /></Avatar>
                    <Typography variant="h6">Actividad Física</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold">{actividad.pasos.toLocaleString()}</Typography>
                    <CircularProgressWithLabel value={porcentajeProgreso} color="#1e88e5" size={60} />
                  </Box>
                  <Typography color="text.secondary">Meta: {actividad.metaPasos.toLocaleString()} pasos</Typography>
                  <LinearProgress variant="determinate" value={porcentajeProgreso} sx={{ height: 10, borderRadius: 5, my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: "center", bgcolor: alpha("#1e88e5", 0.1) }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="h6">{actividad.minutos} min</Typography>
                        <Typography variant="caption" color="text.secondary">Activos</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: "center", bgcolor: alpha("#ff9800", 0.1) }}>
                        <FavoriteIcon fontSize="small" />
                        <Typography variant="h6">{actividad.calorias}</Typography>
                        <Typography variant="caption" color="text.secondary">Calorías</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: "center", bgcolor: alpha("#4caf50", 0.1) }}>
                        <EmojiEventsIcon fontSize="small" />
                        <Typography variant="h6">{Math.round(porcentajeProgreso)}%</Typography>
                        <Typography variant="caption" color="text.secondary">Meta</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Button fullWidth variant="outlined" onClick={() => setOpenActivityDialog(true)} sx={{ mt: 2 }} startIcon={<AddIcon />}>
                    Registrar Actividad
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#2196f3", mr: 2 }}><WaterDropIcon /></Avatar>
                    <Typography variant="h6">Hidratación</Typography>
                  </Box>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color="#2196f3">{hidratacion.vasos}</Typography>
                    <Typography variant="body2">de {hidratacion.metaVasos} vasos</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={porcentajeHidratacion} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
                  <Button fullWidth variant="contained" onClick={registrarVasoAgua} startIcon={<WaterDropIcon />}>
                    + Vaso de Agua
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ bgcolor: "#43a047", mr: 2 }}><MedicationIcon /></Avatar>
                      <Typography variant="h6">Medicamentos</Typography>
                    </Box>
                    <Button size="small" onClick={() => setOpenMedDialog(true)} startIcon={<AddIcon />}>Agregar</Button>
                  </Box>
                  {medicamentos.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>No hay medicamentos registrados</Typography>
                  ) : (
                    <List>
                      {medicamentos.map((med) => (
                        <Paper key={med._id} sx={{ p: 1.5, mb: 1, bgcolor: alpha("#43a047", med.tomado ? 0.1 : 0.05) }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">{med.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">{med.dosis} • {med.horario}</Typography>
                            </Box>
                            <Box>
                              <Button size="small" variant={med.tomado ? "contained" : "outlined"} color={med.tomado ? "success" : "warning"} onClick={() => toggleMedicamento(med._id, med.tomado)} sx={{ mr: 1 }}>
                                {med.tomado ? "Tomado ✓" : "Pendiente"}
                              </Button>
                              <IconButton size="small" onClick={() => eliminarMedicamento(med._id, med.nombre)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ bgcolor: "#ff9800", mr: 2 }}><RestaurantIcon /></Avatar>
                      <Typography variant="h6">Comidas</Typography>
                    </Box>
                    <Button size="small" onClick={() => setOpenMealDialog(true)} startIcon={<AddIcon />}>Agregar</Button>
                  </Box>
                  {comidas.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>No hay comidas registradas</Typography>
                  ) : (
                    <List>
                      {comidas.map((comida) => (
                        <Paper key={comida._id} sx={{ p: 1.5, mb: 1, bgcolor: alpha("#ff9800", 0.05) }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold">{comida.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">{comida.descripcion}</Typography>
                              <Typography variant="caption" color="text.secondary">🍽️ {comida.calorias} kcal</Typography>
                            </Box>
                            <Box>
                              <Chip label={comida.registrado ? "Registrado ✓" : "Pendiente"} size="small" color={comida.registrado ? "success" : "default"} onClick={() => toggleComida(comida._id, comida.registrado)} sx={{ mr: 1 }} />
                              <IconButton size="small" onClick={() => eliminarComida(comida._id, comida.nombre)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Panel Medicamentos */}
        {activeTab === 1 && (
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MedicationIcon color="primary" /> Mis Medicamentos
                </Typography>
                <Button variant="contained" onClick={() => { setEditingMed(null); setNewMedicamento({ nombre: "", dosis: "", horario: "08:00" }); setOpenMedDialog(true); }} startIcon={<AddIcon />}>
                  Agregar Medicamento
                </Button>
              </Box>
              <Grid container spacing={2}>
                {medicamentos.map((med) => (
                  <Grid item xs={12} md={6} key={med._id}>
                    <Paper sx={{ p: 2.5, bgcolor: alpha("#43a047", 0.05), borderRadius: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="h6">{med.nombre}</Typography>
                          <Typography color="text.secondary" variant="body2">{med.dosis}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">{med.horario}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
                          <Button variant={med.tomado ? "contained" : "outlined"} color={med.tomado ? "success" : "warning"} onClick={() => toggleMedicamento(med._id, med.tomado)} size="small">
                            {med.tomado ? "✓ Tomado" : "Pendiente"}
                          </Button>
                          <Box>
                            <IconButton onClick={() => { setEditingMed(med); setNewMedicamento({ nombre: med.nombre, dosis: med.dosis, horario: med.horario }); setOpenMedDialog(true); }} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => eliminarMedicamento(med._id, med.nombre)} color="error" size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Panel Comidas */}
        {activeTab === 2 && (
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RestaurantIcon color="warning" /> Mis Comidas
                </Typography>
                <Button variant="contained" onClick={() => { setEditingMeal(null); setNewComida({ nombre: "", descripcion: "", calorias: "" }); setOpenMealDialog(true); }} startIcon={<AddIcon />}>
                  Registrar Comida
                </Button>
              </Box>
              <Grid container spacing={2}>
                {comidas.map((comida) => (
                  <Grid item xs={12} md={6} key={comida._id}>
                    <Paper sx={{ p: 2.5, bgcolor: alpha("#ff9800", 0.05), borderRadius: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box flex={1}>
                          <Typography variant="h6">{comida.nombre}</Typography>
                          <Typography color="text.secondary" variant="body2">{comida.descripcion}</Typography>
                          <Typography variant="caption" color="text.secondary">🔥 {comida.calorias} kcal • ⏰ {comida.hora}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
                          <Chip label={comida.registrado ? "Registrado ✓" : "Pendiente"} size="small" color={comida.registrado ? "success" : "default"} onClick={() => toggleComida(comida._id, comida.registrado)} />
                          <Box>
                            <IconButton onClick={() => { setEditingMeal(comida); setNewComida({ nombre: comida.nombre, descripcion: comida.descripcion, calorias: comida.calorias.toString() }); setOpenMealDialog(true); }} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => eliminarComida(comida._id, comida.nombre)} color="error" size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Panel Estadísticas */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📊 Historial de Glucosa</Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {glucosa.mediciones.slice(0, 7).map((med, idx) => {
                      let bgColor = "#4caf50";
                      if (med.valor < 70) bgColor = "#ff9800";
                      if (med.valor > 180) bgColor = "#f44336";
                      return (
                        <Paper key={idx} sx={{ p: 2, textAlign: "center", minWidth: 70, bgcolor: alpha(bgColor, 0.1), borderTop: `3px solid ${bgColor}` }}>
                          <Typography variant="caption" color="text.secondary">{format(new Date(med.fecha), "dd/MM")}</Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: bgColor }}>{med.valor}</Typography>
                        </Paper>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>🏆 Logros</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha("#4caf50", 0.1), borderRadius: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 40, color: "#4caf50" }} />
                        <Typography variant="h4">{medicamentos.filter(m => m.tomado).length}/{medicamentos.length}</Typography>
                        <Typography variant="caption">Medicamentos tomados</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha("#ff9800", 0.1), borderRadius: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 40, color: "#ff9800" }} />
                        <Typography variant="h4">{comidas.filter(c => c.registrado).length}/{comidas.length}</Typography>
                        <Typography variant="caption">Comidas registradas</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📈 Recomendaciones</Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha("#2196f3", 0.1), borderRadius: 3 }}>
                    <Typography variant="body2">
                      {getGlucosaStatus() === "Normal ✓" 
                        ? "✅ Tus niveles de glucosa están en rango normal. ¡Sigue así!" 
                        : getGlucosaStatus() === "Baja ⚠️"
                        ? "⚠️ Tus niveles de glucosa están bajos. Considera comer algo."
                        : "⚠️ Tus niveles de glucosa están altos. Recuerda tomar tu medicación."}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Diálogo de Análisis Prolog */}
        <Dialog open={openPrologDialog} onClose={() => setOpenPrologDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PsychologyIcon color="primary" /> Análisis con Prolog
          </DialogTitle>
          <DialogContent dividers>
            {analisisProlog ? (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: alpha(getAnalisisColor(analisisProlog.resultado), 0.1),
                  border: `2px solid ${getAnalisisColor(analisisProlog.resultado)}`,
                  mb: 2
                }}>
                  <Typography variant="h6" gutterBottom>
                    Resultado del análisis para {analisisProlog.valor} mg/dL
                  </Typography>
                  <Chip 
                    label={analisisProlog.resultado === "normal" ? "✅ Normal" : 
                           analisisProlog.resultado === "baja" ? "⚠️ Baja" : "⚠️ Alta"}
                    sx={{ 
                      bgcolor: getAnalisisColor(analisisProlog.resultado),
                      color: "white",
                      fontWeight: "bold",
                      mb: 2
                    }}
                  />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    <LightbulbIcon sx={{ mr: 1, verticalAlign: "middle", color: "#ff9800" }} />
                    {analisisProlog.recomendacion}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Análisis realizado: {format(new Date(analisisProlog.timestamp), "HH:mm • dd/MM/yyyy")}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Ingresa un valor de glucosa para analizar con el sistema Prolog
                </Typography>
                <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
                  <TextField
                    label="Glucosa (mg/dL)"
                    type="number"
                    value={glucosaParaAnalizar}
                    onChange={(e) => setGlucosaParaAnalizar(e.target.value)}
                    sx={{ width: 200 }}
                    InputProps={{ inputProps: { min: 40, max: 600 } }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={analizarConProlog}
                    disabled={cargandoAnalisis}
                    startIcon={cargandoAnalisis ? <CircularProgress size={20} /> : <PsychologyIcon />}
                  >
                    {cargandoAnalisis ? "Analizando..." : "Analizar"}
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                  Rango normal: 70-180 mg/dL
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrologDialog(false)}>Cerrar</Button>
            {analisisProlog && (
              <Button variant="outlined" onClick={() => {
                setAnalisisProlog(null);
                setGlucosaParaAnalizar("");
              }}>
                Nuevo Análisis
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Diálogo de Perfil */}
        <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Mi Perfil</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Nombre" value={profileForm.nombre} onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })} margin="normal" />
            <TextField fullWidth label="Edad" type="number" value={profileForm.edad} onChange={(e) => setProfileForm({ ...profileForm, edad: e.target.value })} margin="normal" />
            <TextField fullWidth label="Peso (kg)" type="number" value={profileForm.peso} onChange={(e) => setProfileForm({ ...profileForm, peso: e.target.value })} margin="normal" />
            <TextField fullWidth label="Altura (cm)" type="number" value={profileForm.altura} onChange={(e) => setProfileForm({ ...profileForm, altura: e.target.value })} margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Diabetes</InputLabel>
              <Select value={profileForm.tipoDiabetes} onChange={(e) => setProfileForm({ ...profileForm, tipoDiabetes: e.target.value })} label="Tipo de Diabetes">
                <MenuItem value="tipo1">Tipo 1</MenuItem>
                <MenuItem value="tipo2">Tipo 2</MenuItem>
                <MenuItem value="gestacional">Gestacional</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Meta de pasos diarios" type="number" value={profileForm.metaPasos} onChange={(e) => setProfileForm({ ...profileForm, metaPasos: e.target.value })} margin="normal" />
            <TextField fullWidth label="Meta de vasos de agua" type="number" value={profileForm.metaAgua} onChange={(e) => setProfileForm({ ...profileForm, metaAgua: e.target.value })} margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfileDialog(false)}>Cancelar</Button>
            <Button onClick={actualizarPerfil} variant="contained">Guardar Cambios</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo Registrar Glucosa */}
        <Dialog open={openGlucosaDialog} onClose={() => setOpenGlucosaDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Registrar Medición de Glucosa</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Glucosa (mg/dL)" type="number" value={glucosaInput} onChange={(e) => setGlucosaInput(e.target.value)} margin="normal" autoFocus />
            <Typography variant="caption" color="text.secondary">Rango normal: 70-180 mg/dL</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGlucosaDialog(false)}>Cancelar</Button>
            <Button onClick={registrarGlucosaManual} variant="contained">Registrar</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo Agregar Medicamento */}
        <Dialog open={openMedDialog} onClose={() => { setOpenMedDialog(false); setEditingMed(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingMed ? "Editar Medicamento" : "Agregar Medicamento"}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Nombre" value={newMedicamento.nombre} onChange={(e) => setNewMedicamento({ ...newMedicamento, nombre: e.target.value })} margin="normal" />
            <TextField fullWidth label="Dosis" value={newMedicamento.dosis} onChange={(e) => setNewMedicamento({ ...newMedicamento, dosis: e.target.value })} margin="normal" />
            <TextField fullWidth label="Horario" type="time" value={newMedicamento.horario} onChange={(e) => setNewMedicamento({ ...newMedicamento, horario: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenMedDialog(false); setEditingMed(null); }}>Cancelar</Button>
            <Button onClick={agregarMedicamento} variant="contained">{editingMed ? "Actualizar" : "Agregar"}</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo Agregar Comida */}
        <Dialog open={openMealDialog} onClose={() => { setOpenMealDialog(false); setEditingMeal(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingMeal ? "Editar Comida" : "Registrar Comida"}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Nombre" value={newComida.nombre} onChange={(e) => setNewComida({ ...newComida, nombre: e.target.value })} margin="normal" />
            <TextField fullWidth label="Descripción" value={newComida.descripcion} onChange={(e) => setNewComida({ ...newComida, descripcion: e.target.value })} margin="normal" multiline rows={2} />
            <TextField fullWidth label="Calorías" type="number" value={newComida.calorias} onChange={(e) => setNewComida({ ...newComida, calorias: e.target.value })} margin="normal" InputProps={{ endAdornment: "kcal" }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenMealDialog(false); setEditingMeal(null); }}>Cancelar</Button>
            <Button onClick={agregarComida} variant="contained">{editingMeal ? "Actualizar" : "Registrar"}</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo Registrar Actividad */}
        <Dialog open={openActivityDialog} onClose={() => setOpenActivityDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Registrar Actividad</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo</InputLabel>
              <Select value={newActividad.tipo} onChange={(e) => setNewActividad({ ...newActividad, tipo: e.target.value })} label="Tipo">
                <MenuItem value="caminata">🚶 Caminata</MenuItem>
                <MenuItem value="carrera">🏃 Carrera</MenuItem>
                <MenuItem value="natacion">🏊 Natación</MenuItem>
                <MenuItem value="ciclismo">🚴 Ciclismo</MenuItem>
                <MenuItem value="gimnasio">💪 Gimnasio</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Duración (minutos)" type="number" value={newActividad.duracion} onChange={(e) => setNewActividad({ ...newActividad, duracion: e.target.value })} margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActivityDialog(false)}>Cancelar</Button>
            <Button onClick={registrarActividad} variant="contained">Registrar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

      </Container>
    </Box>
  );
}