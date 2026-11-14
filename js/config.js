/**
 * @file config.js
 * @description Configurações editáveis do site (contato e mensagens do WhatsApp).
 *
 * Este é o ÚNICO arquivo que precisa ser alterado para trocar telefone,
 * Instagram ou textos pré-definidos. Todos os botões do site leem estes valores
 * (ver `js/main.js`, seção "Links dinâmicos").
 *
 * Carregado ANTES dos demais scripts, pois expõe `window.SITE_CONFIG`.
 */

/**
 * @typedef {Object} SiteConfig
 * @property {string} whatsappNumber  Número no formato internacional, só dígitos (55 + DDD + número).
 * @property {string} instagramUrl    URL completa do perfil no Instagram.
 * @property {Object<string,string>} mensagens  Mensagens pré-definidas; a chave é usada em `data-wa="chave"`.
 */

/** @type {SiteConfig} */
window.SITE_CONFIG = {
  /* ⚠️ TROCAR pelo número real da empresa. Exemplo: "5511987654321" */
  whatsappNumber: "5511999999999",

  /* ⚠️ TROCAR pelo perfil real da empresa. */
  instagramUrl: "https://www.instagram.com/lucasprotecoes",

  /* Use *texto* para negrito no WhatsApp. */
  mensagens: {
    geral:
      "Olá! Vim pelo site da Lucas Proteções e gostaria de solicitar um orçamento grátis.",
    rede:
      "Olá! Vim pelo site da Lucas Proteções e gostaria de um orçamento para instalação de *Rede de Proteção*.",
    varal:
      "Olá! Vim pelo site da Lucas Proteções e gostaria de um orçamento de *Varal Sob Medida*.",
    mosqueteira:
      "Olá! Vim pelo site da Lucas Proteções e gostaria de um orçamento de *Tela Mosqueteira*.",
    especialista:
      "Olá! Vim pelo site da Lucas Proteções e gostaria de falar com um especialista.",
    rapido:
      "Olá! Gostaria de um orçamento rápido com a Lucas Proteções."
  }
};
