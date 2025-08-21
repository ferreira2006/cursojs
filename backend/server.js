import express from "express";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
app.use(express.json());

// Google OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI || "https://cursojs-8012.onrender.com/oauth2callback"
);

// 🔹 URL de login
app.get("/auth-url", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent"
  });
  res.json({ url });
});

// 🔹 Callback Google
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Código não fornecido");

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Redireciona para success.html com token
    res.redirect(`/success.html?token=${encodeURIComponent(JSON.stringify(tokens))}`);
  } catch (err) {
    console.error("Erro OAuth2:", err);
    res.status(500).send("Erro na autenticação");
  }
});

// 🔹 Salvar arquivo no Drive
app.post("/save", async (req, res) => {
  try {
    const { token, filename, content } = req.body;
    if (!token || !filename || !content) return res.status(400).json({ success: false, error: "Parâmetros faltando" });

    oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const response = await drive.files.create({
      requestBody: { name: filename },
      media: { mimeType: "application/json", body: JSON.stringify(content) },
      fields: "id"
    });

    res.json({ success: true, fileId: response.data.id });
  } catch (err) {
    console.error("Erro ao salvar no Drive:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server rodando em http://localhost:${PORT}`));
