/**
 * @file animations.js
 * @description Animações inspiradas no site Melius.
 *
 * Índice:
 *   1. Configuração e preferências do usuário
 *   2. Títulos palavra por palavra (máscara)
 *   3. Scroll reveal (IntersectionObserver)
 *   4. Túnel 3D do hero
 *   5. Microinterações (botão magnético, spotlight, parallax)
 *
 * As transições visuais ficam em css/animations.css; aqui só se
 * ativam classes (.is-in) e variáveis CSS (--d, --i, --mx, --my, --py).
 */
(function () {
  "use strict";

  /* ==========================================================================
     1) CONFIGURAÇÃO E PREFERÊNCIAS
     ========================================================================== */

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;   // mouse (não touch)

  /** Parâmetros do túnel 3D — ajuste aqui para mudar o visual do hero. */
  var TUNNEL = {
    PERSPECTIVE: 1100,        // px — deve ser igual ao `perspective` de .tunnel no CSS
    DRIFT_SPEED: 0.32,        // cartões por segundo (movimento automático)
    SCROLL_FACTOR: 0.011,     // cartões por px rolado
    SCROLL_SMOOTHING: 6,      // maior = acompanha a rolagem mais rápido
    INTRO_DELAY: 250,         // ms antes da abertura começar
    INTRO_DURATION: 2200,     // ms da abertura (cartões saem do centro)
    MOUSE_RANGE: { x: 7, y: 8 }  // % de deslocamento do ponto de fuga com o mouse
  };

  /* ==========================================================================
     2) TÍTULOS PALAVRA POR PALAVRA
     ========================================================================== */

  /**
   * Envolve cada palavra de [data-split] em <span.w><span.w__i>.
   * O span externo funciona como máscara (overflow hidden); o interno "sobe".
   * O texto original vai para aria-label e as palavras ficam aria-hidden,
   * para leitores de tela lerem a frase inteira normalmente.
   */
  function splitTitles() {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var text = el.textContent.trim();
      var words = text.split(/\s+/);

      el.setAttribute("aria-label", text);
      el.textContent = "";

      words.forEach(function (word, i) {
        var outer = document.createElement("span");
        outer.className = "w";
        outer.setAttribute("aria-hidden", "true");

        var inner = document.createElement("span");
        inner.className = "w__i";
        inner.style.setProperty("--i", i);          // índice → atraso escalonado no CSS
        inner.textContent = word;

        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ==========================================================================
     3) SCROLL REVEAL
     ========================================================================== */

  /**
   * Revela elementos [data-reveal] e [data-split] quando entram na tela.
   * `data-delay="ms"` vira a variável CSS --d (atraso da transição).
   * Cada elemento anima só uma vez.
   */
  function setupReveal() {
    var els = document.querySelectorAll("[data-reveal], [data-split]");

    els.forEach(function (el) {
      var delay = el.getAttribute("data-delay");
      if (delay) el.style.setProperty("--d", delay + "ms");
    });

    // Sem suporte ou com "reduzir movimento": mostra tudo de imediato
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    // Aguarda o próximo quadro para o navegador aplicar o estado inicial antes de observar
    requestAnimationFrame(function () { els.forEach(function (el) { observer.observe(el); }); });
  }

  /* ==========================================================================
     4) TÚNEL 3D DO HERO
     --------------------------------------------------------------------------
     Cada cartão ocupa uma posição "p" (−N/2 … +N/2) numa fileira circular:
       • x   cresce com |p|            → cartões se afastam do centro
       • z   cresce com (|p|/VIS)²      → as bordas chegam perto e ficam enormes
       • ry  vira os cartões para o centro → forma de "corredor"
       • t   avança sozinho (deriva) e com a rolagem → cartões fluem pelo túnel
     "spread" vai de 0 a 1 na abertura inicial (cartões saem do centro).
     ========================================================================== */
  function setupTunnel() {
    var tunnel = document.querySelector(".tunnel");
    var stage = document.querySelector("[data-tunnel]");
    var hero = document.querySelector(".hero");
    if (!tunnel || !stage || !hero) return;

    /* ---- Cartões: duplica a lista para um túnel mais denso ---- */
    Array.prototype.slice.call(stage.children).forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      stage.appendChild(clone);
    });
    var cards = Array.prototype.slice.call(stage.children);
    var N = cards.length;
    var HALF = N / 2;

    /* ---- Estado ---- */
    var geo = { cw: 0, ch: 0, gap: 0, zMax: 0, vis: 7 };   // geometria (recalculada no resize)
    var tDrift = 0;                                          // deslocamento automático
    var tScroll = 0, tScrollTarget = 0;                      // deslocamento pela rolagem (suavizado)
    var spread = prefersReduced ? 1 : 0;                     // 0 = fechado, 1 = aberto
    var introStart = null;
    var inView = true;                                       // pausa a animação fora da tela
    var lastTs = 0;
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };                // posição suavizada do mouse (−1…1)

    /** Calcula dimensões dos cartões a partir do tamanho do palco. */
    function measure() {
      var w = tunnel.clientWidth, h = tunnel.clientHeight;
      geo.vis = w < 700 ? 5 : (w < 1100 ? 7 : 9);                       // quantos cartões cabem de cada lado
      geo.ch = Math.min(h * (w < 700 ? 0.5 : 0.38), w * (w < 700 ? 0.3 : 0.11));   // altura do cartão central (maior no celular)
      geo.cw = geo.ch * 0.7;
      geo.gap = geo.cw * 0.52;
      geo.zMax = TUNNEL.PERSPECTIVE * 0.92;
      stage.style.setProperty("--cw", geo.cw + "px");
      stage.style.setProperty("--ch", geo.ch + "px");
    }

    /** Posiciona todos os cartões para o estado atual. */
    function render() {
      for (var i = 0; i < N; i++) {
        // Posição circular em relação ao centro, normalizada para (−N/2, N/2]
        var p = ((i - (tDrift + tScroll)) % N + N) % N;
        if (p > HALF) p -= N;

        var ap = Math.abs(p);
        var side = p < 0 ? -1 : 1;
        var k = Math.min(1.15, ap / geo.vis);                            // 0 centro … 1 borda da tela

        var x = p * geo.gap * (0.3 + 0.7 * spread) * (1 + k * 0.6);
        var z = k * k * geo.zMax * spread;
        var ry = side * -(8 + k * 62) * spread;                          // gira em direção ao centro
        var opacity = Math.max(0, Math.min(1, (HALF - ap) / 2)) * Math.min(1, spread * 1.6);

        var card = cards[i];
        card.style.transform = "translate3d(" + x.toFixed(1) + "px,0," + z.toFixed(1) + "px) rotateY(" + ry.toFixed(1) + "deg)";
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = Math.round(1000 - ap * 10);                  // mais perto do centro = por cima
      }
    }

    /** Desaceleração longa (abertura elegante). */
    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    /** Loop de animação (requestAnimationFrame). */
    function frame(ts) {
      requestAnimationFrame(frame);
      if (!inView) { lastTs = ts; return; }                               // economiza bateria

      var dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000);              // segundos desde o último quadro
      lastTs = ts;

      // Abertura inicial
      if (spread < 1 && !prefersReduced) {
        if (introStart === null) introStart = ts + TUNNEL.INTRO_DELAY;
        spread = easeOutExpo(Math.max(0, Math.min(1, (ts - introStart) / TUNNEL.INTRO_DURATION)));
      }

      if (!prefersReduced) {
        tDrift += dt * TUNNEL.DRIFT_SPEED;
        // Rolagem empurra o túnel; lerp (interpolação) suaviza o movimento
        tScrollTarget = window.scrollY * TUNNEL.SCROLL_FACTOR;
        tScroll += (tScrollTarget - tScroll) * Math.min(1, dt * TUNNEL.SCROLL_SMOOTHING);
        // Parallax do ponto de fuga com o mouse
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 4);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 4);
        tunnel.style.perspectiveOrigin =
          (50 + mouse.x * TUNNEL.MOUSE_RANGE.x).toFixed(2) + "% " + (50 + mouse.y * TUNNEL.MOUSE_RANGE.y).toFixed(2) + "%";
      }
      render();
    }

    /* ---- Inicialização e eventos ---- */
    measure();
    render();
    window.addEventListener("resize", function () { measure(); render(); });

    if (finePointer && !prefersReduced) {
      window.addEventListener("pointermove", function (e) {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    requestAnimationFrame(frame);
  }

  /* ==========================================================================
     5) MICROINTERAÇÕES
     ========================================================================== */

  /** Botões [data-magnetic] acompanham levemente o cursor (só com mouse). */
  function setupMagneticButtons() {
    if (!finePointer || prefersReduced) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /** Cards [data-spotlight]: guarda a posição do cursor em --mx/--my (usada pelo brilho no CSS). */
  function setupSpotlight() {
    document.querySelectorAll("[data-spotlight]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /**
   * Parallax: a foto [data-parallax] desliza dentro da moldura conforme a rolagem.
   * A imagem tem 118% da altura da moldura; --py a desloca até −15%.
   */
  function setupParallax() {
    var imgs = document.querySelectorAll("[data-parallax]");
    if (!imgs.length || prefersReduced) return;

    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      imgs.forEach(function (img) {
        var box = img.parentElement.getBoundingClientRect();
        var progress = Math.max(0, Math.min(1, (vh - box.top) / (vh + box.height)));   // 0 → 1 ao atravessar a tela
        img.style.setProperty("--py", (-progress * box.height * 0.15).toFixed(1) + "px");
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ==========================================================================
     INICIALIZAÇÃO (a ordem importa: dividir títulos ANTES de observar)
     ========================================================================== */
  splitTitles();
  setupReveal();
  setupTunnel();
  setupMagneticButtons();
  setupSpotlight();
  setupParallax();
})();
