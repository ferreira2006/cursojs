// backend.js
import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

// 🔑 Pegando variáveis de ambiente definidas no Render
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PORT = process.env.PORT || 3000;

// ⚠️ Redirecionamento precisa estar configurado no Google Cloud Console
const REDIRECT_URI = `https://seuapp.onrender.com/oauth2callback`;

let TOKENS = null;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// 🔗 URL de autenticação
app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
  res.send(`<a href="${url}">Conectar ao Google Drive</a>`);
});

// 🔄 Callback OAuth
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    TOKENS = tokens;
    res.send("✅ Autenticado com sucesso! Pode fechar esta aba.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro na autenticação");
  }
});

// 💾 Salvar arquivo no Google Drive
app.post("/salvar", async (req, res) => {
  if (!TOKENS) return res.status(401).send("Não autenticado no Google");

  oauth2Client.setCredentials(TOKENS);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const fileMetadata = { name: "cursojs-dados.json" };
    const media = {
      mimeType: "application/json",
      body: JSON.stringify(req.body),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });

    res.json({ fileId: response.data.id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao salvar no Google Drive");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
