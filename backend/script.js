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

  const h2 = document.createElement('h2');
  h2.textContent = semana;
  const expandIcon = document.createElement('span');
  expandIcon.className = 'expand-icon collapsed';
  expandIcon.textContent = '▼';
  h2.appendChild(expandIcon);
  h2.addEventListener('click', () => toggleCollapse(idx));
  header.appendChild(h2);

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '5px';
  btnContainer.style.flexWrap = 'wrap';

  const btnMarcar = document.createElement('button');
  btnMarcar.className = 'botao-semana';
  btnMarcar.textContent = 'Marcar Todos';
  btnMarcar.addEventListener('click', () => marcarSemana(idx, true));

  const btnResetar = document.createElement('button');
  btnResetar.className = 'botao-semana';
  btnResetar.textContent = 'Resetar';
  btnResetar.addEventListener('click', () => marcarSemana(idx, false));

  btnContainer.append(btnMarcar, btnResetar);
  header.appendChild(btnContainer);

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
  tarefas.forEach((t, i) => tarefasDiv.appendChild(criarTarefa(semana, idx, t, i)));
  div.appendChild(tarefasDiv);

  const nota = document.createElement('textarea');
  nota.className = 'nota';
  nota.placeholder = 'Anotações...';
  nota.value = data.notes[`s${idx}`] || '';
  nota.addEventListener('input', () => {
    data.notes[`s${idx}`] = nota.value;
    salvarDados();
  });
  div.appendChild(nota);

  return div;
};

const gerar = () => {
  dom.conteudo.innerHTML = '';
  Object.entries(plano).forEach(([semana, tarefas], idx) => dom.conteudo.appendChild(gerarSemana(semana, tarefas, idx)));
  atualizarProgresso();
  if (modoRevisaoAtivo) ativarModoRevisao();
};

// ======================= BUSCA =======================
const filtrar = () => {
  const termo = dom.inputBusca.value.toLowerCase();
  document.querySelectorAll('.semana').forEach(div => {
    div.style.display = div.innerText.toLowerCase().includes(termo) ? 'flex' : 'none';
  });
};

// ======================= MODO REVISÃO =======================
const ativarModoRevisao = () => {
  modoRevisaoAtivo = !modoRevisaoAtivo;
  document.querySelectorAll('.semana').forEach(div => {
    const incompletas = [...div.querySelectorAll('input')].some(i => !i.checked);
    div.classList.toggle('modo-revisao', modoRevisaoAtivo && incompletas);
  });
};

// ======================= PROGRESSO =======================
const atualizarProgresso = () => {
  let progressoMudouSemana = [];
  Object.keys(plano).forEach((s, i) => {
    const inputs = document.querySelectorAll(`#tarefas-${i} input`);
    const totalS = inputs.length;
    const marcadosS = [...inputs].filter(chk => chk.checked).length;

    const fill = document.getElementById(`semana-progress-fill-${i}`);
    if (fill) fill.style.width = totalS ? (marcadosS / totalS * 100) + '%' : '0%';
    fill.dataset.complete = (marcadosS === totalS && totalS > 0) ? 'true' : 'false';

    const texto = document.getElementById(`semana-progress-${i}`);
    if (texto) texto.textContent = `${marcadosS}/${totalS} tarefas`;

    if (fill.dataset.complete === 'true' && marcadosS === totalS) progressoMudouSemana.push(i);
  });

    if (progressoMudouSemana.length > 0) startConfete();

  // Atualiza progresso total
  const todosCheckboxes = document.querySelectorAll('.tarefas input');
  const total = todosCheckboxes.length;
  const marcados = [...todosCheckboxes].filter(chk => chk.checked).length;
  const perc = Math.round(total ? marcados / total * 100 : 0);

  dom.progressBar.style.width = perc + '%';
  dom.progressBar.textContent = perc + '%';

  atualizarBadgesSemana();
};

// ======================= BADGES =======================
const atualizarBadgesSemana = () => {
  Object.keys(plano).forEach((s, i) => {
    const inputs = document.querySelectorAll(`#tarefas-${i} input`);
    const todasMarcadas = [...inputs].every(chk => chk.checked);
    const badgeName = `Semana ${i + 1} Concluída`;

    if (todasMarcadas && !data.badges.includes(badgeName)) {
      data.badges.push(badgeName);
      if (!suprimirToasts) showToast(`🏅 ${badgeName} conquistada!`);
    }

    if (!todasMarcadas && data.badges.includes(badgeName)) {
      data.badges = data.badges.filter(b => b !== badgeName);
    }
  });

  atualizarBadges();
};

const atualizarBadges = () => {
  dom.badgesContainer.innerHTML = '';
  data.badges.forEach(b => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = b;
    dom.badgesContainer.appendChild(span);
  });
};

