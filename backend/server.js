import express from "express";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

// Google OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://cursojs-8012.onrender.com/oauth2callback"
);

// 🔹 Redireciona direto para login Google
app.get("/auth-url", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ],
    prompt: "consent"
  });
  res.redirect(url); // ❌ Redirecionamento direto
});

// 🔹 Callback do Google
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.send(`
      <script>
        window.opener.postMessage({ googleToken: ${JSON.stringify(tokens)} }, "*");
        window.close();
      </script>
    `);
  } catch (err) {
    console.error("Erro ao trocar code por token:", err);
    res.status(500).send("Erro na autenticação");
  }
});

// 🔹 Salvar arquivo no Drive
app.post("/save", async (req, res) => {
  try {
    const { token, filename, content } = req.body;
    if (!token) return res.status(401).json({ success: false, error: "Token ausente" });

    oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileMetadata = { name: filename };
    const media = { mimeType: "application/json", body: JSON.stringify(content) };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id"
    });

    res.json({ success: true, fileId: response.data.id });
  } catch (err) {
    console.error("Erro ao enviar arquivo para o Drive:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Obter informações do usuário (email e avatar)
app.post("/userinfo", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).send("Token ausente");

    oAuth2Client.setCredentials(token);
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const userinfo = await oauth2.userinfo.get();

    res.json(userinfo.data);
  } catch (err) {
    console.error("Erro ao obter usuário:", err);
    res.status(500).send("Erro ao obter usuário");
  }
});

// 🔹 Inicialização do servidor
app.listen(PORT, () => console.log(`✅ Server rodando em http://localhost:${PORT}`));
