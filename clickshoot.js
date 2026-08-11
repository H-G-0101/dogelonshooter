/*
 * clickshoot.js — atirar com clique / toque na tela.
 *
 * Em vez de mexer na lógica de tiro do jogo (que lê a tecla definida em
 * Controls.Shoot), este script injeta a tecla de tiro no InputManager do
 * GDevelop sempre que o ponteiro está pressionado. Assim animação Shoot,
 * EndShoot, som e cooldown continuam funcionando exatamente igual.
 *
 * MIN_HOLD_MS garante que um toque rápido segure a tecla o suficiente para
 * a animação "Shoot" sair do frame 0 (é o frame > 0 que dispara a bala).
 */
(function () {
  var MIN_HOLD_MS = 220;

  var pointerDown = false;
  var holdUntil = 0;
  var synthDown = false;

  function press() {
    pointerDown = true;
    holdUntil = Date.now() + MIN_HOLD_MS;
  }
  function release() {
    pointerDown = false;
  }

  window.addEventListener('pointerdown', press, true);
  window.addEventListener('pointerup', release, true);
  window.addEventListener('pointercancel', release, true);
  window.addEventListener('blur', release);
  // fallback para navegadores sem Pointer Events
  window.addEventListener('touchstart', press, { capture: true, passive: true });
  window.addEventListener('touchend', release, { capture: true, passive: true });
  window.addEventListener('mousedown', press, true);
  window.addEventListener('mouseup', release, true);

  function shootKeyCode(runtimeScene) {
    try {
      var vars = runtimeScene.getScene().getVariables();
      if (!vars.has('Controls')) return undefined;
      var name = vars.get('Controls').getChild('Shoot').getAsString();
      return gdjs.evtTools.input.keysNameToCode[name];
    } catch (e) {
      return undefined;
    }
  }

  gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
    var code = shootKeyCode(runtimeScene);
    if (code === undefined) return;

    var inputManager = runtimeScene.getGame().getInputManager();
    var wantDown = pointerDown || Date.now() < holdUntil;

    if (wantDown) {
      inputManager.onKeyPressed(code);
      synthDown = true;
    } else if (synthDown) {
      inputManager.onKeyReleased(code);
      synthDown = false;
    }
  });
})();
