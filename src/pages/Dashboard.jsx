// Dashboard.jsx - COMPLETO con Prolog Simulado para Análisis y Asistente IA
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
  CircularProgress
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
  Logout as LogoutIcon,
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  Close as CloseIcon,
  Send as SendIcon,
  School as SchoolIcon,
  FitnessCenter as FitnessCenterIcon,
  SelfImprovement as SelfImprovementIcon,
  HealthAndSafety as HealthAndSafetyIcon
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
        <circle stroke="#e0e0e0" fill="none" strokeWidth={4} cx={size / 2} cy={size / 2} r={radius} />
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
      <Box sx={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", top: 0, left: 0, bottom: 0, right: 0 }}>
        <Typography variant="h6" component="div" fontWeight="bold">{Math.round(value)}%</Typography>
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
  const [openChatDialog, setOpenChatDialog] = useState(false);
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
  
  // Estado para el chat (ASISTENTE IA SIMULADO - NO PROLOG)
  const [chatMessages, setChatMessages] = useState([
    { text: '👋 ¡Hola! Soy tu asistente IA de GlucoControl.\n\nPregúntame sobre:\n• 📊 Glucosa: "mi glucosa es 120"\n• 🍽️ Comida: "qué debo comer"\n• 🏃 Ejercicio: "qué ejercicio hacer"\n• 💊 Medicamentos: "horario"\n• 💧 Agua: "cuánta agua debo tomar"', sender: 'bot' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
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

  // Cargar datos
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
      
      const glucosaRes = await api.get('/glucosa');
      setGlucosa({ value: glucosaRes.data.length > 0 ? glucosaRes.data[0].valor : 0, mediciones: glucosaRes.data });
      
      const medicamentosRes = await api.get('/medicamentos');
      setMedicamentos(medicamentosRes.data);
      
      const comidasRes = await api.get('/comidas');
      setComidas(comidasRes.data);
      
      const actividadRes = await api.get('/actividades');
      setActividad({
        pasos: actividadRes.data.resumen?.pasos || 0,
        minutos: actividadRes.data.resumen?.minutos || 0,
        calorias: actividadRes.data.resumen?.calorias || 0,
        metaPasos: actividadRes.data.metaPasos || 10000
      });
      
      const hidratacionRes = await api.get('/hidratacion');
      setHidratacion({ vasos: hidratacionRes.data.vasos || 0, metaVasos: hidratacionRes.data.metaVasos || 8 });
      
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ============================================
  // ANALIZAR CON PROLOG (CON REGLAS DE PROLOG)
  // ============================================
  const analizarConProlog = async () => {
    const valor = parseInt(glucosaParaAnalizar);
    if (isNaN(valor) || valor < 40 || valor > 600) {
      showMessage("⚠️ Ingresa un valor válido entre 40 y 600 mg/dL", "error");
      return;
    }

    setCargandoAnalisis(true);
    try {
      // Intentar con el backend Prolog
      const response = await api.post("/prolog/analizar", { glucosa: valor });
      const { estado, recomendacion } = response.data;

      setAnalisisProlog({
        valor: valor,
        resultado: estado || 'desconocido',
        recomendacion: recomendacion || "Sin recomendación específica",
        timestamp: new Date().toISOString(),
        modo: response.data.modo || 'backend'
      });
      
      setOpenPrologDialog(true);
      showMessage("✅ Análisis completado con éxito");
    } catch (error) {
      console.error('Error al analizar con Prolog:', error);
      
      // MODO SIMULADO CON REGLAS DE PROLOG (FALLBACK)
      const estadoLocal = valor >= 70 && valor <= 180 ? 'normal' : valor < 70 ? 'baja' : 'alta';
      
      // Recomendaciones según las reglas de Prolog
      const recs = {
        'normal': '✅ Tus niveles de glucosa están en rango normal (70-180 mg/dL). ¡Excelente trabajo! Sigue con tu dieta balanceada y ejercicio regular.',
        'baja': '⚠️ Tu glucosa está BAJA (< 70 mg/dL). Acciones inmediatas:\n• Toma jugo de fruta natural\n• Come una fruta (manzana, plátano)\n• Consume 15g de carbohidratos de absorción rápida\n• Si persiste, consulta a tu médico',
        'alta': '⚠️ Tu glucosa está ALTA (> 180 mg/dL). Acciones recomendadas:\n• Toma tu medicación a tiempo\n• Evita azúcares y carbohidratos refinados\n• Realiza ejercicio moderado (caminata 15-20 min)\n• Bebe agua para mantener hidratación\n• Si persiste, consulta a tu médico'
      };
      
      setAnalisisProlog({
        valor: valor,
        resultado: estadoLocal,
        recomendacion: recs[estadoLocal] || 'Mantén control de tu glucosa.',
        timestamp: new Date().toISOString(),
        modo: 'simulado'
      });
      setOpenPrologDialog(true);
      showMessage("⚠️ Usando modo simulado (Prolog no disponible)", "warning");
    } finally {
      setCargandoAnalisis(false);
    }
  };

  // ============================================
  // ASISTENTE IA (SIMULADO - NO PROLOG)
  // ============================================
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Intentar con el backend de IA (si existe)
      const response = await api.post('/ia/chat', { mensaje: chatInput });
      const botMessage = { text: response.data.respuesta || 'No pude procesar tu mensaje.', sender: 'bot' };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error en chat IA:', error);
      
      // RESPUESTAS SIMULADAS DEL ASISTENTE IA
      const respuestasSimuladas = {
        'glucosa': '📊 Para analizar tu glucosa, necesito el valor. Ejemplo: "mi glucosa es 120"\n\n💡 También puedes usar el botón "Análisis Prolog" para un análisis más detallado con reglas médicas.',
        'comer': '🍽️ RECOMENDACIONES DE ALIMENTACIÓN:\n✅ Alimentos recomendados:\n• Vegetales de hoja verde\n• Proteínas magras (pollo, pescado)\n• Granos integrales (quinoa, avena)\n• Frutas: manzana, pera, fresas\n\n❌ Alimentos a evitar:\n• Azúcares refinados\n• Bebidas azucaradas\n• Pan y arroz blanco',
        'ejercicio': '🏃 RECOMENDACIONES DE EJERCICIO:\n• Caminata 30 min diarios\n• Natación, ciclismo o yoga\n• Ejercicio moderado 5 días/semana\n\n💪 Consejos:\n• Monitorea tu glucosa antes y después\n• Si estás bajo, haz ejercicio ligero\n• Si estás alto, haz ejercicio moderado',
        'medicamento': '💊 HORARIO DE MEDICAMENTOS SUGERIDO:\n• 7:00 AM - Insulina (10 UI)\n• 8:00 AM - Metformina (500mg)\n• 8:00 PM - Metformina (500mg)\n• 7:00 PM - Insulina (10 UI)\n\n⚠️ Consulta a tu médico para ajustes específicos.',
        'agua': '💧 RECOMENDACIÓN DE HIDRATACIÓN:\n• Bebe 8-10 vasos de agua al día\n• 2-2.5 litros diarios\n• Evita bebidas azucaradas\n• El agua ayuda a controlar la glucosa\n\n💡 Lleva siempre una botella de agua contigo.',
        'educación': '📚 EDUCACIÓN PARA LA DIABETES:\n• Conoce tus niveles de glucosa\n• Aprende a contar carbohidratos\n• Identifica síntomas de hipoglucemia\n• Planifica tus comidas\n• Mantén un registro diario\n• Revisa tus pies diariamente\n• Mantén tu peso saludable\n• No saltes comidas\n• Duerme 7-8 horas',
        'ejercicio_fisico': '🏃 EDUCACIÓN FÍSICA:\n• 30 minutos de actividad física moderada\n• 5 días a la semana\n• Incluye ejercicios de fuerza 2 veces/semana\n\nRUTINA SEMANAL SUGERIDA:\n• Lunes: Caminata 30 min\n• Martes: Yoga 30 min\n• Miércoles: Natación 30 min\n• Jueves: Pesas 20 min\n• Viernes: Caminata rápida 20 min\n• Sábado: Ciclismo 30 min\n• Domingo: Descanso activo'
      };
      
      let respuesta = '🤔 No entendí tu pregunta.\n\nPregúntame sobre:\n• 📊 Glucosa: "mi glucosa es 120"\n• 🍽️ Comida: "qué debo comer"\n• 🏃 Ejercicio: "qué ejercicio hacer"\n• 💊 Medicamentos: "horario"\n• 💧 Agua: "cuánta agua debo tomar"\n• 📚 Educación: "consejos para diabetes"';
      
      const msgLower = chatInput.toLowerCase();
      
      // Detectar palabras clave
      if (msgLower.includes('glucosa') || msgLower.includes('azúcar')) {
        respuesta = respuestasSimuladas['glucosa'];
      } else if (msgLower.includes('comer') || msgLower.includes('comida') || msgLower.includes('alimento')) {
        respuesta = respuestasSimuladas['comer'];
      } else if (msgLower.includes('ejercicio') || msgLower.includes('actividad') || msgLower.includes('deporte')) {
        respuesta = respuestasSimuladas['ejercicio'];
      } else if (msgLower.includes('medicamento') || msgLower.includes('horario')) {
        respuesta = respuestasSimuladas['medicamento'];
      } else if (msgLower.includes('agua') || msgLower.includes('hidratación')) {
        respuesta = respuestasSimuladas['agua'];
      } else if (msgLower.includes('educación') || msgLower.includes('consejo') || msgLower.includes('aprender')) {
        respuesta = respuestasSimuladas['educación'];
      } else if (msgLower.includes('física') || msgLower.includes('fisica') || msgLower.includes('rutina')) {
        respuesta = respuestasSimuladas['ejercicio_fisico'];
      }
      
      const botMessage = { text: respuesta, sender: 'bot' };
      setChatMessages(prev => [...prev, botMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // ============================================
  // CRUD Y OTRAS FUNCIONES
  // ============================================
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
      showMessage('Error al registrar glucosa', 'error');
    }
  };

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
      showMessage('Error al guardar medicamento', 'error');
    }
  };

  const eliminarMedicamento = async (id, nombre) => {
    try {
      await api.delete(`/medicamentos/${id}`);
      await cargarDatos();
      showMessage(`🗑️ ${nombre} eliminado`, "error");
    } catch (error) {
      showMessage('Error al eliminar medicamento', 'error');
    }
  };

  const toggleMedicamento = async (id, tomado) => {
    try {
      await api.put(`/medicamentos/${id}`, { tomado: !tomado });
      await cargarDatos();
      const med = medicamentos.find(m => m._id === id);
      showMessage(`💊 ${med?.nombre} ${!tomado ? "marcado como tomado" : "marcado como pendiente"}`);
    } catch (error) {
      showMessage('Error al actualizar medicamento', 'error');
    }
  };

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
      showMessage('Error al guardar comida', 'error');
    }
  };

  const eliminarComida = async (id, nombre) => {
    try {
      await api.delete(`/comidas/${id}`);
      await cargarDatos();
      showMessage(`🗑️ ${nombre} eliminado`, "error");
    } catch (error) {
      showMessage('Error al eliminar comida', 'error');
    }
  };

  const toggleComida = async (id, registrado) => {
    try {
      await api.put(`/comidas/${id}`, { registrado: !registrado });
      await cargarDatos();
    } catch (error) {
      showMessage('Error al actualizar comida', 'error');
    }
  };

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
      showMessage('Error al registrar actividad', 'error');
    }
  };

  const registrarVasoAgua = async () => {
    try {
      await api.post('/hidratacion/vaso');
      await cargarDatos();
      showMessage("💧 ¡Vaso de agua registrado!");
    } catch (error) {
      showMessage('Error al registrar vaso', 'error');
    }
  };

  const actualizarPerfil = async () => {
    try {
      await api.put('/auth/profile', profileForm);
      await cargarDatos();
      setOpenProfileDialog(false);
      showMessage('✅ Perfil actualizado correctamente');
    } catch (error) {
      showMessage('Error al actualizar perfil', 'error');
    }
  };

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

  const getAnalisisColor = (estado) => {
    if (estado === "normal") return "#4caf50";
    if (estado === "baja") return "#ff9800";
    if (estado === "alta") return "#f44336";
    return "#1976d2";
  };

  const porcentajeProgreso = Math.min((actividad.pasos / actividad.metaPasos) * 100, 100);
  const porcentajeHidratacion = Math.min((hidratacion.vasos / hidratacion.metaVasos) * 100, 100);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      
      {/* ========================================== */}
      {/* APP BAR */}
      {/* ========================================== */}
      <AppBar position="sticky" sx={{ bgcolor: "#1976d2", boxShadow: 3 }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>GlucoControl</Typography>
          
          <Tooltip title="Análisis con reglas Prolog">
            <Button variant="contained" onClick={() => setOpenPrologDialog(true)} sx={{ mr: 1, bgcolor: "#ffffff", color: "#1976d2", '&:hover': { bgcolor: "#e3f2fd" } }} startIcon={<PsychologyIcon />}>Analizar</Button>
          </Tooltip>

          <Tooltip title="Asistente IA (Simulado)">
            <Button variant="contained" onClick={() => setOpenChatDialog(true)} sx={{ mr: 1, bgcolor: "#ffffff", color: "#1976d2", '&:hover': { bgcolor: "#e3f2fd" } }} startIcon={<SmartToyIcon />}>Asistente</Button>
          </Tooltip>
          
          <Tooltip title="Notificaciones">
            <IconButton color="inherit">
              <Badge badgeContent={medicamentos.filter(m => !m.tomado).length + comidas.filter(c => !c.registrado).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Mi Perfil">
            <IconButton color="inherit" onClick={() => setOpenProfileDialog(true)}><PersonIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Cerrar Sesión">
            <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        {/* ========================================== */}
        {/* HEADER */}
        {/* ========================================== */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)", color: "white", boxShadow: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>¡Hola {usuario?.nombre || "Usuario"}! 👋</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {medicamentos.filter(m => !m.tomado).length + comidas.filter(c => !c.registrado).length > 0 
                  ? `Tienes ${medicamentos.filter(m => !m.tomado).length + comidas.filter(c => !c.registrado).length} tareas pendientes` 
                  : "¡Todo al día! Buen trabajo"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="contained" onClick={() => setOpenPrologDialog(true)} sx={{ bgcolor: "#ffffff", color: "#1976d2", fontWeight: "bold", '&:hover': { bgcolor: "#e3f2fd", transform: "scale(1.05)" } }} startIcon={<PsychologyIcon />}>Análisis Prolog</Button>
              <Button variant="contained" onClick={() => setOpenChatDialog(true)} sx={{ bgcolor: "#ffffff", color: "#1976d2", fontWeight: "bold", '&:hover': { bgcolor: "#e3f2fd", transform: "scale(1.05)" } }} startIcon={<SmartToyIcon />}>Asistente IA</Button>
            </Box>
          </Box>
        </Paper>

        {/* ========================================== */}
        {/* TABS */}
        {/* ========================================== */}
        <Paper sx={{ borderRadius: 4, mb: 3, boxShadow: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
            <Tab icon={<DashboardIcon />} label="Resumen" />
            <Tab icon={<MedicationIcon />} label="Medicamentos" />
            <Tab icon={<RestaurantIcon />} label="Comidas" />
            <Tab icon={<BarChartIcon />} label="Estadísticas" />
            <Tab icon={<FitnessCenterIcon />} label="Ejercicio" />
            <Tab icon={<SchoolIcon />} label="Educación" />
          </Tabs>
        </Paper>

        {/* ========================================== */}
        {/* TAB 0: RESUMEN */}
        {/* ========================================== */}
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
                    <Avatar sx={{ bgcolor: getGlucosaColor(), width: 70, height: 70 }}><FavoriteIcon sx={{ fontSize: 40 }} /></Avatar>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button fullWidth variant="contained" onClick={() => setOpenGlucosaDialog(true)}>Registrar Manual</Button>
                    <Button fullWidth variant="outlined" onClick={() => setOpenPrologDialog(true)}>Analizar</Button>
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
                  <Button fullWidth variant="outlined" onClick={() => setOpenActivityDialog(true)} sx={{ mt: 2 }} startIcon={<AddIcon />}>Registrar Actividad</Button>
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
                  <Button fullWidth variant="contained" onClick={registrarVasoAgua} startIcon={<WaterDropIcon />}>+ Vaso de Agua</Button>
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
                      {medicamentos.slice(0, 3).map((med) => (
                        <Paper key={med._id} sx={{ p: 1.5, mb: 1, bgcolor: alpha("#43a047", med.tomado ? 0.1 : 0.05) }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">{med.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">{med.dosis} • {med.horario}</Typography>
                            </Box>
                            <Button size="small" variant={med.tomado ? "contained" : "outlined"} color={med.tomado ? "success" : "warning"} onClick={() => toggleMedicamento(med._id, med.tomado)}>
                              {med.tomado ? "Tomado ✓" : "Pendiente"}
                            </Button>
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
                      {comidas.slice(0, 3).map((comida) => (
                        <Paper key={comida._id} sx={{ p: 1.5, mb: 1, bgcolor: alpha("#ff9800", 0.05) }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold">{comida.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">{comida.calorias} kcal</Typography>
                            </Box>
                            <Chip label={comida.registrado ? "Registrado ✓" : "Pendiente"} size="small" color={comida.registrado ? "success" : "default"} onClick={() => toggleComida(comida._id, comida.registrado)} />
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

        {/* ========================================== */}
        {/* TAB 1: MEDICAMENTOS */}
        {/* ========================================== */}
        {activeTab === 1 && (
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MedicationIcon color="primary" /> Mis Medicamentos
                </Typography>
                <Button variant="contained" onClick={() => { setEditingMed(null); setNewMedicamento({ nombre: "", dosis: "", horario: "08:00" }); setOpenMedDialog(true); }} startIcon={<AddIcon />}>Agregar</Button>
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
                            <IconButton onClick={() => { setEditingMed(med); setNewMedicamento({ nombre: med.nombre, dosis: med.dosis, horario: med.horario }); setOpenMedDialog(true); }} size="small"><EditIcon fontSize="small" /></IconButton>
                            <IconButton onClick={() => eliminarMedicamento(med._id, med.nombre)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
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

        {/* ========================================== */}
        {/* TAB 2: COMIDAS */}
        {/* ========================================== */}
        {activeTab === 2 && (
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RestaurantIcon color="warning" /> Mis Comidas
                </Typography>
                <Button variant="contained" onClick={() => { setEditingMeal(null); setNewComida({ nombre: "", descripcion: "", calorias: "" }); setOpenMealDialog(true); }} startIcon={<AddIcon />}>Registrar</Button>
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
                            <IconButton onClick={() => { setEditingMeal(comida); setNewComida({ nombre: comida.nombre, descripcion: comida.descripcion, calorias: comida.calorias.toString() }); setOpenMealDialog(true); }} size="small"><EditIcon fontSize="small" /></IconButton>
                            <IconButton onClick={() => eliminarComida(comida._id, comida.nombre)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
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

        {/* ========================================== */}
        {/* TAB 3: ESTADÍSTICAS */}
        {/* ========================================== */}
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

        {/* ========================================== */}
        {/* TAB 4: EJERCICIO / EDUCACIÓN FÍSICA */}
        {/* ========================================== */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FitnessCenterIcon color="primary" /> Ejercicio Recomendado
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha("#1e88e5", 0.05), borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {`🏃 RUTINA SEMANAL SUGERIDA:
• Lunes: Caminata 30 min
• Martes: Yoga 30 min
• Miércoles: Natación 30 min
• Jueves: Pesas 20 min
• Viernes: Caminata rápida 20 min
• Sábado: Ciclismo 30 min
• Domingo: Descanso activo`}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SelfImprovementIcon color="warning" /> Consejos de Ejercicio
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha("#ff9800", 0.05), borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {`💪 CONSEJOS:
• 30 minutos de actividad física moderada
• 5 días a la semana
• Incluye ejercicios de fuerza 2 veces/semana
• Monitorea tu glucosa antes y después
• Si estás bajo, haz ejercicio ligero
• Si estás alto, haz ejercicio moderado`}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📊 Tu Actividad</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha("#1e88e5", 0.1), borderRadius: 3 }}>
                        <Typography variant="h3" fontWeight="bold" color="#1e88e5">{actividad.pasos}</Typography>
                        <Typography variant="caption">Pasos de hoy</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha("#ff9800", 0.1), borderRadius: 3 }}>
                        <Typography variant="h3" fontWeight="bold" color="#ff9800">{actividad.minutos}</Typography>
                        <Typography variant="caption">Minutos activos</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha("#4caf50", 0.1), borderRadius: 3 }}>
                        <Typography variant="h3" fontWeight="bold" color="#4caf50">{actividad.calorias}</Typography>
                        <Typography variant="caption">Calorías quemadas</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ========================================== */}
        {/* TAB 5: EDUCACIÓN */}
        {/* ========================================== */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SchoolIcon color="primary" /> Educación para la Diabetes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha("#1976d2", 0.05), borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {`📚 CONOCE TU DIABETES:
• Conoce tus niveles de glucosa
• Aprende a contar carbohidratos
• Identifica síntomas de hipoglucemia
• Planifica tus comidas
• Mantén un registro diario`}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HealthAndSafetyIcon color="warning" /> Autocuidado
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha("#4caf50", 0.05), borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {`💚 CONSEJOS DE AUTOCUIDADO:
• Revisa tus pies diariamente
• Mantén tu peso saludable
• No saltes comidas
• Duerme 7-8 horas
• Maneja el estrés
• Mantén un peso saludable
• Realiza ejercicio regular`}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📋 Recomendaciones Nutricionales</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: alpha("#4caf50", 0.1), borderRadius: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#4caf50">✅ Alimentos Recomendados</Typography>
                        <Typography variant="body2">
                          • Vegetales de hoja verde
                          • Proteínas magras (pollo, pescado)
                          • Granos integrales (quinoa, avena)
                          • Frutas: manzana, pera, fresas
                          • Nueces y semillas
                          • Legumbres y frijoles
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: alpha("#f44336", 0.1), borderRadius: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#f44336">❌ Alimentos a Evitar</Typography>
                        <Typography variant="body2">
                          • Azúcares refinados
                          • Bebidas azucaradas
                          • Pan y arroz blanco
                          • Pastas refinadas
                          • Dulces y postres
                          • Comidas procesadas
                          • Frituras
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ========================================== */}
        {/* DIÁLOGO: ANÁLISIS PROLOG */}
        {/* ========================================== */}
        <Dialog open={openPrologDialog} onClose={() => setOpenPrologDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PsychologyIcon color="primary" /> Análisis con Prolog
          </DialogTitle>
          <DialogContent dividers>
            {analisisProlog ? (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha(getAnalisisColor(analisisProlog.resultado), 0.1), border: `2px solid ${getAnalisisColor(analisisProlog.resultado)}`, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Resultado para {analisisProlog.valor} mg/dL</Typography>
                  <Chip 
                    label={analisisProlog.resultado === "normal" ? "✅ Normal" : analisisProlog.resultado === "baja" ? "⚠️ Baja" : "⚠️ Alta"} 
                    sx={{ bgcolor: getAnalisisColor(analisisProlog.resultado), color: "white", fontWeight: "bold", mb: 2 }} 
                  />
                  <Typography variant="body1" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                    <LightbulbIcon sx={{ mr: 1, verticalAlign: "middle", color: "#ff9800" }} />
                    {analisisProlog.recomendacion}
                  </Typography>
                  {analisisProlog.modo === 'simulado' && (
                    <Chip label="Modo simulado" size="small" sx={{ mt: 1, bgcolor: "#ff9800", color: "white" }} />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">Análisis: {format(new Date(analisisProlog.timestamp), "HH:mm • dd/MM/yyyy")}</Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>Ingresa un valor de glucosa para analizar con las reglas de Prolog</Typography>
                <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
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
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>Rango normal: 70-180 mg/dL</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Reglas Prolog: normal (70-180) • baja (&lt;70) • alta (&gt;180)
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrologDialog(false)}>Cerrar</Button>
            {analisisProlog && (
              <Button variant="outlined" onClick={() => { setAnalisisProlog(null); setGlucosaParaAnalizar(""); }}>Nuevo Análisis</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* ========================================== */}
        {/* DIÁLOGO: ASISTENTE IA (SIMULADO - NO PROLOG) */}
        {/* ========================================== */}
        <Dialog open={openChatDialog} onClose={() => setOpenChatDialog(false)} maxWidth="md" fullWidth fullScreen={window.innerWidth < 600}>
          <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SmartToyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Asistente IA - GlucoControl</Typography>
            </Box>
            <IconButton color="inherit" onClick={() => setOpenChatDialog(false)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '500px' }}>
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
              {chatMessages.map((msg, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                  <Paper sx={{ p: 2, maxWidth: '70%', bgcolor: msg.sender === 'user' ? '#1976d2' : '#f0f4f8', color: msg.sender === 'user' ? 'white' : 'text.primary', borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', whiteSpace: 'pre-wrap' }}>
                    <Typography variant="body1">{msg.text}</Typography>
                  </Paper>
                </Box>
              ))}
              {chatLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: '#f0f4f8', borderRadius: '18px 18px 18px 4px' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">Pensando...</Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  fullWidth 
                  placeholder="Escribe tu mensaje..." 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyPress={handleChatKeyPress} 
                  multiline 
                  maxRows={3} 
                  variant="outlined" 
                  disabled={chatLoading} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
                />
                <IconButton 
                  color="primary" 
                  onClick={sendChatMessage} 
                  disabled={chatLoading || !chatInput.trim()} 
                  sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0', transform: 'scale(1.05)' }, '&:disabled': { bgcolor: '#ccc', transform: 'none' }, width: 48, height: 48, borderRadius: 3, transition: 'transform 0.2s' }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* ========================================== */}
        {/* DIÁLOGOS CRUD */}
        {/* ========================================== */}
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
            <TextField fullWidth label="Meta de pasos" type="number" value={profileForm.metaPasos} onChange={(e) => setProfileForm({ ...profileForm, metaPasos: e.target.value })} margin="normal" />
            <TextField fullWidth label="Meta de vasos de agua" type="number" value={profileForm.metaAgua} onChange={(e) => setProfileForm({ ...profileForm, metaAgua: e.target.value })} margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfileDialog(false)}>Cancelar</Button>
            <Button onClick={actualizarPerfil} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openGlucosaDialog} onClose={() => setOpenGlucosaDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Registrar Glucosa</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Glucosa (mg/dL)" type="number" value={glucosaInput} onChange={(e) => setGlucosaInput(e.target.value)} margin="normal" autoFocus />
            <Typography variant="caption" color="text.secondary">Rango normal: 70-180 mg/dL</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGlucosaDialog(false)}>Cancelar</Button>
            <Button onClick={registrarGlucosaManual} variant="contained">Registrar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openMedDialog} onClose={() => { setOpenMedDialog(false); setEditingMed(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingMed ? "Editar" : "Agregar"} Medicamento</DialogTitle>
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

        <Dialog open={openMealDialog} onClose={() => { setOpenMealDialog(false); setEditingMeal(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>{editingMeal ? "Editar" : "Registrar"} Comida</DialogTitle>
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
                <MenuItem value="yoga">🧘 Yoga</MenuItem>
                <MenuItem value="deporte">⛹️ Deporte</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Duración (minutos)" type="number" value={newActividad.duracion} onChange={(e) => setNewActividad({ ...newActividad, duracion: e.target.value })} margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActivityDialog(false)}>Cancelar</Button>
            <Button onClick={registrarActividad} variant="contained">Registrar</Button>
          </DialogActions>
        </Dialog>

        {/* ========================================== */}
        {/* SNACKBAR */}
        {/* ========================================== */}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

      </Container>
    </Box>
  );
}