// ======================= MARCAR SEMANA / COLAPSO =======================
const marcarSemana = (idx, marcar) => {
  document.querySelectorAll(`#tarefas-${idx} input`).forEach(chk => {
    chk.checked = marcar;
    data.check[chk.id] = marcar;
  });
  salvarDados();
  if (modoRevisaoAtivo) ativarModoRevisao();
};

const toggleCollapse = idx => {
  const el = document.getElementById(`tarefas-${idx}`);
  const icon = document.querySelectorAll('.expand-icon')[idx];
  if (el.style.display === 'none') {
    el.style.display = 'flex';
    icon.classList.remove('collapsed');
  } else {
    el.style.display = 'none';
    icon.classList.add('collapsed');
  }
};

// ======================= LIMPAR / TEMA =======================
const limpar = () => {
  if (confirm('Deseja realmente limpar tudo?')) {
    suprimirToasts = true;
    data = { check: {}, notes: {}, dark: data.dark, historico: [], pontos: 0, badges: [] };
    salvarDados();
    gerar();
    suprimirToasts = false;
  }
};

const toggleTheme = () => {
  data.dark = !data.dark;
  document.body.classList.toggle('dark-mode', data.dark);
  salvarDados();
};

// ======================= BUSCA =======================
dom.inputBusca.addEventListener('input', filtrar);


// ======================= GOOGLE =======================

// ======================= LOGIN GOOGLE =======================
let loginInProgress = false;

const loginGoogle = async () => {
  if (loginInProgress) {
    showToast('Login já em andamento...');
    return;
  }

  loginInProgress = true;
  dom.btnLoginGoogle.disabled = true;

  try {
    const resp = await fetch(`${BACKEND_URL}/auth-url`);
    const dataLogin = await resp.json();

    if (!dataLogin.url) {
      showToast('Erro ao obter URL de login');
      loginInProgress = false;
      dom.btnLoginGoogle.disabled = false;
      return;
    }

    const popup = window.open(dataLogin.url, '_blank', 'width=500,height=600');
    if (!popup) {
      showToast('Erro: popup bloqueado');
      loginInProgress = false;
      dom.btnLoginGoogle.disabled = false;
      return;
    }

    // Timeout para evitar popup aberto indefinidamente
    const timeout = setTimeout(() => {
      showToast('Login cancelado ou expirado');
      window.removeEventListener('message', messageHandler);
      if (!popup.closed) popup.close();
      loginInProgress = false;
      dom.btnLoginGoogle.disabled = false;
    }, 2 * 60 * 1000); // 2 minutos

    const messageHandler = (event) => {
      // Aceita apenas mensagens do backend
      if (!event.origin.includes(new URL(BACKEND_URL).origin)) return;

      if (event.data.googleToken) {
        clearTimeout(timeout);
        localStorage.setItem('googleToken', JSON.stringify(event.data.googleToken));
        atualizarUsuarioLogado();
        showToast('Login Google realizado!');
        if (!popup.closed) popup.close();
        loginInProgress = false;
        dom.btnLoginGoogle.disabled = false;
      } else if (event.data.error) {
        clearTimeout(timeout);
        showToast('Erro durante login Google');
        console.error('Login Google erro:', event.data.error);
        if (!popup.closed) popup.close();
        loginInProgress = false;
        dom.btnLoginGoogle.disabled = false;
      }
    };

    window.addEventListener('message', messageHandler, { once: true });

  } catch (err) {
    console.error(err);
    showToast('Erro ao iniciar login Google');
    loginInProgress = false;
    dom.btnLoginGoogle.disabled = false;
  }
};


// ======================= LOGOUT GOOGLE =======================
const logoutGoogle = () => {
  const token = JSON.parse(localStorage.getItem('googleToken'));
  if (!token) {
    showToast('Nenhuma conta conectada');
    return;
  }

  localStorage.removeItem('googleToken');
  atualizarUsuarioLogado();
  showToast('Logout realizado com sucesso');
};

