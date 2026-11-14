# Lucas Proteções — Redes de Proteção, Varais e Telas

Landing page moderna, responsiva e de alta performance desenvolvida para a **Lucas Proteções**, empresa especializada na instalação de redes de proteção residencial, varais sob medida e telas mosqueteiras em São Paulo e região metropolitana.

---

## 🚀 Tecnologias & Arquitetura

O projeto foi construído seguindo as melhores práticas de desenvolvimento web moderno, sem frameworks pesados, garantindo carregamento ultrarrápido, acessibilidade e excelente pontuação de SEO / Core Web Vitals.

- **HTML5 Semântico**: Estrutura orientada a acessibilidade (WAI-ARIA) e SEO técnico com microdados Schema.org (LocalBusiness).
- **CSS3 Moderno**:
  - Metodologia BEM (Block-Element-Modifier).
  - Variáveis CSS (Custom Properties) para temas dinâmicos (**Dark & Light Mode**).
  - Design responsivo (Mobile-First) com flexbox e CSS Grid.
  - Efeitos de glassmorphism com `backdrop-filter`.
- **JavaScript (Vanilla ES6+)**:
  - **GSAP 3** & **ScrollTrigger**: Micro-interações, entrada cinematográfica e animações fluidas.
  - **Lenis Smooth Scroll**: Rolagem suave de alta precisão integrada com GPU acceleration.
  - Carrossel 3D cilíndrico com rotação contínua e interações touch/drag.
  - Lightbox responsivo em alta definição com navegação por teclado e botões ergonômicos.
  - Simulador interativo de orçamento com geração dinâmica de mensagem formatada para WhatsApp.
- **Font Awesome 6**: Ícones vetorizados consistentes.

---

## ✨ Funcionalidades Principais

1. **Tema Claro / Escuro (Dark & Light Mode)**:
   - Alternância instantânea com persistência da preferência do usuário no `localStorage`.
   - Paleta refinada: *Black & Gold Luxury* (modo escuro) e *Alabaster & Bronze Gold* (modo claro de alto contraste).

2. **Carrossel 3D Interativo**:
   - Perspectiva cilíndrica com profundidade real e ajuste dinâmico para telas móveis.
   - Suporte a arraste com mouse e toque no mobile.

3. **Galeria & Lightbox HD**:
   - Filtro de categorias por tipo de serviço (Sacadas, Janelas, Varais, Telas).
   - Visualizador de fotos em tela cheia com legendas e link direto para cotação do modelo específico no WhatsApp.

4. **Simulador de Orçamento Express**:
   - Seleção em 3 etapas (Serviço, Tipo de Imóvel e Região de SP).
   - Gera um pedido pronto e estruturado com 1 clique para o WhatsApp do instalador.

5. **Menu Mobile Otimizado**:
   - Menu drawer com efeito vidro fosco (glassmorphism) e toque ergonômico.

---

## 📁 Estrutura de Arquivos

```text
├── css/
│   └── style.css            # Folha de estilos unificada (Reset, Variáveis, Temas, Componentes e Responsividade)
├── js/
│   └── main.js              # Lógica da aplicação, animações GSAP, filtros, simulador e lightbox
├── img/                     # Fotografias e imagens de projetos reais instalados
├── logo/                    # Identidade visual da marca
├── index.html               # Estrutura principal da Landing Page
├── .gitignore               # Arquivos ignorados pelo controle de versão
└── README.md                # Documentação técnica do projeto
```

---

## 🛠️ Como Executar o Projeto Localmente

Por se tratar de uma aplicação front-end estática, não requer instalação de dependências ou build complexo:

1. Clone o repositório:
   ```bash
   git clone https://github.com/BrunoCarvalho07/LucasProtecoes.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd LucasProtecoes
   ```
3. Abra o arquivo `index.html` em seu navegador favorito ou utilize um servidor local:
   ```bash
   # Utilizando Python 3:
   python -m http.server 3000
   
   # Ou com Node.js (via npx):
   npx serve .
   ```

---

## 📱 Contato & Orçamentos

- **Empresa**: Lucas Proteções
- **Atendimento**: São Paulo, Capital, ABC, Alphaville e Região Metropolitana.
- **WhatsApp**: [(11) 99999-9999](https://wa.me/5511999999999)

---

## 📄 Licença

Este projeto é de propriedade exclusiva da **Lucas Proteções**. Todos os direitos reservados.
