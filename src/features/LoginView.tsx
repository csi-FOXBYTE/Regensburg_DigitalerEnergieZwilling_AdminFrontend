import { useAuth } from "@/components/AuthContext";
import theme from "@/theme/theme";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.error.dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 440, width: "100%", mx: 2 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/de/thumb/6/6a/Regensburg_Logo.svg/960px-Regensburg_Logo.svg.png"
            alt="Stadt Regensburg Logo"
            sx={{ height: 56, width: "auto" }}
          />
          <Typography variant="h2">
            <Box sx={{ color: "error.main" }}>Digitaler Energie Zwilling</Box>
          </Typography>
          <Typography variant="body1" mt={2}>
            Verwaltungsplattform für Stadtverwalter
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={5}>
            <TextField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              size="small"
              variant="standard"
              slotProps={{
                input: {
                  sx: {
                    fontSize: 16,
                  },
                },
              }}
            />
            <TextField
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              size="small"
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              sx={{ bgcolor: theme.palette.error.main }}
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Anmelden"
              )}
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 1.5,
            bgcolor: "grey.50",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography variant="body2" display="block" gutterBottom>
            Demo-Zugangsdaten (Passwort: <strong>password</strong>):
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
            onClick={() => setEmail("max.mueller@example.com")}
          >
            max.mueller@example.com — Max Müller
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
            onClick={() => setEmail("anna.schmidt@example.com")}
          >
            anna.schmidt@example.com — Anna Schmidt
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
