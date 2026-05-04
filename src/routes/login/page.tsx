import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { useAuth } from "@/components/AuthContext";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

function LoginPage() {
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
        bgcolor: "grey.100",
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
          <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>
            <Box component="span" sx={{ color: "error.main" }}>
              Digitaler Energie Zwilling
            </Box>
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Gebäude-Triage · Anmelden
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              size="small"
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
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Anmelden"}
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
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
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
