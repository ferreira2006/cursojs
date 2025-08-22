// ======================= CONFIGURAÇÕES =======================
const coresSemana = ['#FFCDD2','#C8E6C9','#BBDEFB','#FFF9C4','#D1C4E9','#FFE0B2','#B2DFDB','#F8BBD0'];
const plano = {
  "Semana 1 – Fundamentos": ["O que é JS, onde roda, configurar ambiente.","Variáveis e tipos de dados.","Operadores matemáticos e lógicos.","Exercícios práticos."],
  "Semana 2 – Controle de Fluxo": ["if, else if, else.","Operador ternário e switch.","Estruturas de repetição: for, while, do...while.","Exercícios práticos."],
  "Semana 3 – Funções e Escopo": ["Declaração de funções.","Arrow functions.","Escopo global, local e de bloco.","setTimeout e setInterval."],
  "Semana 4 – Arrays e Objetos": ["Criar arrays e usar .push(), .pop().",".map(), .filter(), .reduce().","Objetos e iteração.","Exercícios práticos."],
  "Semana 5 – DOM": ["Selecionar elementos e alterar conteúdo.","Alterar estilos e criar/remover elementos.","Eventos: onclick, addEventListener.","Exercícios práticos."],
  "Semana 6 – Projeto To-Do List": ["Estrutura HTML e input para tarefas.","Adicionar itens à lista.","Marcar como concluído.","Excluir tarefas.","Salvar no localStorage."],
  "Semana 7 – JS Moderno": ["Template literals, desestruturação.","Spread/rest, módulos.","fetch e Promises.","async/await."],
  "Semana 8 – Projeto Final": ["Planejar projeto.","Estruturar HTML/CSS.","Criar funções principais.","Consumir API.","Finalizar e melhorias extras."]
};
const BACKEND_URL = 'https://cursojs-8012.onrender.com';
let data = JSON.parse(localStorage.getItem('data')) || { check: {}, notes: {}, dark: false, historico: [], pontos: 0, badges: [] };
let modoRevisaoAtivo = false;
let suprimirToasts = false;

// ======================= DOM ELEMENTS =======================
const dom = {
  btnTema: document.querySelector('.top-bar-group button:nth-child(1)'),
  btnRevisao: document.querySelector('.top-bar-group button:nth-child(2)'),
  btnLimpar: document.querySelector('.top-bar-group button:nth-child(3)'),
  btnExportJSON: document.querySelector('.dropdown-content button:nth-child(1)'),
  btnExportAvancado: document.querySelector('.dropdown-content button:nth-child(2)'),
  btnExportPDF: document.querySelector('.dropdown-content button:nth-child(3)'),
  btnExportCalendar: document.querySelector('.dropdown-content button:nth-child(4)'),
  btnImport: document.querySelector('.top-bar-group:nth-child(3) button'),
  btnLoginGoogle: document.querySelector('.google-group .dropdown-content button:nth-child(1)'),
  btnLogoutGoogle: document.querySelector('.google-group .dropdown-content button:nth-child(2)'),
  btnSaveDrive: document.querySelector('.google-group .dropdown-content button:nth-child(3)'),
  inputBusca: document.getElementById('busca'),
  confeteCanvas: document.getElementById('confete-canvas'),
  toastContainer: document.getElementById('toast-container'),
  badgesContainer: document.getElementById('badges-container'),
  conteudo: document.getElementById('conteudo'),
  progressBar: document.getElementById('progressBar'),
  usuarioAvatar: document.getElementById('usuario-avatar'),
  usuarioEmail: document.getElementById('usuario-email')
};

// ======================= TOAST =======================
const showToast = (msg, duration = 3000) => {
  if (suprimirToasts) return;
  const toast = document.createElement('div'); 
  toast.className = 'toast'; 
  toast.innerHTML = msg; 
  dom.toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => dom.toastContainer.removeChild(toast), 300);
  }, duration);
};

// ======================= CONFETE =======================
const ctx = dom.confeteCanvas.getContext('2d');
dom.confeteCanvas.width = window.innerWidth;
dom.confeteCanvas.height = window.innerHeight;

let confeteParticles = [];
const confeteCores = ['#FF595E','#FFCA3A','#8AC926','#1982C4','#6A4C93','#FF924C','#6FFFE9','#FF6FFF'];

const startConfete = (count = 200) => {
  for (let i = 0; i < count; i++) {
    confeteParticles.push({
      x: Math.random() * dom.confeteCanvas.width,
      y: -10,
      dx: (Math.random() - 0.5) * 8,
      dy: Math.random() * 7 + 3,
      size: Math.random() * 10 + 5,
      color: confeteCores[Math.floor(Math.random() * confeteCores.length)],
      angle: Math.random() * 360,
      spin: Math.random() * 0.2 - 0.1,
      life: Math.random() * 120 + 80
    });
  }
  animateConfete();
  setTimeout(() => { confeteParticles.length = 0; ctx.clearRect(0, 0, dom.confeteCanvas.width, dom.confeteCanvas.height); }, 7000);
};

