/**
 * Lucas Proteção — main.js
 * ==========================================================================
 * Stack de Animação e Interatividade (Inspirado no Melius / A1 Gallery):
 *   - GSAP 3 + ScrollTrigger    → Orquestração de animações e revelação no scroll
 *   - Lenis                    → Rolagem inercial ultra-fluida (Smooth Scroll)
 *   - 3D Perspective Carousel  → Carrossel cilíndrico com fotos que diminuem em 3D
 *   - Abas Interativas         → Alternância fluida dos serviços principais
 *   - Lightbox Modal           → Visualização ampliada de projetos
 *   - Magnetic FABs & Ripple   → Microinterações refinadas de clique e hover
 * ==========================================================================
 */

'use strict';

/* --------------------------------------------------------------------------
   UTILITÁRIOS DOM
-------------------------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* Instância do Lenis */
let lenis = null;

/* ==========================================================================
   1. INICIALIZAÇÃO DO LENIS (SMOOTH SCROLLING MELIUS STYLE)
   ========================================================================== */
function initLenis() {
  if (typeof Lenis === 'undefined') return null;

  try {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    /* Integração bidirecional Lenis <-> GSAP ScrollTrigger */
    if (typeof gsap !== 'undefined') {
      lenis.on('scroll', () => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.update();
        }
      });

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    return lenis;
  } catch (e) {
    console.warn('Lenis não pôde ser inicializado:', e);
    return null;
  }
}

/* ==========================================================================
   2. CORTINA CINEMATOGRÁFICA DE ABERTURA (CURTAIN REVEAL)
   ========================================================================== */
function runCinematicCurtain() {
  return new Promise((resolve) => {
    const curtain  = $('#pageCurtain');
    const fillLine = $('#curtainFill');
    const brand    = $('.page-curtain__brand');
    const inner    = $('.page-curtain__inner');

    if (!curtain) {
      resolve();
      return;
    }

    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          curtain.style.display = 'none';
          resolve();
        },
      });

      tl.to(fillLine, {
        width: '100%',
        duration: 0.35,
        ease: 'power2.inOut',
      })
      .to(brand, {
        scale: 1.04,
        opacity: 1,
        duration: 0.2,
        ease: 'power1.out',
      }, 0.1)
      .to(inner, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        ease: 'power2.in',
      }, 0.3)
      .to(curtain, {
        yPercent: -100,
        duration: 0.7,
        ease: 'power4.inOut',
      }, 0.35);
    } else {
      if (fillLine) fillLine.style.width = '100%';
      setTimeout(() => {
        curtain.style.transition = 'transform 0.5s cubic-bezier(0.77, 0, 0.175, 1)';
        curtain.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          curtain.style.display = 'none';
          resolve();
        }, 500);
      }, 300);
    }
  });
}

/* ==========================================================================
   3. HERO ENTRANCE TIMELINE (ENTRADA PRINCIPAL DO SITE)
   ========================================================================== */
function initHeroEntrance() {
  const header       = $('#header');
  const badge        = $('#heroBadge');
  const titleLines   = $$('.hero__title-line-inner');
  const subtitle     = $('#heroSubtitle');
  const actionBtns   = $$('#heroActions .btn');
  const carouselWrap = $('#heroCarousel3DWrap');
  const stats        = $('#heroStats');
  const scrollInd    = $('#heroScrollIndicator');

  if (typeof gsap === 'undefined') {
    if (header) { header.style.opacity = '1'; header.style.transform = 'none'; }
    if (badge) { badge.style.opacity = '1'; badge.style.transform = 'none'; }
    if (subtitle) { subtitle.style.opacity = '1'; subtitle.style.transform = 'none'; }
    if (stats) { stats.style.opacity = '1'; stats.style.transform = 'none'; }
    titleLines.forEach(l => { l.style.transform = 'none'; });
    actionBtns.forEach(b => { b.style.opacity = '1'; b.style.transform = 'none'; });
    return;
  }

  /* Estados iniciais */
  gsap.set(header,       { yPercent: -100, opacity: 0 });
  gsap.set(badge,        { opacity: 0, y: 25 });
  gsap.set(titleLines,   { yPercent: 120 });
  gsap.set(subtitle,     { opacity: 0, y: 28 });
  gsap.set(actionBtns,   { opacity: 0, y: 24 });
  if (carouselWrap) gsap.set(carouselWrap, { opacity: 0, scale: 0.92, y: 40 });
  gsap.set(stats,        { opacity: 0, y: 30 });
  gsap.set(scrollInd,    { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl
    /* Header desliza do topo */
    .to(header, {
      yPercent: 0,
      opacity: 1,
      duration: 0.85,
      ease: 'power3.out',
    }, 0)

    /* Selo Dourado */
    .to(badge, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
    }, 0.15)

    /* Título Sliced: linhas sobem de trás de suas máscaras */
    .to(titleLines, {
      yPercent: 0,
      duration: 1.0,
      stagger: 0.14,
      ease: 'power4.out',
    }, 0.25)

    /* Subtítulo */
    .to(subtitle, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
    }, 0.55)

    /* Botões com leve efeito elástico */
    .to(actionBtns, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.12,
      ease: 'back.out(1.4)',
    }, 0.7)

    /* Carrossel 3D entra com profundidade */
    .to(carouselWrap, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
    }, 0.85)

    /* Card de Estatísticas Dourado */
    .to(stats, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 1.1)

    /* Indicador do Mouse */
    .to(scrollInd, {
      opacity: 1,
      duration: 0.6,
    }, 1.3);
}

