/*
 * controls.js — controles do Dogelon (teclado + toque).
 *
 *  1) Dois esquemas de teclado (WASD ou Setas+ZX).
 *  2) Tiro semi-automatico: 1 toque = 1 tiro (segurar nao repete).
 *  3) Controles na tela para celular, com deteccao automatica.
 *  4) Tela "Controls" aberta pelo botao do menu ou pela tecla Esc.
 *
 * Nada da logica do jogo muda: o script traduz teclado e toque para as
 * teclas que os eventos do GDevelop ja esperam e injeta no InputManager.
 */
(function () {
  if (typeof gdjs === 'undefined') {
    console.error('[controls] gdjs nao carregado — cheque a ordem dos scripts no index.html');
    return;
  }

  var SHOOT_PULSE_MS = 220; // o tiro so sai quando a animacao passa do frame 0
  var KEY_SCHEME = 'dogelon.controlScheme';
  var KEY_TOUCH = 'dogelon.touchControls';

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

  function load(key, fallback, valid) {
    try {
      var v = localStorage.getItem(key);
      if (v && (!valid || valid.indexOf(v) !== -1)) return v;
    } catch (e) {}
    return fallback;
  }
  function save(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  var scheme = load(KEY_SCHEME, 'wasd', ['wasd', 'arrows']);
  var touchMode = load(KEY_TOUCH, 'auto', ['auto', 'on', 'off']);

  // ------------------------------------------------------------ estado
  var physical = {};        // e.code -> true
  var touch = { left: false, right: false, up: false, down: false, jump: false };
  var shootPulseUntil = 0;
  var shootWasActive = false;
  var shootJustEnded = false;
  var pointerArmed = true;  // semi-automatico: so rearma ao soltar
  var keyArmed = true;
  var padArmed = true;
  var overlayOpen = false;
  var inGameScene = false;
  var synthHeld = {};

  var NAME_TO_CODE = {
    a: 'KeyA', d: 'KeyD', w: 'KeyW', s: 'KeyS', q: 'KeyQ', z: 'KeyZ',
    j: 'KeyJ', k: 'KeyK', Space: 'Space',
    Left: 'ArrowLeft', Right: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown'
  };

  function isTouchDevice() {
    try {
      if ((navigator.maxTouchPoints || 0) > 0) return true;
      if ('ontouchstart' in window) return true;
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    } catch (e) {}
    return false;
  }
  var touchDevice = isTouchDevice();
  function touchEnabled() {
    return touchMode === 'on' || (touchMode === 'auto' && touchDevice);
  }
  function padVisible() { return touchEnabled() && inGameScene && !overlayOpen; }

  function anyDown(codes) {
    for (var i = 0; i < codes.length; i++) if (physical[codes[i]]) return true;
    return false;
  }
  function shootActive() { return Date.now() < shootPulseUntil; }
  function pulseShoot() {
    if (overlayOpen) return;
    shootPulseUntil = Date.now() + SHOOT_PULSE_MS;
  }
  function isShootKey(code) { return SCHEMES[scheme].shoot.indexOf(code) !== -1; }

  // ------------------------------------------------------------ teclado
  window.addEventListener('keydown', function (e) {
    var wasDown = !!physical[e.code];
    physical[e.code] = true;
    if (e.code === 'Escape') { e.preventDefault(); toggleOverlay(); return; }
    if (isShootKey(e.code)) {
      e.preventDefault();
      if (!wasDown && keyArmed) { keyArmed = false; pulseShoot(); }
      return;
    }
    if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
  }, true);

  window.addEventListener('keyup', function (e) {
    physical[e.code] = false;
    if (isShootKey(e.code)) keyArmed = true;
  }, true);

  window.addEventListener('blur', function () {
    physical = {};
    touch = { left: false, right: false, up: false, down: false, jump: false };
    pointerArmed = keyArmed = padArmed = true;
    shootPulseUntil = 0;
    refreshPadVisual();
  });

  // --------------------------------------- clique no cenario (desktop)
  function pointerPress() {
    // com os botoes na tela, so o botao de tiro atira
    if (overlayOpen || padVisible() || !pointerArmed) return;
    pointerArmed = false;
    pulseShoot();
  }
  function pointerRelease() { pointerArmed = true; }

  window.addEventListener('pointerdown', pointerPress, true);
  window.addEventListener('pointerup', pointerRelease, true);
  window.addEventListener('pointercancel', pointerRelease, true);
  window.addEventListener('mousedown', pointerPress, true);
  window.addEventListener('mouseup', pointerRelease, true);

  // ---------------------------------------------- injecao por frame
  function controlsVar(runtimeScene, child, fallback) {
    try {
      var vars = runtimeScene.getScene().getVariables();
      if (!vars.has('Controls')) return fallback;
      return vars.get('Controls').getChild(child).getAsString() || fallback;
    } catch (e) { return fallback; }
  }

  if (gdjs.registerRuntimeScenePreEventsCallback) {
    gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
      var sceneName = runtimeScene.getName ? runtimeScene.getName() : '';
      var wasInGame = inGameScene;
      inGameScene = sceneName === 'GameScene';
      if (wasInGame !== inGameScene) refreshPadVisual();

      var s = SCHEMES[scheme];
      var want = {};

      if (!overlayOpen) {
        // 'a' e 'd' entram sempre: o template checa essas duas teclas na mao,
        // fora da variavel Controls (logica de agarrar escada).
        if (anyDown(s.left) || touch.left) { want[controlsVar(runtimeScene, 'Left', 'a')] = 1; want.a = 1; }
        if (anyDown(s.right) || touch.right) { want[controlsVar(runtimeScene, 'Right', 'd')] = 1; want.d = 1; }
        if (anyDown(s.up) || touch.up) { want[controlsVar(runtimeScene, 'Up', 'w')] = 1; }
        if (anyDown(s.down) || touch.down) { want[controlsVar(runtimeScene, 'Down', 's')] = 1; }
        if (anyDown(s.jump) || touch.jump) { want[controlsVar(runtimeScene, 'Jump', 'Space')] = 1; }
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
        if (physical[NAME_TO_CODE[name]]) continue; // nao solta tecla realmente segurada
        inputManager.onKeyReleased(codes[name]);
      }
    });
  } else {
    console.warn('[controls] registerRuntimeScenePreEventsCallback ausente');
  }

  // ------------- leitura da tecla de tiro (ignora segurar a tecla) ------
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

  // ============================ CSS ====================================
  var CSS =
    '#dgPad{position:fixed;pointer-events:none;z-index:9998;touch-action:none;' +
    '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;display:none}' +
    '#dgPad .cluster{position:absolute;bottom:calc(3vmin + env(safe-area-inset-bottom,0px));' +
    'display:flex;align-items:flex-end;gap:2.2vmin}' +
    '#dgPad .cluster.l{left:calc(3vmin + env(safe-area-inset-left,0px))}' +
    '#dgPad .cluster.r{right:calc(3vmin + env(safe-area-inset-right,0px))}' +
    '#dgPad .dpad{position:relative;width:34vmin;height:34vmin;max-width:210px;max-height:210px}' +
    '#dgPad .btn{position:absolute;pointer-events:auto;touch-action:none;display:flex;' +
    'align-items:center;justify-content:center;border-radius:50%;' +
    'background:rgba(20,13,28,.42);border:2px solid rgba(255,193,77,.55);' +
    'box-shadow:0 2px 10px rgba(0,0,0,.45), inset 0 0 14px rgba(255,193,77,.10);' +
    'backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px);transition:background .06s,transform .06s}' +
    '#dgPad .btn.on{background:rgba(232,135,58,.72);border-color:#ffd98a;transform:scale(.94)}' +
    '#dgPad .btn svg{width:52%;height:52%;fill:#ffc14d;opacity:.92;pointer-events:none}' +
    '#dgPad .btn.on svg{fill:#1a0f22;opacity:1}' +
    '#dgPad .dpad .btn{width:12.5vmin;height:12.5vmin;max-width:78px;max-height:78px}' +
    '#dgPad .dpad .up{left:50%;top:0;transform:translateX(-50%)}' +
    '#dgPad .dpad .up.on{transform:translateX(-50%) scale(.94)}' +
    '#dgPad .dpad .down{left:50%;bottom:0;transform:translateX(-50%)}' +
    '#dgPad .dpad .down.on{transform:translateX(-50%) scale(.94)}' +
    '#dgPad .dpad .left{left:0;top:50%;transform:translateY(-50%)}' +
    '#dgPad .dpad .left.on{transform:translateY(-50%) scale(.94)}' +
    '#dgPad .dpad .right{right:0;top:50%;transform:translateY(-50%)}' +
    '#dgPad .dpad .right.on{transform:translateY(-50%) scale(.94)}' +
    '#dgPad .act{position:relative;width:16vmin;height:16vmin;max-width:104px;max-height:104px}' +
    '#dgPad .act.shoot{width:18.5vmin;height:18.5vmin;max-width:118px;max-height:118px;' +
    'border-color:#ffc14d;background:rgba(232,135,58,.30)}' +
    '#dgPad .lbl{position:absolute;bottom:-2.6vmin;left:0;right:0;text-align:center;' +
    'font:600 2.1vmin/1 ui-monospace,Menlo,Consolas,monospace;color:rgba(255,215,150,.75);' +
    'letter-spacing:1px;pointer-events:none}' +

    '#dgControls{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;' +
    'justify-content:center;background:rgba(12,8,20,.88);font-family:ui-monospace,Menlo,Consolas,monospace;' +
    'color:#f4e9d8;padding:16px;box-sizing:border-box;overflow:auto}' +
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
    '#dgTouch{margin-top:18px;border-top:1px solid #3a2846;padding-top:14px;font-size:12px}' +
    '#dgTouch b{color:#ffc14d;letter-spacing:1px;font-size:12px}' +
    '#dgTouch .opts{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}' +
    '#dgTouch .opt{cursor:pointer;border:2px solid #4a3358;background:#191024;padding:7px 14px;font-size:12px}' +
    '#dgTouch .opt.on{border-color:#ffc14d;color:#ffc14d}' +
    '#dgFoot{display:flex;justify-content:space-between;align-items:center;margin-top:18px;' +
    'gap:10px;font-size:11px;opacity:.75}' +
    '#dgClose{cursor:pointer;background:#e8873a;color:#1a0f22;border:0;padding:9px 20px;' +
    'font-family:inherit;font-size:13px;letter-spacing:2px}';

  var ICON = {
    left: '<svg viewBox="0 0 24 24"><path d="M16 3 6 12l10 9z"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M8 3l10 9-10 9z"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 4l9 10H3z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 20 3 10h18z"/></svg>',
    jump: '<svg viewBox="0 0 24 24"><path d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2zm-1 5.6h2.4l3.3 3.6 2.6-1.4 1 1.9-3.9 2.1-2-2.1V16l3.4 5.2-2 1.3L12 17.6 8.6 22l-2-1.2 3-4.6v-4l-2.1 1.9v3.2H5.2v-4.1z"/></svg>',
    shoot: '<svg viewBox="0 0 24 24"><path d="M2 7h11l1.6 3H21v2.2h-4.2l1 2.3-2 .9-1.4-3.2H10v3.4H7.6V12.2H5.4L4 16H2V7zm3.6 2.1v1.6h2.2V9.1H5.6z"/></svg>'
  };

  // ============================ PAD =====================================
  var pad = null;
  var padBtns = {};

  function ensureStyle() {
    if (document.getElementById('dgStyle')) return;
    var st = document.createElement('style');
    st.id = 'dgStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function setAction(action, down) {
    if (action === 'shoot') {
      if (down) {
        if (padArmed) { padArmed = false; pulseShoot(); }
      } else {
        padArmed = true;
      }
      return;
    }
    touch[action] = down;
  }

  function makeBtn(action, cls, icon, label) {
    var b = document.createElement('div');
    b.className = 'btn ' + cls;
    b.innerHTML = icon + (label ? '<span class="lbl">' + label + '</span>' : '');
    b.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      try { b.setPointerCapture(ev.pointerId); } catch (e) {}
      setAction(action, true);
      b.classList.add('on');
    }, true);
    var up = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      setAction(action, false);
      b.classList.remove('on');
    };
    b.addEventListener('pointerup', up, true);
    b.addEventListener('pointercancel', up, true);
    b.addEventListener('lostpointercapture', up, true);
    b.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    padBtns[action] = b;
    return b;
  }

  function buildPad() {
    ensureStyle();
    pad = document.createElement('div');
    pad.id = 'dgPad';

    var left = document.createElement('div');
    left.className = 'cluster l';
    var dpad = document.createElement('div');
    dpad.className = 'dpad';
    dpad.appendChild(makeBtn('up', 'up', ICON.up));
    dpad.appendChild(makeBtn('down', 'down', ICON.down));
    dpad.appendChild(makeBtn('left', 'left', ICON.left));
    dpad.appendChild(makeBtn('right', 'right', ICON.right));
    left.appendChild(dpad);

    var right = document.createElement('div');
    right.className = 'cluster r';
    right.appendChild(makeBtn('shoot', 'act shoot', ICON.shoot, 'TIRO'));
    right.appendChild(makeBtn('jump', 'act', ICON.jump, 'PULO'));

    pad.appendChild(left);
    pad.appendChild(right);
    document.body.appendChild(pad);
    layoutPad();
  }

  // encaixa o pad exatamente sobre a area do canvas do jogo
  function layoutPad() {
    if (!pad) return;
    var canvas = document.querySelector('#canvasArea canvas') || document.querySelector('canvas');
    var r = canvas ? canvas.getBoundingClientRect() : null;
    if (r && r.width > 0 && r.height > 0) {
      pad.style.left = r.left + 'px';
      pad.style.top = r.top + 'px';
      pad.style.width = r.width + 'px';
      pad.style.height = r.height + 'px';
    } else {
      pad.style.left = '0px';
      pad.style.top = '0px';
      pad.style.width = '100%';
      pad.style.height = '100%';
    }
  }

  function refreshPadVisual() {
    if (!padVisible()) {
      if (pad) pad.style.display = 'none';
      touch = { left: false, right: false, up: false, down: false, jump: false };
      for (var k in padBtns) padBtns[k].classList.remove('on');
      return;
    }
    if (!pad) { if (!document.body) return; buildPad(); }
    layoutPad();
    pad.style.display = 'block';
  }

  window.addEventListener('resize', function () { layoutPad(); });
  window.addEventListener('orientationchange', function () { setTimeout(layoutPad, 250); });
  setInterval(function () { if (pad && pad.style.display !== 'none') layoutPad(); }, 1000);

  // ========================== OVERLAY ===================================
  var el = null;

  function cardHtml(key) {
    var s = SCHEMES[key];
    var rows = s.rows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
    }).join('');
    return '<div class="dgCard' + (key === scheme ? ' on' : '') + '" data-scheme="' + key + '">' +
      '<h3>' + s.label + '</h3><p class="note">' + s.note + '</p><table>' + rows + '</table>' +
      (key === scheme ? '<span class="dgTag">ATIVO</span>' : '') + '</div>';
  }

  function touchHtml() {
    var opts = [['auto', 'Automatico'], ['on', 'Sempre'], ['off', 'Nunca']].map(function (o) {
      return '<div class="opt' + (touchMode === o[0] ? ' on' : '') + '" data-touch="' + o[0] + '">' + o[1] + '</div>';
    }).join('');
    return '<b>CONTROLES NA TELA</b><div style="opacity:.65;margin-top:4px">' +
      'Automatico mostra o direcional so em celular e tablet. Este aparelho foi detectado como ' +
      (touchDevice ? 'toque' : 'mouse/teclado') + '.</div>' +
      '<div class="opts">' + opts + '</div>';
  }

  function build() {
    ensureStyle();
    el = document.createElement('div');
    el.id = 'dgControls';
    el.style.display = 'none';
    el.innerHTML = '<div id="dgBox">' +
      '<h2>CONTROLS</h2>' +
      '<p class="sub">As escolhas ficam salvas neste navegador.</p>' +
      '<div id="dgGrid"></div>' +
      '<div id="dgTouch"></div>' +
      '<div id="dgFoot"><span>Esc abre e fecha esta tela.</span>' +
      '<button id="dgClose">FECHAR</button></div></div>';
    document.body.appendChild(el);

    el.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); }, true);
    el.addEventListener('mousedown', function (ev) { ev.stopPropagation(); }, true);
    el.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var t = ev.target;
      var card = t.closest ? t.closest('.dgCard') : null;
      if (card) { scheme = card.getAttribute('data-scheme'); save(KEY_SCHEME, scheme); render(); return; }
      var opt = t.closest ? t.closest('.opt') : null;
      if (opt) { touchMode = opt.getAttribute('data-touch'); save(KEY_TOUCH, touchMode); render(); return; }
      if (t.id === 'dgClose' || t.id === 'dgControls') closeOverlay();
    }, true);
    render();
  }

  function render() {
    if (!el) return;
    el.querySelector('#dgGrid').innerHTML = cardHtml('wasd') + cardHtml('arrows');
    el.querySelector('#dgTouch').innerHTML = touchHtml();
  }

  function openOverlay() {
    if (!document.body) return;
    if (!el) build();
    render();
    el.style.display = 'flex';
    overlayOpen = true;
    physical = {};
    touch = { left: false, right: false, up: false, down: false, jump: false };
    shootPulseUntil = 0;
    pointerArmed = keyArmed = padArmed = true;
    refreshPadVisual();
  }
  function closeOverlay() {
    if (el) el.style.display = 'none';
    overlayOpen = false;
    shootPulseUntil = 0;
    pointerArmed = keyArmed = padArmed = true;
    refreshPadVisual();
  }
  function toggleOverlay() { overlayOpen ? closeOverlay() : openOverlay(); }

  window.__dgPadButtons = padBtns; // hook de depuracao
  window.__openControls = openOverlay;
  window.__closeControls = closeOverlay;

  window.__tutorialText = function () {
    if (padVisible()) return 'Tutorial:\nUse os botoes na tela\npara mover, pular e atirar';
    var r = SCHEMES[scheme].rows;
    return 'Tutorial:\nMover ' + r[0][1] + '  |  Escada ' + r[1][1] +
      '\nPular ' + r[2][1] + '\nEsc = controles';
  };
  window.__shootHintText = function () {
    if (padVisible()) return 'Toque no botao de tiro';
    return 'Atirar: ' + SCHEMES[scheme].rows[3][1];
  };

  console.log('[controls] ativo — teclado "' + scheme + '", toque "' + touchMode +
    '" (aparelho: ' + (touchDevice ? 'toque' : 'mouse/teclado') + ')');
})();