const animateConfete = () => {
  ctx.clearRect(0, 0, dom.confeteCanvas.width, dom.confeteCanvas.height);
  confeteParticles.forEach(p => {
    p.x += p.dx; p.y += p.dy; p.angle += p.spin; p.life -= 2;
    const rad = p.angle * Math.PI / 180;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(rad);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2);
    ctx.restore();
    p.size *= 0.98;
  });
  confeteParticles = confeteParticles.filter(p => p.life > 0);
  if (confeteParticles.length > 0) requestAnimationFrame(animateConfete);
};

window.addEventListener('resize', () => {
  dom.confeteCanvas.width = window.innerWidth;
  dom.confeteCanvas.height = window.innerHeight;
});

// ======================= FUNÇÕES AUXILIARES =======================
const salvarDados = () => { 
  localStorage.setItem('data', JSON.stringify(data)); 
  atualizarProgresso(); 
  atualizarBadgesSemana();
};

const limparTexto = txt => txt.replace(/[\x00-\x1F\x7F]/g, '').trim();

// ======================= FUNÇÕES DE GERAÇÃO DE CONTEÚDO =======================
const criarTarefa = (semana, idx, tarefa, i) => {
  const chk = document.createElement('input'); 
  chk.type = 'checkbox'; 
  chk.id = `s${idx}d${i}`;
  chk.checked = data.check[chk.id] || false;
  chk.addEventListener('change', () => {
    data.check[chk.id] = chk.checked; 
    salvarDados();
    if ([...document.querySelectorAll(`#tarefas-${idx} input`)].every(i => i.checked)) startConfete();
    if (modoRevisaoAtivo) ativarModoRevisao();
  });
  const label = document.createElement('span'); 
  label.textContent = tarefa;
  const div = document.createElement('div'); 
  div.append(chk, label);
  return div;
};

const gerarSemana = (semana, tarefas, idx) => {
  const div = document.createElement('div'); 
  div.className = 'semana'; 
  div.style.background = coresSemana[idx % coresSemana.length];

  const header = document.createElement('div'); 
  header.className = 'semana-header';
  header.innerHTML = `
    <h2>
      ${semana} <span class="expand-icon collapsed">▼</span>
    </h2>
    <div style="display:flex;gap:5px;flex-wrap:wrap;">
      <button class="botao-semana" data-action="marcarTodos" data-idx="${idx}">Marcar Todos</button>
      <button class="botao-semana" data-action="resetar" data-idx="${idx}">Resetar</button>
    </div>
  `;
  div.appendChild(header);

  const progresso = document.createElement('div'); 
  progresso.className = 'semana-progress'; 
  progresso.id = `semana-progress-${idx}`; 
  div.appendChild(progresso);

  const progressBar = document.createElement('div'); 
  progressBar.className = 'semana-progress-bar'; 
  progressBar.innerHTML = `<div class='semana-progress-fill' id='semana-progress-fill-${idx}'></div>`; 
  div.appendChild(progressBar);

  const tarefasDiv = document.createElement('div'); 
  tarefasDiv.className = 'tarefas'; 
  tarefasDiv.id = `tarefas-${idx}`; 
  tarefasDiv.style.display = 'none';
  tarefas.forEach((t,i) => tarefasDiv.appendChild(criarTarefa(semana, idx, t, i)));
  div.appendChild(tarefasDiv);

  const nota = document.createElement('textarea');
  nota.className = 'nota';
  nota.placeholder = 'Anotações...';
  nota.value = data.notes[`s${idx}`] || '';
  nota.addEventListener('input', () => { data.notes[`s${idx}`] = nota.value; salvarDados(); });
  div.appendChild(nota);

  return div;
};

const gerar = () => {
  dom.conteudo.innerHTML = '';
  Object.entries(plano).forEach(([semana, tarefas], idx) => dom.conteudo.appendChild(gerarSemana(semana, tarefas, idx)));
  atualizarProgresso();
  if (modoRevisaoAtivo) ativarModoRevisao();
};

// ======================= EVENTOS GERAIS =======================
dom.conteudo.addEventListener('click', e => {
  const target = e.target;
  if (target.dataset.action === 'marcarTodos') marcarSemana(target.dataset.idx, true);
  if (target.dataset.action === 'resetar') marcarSemana(target.dataset.idx, false);
  if (target.tagName === 'H2') toggleCollapse([...dom.conteudo.querySelectorAll('h2')].indexOf(target));
});

// Busca dinâmica
dom.inputBusca.addEventListener('input', filtrar);

// ======================= INICIALIZAÇÃO =======================
document.body.classList.toggle('dark-mode', data.dark);
gerar();
atualizarProgresso();
atualizarUsuarioLogado();