/* ==========================================================================
   4. CARROSSEL 3D EM PERSPECTIVA CILÍNDRICA (EXATAMENTE COMO NO VÍDEO DO MELIUS)
   As fotos diminuem no fundo (scale: 0.58) e possuem textos integrados no card
   ========================================================================== */
function init3DCarousel() {
  const stage = $('#carousel3DStage');
  const cards = $$('.carousel-3d-card', stage);
  const prevBtn = $('#carouselPrev');
  const nextBtn = $('#carouselNext');

  if (!stage || !cards.length) return;

  const N = cards.length;
  let angle = 0;
  let targetAngle = 0;
  const autoRotateSpeed = 0.0032; // Rotação contínua e elegante
  let isHovered = false;
  let isDragging = false;
  let startX = 0;
  let lastX = 0;

  function updateCards() {
    const isMobile = window.innerWidth <= 768;
    /* Raio horizontal (Rx) e profundidade (Rz) */
    const Rx = isMobile ? Math.min(window.innerWidth * 0.46, 270) : 520;
    const Rz = isMobile ? 180 : 320;
    const dipY = isMobile ? 22 : 40;

    cards.forEach((card, i) => {
      const cardAngle = angle + (i * (2 * Math.PI / N));
      const sin = Math.sin(cardAngle);
      const cos = Math.cos(cardAngle);

      /* Coordenadas tridimensionais */
      const x = sin * Rx;
      const z = (cos - 1) * Rz; // 0 na frente, -2Rz no fundo
      const y = (1 - cos) * dipY; // Arco com leve caimento côncavo (igual vídeo)
      const rotY = -sin * 36; // Inclinação rotacional para o centro da curva

      /* EFEITO CRUCIAL: Fotos no fundo ficam MENORES com perspectiva real */
      const factor = (cos + 1) / 2; // Varia de 0 (fundo) a 1 (frente)
      const scale = 0.56 + (0.44 * factor); // De 0.56 a 1.0
      const opacity = 0.36 + (0.64 * factor); // De 0.36 a 1.0
      const zIndex = Math.round(factor * 100);

      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(2);
      card.style.zIndex = zIndex;
    });
  }

  function tick() {
    if (!isDragging) {
      if (!isHovered) {
        targetAngle -= autoRotateSpeed;
      }
      /* Interpolação amortecida suave (lerp) */
      angle += (targetAngle - angle) * 0.075;
    }
    updateCards();
    requestAnimationFrame(tick);
  }
  tick();

  /* Redimensionamento responsivo */
  window.addEventListener('resize', updateCards, { passive: true });

  /* Suporte a Mouse Drag no Desktop */
  stage.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    lastX = startX;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    targetAngle += dx * 0.005;
    angle += dx * 0.005;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  /* Suporte a Touch Swipe em Celulares */
  stage.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    lastX = startX;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const clientX = e.touches[0].clientX;
    const dx = clientX - lastX;
    lastX = clientX;
    targetAngle += dx * 0.007;
    angle += dx * 0.007;
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    isDragging = false;
  }, { passive: true });

  /* Pausa suave no hover para leitura do texto do card */
  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => { isHovered = false; });

  /* Botões de Avançar e Voltar */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      targetAngle += (2 * Math.PI / N);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      targetAngle -= (2 * Math.PI / N);
    });
  }

  /* Clique no Card para focar ou abrir */
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      /* Ao clicar em um card lateral, gira ele para a frente */
      const targetCardAngle = -(index * (2 * Math.PI / N));
      /* Normaliza para o menor giro */
      const diff = ((targetCardAngle - targetAngle) % (2 * Math.PI));
      targetAngle += diff;
    });
  });
}

