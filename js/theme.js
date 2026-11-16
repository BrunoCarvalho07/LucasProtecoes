/**
 * @file theme.js
 * @description Alternância entre tema claro e escuro.
 *
 * Como funciona:
 *   • O tema fica no atributo <html data-theme="light|dark"> (ver css/variables.css).
 *   • A escolha é salva no localStorage ("lp-theme") e restaurada nas próximas visitas.
 *     O estado inicial é aplicado por um pequeno script inline no <head> do index.html,
 *     ANTES do CSS carregar, para evitar o "flash" do tema errado.
 *   • A troca usa a View Transitions API: um círculo do novo tema se expande a partir
 *     do botão. Sem suporte (ou com "reduzir movimento"), usa um fade de cores via CSS.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "lp-theme";
  var DURATION = 850;                                       // ms do círculo de revelação
  var EASING = "cubic-bezier(.65, 0, .35, 1)";              // mesma curva --ease-in-out do CSS

  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!toggle) return;

  /** @returns {"light"|"dark"} tema atualmente aplicado. */
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  /**
   * Aplica o tema no DOM e sincroniza acessibilidade e cor da barra do navegador.
   * @param {"light"|"dark"} theme
   */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#111216" : "#0d0e11");
  }

  /** Salva a escolha (try/catch: o localStorage pode estar bloqueado). */
  function saveTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* sem persistência: tudo bem */ }
  }

  /**
   * Troca de tema com animação de círculo expansivo a partir do botão.
   * @param {"light"|"dark"} next Novo tema.
   */
  function switchTheme(next) {
    var canAnimate = typeof document.startViewTransition === "function" && !prefersReduced;

    if (!canAnimate) {                                      // Fallback: fade de cores por CSS
      root.classList.add("theme-fade");
      applyTheme(next);
      setTimeout(function () { root.classList.remove("theme-fade"); }, 700);
      return;
    }

    // Centro do círculo = centro do botão; raio final = distância até o canto mais distante
    var rect = toggle.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    var transition = document.startViewTransition(function () { applyTheme(next); });

    transition.ready.then(function () {
      root.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: DURATION, easing: EASING, pseudoElement: "::view-transition-new(root)" }
      );
    });
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    saveTheme(next);
    switchTheme(next);
  });

  applyTheme(currentTheme());                               // sincroniza ARIA com o tema inicial
})();