// ======================= ATUALIZA USUÁRIO =======================
const atualizarUsuarioLogado = async () => {
  const token = JSON.parse(localStorage.getItem('googleToken'));
  if (!token) {
    dom.usuarioAvatar.style.display = 'none';
    dom.usuarioEmail.textContent = 'Nenhuma conta conectada';
    return;
  }

  try {
    const resp = await fetch(`${BACKEND_URL}/userinfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const u = await resp.json();
    dom.usuarioAvatar.src = u.picture;
    dom.usuarioAvatar.style.display = 'block';
    dom.usuarioEmail.textContent = u.email;
  } catch (err) {
    console.error(err);
    dom.usuarioAvatar.style.display = 'none';
    dom.usuarioEmail.textContent = 'Erro ao carregar usuário';
    showToast('Erro ao carregar usuário Google');
  }
};
const salvarNoDrive = async () => {
  const token = JSON.parse(localStorage.getItem('googleToken'));
  if (!token) { showToast('Você precisa fazer login primeiro'); return; }
  const payload = { token, filename: 'checklist.json', content: data };
  try {
    const resp = await fetch(`${BACKEND_URL}/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await resp.json();
    if (result.success) {
      const link = `https://drive.google.com/file/d/${result.fileId}/view`;
      showToast(`Arquivo salvo no Google Drive! <a href="${link}" target="_blank" style="color:#FFD700;text-decoration:underline;">Abrir</a>`);
    } else {
      showToast('Erro ao salvar no Drive'); console.error(result);
    }
  } catch (err) {
    console.error(err);
    showToast('Erro ao salvar no Drive');
  }
};

// ======================= EXPORT / IMPORT =======================
const exportar = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'checklist.json';
  a.click();
};

const exportarAvancado = () => {
  const avancado = { data, exportadoEm: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(avancado)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'checklist-avancado.json';
  a.click();
};

const importar = () => {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json';
  inp.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        data = JSON.parse(ev.target.result);
        salvarDados();
        gerar();
        showToast('Importado com sucesso');
      } catch (err) {
        showToast('Erro ao importar');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  inp.click();
};

// ======================= PDF =======================
const gerarPDFRelatorio = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const marginLeft = 15, marginTop = 25, lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * marginLeft;

  let y = marginTop;
  const hoje = new Date();
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Relatório - Curso JavaScript", marginLeft, y);
  y += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120);
  doc.text(`Relatório emitido em ${hoje.toLocaleDateString('pt-BR')}`, marginLeft, y);
  y += 7;
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginLeft, y);
  y += 8;

  dom.conteudo.querySelectorAll('.semana').forEach(semanaDiv => {
    const h2 = semanaDiv.querySelector('h2');
    h2.querySelectorAll('span').forEach(el => el.remove());
    let titulo = limparTexto(h2.innerText);

    if (y > pageHeight - 20) { doc.addPage(); y = marginTop; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text(titulo, marginLeft, y);
    y += lineHeight;

    semanaDiv.querySelectorAll('.tarefas div span').forEach(tarefaSpan => {
      if (y > pageHeight - 20) { doc.addPage(); y = marginTop; }
      let txt = limparTexto(tarefaSpan.innerText);
      doc.setTextColor(0, 0, 0);
      doc.splitTextToSize('• ' + txt, contentWidth).forEach(l => { 
        if (y > pageHeight - 20) { doc.addPage(); y = marginTop; }
        doc.text(l, marginLeft + 5, y);
        y += lineHeight;
      });
    });

    const notaTextarea = semanaDiv.querySelector('.nota');
    if (notaTextarea && notaTextarea.value.trim()) {
      if (y > pageHeight - 20) { doc.addPage(); y = marginTop; }
      const prefixo = "Anotações: ";
      const notaTexto = limparTexto(notaTextarea.value);
      doc.setFont("helvetica", "bold");
      doc.text(prefixo, marginLeft + 5, y);
      doc.setFont("helvetica", "normal");
      doc.text(notaTexto, marginLeft + 5 + doc.getTextWidth(prefixo), y);
      y += lineHeight + 2;
    }
    y += 5;
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save('relatorio.pdf');
  showToast('PDF gerado');
};

// ======================= CALENDÁRIO =======================
const exportarParaCalendario = () => {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n";
  Object.keys(data.notes).forEach(key => {
    const nota = data.notes[key];
    if (nota) {
      const dt = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      ics += `BEGIN:VEVENT\nSUMMARY:${key}\nDESCRIPTION:${nota}\nDTSTART:${dt}\nEND:VEVENT\n`;
    }
  });
  ics += "END:VCALENDAR";
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "checklist.ics";
  a.click();
};

// ======================= EVENTOS =======================
dom.btnTema.addEventListener('click', toggleTheme);
dom.btnRevisao.addEventListener('click', ativarModoRevisao);
dom.btnLimpar.addEventListener('click', limpar);
dom.btnExportJSON.addEventListener('click', exportar);
dom.btnExportAvancado.addEventListener('click', exportarAvancado);
dom.btnExportPDF.addEventListener('click', gerarPDFRelatorio);
dom.btnExportCalendar.addEventListener('click', exportarParaCalendario);
dom.btnImport.addEventListener('click', importar);
dom.btnLoginGoogle.addEventListener('click', loginGoogle);
dom.btnLogoutGoogle.addEventListener('click', logoutGoogle);
dom.btnSaveDrive.addEventListener('click', salvarNoDrive);

// ======================= INICIALIZAÇÃO =======================
document.body.classList.toggle('dark-mode', data.dark);
gerar();
atualizarProgresso();
atualizarUsuarioLogado();