/* ==========================================================================
   5. SCROLL REVEAL (GSAP SCROLLTRIGGER)
   ========================================================================== */
function initScrollReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    initIntersectionFallback();
    return;
  }

  /* Revelação de elementos comuns */
  const reveals = $$('.reveal').filter(el =>
    !el.closest('.hero__content') &&
    !el.closest('.portfolio__grid') &&
    !el.closest('.testimonials__grid')
  );

  reveals.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  /* Galeria / Portfólio em Grade */
  const portfolioItems = $$('.portfolio-item');
  if (portfolioItems.length) {
    gsap.fromTo(
      portfolioItems,
      { opacity: 0, y: 40, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        ease: 'power2.out',
        stagger: {
          amount: 0.8,
          from: 'start',
        },
        scrollTrigger: {
          trigger: '.portfolio__grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* Depoimentos */
  const testimonials = $$('.testimonial-card');
  if (testimonials.length) {
    gsap.fromTo(
      testimonials,
      { opacity: 0, y: 45 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.16,
        scrollTrigger: {
          trigger: '.testimonials__grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }
}

/* Fallback de Revelação via IntersectionObserver */
function initIntersectionFallback() {
  const elements = $$('.reveal, .portfolio-item, .testimonial-card');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   6. ABAS INTERATIVAS DE SERVIÇOS (ESTILO SHOWCASE DO MELIUS)
   ========================================================================== */
function initServiceTabs() {
  const tabBtns = $$('.tab-btn');
  const panels  = $$('.service-panel');

  if (!tabBtns.length || !panels.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      /* Atualiza estado dos botões */
      tabBtns.forEach((b) => {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      /* Alterna painéis com transição suave */
      panels.forEach((panel) => {
        if (panel.id === `panel-${targetId}`) {
          panel.classList.add('service-panel--active');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(panel, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
            );
          }
        } else {
          panel.classList.remove('service-panel--active');
        }
      });
    });
  });
}

/* ==========================================================================
   7. HEADER STICKY & BLUR NO SCROLL
   ========================================================================== */
function initStickyHeader() {
  const header = $('#header');
  if (!header) return;

  const SCROLL_THRESHOLD = 70;

  function handleScroll(scrollY) {
    if (scrollY > SCROLL_THRESHOLD) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => handleScroll(scroll));
  } else {
    window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });
  }
}

/* ==========================================================================
   8. BOTÕES FLUTUANTES MAGNÉTICOS (WHATSAPP & INSTAGRAM)
   ========================================================================== */
function initMagneticFAB() {
  const fabs = $$('.fab-btn');

  fabs.forEach((fab) => {
    fab.addEventListener('mousemove', (e) => {
      const rect = fab.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.35;
      const dy   = (e.clientY - cy) * 0.35;

      if (typeof gsap !== 'undefined') {
        gsap.to(fab, { x: dx, y: dy, duration: 0.25, ease: 'power2.out' });
      }
    });

    fab.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(fab, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
    });
  });
}

/* ==========================================================================
   9. MENU MOBILE DRAWER
   ========================================================================== */
function initMobileMenu() {
  const hamburger     = $('#hamburger');
  const mobileNav     = $('#mobileNav');
  const mobileOverlay = $('#mobileOverlay');
  const mobileClose   = $('#mobileClose');
  const mobileLinks   = $$('.mobile-nav__link');

  if (!hamburger || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
  }

  function closeMenu() {
    mobileNav.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }

  hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ==========================================================================
   10. ROLAGEM SUAVE PARA ÂNCORAS
   ========================================================================== */
function initSmoothScroll() {
  const header = $('#header');

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#' || targetId === '') return;

    const targetEl = $(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const headerHeight = header ? header.offsetHeight : 76;
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

    if (lenis) {
      lenis.scrollTo(targetTop, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
}

/* ==========================================================================
   11. LIGHTBOX (AMPLIADOR DE FOTOS EM ALTA DEFINIÇÃO)
   ========================================================================== */
function initLightbox() {
  const lightbox        = $('#lightbox');
  const lightboxImg     = $('#lightboxImg');
  const lightboxClose   = $('#lightboxClose');
  const lightboxPrev    = $('#lightboxPrev');
  const lightboxNext    = $('#lightboxNext');
  const lightboxTitle   = $('#lightboxTitle');
  const lightboxCounter = $('#lightboxCounter');
  const lightboxCta     = $('#lightboxCta');

  if (!lightbox || !lightboxImg) return;

  let items        = [];
  let currentIndex = 0;

  /* Coleta fotos visíveis da galeria com título */
  function collectItems() {
    const cards = $$('.portfolio-card:not(.hidden), .portfolio-item:not(.hidden)');
    return cards.map(card => {
      const img = card.querySelector('img');
      const h4  = card.querySelector('h4, strong, .portfolio-card__title');
      return {
        src:   img ? img.src : '',
        alt:   img ? (img.alt || '') : '',
        title: h4  ? h4.textContent.trim() : (img ? img.alt : 'Instalação Lucas Proteção'),
      };
    }).filter(i => i.src);
  }

  function displayIndex(idx) {
    if (!items.length) return;
    currentIndex = (idx + items.length) % items.length;
    const it = items[currentIndex];

    if (lightboxTitle)   lightboxTitle.textContent   = it.title;
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    if (lightboxCta) {
      const msg = encodeURIComponent(`Olá! Gostei da instalação "${it.title}" vista no site e gostaria de um orçamento.`);
      lightboxCta.href = `https://wa.me/5511999999999?text=${msg}`;
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(lightboxImg, {
        opacity: 0, scale: 0.96, duration: 0.15, ease: 'power1.in',
        onComplete: () => {
          lightboxImg.src = it.src;
          lightboxImg.alt = it.alt;
          gsap.to(lightboxImg, { opacity: 1, scale: 1, duration: 0.28, ease: 'power2.out' });
        },
      });
    } else {
      lightboxImg.src = it.src;
      lightboxImg.alt = it.alt;
    }
  }

  function openLightbox(src) {
    items        = collectItems();
    currentIndex = items.findIndex(i => i.src === src);
    if (currentIndex < 0) currentIndex = 0;
    displayIndex(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lenis) lenis.start();
  }

  function prevImage() { displayIndex(currentIndex - 1); }
  function nextImage() { displayIndex(currentIndex + 1); }

  /* Cliques para abrir Lightbox na galeria de fotos */
  document.addEventListener('click', (e) => {
    /* Botão de zoom */
    const zoomBtn = e.target.closest('.btn-card-zoom');
    if (zoomBtn) {
      e.stopPropagation();
      const card = zoomBtn.closest('.portfolio-card, .portfolio-item');
      if (!card) return;
      const img = card.querySelector('img');
      if (img) openLightbox(img.src);
      return;
    }

    /* Clique na imagem dentro do portfolio-card */
    const cardClick = e.target.closest('.portfolio-card');
    if (cardClick) {
      if (e.target.closest('.portfolio-card__actions') || e.target.closest('a')) return;
      const img = cardClick.querySelector('img');
      if (img) openLightbox(img.src);
      return;
    }

    /* Clique nos portfolio-item */
    const item = e.target.closest('.portfolio-item');
    if (!item) return;
    const itemImg = item.querySelector('img');
    if (itemImg) openLightbox(itemImg.src);
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
}


/* ==========================================================================
   12. FILTRO DINÂMICO DE PORTFÓLIO (compatível com .portfolio-card e .portfolio-item)
   ========================================================================== */
function initPortfolioFilter() {
  const filterBtns    = $$('.filter-btn');
  const portfolioGrid = $('#portfolioGrid');

  if (!filterBtns.length || !portfolioGrid) return;

  /* Seleciona qualquer tipo de card presente no grid */
  const getCards = () => $$('.portfolio-card, .portfolio-item', portfolioGrid);

  /* Binds dos links "Ver Fotos de..." para acionar filtro da galeria */
  $('[data-filter-scroll]').forEach((link) => {
    link.addEventListener('click', () => {
      const targetCat = link.dataset.filterScroll;
      const targetBtn = $(`.filter-btn[data-filter="${targetCat}"]`);
      if (targetBtn) targetBtn.click();
    });
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const cards = getCards();

      cards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;

        if (matches) {
          card.classList.remove('hidden');
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.35,
              ease: 'power2.out',
              clearProps: 'pointerEvents',
            });
          } else {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }
        } else {
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              opacity: 0,
              scale: 0.92,
              duration: 0.25,
              ease: 'power1.in',
              onComplete: () => card.classList.add('hidden'),
            });
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
}

/* ==========================================================================
   13. EFEITO RIPPLE NOS BOTÕES
   ========================================================================== */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

/* ==========================================================================
   14. LINK ATIVO NO CABEÇALHO CONFORME SEÇÃO VISÍVEL
   ========================================================================== */
function initActiveNavLink() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');
  const header   = $('#header');

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollY = window.scrollY;
    const headerH = header ? header.offsetHeight : 76;
    let currentSect = '';

    sections.forEach((section) => {
      const top = section.offsetTop - headerH - 120;
      if (scrollY >= top) currentSect = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        'nav__link--active',
        link.getAttribute('href') === `#${currentSect}`
      );
    });
  }

  if (lenis) {
    lenis.on('scroll', updateActiveLink);
  } else {
    window.addEventListener('scroll', updateActiveLink, { passive: true });
  }
  updateActiveLink();
}

/* ==========================================================================
   16. ALTERNADOR TEMA ESCURO / CLARO
   ========================================================================== */
function initThemeToggle() {
  const html = document.documentElement;

  /* Aplica tema salvo (padrão: dark) */
  const stored = localStorage.getItem('lucas_theme') || 'dark';
  html.setAttribute('data-theme', stored);

  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('lucas_theme', theme);
  };

  const toggle = () => {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  const btn        = $('#themeToggle');
  const btnMobile  = $('#themeToggleMobile');
  if (btn)       btn.addEventListener('click', toggle);
  if (btnMobile) btnMobile.addEventListener('click', toggle);
}

/* ==========================================================================
   17. SIMULADOR INTERATIVO DE ORÇAMENTO — envia mensagem formatada no WhatsApp
   ========================================================================== */
function initBudgetSimulator() {
  const serviceWrap  = $('#simServiceOptions');
  const propertyWrap = $('#simPropertyOptions');
  const regionSel    = $('#simRegionSelect');
  const summaryText  = $('#simSummaryText');
  const sendBtn      = $('#simSendBtn');

  if (!serviceWrap || !propertyWrap || !sendBtn) return;

  /* Clique único em cada grupo de opções */
  const bindGroup = (wrap) => {
    const opts = $$('.sim-opt', wrap);
    opts.forEach(btn => {
      btn.addEventListener('click', () => {
        opts.forEach(o => o.classList.remove('sim-opt--active'));
        btn.classList.add('sim-opt--active');
        update();
      });
    });
  };

  bindGroup(serviceWrap);
  bindGroup(propertyWrap);
  if (regionSel) regionSel.addEventListener('change', update);

  function getActive(wrap) {
    const a = wrap.querySelector('.sim-opt--active');
    return a ? a.dataset.val : '';
  }

  function update() {
    const service  = getActive(serviceWrap);
    const property = getActive(propertyWrap);
    const region   = regionSel ? regionSel.value : '';

    /* Atualiza resumo */
    if (summaryText) {
      summaryText.innerHTML =
        `Serviço: <strong>${service || '—'}</strong> &nbsp;•&nbsp; ` +
        `Imóvel: <strong>${property || '—'}</strong> &nbsp;•&nbsp; ` +
        `Região: <strong>${region || '—'}</strong>`;
    }

    /* Monta link WhatsApp */
    const msg = `Olá, Lucas Proteção!\n\nGostaria de solicitar um orçamento:\n\n` +
                `📌 Serviço: ${service}\n` +
                `🏠 Imóvel: ${property}\n` +
                `📍 Região: ${region}\n\n` +
                `Aguardo contato. Obrigado!`;
    sendBtn.setAttribute('href', `https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`);
  }

  /* Inicializa resumo com valores padrão */
  update();
}

/* ==========================================================================
   INICIALIZAÇÃO GERAL E SINCRONIZADA
   ========================================================================== */
window.addEventListener('DOMContentLoaded', async () => {
  /* 1. Plugins do GSAP */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* 2. Lenis Smooth Scroll */
  initLenis();

  /* 3. Cortina Cinematográfica de Abertura */
  await runCinematicCurtain();

  /* 4. Timeline Principal de Entrada do Hero */
  initHeroEntrance();

  /* 5. Carrossel 3D Cilíndrico */
  init3DCarousel();

  /* 6. Scroll Reveal */
  initScrollReveal();

  /* 7. Abas de Serviços */
  initServiceTabs();

  /* 8. Header Sticky */
  initStickyHeader();

  /* 9. FAB Magnético */
  initMagneticFAB();

  /* 10. Menu Mobile */
  initMobileMenu();

  /* 11. Smooth Scroll para Âncoras */
  initSmoothScroll();

  /* 12. Lightbox */
  initLightbox();

  /* 13. Filtros de Portfólio (bento-grid) */
  initPortfolioFilter();

  /* 14. Ripple Effect */
  initRipple();

  /* 15. Nav Active Link */
  initActiveNavLink();

  /* 16. ★ Alternador de Tema Escuro/Claro */
  initThemeToggle();

  /* 17. ★ Simulador de Orçamento */
  initBudgetSimulator();

  console.log('👑 Lucas Proteção — Site moderno, responsivo e totalmente funcional!');
});
