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
let data = JSON.parse(localStorage.getItem('data')) || { check: {}, notes: {}, dark: false, pontos: 0, badges: [] };
let modoRevisaoAtivo = false;
let suprimirToasts = false;
let googleToken = localStorage.getItem("googleToken") || null;

// ======================= DOM ELEMENTS =======================
const dom = {
  btnTema: document.getElementById('btn-toggle-theme'),
  btnRevisao: document.getElementById('btn-modo-revisao'),
  btnLimpar: document.getElementById('btn-limpar'),
  btnExportJSON: document.getElementById('btn-exportar-json'),
  btnExportAvancado: document.getElementById('btn-exportar-avancado'),
  btnExportPDF: document.getElementById('btn-gerar-pdf'),
  btnExportCalendar: document.getElementById('btn-exportar-calendario'),
  btnImport: document.getElementById('btn-importar'),
  btnLoginGoogle: document.getElementById('btn-login-google'),
  btnLogoutGoogle: document.getElementById('btn-logout-google'),
  btnSaveDrive: document.getElementById('btn-salvar-drive'),
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
const ctx = dom.confeteCanvas.getContext('2d', { willReadFrequently: true });
dom.confeteCanvas.width = window.innerWidth;
dom.confeteCanvas.height = window.innerHeight;
let confeteParticles = [];
const confeteCores = ['#FF595E','#FFCA3A','#8AC926','#1982C4','#6A4C93','#FF924C','#6FFFE9','#FF6FFF'];
let animandoConfete = false;
const MAX_PARTICLES = 500;

const criarParticulas = (count = 200) => {
  const novas = [];
  for (let i = 0; i < count && confeteParticles.length + novas.length < MAX_PARTICLES; i++) {
    novas.push({
      x: Math.random() * dom.confeteCanvas.width,
      y: -10,
      dx: (Math.random() - 0.5) * 8,
      dy: Math.random() * 5 + 3,
      size: Math.random() * 10 + 5,
      color: confeteCores[Math.floor(Math.random() * confeteCores.length)],
      angle: Math.random() * 360,
      spin: Math.random() * 0.2 - 0.1,
      life: Math.random() * 120 + 80
    });
  }
  return novas;
};

const startConfete = (count = 200) => { confeteParticles.push(...criarParticulas(count)); if (!animandoConfete) animateConfete(); };

const animateConfete = () => {
  animandoConfete = true;
  ctx.clearRect(0, 0, dom.confeteCanvas.width, dom.confeteCanvas.height);
  confeteParticles.forEach(p => {
    p.x += p.dx; p.y += p.dy; p.angle += p.spin; p.life -= 2;
    const rad = p.angle * Math.PI / 180;
    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(rad);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2);
    ctx.restore();
    p.size *= 0.995;
  });
  confeteParticles = confeteParticles.filter(p => p.life > 0 && p.y < dom.confeteCanvas.height + 20);
  if (confeteParticles.length > 0) requestAnimationFrame(animateConfete);
  else { ctx.clearRect(0,0,dom.confeteCanvas.width, dom.confeteCanvas.height); animandoConfete = false; }
};

window.addEventListener('resize', () => {
  dom.confeteCanvas.width = window.innerWidth;
  dom.confeteCanvas.height = window.innerHeight;
});

// ======================= AUXILIARES =======================
const salvarDados = (dispararConfete = false) => {
  localStorage.setItem('data', JSON.stringify(data));
  atualizarProgresso(dispararConfete);
  atualizarBadgesSemana();
};
const limparTexto = txt => txt.replace(/[\x00-\x1F\x7F]/g, '').trim();

