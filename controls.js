/*
 * controls.js — substitui o antigo clickshoot.js.
 *
 * 1) Dois esquemas de teclado modernos (WASD ou Setas+ZX), escolhidos numa
 *    tela de opcoes aberta pelo botao "Controls" do menu (antigo "Quit")
 *    ou pela tecla Esc.
 * 2) Tiro tambem no clique / toque na tela.
 *
 * Nada da logica do jogo muda: o script traduz as teclas fisicas para as
 * teclas que os eventos do GDevelop ja esperam, injetando-as no InputManager.
 * Uma tecla canonica nunca e solta por nos enquanto estiver fisicamente
 * pressionada — entao WASD continua funcionando mesmo no esquema Setas.
 */
(function () {
  if (typeof gdjs === 'undefined') {
    console.error('[controls] gdjs nao carregado — cheque a ordem dos scripts no index.html');
    return;
  }

  // Um toque = um tiro. O pulso segura a tecla de tiro por alguns frames
  // porque o disparo so sai quando a animacao "Shoot" passa do frame 0.
  var SHOOT_PULSE_MS = 220;
  var STORAGE_KEY = 'dogelon.controlScheme';

  var SCHEMES = {
    wasd: {
      label: 'WASD',
      note: 'Mao esquerda no teclado. Tiro tambem no clique.',
      left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'],
      jump: ['Space'], shoot: ['KeyJ'],
      rows: [['Mover', 'A / D'], ['Escada', 'W / S'], ['Pular', 'Espaco'], ['Atirar', 'J (1 toque = 1 tiro)']]
    },
    arrows: {
      label: 'Setas + Z X',
      note: 'Mao direita nas setas. Tiro tambem no clique.',
      left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
      jump: ['Space', 'KeyX'], shoot: ['KeyZ'],
      rows: [['Mover', '\u2190 / \u2192'], ['Escada', '\u2191 / \u2193'], ['Pular', 'Espaco ou X'], ['Atirar', 'Z (1 toque = 1 tiro)']]
    }
  };

  var scheme = 'wasd';
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SCHEMES[saved]) scheme = saved;
  } catch (e) {}

  // ---------------------------------------------------------------- input
  var physical = {};            // e.code -> true
  var shootPulseUntil = 0;      // ate quando a tecla de tiro fica injetada
  var pointerArmed = true;      // semi-automatico: rearma so ao soltar
  var keyArmed = true;
  var shootWasActive = false;
  var shootJustEnded = false;
  var overlayOpen = false;
  var synthHeld = {};           // nome de tecla gdjs -> true (injetada por nos)

  // nome de tecla do GDevelop -> KeyboardEvent.code, para nao soltar
  // uma tecla que o jogador esta segurando de verdade.
  var NAME_TO_CODE = {
    a: 'KeyA', d: 'KeyD', w: 'KeyW', s: 'KeyS', q: 'KeyQ', z: 'KeyZ',
    j: 'KeyJ', k: 'KeyK', Space: 'Space',
    Left: 'ArrowLeft', Right: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown'
  };

  function anyDown(codes) {
    for (var i = 0; i < codes.length; i++) if (physical[codes[i]]) return true;
    return false;
  }
  function shootActive() {
    return Date.now() < shootPulseUntil;
  }
  function pulseShoot() {
    if (overlayOpen) return;
    shootPulseUntil = Date.now() + SHOOT_PULSE_MS;
  }
  function isShootKey(code) {
    return SCHEMES[scheme].shoot.indexOf(code) !== -1;
  }

  window.addEventListener('keydown', function (e) {
    var wasDown = !!physical[e.code];
    physical[e.code] = true;
    if (e.code === 'Escape') { e.preventDefault(); toggleOverlay(); return; }
    // um tiro por toque: segurar a tecla nao dispara de novo
    if (isShootKey(e.code)) {
      e.preventDefault();
      if (!wasDown && keyArmed) { keyArmed = false; pulseShoot(); }
      return;
    }
    // evita a pagina rolar com setas/espaco
    if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
  }, true);

  window.addEventListener('keyup', function (e) {
    physical[e.code] = false;
    if (isShootKey(e.code)) keyArmed = true;
  }, true);

  window.addEventListener('blur', function () {
    physical = {}; pointerArmed = true; keyArmed = true; shootPulseUntil = 0;
  });

  function press() {
    if (overlayOpen || !pointerArmed) return;
    pointerArmed = false;
    pulseShoot();
  }
  function release() { pointerArmed = true; }

  window.addEventListener('pointerdown', press, true);
  window.addEventListener('pointerup', release, true);
  window.addEventListener('pointercancel', release, true);
  window.addEventListener('mousedown', press, true);
  window.addEventListener('mouseup', release, true);
  window.addEventListener('touchstart', press, true);
  window.addEventListener('touchend', release, true);
  window.addEventListener('touchcancel', release, true);

  // ------------------------------------------------- injecao por frame
  function controlsVar(runtimeScene, child, fallback) {
    try {
      var vars = runtimeScene.getScene().getVariables();
      if (!vars.has('Controls')) return fallback;
      var v = vars.get('Controls').getChild(child).getAsString();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  if (gdjs.registerRuntimeScenePreEventsCallback) {
    gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
      var s = SCHEMES[scheme];
      var want = {};

      if (!overlayOpen) {
        // 'a' e 'd' entram sempre: alguns eventos do template checam essas
        // teclas na mao, fora da variavel Controls (logica de escada).
        if (anyDown(s.left))  { want[controlsVar(runtimeScene, 'Left', 'a')] = 1; want.a = 1; }
        if (anyDown(s.right)) { want[controlsVar(runtimeScene, 'Right', 'd')] = 1; want.d = 1; }
        if (anyDown(s.up))    { want[controlsVar(runtimeScene, 'Up', 'w')] = 1; }
        if (anyDown(s.down))  { want[controlsVar(runtimeScene, 'Down', 's')] = 1; }
        if (anyDown(s.jump))  { want[controlsVar(runtimeScene, 'Jump', 'Space')] = 1; }
      }

      var nowShooting = !overlayOpen && shootActive();
      shootJustEnded = shootWasActive && !nowShooting;
      shootWasActive = nowShooting;

      var inputManager = runtimeScene.getGame().getInputManager();
      var codes = gdjs.evtTools.input.keysNameToCode;
      var name;

      for (name in want) {
        if (codes[name] === undefined) continue;
        inputManager.onKeyPressed(codes[name]);
        synthHeld[name] = true;
      }
      for (name in synthHeld) {
        if (!synthHeld[name] || want[name]) continue;
        synthHeld[name] = false;
        if (codes[name] === undefined) continue;
        // nao solta se o jogador estiver segurando essa tecla de verdade
        if (physical[NAME_TO_CODE[name]]) continue;
        inputManager.onKeyReleased(codes[name]);
      }
    });
  } else {
    console.warn('[controls] registerRuntimeScenePreEventsCallback ausente');
  }

  // ------------------- leitura da tecla de tiro (ignora segurar a tecla) ----
  var GAME_SHOOT_KEYS = { j: true, k: true }; // valores possiveis de Controls.Shoot

  var origIsKeyPressed = gdjs.evtTools.input.isKeyPressed;
  gdjs.evtTools.input.isKeyPressed = function (runtimeScene, keyName) {
    if (GAME_SHOOT_KEYS[keyName]) return !overlayOpen && shootActive();
    return origIsKeyPressed(runtimeScene, keyName);
  };

  var origWasKeyReleased = gdjs.evtTools.input.wasKeyReleased;
  gdjs.evtTools.input.wasKeyReleased = function (runtimeScene, keyName) {
    if (GAME_SHOOT_KEYS[keyName]) return shootJustEnded;
    return origWasKeyReleased(runtimeScene, keyName);
  };

  // ------------------------------------------------------------- overlay
  var el = null;

  function css() {
    return '#dgControls{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;' +
      'justify-content:center;background:rgba(12,8,20,.88);font-family:ui-monospace,Menlo,Consolas,monospace;' +
      'color:#f4e9d8;padding:16px;box-sizing:border-box}' +
      '#dgControls *{box-sizing:border-box}' +
      '#dgBox{max-width:680px;width:100%;background:#211123;border:4px solid #e8873a;' +
      'box-shadow:0 0 0 4px #120a1c;padding:22px}' +
      '#dgBox h2{margin:0 0 4px;font-size:20px;letter-spacing:2px;color:#ffc14d}' +
      '#dgBox p.sub{margin:0 0 18px;font-size:12px;opacity:.7}' +
      '#dgGrid{display:flex;gap:14px;flex-wrap:wrap}' +
      '.dgCard{flex:1 1 260px;border:3px solid #4a3358;background:#191024;padding:14px;cursor:pointer}' +
      '.dgCard:hover{border-color:#e8873a}' +
      '.dgCard.on{border-color:#ffc14d;background:#2a1730}' +
      '.dgCard h3{margin:0 0 2px;font-size:15px;color:#ffc14d;letter-spacing:1px}' +
      '.dgCard .note{font-size:11px;opacity:.65;margin:0 0 10px}' +
      '.dgCard table{width:100%;border-collapse:collapse;font-size:12px}' +
      '.dgCard td{padding:3px 0}' +
      '.dgCard td:last-child{text-align:right;color:#9fe0ff}' +
      '.dgTag{display:inline-block;margin-top:10px;font-size:10px;letter-spacing:1px;' +
      'color:#0f0a16;background:#ffc14d;padding:2px 6px}' +
      '#dgFoot{display:flex;justify-content:space-between;align-items:center;margin-top:18px;' +
      'font-size:11px;opacity:.65}' +
      '#dgClose{cursor:pointer;background:#e8873a;color:#1a0f22;border:0;padding:9px 20px;' +
      'font-family:inherit;font-size:13px;letter-spacing:2px}';
  }

  function cardHtml(key) {
    var s = SCHEMES[key];
    var rows = s.rows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
    }).join('');
    return '<div class="dgCard' + (key === scheme ? ' on' : '') + '" data-scheme="' + key + '">' +
      '<h3>' + s.label + '</h3><p class="note">' + s.note + '</p>' +
      '<table>' + rows + '</table>' +
      (key === scheme ? '<span class="dgTag">ATIVO</span>' : '') +
      '</div>';
  }

  function build() {
    var style = document.createElement('style');
    style.textContent = css();
    document.head.appendChild(style);

    el = document.createElement('div');
    el.id = 'dgControls';
    el.style.display = 'none';
    el.innerHTML = '<div id="dgBox">' +
      '<h2>CONTROLS</h2>' +
      '<p class="sub">Escolha um esquema. A escolha fica salva no navegador.</p>' +
      '<div id="dgGrid"></div>' +
      '<div id="dgFoot"><span>Esc abre e fecha esta tela. No celular, toque na tela para atirar.</span>' +
      '<button id="dgClose">FECHAR</button></div></div>';
    document.body.appendChild(el);

    el.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); }, true);
    el.addEventListener('mousedown', function (ev) { ev.stopPropagation(); }, true);
    el.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var card = ev.target.closest ? ev.target.closest('.dgCard') : null;
      if (card) {
        scheme = card.getAttribute('data-scheme');
        try { localStorage.setItem(STORAGE_KEY, scheme); } catch (e) {}
        render();
        return;
      }
      if (ev.target.id === 'dgClose' || ev.target.id === 'dgControls') closeOverlay();
    }, true);

    render();
  }

  function render() {
    var grid = el.querySelector('#dgGrid');
    grid.innerHTML = cardHtml('wasd') + cardHtml('arrows');
  }

  function openOverlay() {
    if (!document.body) return;
    if (!el) build();
    render();
    el.style.display = 'flex';
    overlayOpen = true;
    physical = {};
    shootPulseUntil = 0;
    pointerArmed = true;
    keyArmed = true;
  }
  function closeOverlay() {
    if (el) el.style.display = 'none';
    overlayOpen = false;
    shootPulseUntil = 0;
    pointerArmed = true;
    keyArmed = true;
  }
  function toggleOverlay() { overlayOpen ? closeOverlay() : openOverlay(); }

  window.__openControls = openOverlay;
  window.__closeControls = closeOverlay;

  // texto do tutorial dentro da fase, coerente com o esquema escolhido
  window.__tutorialText = function () {
    var r = SCHEMES[scheme].rows;
    return 'Tutorial:\nMover ' + r[0][1] + '  |  Escada ' + r[1][1] +
      '\nPular ' + r[2][1] + '\nEsc = controles';
  };
  window.__shootHintText = function () {
    return 'Atirar: ' + SCHEMES[scheme].rows[3][1];
  };

  console.log('[controls] ativo — esquema "' + scheme + '". Esc abre a tela de controles.');
})();
