import {
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  Box,
  Fade,
  useTheme,
  alpha
} from "@mui/material";
import {
  CloudDone as CloudIcon,
  Speed as SpeedIcon,
  FitnessCenter as FitnessIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";

// Animaciones chidas
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(1.05); opacity: 1; }
`;

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    { icon: <SpeedIcon fontSize="large" />, title: "Monitoreo en Tiempo Real", desc: "Registra y analiza tu glucosa al instante" },
    { icon: <FitnessIcon fontSize="large" />, title: "Actividad Física", desc: "Registra tus ejercicios y mejora tu salud" },
    { icon: <LightbulbIcon fontSize="large" />, title: "Recomendaciones IA", desc: "Consejos personalizados inteligentes" },
    { icon: <CloudIcon fontSize="large" />, title: "Nube Segura", desc: "Tus datos siempre disponibles y protegidos" }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          animation: `${float} 20s linear infinite`,
          opacity: 0.3
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        
        {/* Hero Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: "center", pt: { xs: 8, md: 12 }, mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "3rem", md: "5rem" },
                background: "linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                mb: 2,
                animation: `${pulse} 3s ease-in-out infinite`
              }}
            >
              GlucoControl
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "white",
                mb: 2,
                fontWeight: 500,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              🤖 Asistente Virtual para el Control de la Diabetes
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: alpha("#fff", 0.9),
                maxWidth: "600px",
                mx: "auto",
                fontSize: "1.1rem",
                mb: 4
              }}
            >
              Monitorea tu glucosa, registra tu actividad física,
              recibe recordatorios y obtén recomendaciones
              inteligentes mediante IA.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
                endIcon={<ArrowIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  backgroundColor: "white",
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha("#fff", 0.9),
                    transform: "translateY(-2px)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Iniciar Sesión
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: alpha("#fff", 0.1),
                    transform: "translateY(-2px)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Registrarse
              </Button>
            </Stack>
          </Box>
        </Fade>

        {/* Features Grid */}
        <Fade in timeout={1500}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ mt: 8, pb: 8 }}
            justifyContent="center"
          >
            {features.map((feature, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  flex: 1,
                  textAlign: "center",
                  background: alpha("#fff", 0.95),
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    background: "white"
                  }
                }}
              >
                <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Fade>

        {/* CTA Banner */}
        <Fade in timeout={2000}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mt: 4,
              mb: 8,
              textAlign: "center",
              background: alpha("#000", 0.3),
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              border: `1px solid ${alpha("#fff", 0.2)}`
            }}
          >
            <Typography variant="body1" sx={{ color: "white", mb: 2 }}>
              🌟 Únete a más de 10,000 personas que ya controlan su diabetes con GlucoControl
            </Typography>
            <Typography variant="caption" sx={{ color: alpha("#fff", 0.7) }}>
              ¡Es gratis y siempre lo será! 🎉
            </Typography>
          </Paper>
        </Fade>

      </Container>
    </Box>
  );
}