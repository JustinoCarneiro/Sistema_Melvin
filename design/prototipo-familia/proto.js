/*
 * FERRAMENTA DO PROTÓTIPO — não faz parte das telas nem será portada para a aplicação.
 * Serve só para: (1) alternar os estados de cada tela por ?estado=..., (2) simular validação e envio
 * sem servidor, (3) mostrar/ocultar senha, copiar texto e abrir diálogos. Nenhuma chamada de rede.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var estado = params.get('estado') || 'normal';
  document.documentElement.setAttribute('data-estado', estado);

  // 1) Exibe só o que pertence ao estado atual: data-estados="normal sem-foto" (ou "*" para todos).
  document.querySelectorAll('[data-estados]').forEach(function (el) {
    var lista = el.getAttribute('data-estados').split(/\s+/);
    // toggleAttribute (e não el.hidden): a propriedade não existe em elementos SVG.
    el.toggleAttribute('hidden', lista.indexOf('*') === -1 && lista.indexOf(estado) === -1);
  });

  // 2) Barra do protótipo, montada a partir de <body data-estados-lista="normal:Normal|erro:Erro">.
  var lista = document.body.getAttribute('data-estados-lista');
  var barra = document.createElement('nav');
  barra.className = 'barra-prototipo';
  barra.setAttribute('aria-label', 'Barra do protótipo: estados e navegação (não faz parte da tela)');
  var rotulo = document.createElement('strong');
  rotulo.textContent = 'Estado:';
  barra.appendChild(rotulo);
  if (lista) {
    lista.split('|').forEach(function (item) {
      var partes = item.split(':');
      var a = document.createElement('a');
      a.href = '?estado=' + partes[0];
      a.textContent = partes[1];
      if (partes[0] === estado) { a.setAttribute('aria-current', 'true'); }
      barra.appendChild(a);
    });
  }
  var dica = document.body.getAttribute('data-dica');
  if (dica) {
    var d = document.createElement('span');
    d.textContent = '· Dica: ' + dica;
    barra.appendChild(d);
  }
  var sep = document.createElement('span');
  sep.className = 'sep';
  sep.setAttribute('aria-hidden', 'true');
  sep.textContent = '|';
  barra.appendChild(sep);
  var mapa = document.createElement('a');
  mapa.href = 'index.html';
  mapa.textContent = 'Mapa das telas';
  barra.appendChild(mapa);
  var caixa = document.createElement('details');
  caixa.className = 'barra-prototipo';
  if (window.innerWidth >= 690) { caixa.open = true; }
  var resumo = document.createElement('summary');
  resumo.textContent = 'Protótipo: estados e navegação (não faz parte da tela)';
  barra.className = 'barra-lista';
  caixa.appendChild(resumo);
  caixa.appendChild(barra);
  document.body.appendChild(caixa);

  // Estado "carregando": trava o formulário como se o envio estivesse em andamento.
  if (estado === 'carregando') {
    document.querySelectorAll('form[data-proto-form]').forEach(function (form) {
      var botao = form.querySelector('[type="submit"]');
      var texto = botao && botao.querySelector('.botao-rotulo');
      if (botao) {
        botao.setAttribute('aria-busy', 'true');
        botao.disabled = true;
        if (texto && botao.getAttribute('data-rotulo-enviando')) { texto.textContent = botao.getAttribute('data-rotulo-enviando'); }
      }
      form.querySelectorAll('input, select').forEach(function (campo) { campo.disabled = true; });
    });
  }

  // 3) Nota flutuante para links que, no sistema real, levam a outra página.
  var temporizador = null;
  function nota(texto) {
    var el = document.getElementById('nota-flutuante');
    if (!el) {
      el = document.createElement('div');
      el.id = 'nota-flutuante';
      el.className = 'nota-flutuante';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { el.hidden = true; }, 3200);
  }
  document.addEventListener('click', function (ev) {
    var alvo = ev.target.closest('[data-proto-nota]');
    if (alvo) { ev.preventDefault(); nota(alvo.getAttribute('data-proto-nota')); }
  });

  // 4) Mostrar/ocultar senha.
  document.querySelectorAll('[data-ver-senha]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var campo = document.getElementById(botao.getAttribute('data-ver-senha'));
      var visivel = campo.type === 'text';
      campo.type = visivel ? 'password' : 'text';
      botao.textContent = visivel ? 'Mostrar' : 'Ocultar';
      botao.setAttribute('aria-pressed', visivel ? 'false' : 'true');
      botao.setAttribute('aria-label', (visivel ? 'Mostrar' : 'Ocultar') + ' ' + botao.getAttribute('data-nome-campo'));
    });
  });

  // 5) Copiar texto (login e senha temporária).
  document.querySelectorAll('[data-copiar]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var origem = document.getElementById(botao.getAttribute('data-copiar'));
      var texto = origem ? origem.textContent.trim() : '';
      var feito = function () { nota('Copiado: ' + botao.getAttribute('data-nome-campo')); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(feito, feito);
      } else { feito(); }
    });
  });

  // 6) Diálogos nativos <dialog> com duas etapas: confirmar e resultado.
  document.querySelectorAll('[data-abrir-dialogo]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var dlg = document.getElementById(botao.getAttribute('data-abrir-dialogo'));
      var nome = botao.getAttribute('data-nome-responsavel');
      dlg.querySelectorAll('[data-preencher="nome"]').forEach(function (el) { el.textContent = nome; });
      dlg.querySelectorAll('[data-etapa]').forEach(function (el) { el.hidden = el.getAttribute('data-etapa') !== 'confirmar'; });
      if (dlg.showModal) { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    });
  });
  document.querySelectorAll('[data-fechar-dialogo]').forEach(function (botao) {
    botao.addEventListener('click', function () { botao.closest('dialog').close(); });
  });
  document.querySelectorAll('[data-confirmar-dialogo]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var dlg = botao.closest('dialog');
      botao.setAttribute('aria-busy', 'true');
      botao.disabled = true;
      setTimeout(function () {
        botao.removeAttribute('aria-busy');
        botao.disabled = false;
        dlg.querySelectorAll('[data-etapa]').forEach(function (el) { el.hidden = el.getAttribute('data-etapa') !== 'resultado'; });
        var foco = dlg.querySelector('[data-etapa="resultado"] [data-fechar-dialogo]');
        if (foco) { foco.focus(); }
      }, 700);
    });
  });

  // Revogar/desfazer vínculo (somente visual).
  document.querySelectorAll('[data-revogar]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var item = botao.closest('.vinculo-item');
      var revogado = item.getAttribute('data-revogado') === 'true';
      item.setAttribute('data-revogado', revogado ? 'false' : 'true');
      botao.textContent = revogado ? 'Revogar' : 'Desfazer';
      var nome = item.querySelector('.vinculo-nome');
      nome.setAttribute('aria-label', revogado ? '' : nome.textContent + ' (revogado)');
      if (revogado) { nome.removeAttribute('aria-label'); }
    });
  });

  // 7) Formulários: validação por campo, mensagem junto ao campo, simulação de envio.
  function mostrarErro(campo, texto) {
    var alvo = document.getElementById(campo.id + '-erro');
    campo.setAttribute('aria-invalid', 'true');
    if (alvo) { alvo.textContent = texto; alvo.hidden = false; }
  }
  function limparErro(campo) {
    var alvo = document.getElementById(campo.id + '-erro');
    campo.removeAttribute('aria-invalid');
    if (alvo) { alvo.hidden = true; }
  }

  document.querySelectorAll('form[data-proto-form]').forEach(function (form) {
    form.querySelectorAll('input, select').forEach(function (campo) {
      campo.addEventListener('input', function () { limparErro(campo); });
      campo.addEventListener('change', function () { limparErro(campo); });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var invalidos = [];
      form.querySelectorAll('[required]').forEach(function (campo) {
        var vazio = campo.type === 'checkbox' ? !campo.checked : !campo.value.trim();
        if (vazio) {
          mostrarErro(campo, campo.getAttribute('data-erro') || 'Preencha este campo.');
          invalidos.push(campo);
        } else { limparErro(campo); }
      });

      var tipo = form.getAttribute('data-proto-form');
      if (!invalidos.length && tipo === 'senha') {
        var nova = form.querySelector('#nova-senha');
        var repete = form.querySelector('#repete-senha');
        var comuns = ['12345678', '123456789', 'senha123', 'password', 'melvin123'];
        if (nova.value.length < 8) {
          mostrarErro(nova, 'A senha precisa ter pelo menos 8 caracteres.');
          invalidos.push(nova);
        } else if (comuns.indexOf(nova.value.toLowerCase()) !== -1) {
          mostrarErro(nova, 'Essa senha é muito comum. Escolha outra, como uma frase fácil de lembrar.');
          invalidos.push(nova);
        } else if (nova.value !== repete.value) {
          mostrarErro(repete, 'As duas senhas precisam ser iguais.');
          invalidos.push(repete);
        }
      }
      if (tipo === 'cadastro') {
        var grupo = document.getElementById('alunos-erro');
        if (!form.querySelectorAll('input[name="aluno"]:checked').length) {
          grupo.hidden = false;
          invalidos.push(form.querySelector('input[name="aluno"]'));
        } else { grupo.hidden = true; }
      }

      if (invalidos.length) {
        // Foco no primeiro erro na ordem em que aparece na tela.
        invalidos.sort(function (x, y) { return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
        invalidos[0].focus();
        return;
      }

      var destino = form.getAttribute('data-destino');
      if (tipo === 'login') {
        var usuario = form.querySelector('#login').value.trim().toLowerCase();
        if (usuario === 'erro') { destino = 'entrar.html?estado=erro'; }
        else if (usuario === 'bloqueio') { destino = 'entrar.html?estado=bloqueado'; }
        else if (usuario === 'ocupado') { destino = 'entrar.html?estado=indisponivel'; }
        else if (usuario === 'novo') { destino = 'trocar-senha.html'; }
        else if (usuario === 'unico') { destino = 'painel.html'; }
      }
      var botao = form.querySelector('[type="submit"]');
      var texto = botao.querySelector('.botao-rotulo');
      botao.setAttribute('aria-busy', 'true');
      botao.disabled = true;
      if (texto && botao.getAttribute('data-rotulo-enviando')) { texto.textContent = botao.getAttribute('data-rotulo-enviando'); }
      setTimeout(function () { window.location.href = destino; }, 900);
    });
  });
})();
