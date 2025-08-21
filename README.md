# Checklist de Estudos - JavaScript Avançado

Este projeto é um **Checklist de estudos JavaScript Avançado** com integração ao Google Drive, exportação de JSON/PDF/Calendário, modo revisão, progresso e badges.

---

## Estrutura de arquivos

O projeto possui os seguintes arquivos principais:

- `index.html` → Front-end completo (v4.3), responsivo e interativo.  
- `server.js` → Backend Node.js com Google OAuth e integração com Google Drive.  
- `success.html` → Página intermediária para login Google.  
- `package.json` → Dependências e scripts para rodar o projeto.  
- `README.md` → Este arquivo com instruções.

---

## Requisitos

- Node.js v18 ou superior.  
- Conta Google para testes de OAuth2.  
- Navegador moderno para executar o front-end.

---

## Configuração local

1. Clone o repositório:  
   ```bash
   git clone https://github.com/seu-usuario/curso-js-checklist.git
   cd curso-js-checklist
   ```
2. Instale as dependências:  
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente criando um arquivo `.env` ou definindo no seu sistema:

```
CLIENT_ID=seu_client_id_google
CLIENT_SECRET=seu_client_secret_google
```

> Observação: o Redirect URI deve ser `https://cursojs-8012.onrender.com/oauth2callback` para produção ou `http://localhost:5000/oauth2callback` para testes locais.

4. Rodar o projeto localmente:  
   - `npm run dev` → modo desenvolvimento com reload automático (nodemon)  
   - `npm start` → modo produção  

5. Abra no navegador:  
   ```
   http://localhost:5000
   ```

---

## Deploy no Render

1. Crie um novo serviço Web no Render, apontando para seu repositório GitHub.  
2. Configure as variáveis de ambiente `CLIENT_ID` e `CLIENT_SECRET`.  
3. Build command: `npm install`  
4. Start command: `npm start`  
5. Acesse a URL fornecida pelo Render para testar o app online.

---

## Funcionalidades

- Modo Claro/Escuro  
- Progresso por semana e geral  
- Badges de conclusão de semanas  
- Exportar JSON, JSON Avançado, PDF e Calendário (.ics)  
- Importar JSON  
- Modo Revisão, destacando tarefas pendentes  
- Busca filtrando tarefas por palavra-chave  
- Confetes animados ao concluir semanas  
- Login com Google  
- Salvar checklist no Google Drive  
- Toasts de notificação

---

## Observações importantes

- Para salvar no Drive, faça login com a **conta desejada**, pois o arquivo será enviado para esta conta.  
- O front-end utiliza **localStorage**, garantindo que o progresso local seja mantido mesmo sem login.  
- Recomenda-se usar navegadores modernos para melhor performance das animações e funcionalidades.

---

## Autor

Marcos Ferreira | [GitHub](https://github.com/ferreira2006)

---

## Licença

MIT
