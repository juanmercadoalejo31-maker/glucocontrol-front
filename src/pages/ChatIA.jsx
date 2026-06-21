import { useState } from "react";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";

import api from "../services/api";

export default function ChatIA() {

  const [mensaje, setMensaje] = useState("");

  const [respuesta, setRespuesta] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const enviarPregunta = async () => {

    if (!mensaje.trim()) {

      setError(
        "Escribe una pregunta"
      );

      return;

    }

    try {

      setLoading(true);

      setError("");

      setRespuesta("");

      console.log(
        "📤 Enviando:",
        mensaje
      );

      const res = await api.post(
        "/ia/chat",
        {
          mensaje
        }
      );

      console.log(
        "📥 Respuesta:",
        res.data
      );

      setRespuesta(
        res.data.respuesta
      );

    } catch (err) {

      console.error(
        "❌ Error:",
        err
      );

      setError(

        err.response?.data?.mensaje ||

        err.message ||

        "Error al consultar la IA"

      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <Container
      maxWidth="md"
      sx={{ mt: 4 }}
    >

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4
        }}
      >

        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
        >
          🤖 Asistente IA
        </Typography>

        <Typography
          color="text.secondary"
          mb={3}
        >
          Pregunta sobre diabetes,
          alimentación, actividad física,
          medicamentos o hidratación.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Escribe tu pregunta"
          value={mensaje}
          onChange={(e) =>
            setMensaje(
              e.target.value
            )
          }
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={enviarPregunta}
          disabled={loading}
        >

          {
            loading
            ? (
              <CircularProgress
                size={24}
              />
            )
            : "Preguntar"
          }

        </Button>

        {
          error && (

            <Alert
              severity="error"
              sx={{ mt: 3 }}
            >

              {error}

            </Alert>

          )
        }

        {
          respuesta && (

            <Paper
              sx={{
                mt: 3,
                p: 3,
                bgcolor: "#f5f5f5"
              }}
            >

              <Typography
                variant="h6"
                gutterBottom
              >
                Respuesta
              </Typography>

              <Typography>

                {respuesta}

              </Typography>

            </Paper>

          )
        }

      </Paper>

    </Container>

  );

}