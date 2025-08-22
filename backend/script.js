// ================= CONFIGURAÇÕES ======================
const coresSemana=['#FFCDD2','#C8E6C9','#BBDEFB','#FFF9C4','#D1C4E9','#FFE0B2','#B2DFDB','#F8BBD0'];
const plano={
  "Semana 1 – Fundamentos":["O que é JS, onde roda, configurar ambiente.","Variáveis e tipos de dados.","Operadores matemáticos e lógicos.","Exercícios práticos."],
  "Semana 2 – Controle de Fluxo":["if, else if, else.","Operador ternário e switch.","Estruturas de repetição: for, while, do...while.","Exercícios práticos."],
  "Semana 3 – Funções e Escopo":["Declaração de funções.","Arrow functions.","Escopo global, local e de bloco.","setTimeout e setInterval."],
  "Semana 4 – Arrays e Objetos":["Criar arrays e usar .push(), .pop().",".map(), .filter(), .reduce().","Objetos e iteração.","Exercícios práticos."],
  "Semana 5 – DOM":["Selecionar elementos e alterar conteúdo.","Alterar estilos e criar/remover elementos.","Eventos: onclick, addEventListener.","Exercícios práticos."],
  "Semana 6 – Projeto To-Do List":["Estrutura HTML e input para tarefas.","Adicionar itens à lista.","Marcar como concluído.","Excluir tarefas.","Salvar no localStorage."],
  "Semana 7 – JS Moderno":["Template literals, desestruturação.","Spread/rest, módulos.","fetch e Promises.","async/await."],
  "Semana 8 – Projeto Final":["Planejar projeto.","Estruturar HTML/CSS.","Criar funções principais.","Consumir API.","Finalizar e melhorias extras."]
};
const BACKEND_URL='https://cursojs-8012.onrender.com';
let data=JSON.parse(localStorage.getItem('data'))||{check:{},notes:{},dark:false,historico:[],pontos:0,badges:[]};
let modoRevisaoAtivo=false;
let suprimirToasts=false;

// ================= Toast ======================
const showToast=(msg,duration=3000)=>{
  if(suprimirToasts) return;
  const container=document.getElementById('toast-container');
  const toast=document.createElement('div');
  toast.className='toast';
  toast.innerHTML=msg;
  container.appendChild(toast);
  setTimeout(()=>toast.classList.add('show'),50);
  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=>container.removeChild(toast),300);
  },duration);
};

// ================= Confete ======================
const confeteCanvas=document.getElementById('confete-canvas');
const ctx=confeteCanvas.getContext('2d');
confeteCanvas.width=window.innerWidth;
confeteCanvas.height=window.innerHeight;
let confeteParticles=[];
const confeteCores=['#FF595E','#FFCA3A','#8AC926','#1982C4','#6A4C93','#FF924C','#6FFFE9','#FF6FFF'];

const startConfete=(count=200)=>{
  for(let i=0;i<count;i++){
    confeteParticles.push({
      x:Math.random()*confeteCanvas.width,
      y:-10,
      dx:(Math.random()-0.5)*8,
      dy:Math.random()*7+3,
      size:Math.random()*10+5,
      color: confeteCores[Math.floor(Math.random()*confeteCores.length)],
      angle:Math.random()*360,
      spin:Math.random()*0.2-0.1,
      life:Math.random()*120+80
    });
  }
  animateConfete();
  setTimeout(()=>{ confeteParticles.length=0; ctx.clearRect(0,0,confeteCanvas.width,confeteCanvas.height); },7000);
};

const animateConfete=()=>{
  ctx.clearRect(0,0,confeteCanvas.width,confeteCanvas.height);
  confeteParticles.forEach(p=>{
    p.x+=p.dx; p.y+=p.dy; p.angle+=p.spin; p.life-=2;
    const rad=p.angle*Math.PI/180;
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(rad);
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*2);
    ctx.restore();
    p.size*=0.98;
  });
  confeteParticles=confeteParticles.filter(p=>p.life>0);
  if(confeteParticles.length>0) requestAnimationFrame(animateConfete);
};

window.addEventListener('resize',()=>{ confeteCanvas.width=window.innerWidth; confeteCanvas.height=window.innerHeight; });

// ================= Funções Principais ======================
const salvarDados=()=>{ 
  localStorage.setItem('data',JSON.stringify(data));
  atualizarProgresso();
  atualizarBadgesSemana();
};

