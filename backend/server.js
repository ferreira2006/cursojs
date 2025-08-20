const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:5500', credentials: true })); // front-end na porta 5500
app.use(bodyParser.json());
app.use(session({ secret: 'checklist_secret', resave: false, saveUninitialized: true }));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Login / autenticação
app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  res.redirect(url);
});

// Callback do OAuth2
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  req.session.tokens = tokens;
  oauth2Client.setCredentials(tokens);
  res.send('Login realizado! Feche essa aba e volte ao checklist.');
});

// Salvar checklist no Drive
app.post('/save', async (req, res) => {
  try {
    if (!req.session.tokens) return res.status(401).json({ error: 'Usuário não logado' });
    oauth2Client.setCredentials(req.session.tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata = { name: 'checklist.json' };
    const media = { mimeType: 'application/json', body: JSON.stringify(req.body.data) };

    // Procura arquivo existente
    const existing = await drive.files.list({ q: "name='checklist.json'" });
    if (existing.data.files.length > 0) {
      await drive.files.update({ fileId: existing.data.files[0].id, media });
    } else {
      await drive.files.create({ resource: fileMetadata, media });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar no Google Drive' });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
