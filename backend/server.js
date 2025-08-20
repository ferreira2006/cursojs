import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend"))); // pasta frontend

// Google OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://cursojs-8012.onrender.com/oauth2callback" // Redirect URI configurado no console do Google
);

// 🔹 Gera a URL de login do Google
app.get("/auth-url", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent"
  });
  res.json({ url });
});

// 🔹 Callback do Google (troca code por token)
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Redireciona para página estática com token
    res.redirect(
      `/success.html?token=${encodeURIComponent(JSON.stringify(tokens))}`
    );
  } catch (err) {
    console.error("Erro ao trocar code por token:", err);
    res.status(500).send("Erro na autenticação");
  }
});

// 🔹 Exemplo de rota para salvar no Drive
app.post("/upload", async (req, res) => {
  try {
    const { token, filename, data } = req.body;
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileMetadata = { name: filename };
    const media = {
      mimeType: "application/json",
      body: JSON.stringify(data)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: { mimeType: media.mimeType, body: media.body },
      fields: "id"
    });

    res.json({ fileId: response.data.id });
  } catch (err) {
    console.error("Erro ao enviar arquivo para o Drive:", err);
    res.status(500).send("Erro no upload");
  }
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`✅ Server rodando em http://localhost:${PORT}`);
});