const criarTarefa=(semana,idx,t,i)=>{
  const chk=document.createElement('input'); chk.type='checkbox'; chk.id=`s${idx}d${i}`;
  chk.checked=data.check[chk.id]||false;
  chk.onchange=()=>{
    data.check[chk.id]=chk.checked; salvarDados(); 
    if([...document.querySelectorAll(`#tarefas-${idx} input`)].every(i=>i.checked)) startConfete(); 
    if(modoRevisaoAtivo) ativarModoRevisao(); 
  };
  const label=document.createElement('span'); label.textContent=t;
  const div=document.createElement('div'); div.appendChild(chk); div.appendChild(label);
  return div;
};

const gerarSemana=(semana,tarefas,idx)=>{
  const div=document.createElement('div'); div.className='semana'; div.style.background=coresSemana[idx%coresSemana.length];

  const header=document.createElement('div'); header.className='semana-header';
  header.innerHTML=`
    <h2 onclick="toggleCollapse(${idx})">
      ${semana} <span class="expand-icon collapsed">▼</span>
    </h2>
    <div style="display:flex;gap:5px;flex-wrap:wrap;">
      <button class="botao-semana" onclick="marcarSemana(${idx},true)">Marcar Todos</button>
      <button class="botao-semana" onclick="marcarSemana(${idx},false)">Resetar</button>
    </div>
  `;
  div.appendChild(header);

  const progresso=document.createElement('div'); progresso.className='semana-progress'; progresso.id=`semana-progress-${idx}`; div.appendChild(progresso);

  const progressBar=document.createElement('div'); progressBar.className='semana-progress-bar'; 
  progressBar.innerHTML=`<div class='semana-progress-fill' id='semana-progress-fill-${idx}'></div>`; div.appendChild(progressBar);

  const tarefasDiv=document.createElement('div'); tarefasDiv.className='tarefas'; tarefasDiv.id=`tarefas-${idx}`; tarefasDiv.style.display='none';
  tarefas.forEach((t,i)=>tarefasDiv.appendChild(criarTarefa(semana,idx,t,i)));
  div.appendChild(tarefasDiv);

  const nota = document.createElement('textarea');
  nota.className = 'nota';
  nota.placeholder = 'Anotações...';
  nota.value = data.notes[`s${idx}`] || '';
  nota.oninput = () => { data.notes[`s${idx}`] = nota.value; salvarDados(); };
  div.appendChild(nota);

  return div;
};

const gerar=()=>{
  const container=document.getElementById('conteudo'); container.innerHTML='';
  Object.entries(plano).forEach(([semana,tarefas],idx)=>container.appendChild(gerarSemana(semana,tarefas,idx)));
  atualizarProgresso(); if(modoRevisaoAtivo) ativarModoRevisao();
};

// ================= Marcar Semana e Colapso ======================
const marcarSemana = (idx, marcar) => {
  document.querySelectorAll(`#tarefas-${idx} input`).forEach(chk => {
    chk.checked = marcar;
    data.check[chk.id] = marcar;
  });
  salvarDados();
  atualizarProgresso();
  if (modoRevisaoAtivo) ativarModoRevisao();
};

const toggleCollapse=idx=>{
  const el=document.getElementById(`tarefas-${idx}`);
  const icon=document.querySelectorAll('.expand-icon')[idx];
  if(el.style.display==='none'){ el.style.display='flex'; icon.classList.remove('collapsed'); } 
  else { el.style.display='none'; icon.classList.add('collapsed'); }
};

const filtrar=()=>{ 
  const termo=document.getElementById('busca').value.toLowerCase(); 
  document.querySelectorAll('.semana').forEach(div=>{
    div.style.display=div.innerText.toLowerCase().includes(termo)?'flex':'none'; 
  }); 
};

// ================= Modo Revisão ======================
const ativarModoRevisao = () => {
  modoRevisaoAtivo = !modoRevisaoAtivo;
  document.querySelectorAll('.semana').forEach(div => {
    const incompletas = [...div.querySelectorAll('input')].some(i => !i.checked);
    div.classList.toggle('modo-revisao', modoRevisaoAtivo && incompletas);
  });
};

// ================= Progresso e Badges ======================
const atualizarProgresso=()=>{
  Object.keys(plano).forEach((s,i)=>{
    const inputs=document.querySelectorAll(`#tarefas-${i} input`);
    const total=inputs.length;
    const marcados=[...inputs].filter(chk=>chk.checked).length;
    const fill=document.getElementById(`semana-progress-fill-${i}`);
    if(fill) fill.style.width = total? (marcados/total*100)+'%':'0%';
    const texto=document.getElementById(`semana-progress-${i}`);
    if(texto) texto.textContent=`${marcados}/${total} tarefas`;
  });

  const todosCheckboxes=document.querySelectorAll('.tarefas input');
  const total=todosCheckboxes.length;
  const marcados=[...todosCheckboxes].filter(chk=>chk.checked).length;
  const perc=Math.round(total? marcados/total*100:0);
  const progressBar=document.getElementById('progressBar');
  progressBar.style.width=perc+'%'; progressBar.textContent=perc+'%';
  atualizarBadgesSemana();
};

