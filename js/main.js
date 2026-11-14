/**
 * @file main.js
 * @description Comportamentos gerais do site.
 *
 * Índice:
 *   1. Utilitários e estado compartilhado
 *   2. Links dinâmicos (WhatsApp / Instagram / ano do rodapé)
 *   3. Menu mobile
 *   4. Rolagem suave entre seções
 *   5. Scroll global (progresso de leitura + header inteligente)
 *   6. Scroll spy (link ativo do menu)
 *
 * Dependências: js/config.js (window.SITE_CONFIG).
 * Escrito em ES5 (IIFE) para máxima compatibilidade, sem build/bundler.
 */
(function () {
  "use strict";

  /* ==========================================================================
     1) UTILITÁRIOS E ESTADO COMPARTILHADO
     ========================================================================== */

  /** Configurações do site (ver js/config.js). */
  var cfg = window.SITE_CONFIG || {};

  /** Usuário pediu menos movimento no sistema operacional? (acessibilidade) */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Largura (px) a partir da qual o menu deixa de ser mobile (igual ao CSS). */
  var DESKTOP_QUERY = "(min-width: 960px)";

  /** Parâmetros do header inteligente. */
  var HEADER_HIDE_AFTER = 120;  // só esconde depois de rolar este tanto (px)
  var HEADER_DELTA = 6;         // ignora micro-movimentos de rolagem (px)

  var body = document.body;
  var header = document.querySelector(".header");
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("menu");

  /** Estado: menu mobile aberto? */
  var menuOpen = false;

  /* ==========================================================================
     2) LINKS DINÂMICOS
     ========================================================================== */

  /**
   * Monta a URL do WhatsApp com a mensagem pré-definida da chave informada.
   * Se a chave não existir, usa a mensagem "geral".
   * @param {string} key Chave em SITE_CONFIG.mensagens.
   * @returns {string} URL wa.me pronta para uso em href.
   */
  function buildWhatsAppUrl(key) {
    var msgs = cfg.mensagens || {};
    var text = msgs[key] || msgs.geral || "";
    return "https://wa.me/" + cfg.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  /** Aplica os links em todos os elementos marcados no HTML. */
  function setupContactLinks() {
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      el.setAttribute("href", buildWhatsAppUrl(el.getAttribute("data-wa")));
    });
    document.querySelectorAll("[data-ig]").forEach(function (el) {
      el.setAttribute("href", cfg.instagramUrl || "#");
    });
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();   // copyright sempre atual
  }

  /* ==========================================================================
     3) MENU MOBILE
     ========================================================================== */

  /**
   * Abre/fecha o menu em tela cheia, sincronizando ARIA e bloqueio de rolagem.
   * @param {boolean} open
   */
  function setMenu(open) {
    menuOpen = open;
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    body.classList.toggle("is-locked", open);
    if (open) header.classList.remove("is-hidden");   // garante header visível com menu aberto
  }

  function setupMenu() {
    burger.addEventListener("click", function () { setMenu(!menuOpen); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) setMenu(false);
    });
    // Se a tela crescer para desktop com o menu aberto, fecha-o
    window.matchMedia(DESKTOP_QUERY).addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ==========================================================================
     4) ROLAGEM SUAVE ENTRE SEÇÕES
     ========================================================================== */

  /**
   * Curva de aceleração (começa e termina devagar).
   * @param {number} t Progresso de 0 a 1.
   * @returns {number} Progresso suavizado de 0 a 1.
   */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Rola a página até `targetY` animando com requestAnimationFrame.
   * A duração cresce com a distância (700–1500 ms).
   * @param {number} targetY Posição vertical de destino (px).
   */
  function smoothScrollTo(targetY) {
    var startY = window.scrollY;
    var dist = targetY - startY;

    if (prefersReduced || Math.abs(dist) < 2) { window.scrollTo(0, targetY); return; }

    var duration = Math.min(1500, Math.max(700, Math.abs(dist) * 0.45));
    var t0 = null;

    function step(ts) {
      if (t0 === null) t0 = ts;
      var progress = Math.min(1, (ts - t0) / duration);
      window.scrollTo(0, startY + dist * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /** Intercepta cliques em âncoras internas (#secao) e rola suavemente. */
  function setupAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;                    // "#" sozinho: não faz nada
        var target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        var wasOpen = menuOpen;
        if (wasOpen) setMenu(false);

        // Se o menu estava aberto, espera a trava de rolagem sair antes de medir
        setTimeout(function () {
          var y = id === "#inicio" ? 0 : target.getBoundingClientRect().top + window.scrollY;
          smoothScrollTo(y);
        }, wasOpen ? 60 : 0);
      });
    });
  }

  /* ==========================================================================
     5) SCROLL GLOBAL (progresso + header)
     Um único listener "passive", agrupado por requestAnimationFrame.
     ========================================================================== */

  var lastY = window.scrollY;
  var ticking = false;

  /** Atualiza a barra de progresso e a visibilidade do header. */
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    document.documentElement.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);

    if (!menuOpen) {
      if (y > lastY + HEADER_DELTA && y > HEADER_HIDE_AFTER) header.classList.add("is-hidden");   // descendo
      else if (y < lastY - HEADER_DELTA || y < 60) header.classList.remove("is-hidden");           // subindo / topo
    }
    lastY = y;
    ticking = false;
  }

  function setupScroll() {
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }   // no máximo 1x por quadro
    }, { passive: true });
    onScroll();
  }

  /* ==========================================================================
     6) SCROLL SPY — destaca no menu a seção visível
     ========================================================================== */
  function setupScrollSpy() {
    var links = {};   // id da seção → <a> do menu
    document.querySelectorAll(".nav__link").forEach(function (l) {
      links[l.getAttribute("href").slice(1)] = l;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !links[en.target.id]) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove("is-current"); });
        links[en.target.id].classList.add("is-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });   // faixa fina no meio da tela

    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ==========================================================================
     INICIALIZAÇÃO
     ========================================================================== */
  setupContactLinks();
  setupMenu();
  setupAnchorScroll();
  setupScroll();
  setupScrollSpy();
})();
