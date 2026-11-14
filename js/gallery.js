/**
 * @file gallery.js
 * @description Galeria de trabalhos: filtro, paginação e lightbox.
 *
 * Índice:
 *   1. Elementos e estado
 *   2. Abas de filtro (indicador deslizante)
 *   3. Filtro + "Ver mais"
 *   4. Lightbox (teclado, swipe, pré-carregamento)
 *
 * Marcação esperada (index.html):
 *   <li class="gallery__item" data-cat="redes"> <button class="gallery__btn"> <img src=thumb data-full=grande> …
 */
(function () {
  "use strict";

  var grid = document.getElementById("galleryGrid");
  if (!grid) return;

  /* ==========================================================================
     1) ELEMENTOS E ESTADO
     ========================================================================== */
  var PAGE_SIZE = 12;               // quantas fotos aparecem por vez
  var LEAVE_MS = 240;               // duração da animação de saída ao trocar de filtro

  var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery__item"));
  var moreBtn = document.getElementById("galleryMore");
  var tabsEl = document.querySelector(".tabs");
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll(".tabs__btn"));
  var indicator = document.querySelector(".tabs__indicator");

  var filter = "all";               // categoria ativa
  var limit = PAGE_SIZE;            // limite atual de itens visíveis
  var shown = [];                   // itens visíveis agora (usado também pelo lightbox)

  /* ==========================================================================
     2) ABAS
     ========================================================================== */

  /** Move a "pílula" bronze para baixo da aba ativa. */
  function moveIndicator() {
    var active = tabsEl.querySelector(".tabs__btn.is-active");
    if (!active) return;
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = "translateX(" + active.offsetLeft + "px)";
  }

  /**
   * Ativa uma aba: atualiza classes/ARIA, move o indicador, centraliza a aba
   * (útil no celular, onde a lista rola) e aplica o novo filtro com animação.
   * @param {HTMLElement} btn Aba clicada.
   */
  function activateTab(btn) {
    if (btn.classList.contains("is-active")) return;

    tabBtns.forEach(function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    moveIndicator();
    tabsEl.scrollTo({ left: btn.offsetLeft - (tabsEl.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });

    // Saída dos itens atuais → depois entra o novo conjunto
    shown.forEach(function (it) { it.classList.add("is-leaving"); });
    setTimeout(function () {
      filter = btn.dataset.filter;
      limit = PAGE_SIZE;
      shown = [];
      applyFilter(true);
    }, LEAVE_MS);
  }

  /* ==========================================================================
     3) FILTRO + "VER MAIS"
     ========================================================================== */

  /**
   * Mostra/esconde itens conforme o filtro e o limite atuais.
   * @param {boolean} animateNew Se true, itens recém-exibidos entram com animação escalonada.
   */
  function applyFilter(animateNew) {
    var matches = items.filter(function (it) { return filter === "all" || it.dataset.cat === filter; });
    var visible = matches.slice(0, limit);
    var previous = shown;

    items.forEach(function (it) {
      var show = visible.indexOf(it) > -1;
      it.classList.remove("is-leaving");
      it.hidden = !show;

      if (show && animateNew && previous.indexOf(it) === -1) {
        it.classList.remove("is-entering");
        void it.offsetWidth;                                         // força reflow para reiniciar a animação
        it.style.setProperty("--i", visible.indexOf(it) % PAGE_SIZE);
        it.classList.add("is-entering");
      }
    });

    shown = visible;
    moreBtn.parentElement.hidden = matches.length <= limit;          // esconde o botão quando acabou
  }

  /* ==========================================================================
     4) LIGHTBOX
     ========================================================================== */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector(".lightbox__img");
  var lbCount = lb.querySelector(".lightbox__count");
  var current = 0;                  // índice da foto aberta
  var list = [];                    // fotos navegáveis (as filtradas no momento da abertura)
  var lastFocus = null;             // elemento a receber o foco ao fechar (acessibilidade)

  /**
   * Exibe a foto de índice `idx` (circular), com fade e pré-carga das vizinhas.
   * @param {number} idx
   */
  function showPhoto(idx) {
    current = (idx + list.length) % list.length;
    var thumb = list[current].querySelector("img");

    lbImg.classList.add("is-swapping");
    var full = new Image();                                          // carrega a versão grande antes de trocar
    full.onload = function () {
      lbImg.src = full.src;
      lbImg.alt = thumb.alt;
      lbImg.classList.remove("is-swapping");
    };
    full.src = thumb.dataset.full;
    lbCount.textContent = (current + 1) + " / " + list.length;

    [current - 1, current + 1].forEach(function (n) {                // pré-carrega anterior e próxima
      (new Image()).src = list[(n + list.length) % list.length].querySelector("img").dataset.full;
    });
  }

  /** @param {HTMLElement} item <li.gallery__item> clicado. */
  function openLightbox(item) {
    list = shown.slice();
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    showPhoto(list.indexOf(item));
    lb.querySelector(".lightbox__close").focus();
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute("src"); }, 400);   // espera o fade
    if (lastFocus) lastFocus.focus();
  }

  function setupLightbox() {
    grid.addEventListener("click", function (e) {                    // delegação: 1 listener para todas as fotos
      var btn = e.target.closest(".gallery__btn");
      if (btn) openLightbox(btn.parentElement);
    });
    lb.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lb.querySelector(".lightbox__nav--prev").addEventListener("click", function () { showPhoto(current - 1); });
    lb.querySelector(".lightbox__nav--next").addEventListener("click", function () { showPhoto(current + 1); });
    lb.addEventListener("click", function (e) {                      // clique no fundo fecha
      if (e.target === lb || e.target.classList.contains("lightbox__figure")) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showPhoto(current - 1);
      else if (e.key === "ArrowRight") showPhoto(current + 1);
    });

    // Swipe horizontal (celular): arrastar ≥ 50px troca de foto
    var startX = null;
    lb.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) showPhoto(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ==========================================================================
     INICIALIZAÇÃO
     ========================================================================== */
  tabBtns.forEach(function (btn) { btn.addEventListener("click", function () { activateTab(btn); }); });
  moreBtn.addEventListener("click", function () { limit += PAGE_SIZE; applyFilter(true); });
  window.addEventListener("resize", moveIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);   // fontes mudam a largura das abas

  applyFilter(false);
  moveIndicator();
  setupLightbox();
})();