// ======================= TAREFAS =======================
const criarTarefa = (semana, idx, tarefa, i) => {
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.id = `s${idx}d${i}`;
  chk.checked = data.check[chk.id] || false;
  chk.addEventListener('change', () => {
    data.check[chk.id] = chk.checked;
    salvarDados(true);
    if (modoRevisaoAtivo) aplicarModoRevisao(true);
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

  const header = document.createElement('div'); header.className = 'semana-header';
  const h2 = document.createElement('h2'); h2.textContent = semana;
  const expandIcon = document.createElement('span'); expandIcon.className = 'expand-icon collapsed'; expandIcon.textContent = '▼';
  h2.appendChild(expandIcon);
  h2.addEventListener('click', () => toggleCollapse(idx));
  header.appendChild(h2);

  const btnContainer = document.createElement('div'); btnContainer.style.display='flex'; btnContainer.style.gap='5px'; btnContainer.style.flexWrap='wrap';
  const btnMarcar = document.createElement('button'); btnMarcar.className='botao-semana'; btnMarcar.textContent='Marcar Todos'; btnMarcar.addEventListener('click',()=>marcarSemana(idx,true));
  const btnResetar = document.createElement('button'); btnResetar.className='botao-semana'; btnResetar.textContent='Resetar'; btnResetar.addEventListener('click',()=>marcarSemana(idx,false));
  btnContainer.append(btnMarcar,btnResetar); header.appendChild(btnContainer);
  div.appendChild(header);

  const progresso = document.createElement('div'); progresso.className='semana-progress'; progresso.id=`semana-progress-${idx}`; div.appendChild(progresso);
  const progressBar = document.createElement('div'); progressBar.className='semana-progress-bar'; progressBar.innerHTML=`<div class='semana-progress-fill' id='semana-progress-fill-${idx}'></div>`; div.appendChild(progressBar);

  const tarefasDiv = document.createElement('div'); tarefasDiv.className='tarefas'; tarefasDiv.id=`tarefas-${idx}`; tarefasDiv.style.display='none';
  tarefas.forEach((t,i)=>tarefasDiv.appendChild(criarTarefa(semana,idx,t,i)));
  div.appendChild(tarefasDiv);

  const nota = document.createElement('textarea'); nota.className='nota'; nota.placeholder='Anotações...'; nota.value = data.notes[`s${idx}`]||'';
  nota.addEventListener('input',()=>{data.notes[`s${idx}`]=nota.value; salvarDados(false);}); div.appendChild(nota);

  return div;
};

const gerar = () => { 
  dom.conteudo.innerHTML=''; 
  Object.entries(plano).forEach(([semana,tarefas],idx)=>dom.conteudo.appendChild(gerarSemana(semana,tarefas,idx))); 
  atualizarProgresso(false); 
  if(modoRevisaoAtivo) aplicarModoRevisao(true); 
};

// ======================= MODO REVISÃO =======================
const aplicarModoRevisao = (ativar=!modoRevisaoAtivo) => {
  modoRevisaoAtivo = ativar;
  document.querySelectorAll('.semana').forEach(div=>{
    const incompletas = [...div.querySelectorAll('input')].some(i => !i.checked);
    div.classList.toggle('modo-revisao', modoRevisaoAtivo && incompletas);
  });
};

// ======================= PROGRESSO =======================
const atualizarProgresso = (dispararConfete=true) => {
  let semanasConcluidas = [];
  Object.keys(plano).forEach((s,i)=>{
    const inputs = document.querySelectorAll(`#tarefas-${i} input`);
    const totalS = inputs.length;
    const marcadosS = [...inputs].filter(chk=>chk.checked).length;
    const fill = document.getElementById(`semana-progress-fill-${i}`);
    if(fill) fill.style.width = totalS ? (marcadosS/totalS*100)+'%' : '0%';
    fill && (fill.dataset.complete = (marcadosS===totalS && totalS>0) ? 'true' : 'false');
    const texto = document.getElementById(`semana-progress-${i}`);
    texto && (texto.textContent = `${marcadosS}/${totalS} tarefas`);
    if(fill && fill.dataset.complete==='true' && !data.badges.includes(`Semana ${i+1} Concluída`)) semanasConcluidas.push(i);
  });
  if(dispararConfete && semanasConcluidas.length>0) startConfete();

  const todosCheckboxes = document.querySelectorAll('.tarefas input');
  const total = todosCheckboxes.length;
  const marcados = [...todosCheckboxes].filter(chk=>chk.checked).length;
  const perc = Math.round(total ? marcados/total*100 : 0);
  dom.progressBar.style.width = perc+'%';
  dom.progressBar.textContent = perc+'%';

  atualizarBadgesSemana();
};

// ======================= BADGES =======================
const atualizarBadgesSemana = () => {
  Object.keys(plano).forEach((s,i)=>{
    const inputs = document.querySelectorAll(`#tarefas-${i} input`);
    const todasMarcadas = [...inputs].every(chk=>chk.checked);
    const badgeName = `Semana ${i+1} Concluída`;
    if(todasMarcadas && !data.badges.includes(badgeName)){ data.badges.push(badgeName); showToast(`🏅 ${badgeName}. Parabéns!`); }
    if(!todasMarcadas && data.badges.includes(badgeName)) data.badges = data.badges.filter(b=>b!==badgeName);
  });
  atualizarBadges();
};
const atualizarBadges = () => {
  dom.badgesContainer.innerHTML = '';
  data.badges.forEach(b=>{
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = b;
    dom.badgesContainer.appendChild(span);
  });
};

// ======================= MARCAR / COLAPSAR =======================
const marcarSemana = (idx,marcar) => {
  document.querySelectorAll(`#tarefas-${idx} input`).forEach(chk=>{ chk.checked=marcar; data.check[chk.id]=marcar; });
  salvarDados(true);
  modoRevisaoAtivo && aplicarModoRevisao(true);
};
const toggleCollapse = idx => {
  const el = document.getElementById(`tarefas-${idx}`);
  const icon = document.querySelectorAll('.expand-icon')[idx];
  const mostrar = el.style.display==='none';
  el.style.display = mostrar ? 'flex' : 'none';
  icon.classList.toggle('collapsed', !mostrar);
};

// ======================= LIMPAR / TEMA =======================
const limpar = () => {
  if(confirm('Deseja realmente limpar tudo?')){
    suprimirToasts=true;
    data={check:{},notes:{},dark:data.dark,pontos:0,badges:[]};
    salvarDados(false);
    gerar();
    suprimirToasts=false;
  }
};
const toggleTheme = () => {
  data.dark = !data.dark;
  document.body.classList.toggle('dark-mode', data.dark);
  salvarDados(false);
};

// ======================= EXPORTAR / IMPORTAR =======================
const exportar = () => { const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist.json'; a.click(); };
const exportarAvancado = () => { const avancado={data,meta:{exportadoEm:new Date().toISOString(),versão:"avançado-v1"}}; const blob=new Blob([JSON.stringify(avancado,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist-avancado.json'; a.click(); };
const exportarParaCalendario = () => {
  let ics="BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n";
  Object.keys(plano).forEach((s,idx)=>{ document.querySelectorAll(`#tarefas-${idx} input`).forEach((chk,i)=>{ if(chk.checked){ const dt=new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+"Z"; ics+=`BEGIN:VEVENT\nSUMMARY:Semana ${idx+1} - Tarefa ${i+1}\nDTSTART:${dt}\nEND:VEVENT\n`; } }); });
  ics+="END:VCALENDAR";
  const blob=new Blob([ics],{type:'text/calendar'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist.ics'; a.click();
};
const importar = () => {
  const input = document.createElement('input'); input.type='file'; input.accept='.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const conteudo = JSON.parse(ev.target.result);
        data = conteudo.data ? conteudo.data : conteudo;
        salvarDados(false);
        gerar();
      } catch { alert("Arquivo inválido!"); }
    };
    reader.readAsText(file);
  };
  input.click();
};

// ======================= GOOGLE LOGIN =======================
async function loginGoogle() {
  try {
    const resp = await fetch(`${BACKEND_URL}/auth-url`);
    const { url } = await resp.json();
    window.open(url, "_blank", "width=500,height=600");
  } catch { showToast("Erro ao autenticar no Google!"); }
}

function logoutGoogle() {
  googleToken = null;
  localStorage.removeItem("googleToken");
  atualizarUsuarioLogado();
  showToast("Logout realizado com sucesso!");
}

async function salvarNoDrive() {
  if(!googleToken){ showToast("Você precisa estar logado no Google!"); return; }
  try {
    const resp = await fetch(`${BACKEND_URL}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${googleToken}` },
      body: JSON.stringify({ data })
    });
    resp.ok ? showToast("Backup salvo no Google Drive!") : showToast("Erro ao salvar no Drive!");
  } catch { showToast("Erro ao salvar no Drive!"); }
}

async function atualizarUsuarioLogado() {
  if(googleToken){
    dom.usuarioAvatar.src=`https://www.gravatar.com/avatar/${googleToken}?s=32`; dom.usuarioEmail.textContent=googleToken;
    dom.btnLoginGoogle.style.display='none'; dom.btnLogoutGoogle.style.display='inline-block'; dom.btnSaveDrive.style.display='inline-block';
  } else {
    dom.usuarioAvatar.src=''; dom.usuarioEmail.textContent='';
    dom.btnLoginGoogle.style.display='inline-block'; dom.btnLogoutGoogle.style.display='none'; dom.btnSaveDrive.style.display='none';
  }
}

// ======================= PDF =======================
async function gerarPDFRelatorio() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin=15; let y=20;
  doc.setFontSize(16); doc.setTextColor(0,0,200); doc.text("Checklist de Estudo - JavaScript Avançado",margin,y); y+=10;
  doc.setFontSize(12); doc.setTextColor(0,0,0); doc.text(`Relatório emitido em ${new Date().toLocaleDateString()}`,margin,y); y+=10;

  Object.keys(plano).forEach((s,idx)=>{
    doc.setFontSize(14); doc.setTextColor(0,0,0); y+=5; doc.text(s,margin,y); y+=7;
    const tarefas = plano[s];
    tarefas.forEach((t,i)=>{
      const chkId = `s${idx}d${i}`;
      const status = data.check[chkId]?'✔️':'❌';
      const linha = `${status} ${t}`;
      const splitText = doc.splitTextToSize(linha, 180);
      splitText.forEach(txt=>{
        if(y>270){doc.addPage(); y=20;}
        doc.text(txt,margin,y); y+=7;
      });
    });
    const nota = data.notes[`s${idx}`];
    if(nota){
      doc.setFontSize(11); doc.setTextColor(100,100,100); y+=3;
      const splitNota = doc.splitTextToSize("Anotações: "+nota,180);
      splitNota.forEach(txt=>{
        if(y>270){doc.addPage(); y=20;}
        doc.text(txt,margin,y); y+=7;
      });
    }
  });
  doc.save('checklist-relatorio.pdf');
}

// ======================= BUSCA COM DEBOUNCE =======================
let buscaTimeout;
dom.inputBusca.addEventListener('input', e=>{
  clearTimeout(buscaTimeout);
  buscaTimeout = setTimeout(()=>{
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll('.tarefas div').forEach(div=>{
      const text = div.textContent.toLowerCase();
      div.style.display = text.includes(termo)?'flex':'none';
    });
  },300);
});

// ======================= INICIALIZAÇÃO =======================
gerar();
document.body.classList.toggle('dark-mode',data.dark);
atualizarUsuarioLogado();

// ======================= EVENT LISTENERS =======================
dom.btnExportPDF.addEventListener('click', gerarPDFRelatorio);
dom.btnLoginGoogle.addEventListener('click', loginGoogle);
dom.btnTema.addEventListener('click', toggleTheme);
dom.btnRevisao.addEventListener('click', () => aplicarModoRevisao());
dom.btnLimpar.addEventListener('click', limpar);
dom.btnExportJSON.addEventListener('click', exportar);
dom.btnExportAvancado.addEventListener('click', exportarAvancado);
dom.btnExportCalendar.addEventListener('click', exportarParaCalendario);
dom.btnImport.addEventListener('click', importar);
dom.btnLogoutGoogle.addEventListener('click', logoutGoogle);
dom.btnSaveDrive.addEventListener('click', salvarNoDrive);

