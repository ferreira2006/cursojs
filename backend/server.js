// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { google } from 'googleapis';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PORT = process.env.PORT || 5000;
// Corrigido para OAuth funcionar corretamente
const REDIRECT_URI = `https://cursojs-8012.onrender.com/oauth2callback`;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// --- URL de login OAuth ---
app.get('/auth-url', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  res.json({ url });
});

// --- Callback OAuth ---
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('Erro: código não fornecido');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // Redireciona para frontend com token
    res.redirect(`/?token=${encodeURIComponent(JSON.stringify(tokens))}`);
  } catch (err) {
    console.error(err);
    res.send('Erro ao trocar código pelo token');
  }
});

// --- Salvar dados no Google Drive ---
app.post('/save', async (req, res) => {
  try {
    const { token, filename, content } = req.body;
    if (!token || !filename || !content)
      return res.status(400).json({ error: 'Token, filename e content são obrigatórios' });

    oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const fileMetadata = { name: filename };
    const media = { mimeType: 'application/json', body: JSON.stringify(content) };

    const existing = await drive.files.list({
      q: `name='${filename}' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (existing.data.files.length) {
      await drive.files.update({ fileId: existing.data.files[0].id, media });
    } else {
      await drive.files.create({ resource: fileMetadata, media });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar no Google Drive.' });
  }
});

// --- Carregar dados do Google Drive ---
app.post('/load', async (req, res) => {
  try {
    const { token, filename } = req.body;
    if (!token || !filename)
      return res.status(400).json({ error: 'Token e filename são obrigatórios.' });

    oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const files = await drive.files.list({
      q: `name='${filename}' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (!files.data.files.length)
      return res.status(404).json({ error: 'Arquivo não encontrado.' });

    const fileId = files.data.files[0].id;
    const response = await drive.files.get({ fileId, alt: 'media' });
    res.json({ content: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar do Google Drive.' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