const atualizarBadgesSemana=()=>{
  Object.keys(plano).forEach((s,i)=>{
    const inputs=document.querySelectorAll(`#tarefas-${i} input`);
    const todasMarcadas=[...inputs].every(chk=>chk.checked);
    const badgeName=`Semana ${i+1} Concluída`;
    if(todasMarcadas && !data.badges.includes(badgeName)){ data.badges.push(badgeName); if(!suprimirToasts) showToast(`🏅 ${badgeName} conquistada!`); }
    if(!todasMarcadas && data.badges.includes(badgeName)) data.badges=data.badges.filter(b=>b!==badgeName);
  });
  atualizarBadges();
};

const atualizarBadges=()=>{
  const container=document.getElementById('badges-container'); container.innerHTML='';
  data.badges.forEach(b=>{ const span=document.createElement('span'); span.className='badge'; span.textContent=b; container.appendChild(span); });
};

// ================= Tema, Limpar, Export/Import ======================
const toggleTheme=()=>{ data.dark=!data.dark; document.body.classList.toggle('dark-mode',data.dark); salvarDados(); };
const limpar=()=>{ if(confirm('Deseja realmente limpar tudo?')){ suprimirToasts=true; data={check:{},notes:{},dark:data.dark,historico:[],pontos:0,badges:[]}; salvarDados(); gerar(); suprimirToasts=false; } };
const exportar=()=>{ const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='checklist.json'; a.click(); };
function exportarAvancado(){ const avancado={data,exportadoEm:new Date().toISOString()}; const blob=new Blob([JSON.stringify(avancado)],{type:"application/json"}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download="checklist-avancado.json"; a.click(); }
const importar=()=>{ const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json'; inp.onchange=e=>{ const file=e.target.files[0]; const reader=new FileReader(); reader.onload=ev=>{ try{ data=JSON.parse(ev.target.result); salvarDados(); gerar(); showToast('Importado com sucesso'); }catch(err){ showToast('Erro ao importar'); console.error(err); } }; reader.readAsText(file); }; inp.click(); }

// ================= PDF ======================
const gerarPDFRelatorio = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const marginLeft = 15, marginTop = 25, lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * marginLeft;

  const limparTexto = txt => txt.replace(/[\x00-\x1F\x7F]/g, '').trim();
  const checkPageBreak = (y) => y > pageHeight - 20 ? (doc.addPage(), marginTop) : y;

  doc.setFont("helvetica");
  doc.setFontSize(16);
  doc.setTextColor(0,102,204);
  doc.text("Relatório - Curso JavaScript", marginLeft, 15);
  const hoje = new Date();
  doc.setFontSize(11); doc.setFont("helvetica", "italic"); doc.setTextColor(120);
  doc.text(`Relatório emitido em ${hoje.toLocaleDateString('pt-BR')}`, marginLeft, 22);
  doc.setDrawColor(0,102,204); doc.setLineWidth(0.5); doc.line(marginLeft,27,pageWidth-marginLeft,27);

  let y=35;
  const container=document.getElementById('conteudo');
  if(container){
    container.querySelectorAll('.semana').forEach(semanaDiv=>{
      const h2=semanaDiv.querySelector('h2'); h2.querySelectorAll('span').forEach(el=>el.remove());
      let titulo=limparTexto(h2.innerText);
      y=checkPageBreak(y);
      doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(0,102,204);
      doc.text(titulo, marginLeft, y); y+=lineHeight;

      semanaDiv.querySelectorAll('.tarefas div span').forEach(tarefaSpan=>{
        y=checkPageBreak(y);
        let txt=limparTexto(tarefaSpan.innerText);
        let cor=[0,0,0];
        doc.setTextColor(...cor);
        doc.splitTextToSize('• '+txt, contentWidth).forEach(l=>{y=checkPageBreak(y); doc.text(l, marginLeft+5,y); y+=lineHeight;});
      });

      const notaTextarea=semanaDiv.querySelector('.nota');
      if(notaTextarea && notaTextarea.value.trim()){
        y=checkPageBreak(y);
        const offsetX=marginLeft+5;
        const prefixo="Anotações: ";
        const notaTexto=limparTexto(notaTextarea.value);
        const prefixWidth=doc.getTextWidth(prefixo);
        const linhasNota=doc.splitTextToSize(notaTexto, contentWidth-prefixWidth);
        doc.setFont("helvetica","bold"); doc.text(prefixo, offsetX,y);
        doc.setFont("helvetica","normal");
        if(linhasNota.length>0) doc.text(linhasNota[0], offsetX+prefixWidth, y);
        y+=lineHeight;
        for(let i=1;i<linhasNota.length;i++){ y=checkPageBreak(y); doc.text(linhasNota[i], offsetX, y); y+=lineHeight;}
        y+=2;
      }

      y+=5;
    });
  }

  const pageCount=doc.internal.getNumberOfPages();
  for(let i=1;i<=pageCount;i++){ doc.setPage(i); doc.setFontSize(8); doc.setFont("helvetica","italic"); doc.setTextColor(100); doc.text(`Página ${i} de ${pageCount}`, pageWidth/2, pageHeight-10,{align:"center"}); }
  doc.save('relatorio.pdf');
  showToast('PDF gerado');
};

// ================= Calendário ======================
function exportarParaCalendario(){
  let ics="BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n";
  Object.keys(data.notes).forEach((key,i)=>{
    const nota=data.notes[key];
    if(nota){
      const dtStart=new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
      ics+=`BEGIN:VEVENT\nSUMMARY:${key}\nDESCRIPTION:${nota}\nDTSTART:${dtStart}\nEND:VEVENT\n`;
    }
  });
  ics+="END:VCALENDAR";
  const blob=new Blob([ics],{type:"text/calendar"});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download="checklist.ics"; a.click();
}

// ================= Google ======================
const loginGoogle=async()=>{ 
  try{
    const resp=await fetch(`${BACKEND_URL}/auth-url`);
    const dataLogin=await resp.json();
    if(!dataLogin.url){ showToast('Erro ao obter URL de login'); return; }
    const popup=window.open(dataLogin.url,'_blank','width=500,height=600');
    window.addEventListener('message',e=>{
      if(e.data.googleToken){ localStorage.setItem('googleToken',JSON.stringify(e.data.googleToken)); atualizarUsuarioLogado(); showToast('Login Google realizado!'); }
    },{once:true});
  }catch(err){ console.error(err); showToast('Erro ao iniciar login Google'); }
};
const logoutGoogle=()=>{ localStorage.removeItem('googleToken'); atualizarUsuarioLogado(); showToast('Logout realizado'); };
const atualizarUsuarioLogado=()=>{
  const token=JSON.parse(localStorage.getItem('googleToken'));
  const avatar=document.getElementById('usuario-avatar'); const email=document.getElementById('usuario-email');
  if(token){
    fetch(`${BACKEND_URL}/userinfo`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})})
      .then(r=>r.json()).then(u=>{
        if(u.email){ email.textContent=u.email; avatar.src=u.picture||''; }
      }).catch(()=>{ email.textContent=''; avatar.src=''; });
  }else{ email.textContent=''; avatar.src=''; }
};
const salvarNoDrive=async()=>{
  const token=JSON.parse(localStorage.getItem('googleToken'));
  if(!token){ showToast('Faça login primeiro'); return; }
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const formData=new FormData(); formData.append('file',blob,'checklist.json');
  fetch(`${BACKEND_URL}/upload`,{method:'POST',body:formData,headers:{'Authorization':`Bearer ${token.access_token}`}})
    .then(r=>r.json()).then(res=>{ showToast('Arquivo salvo no Drive'); }).catch(err=>{ console.error(err); showToast('Erro ao salvar no Drive'); });
};

// ================= Inicialização ======================
document.body.classList.toggle('dark-mode', data.dark);
gerar();
atualizarProgresso();
atualizarUsuarioLogado();

// ================= Eventos Botões ======================
document.getElementById('btn-toggle-theme').onclick = toggleTheme;
document.getElementById('btn-modo-revisao').onclick = ativarModoRevisao;
document.getElementById('btn-limpar').onclick = limpar;

document.getElementById('btn-exportar-json').onclick = exportar;
document.getElementById('btn-exportar-avancado').onclick = exportarAvancado;
document.getElementById('btn-gerar-pdf').onclick = gerarPDFRelatorio;
document.getElementById('btn-exportar-calendario').onclick = exportarParaCalendario;

document.getElementById('btn-importar').onclick = importar;

document.getElementById('btn-login-google').onclick = loginGoogle;
document.getElementById('btn-logout-google').onclick = logoutGoogle;
document.getElementById('btn-salvar-drive').onclick = salvarNoDrive;

document.getElementById('busca').addEventListener('input', filtrar);

