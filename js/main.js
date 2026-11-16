/* ==========================================================================
   AGRIM SRIVASTAVA — PORTFOLIO SCRIPT ENGINE
   Interactive Specimen Deck, Ambient Mesh, EM Sandbox, Terminal & Telemetry
   ========================================================================== */

function initPortfolio() {

  /* --------------------------------------------------------------------------
     1. AMBIENT BACKGROUND CANVAS (Fluid Particle Constellation)
     -------------------------------------------------------------------------- */
  const ambientCanvas = document.getElementById('ambient-canvas');
  if (ambientCanvas) {
    const ctx = ambientCanvas.getContext('2d');
    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 24), 60);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.8;
        this.alpha = Math.random() * 0.35 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Subtle gravitational pull toward cursor
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 10) {
          this.vx += (dx / dist) * 0.012;
          this.vy += (dy / dist) * 0.012;
        }

        // Dampen velocity
        this.vx *= 0.99;
        this.vy *= 0.99;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 184, 105, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const opacity = (1 - dist / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(229, 184, 105, ${opacity})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderAmbient);
    }
    renderAmbient();
  }

  /* --------------------------------------------------------------------------
     2. TELEMETRY SCROLL PROGRESS & RETICLE CURSOR
     -------------------------------------------------------------------------- */
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const cursorDot = document.querySelector('.custom-cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  const cursorTelemetry = document.querySelector('.cursor-telemetry');
  const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

  let curX = -100, curY = -100;
  let followerX = -100, followerY = -100;
  let cursorActivated = false;

  const chronicleContainer = document.querySelector('.chronicle-container');
  const chronicleTrackFill = document.getElementById('chronicle-track-fill');

  function updateChronicleProgress() {
    if (!chronicleContainer || !chronicleTrackFill) return;
    const rect = chronicleContainer.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Active zone: from when container enters mid-screen to when it exits
    const startY = windowH * 0.7;
    const endY = windowH * 0.2;

    if (rect.top <= startY && rect.bottom >= endY) {
      const totalH = rect.height;
      const current = startY - rect.top;
      const pct = Math.min(Math.max((current / totalH) * 100, 0), 100);
      chronicleTrackFill.style.height = `${pct}%`;
    } else if (rect.top > startY) {
      chronicleTrackFill.style.height = '0%';
    } else if (rect.bottom < endY) {
      chronicleTrackFill.style.height = '100%';
    }
  }

  function updateScrollProgress() {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0 && scrollProgressBar) {
      const progress = (window.scrollY / totalScroll) * 100;
      scrollProgressBar.style.width = `${progress}%`;
    }
    updateChronicleProgress();
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress, { passive: true });
  updateScrollProgress();

  if (isFinePointer && cursorDot && cursorFollower) {
    window.addEventListener('mousemove', (e) => {
      curX = e.clientX;
      curY = e.clientY;

      if (!cursorActivated) {
        cursorActivated = true;
        document.body.classList.add('cursor-active');
        followerX = curX;
        followerY = curY;
      }

      cursorDot.style.left = `${curX}px`;
      cursorDot.style.top = `${curY}px`;

      if (cursorTelemetry) {
        cursorTelemetry.style.left = `${curX}px`;
        cursorTelemetry.style.top = `${curY}px`;
        cursorTelemetry.textContent = `[X:${Math.round(curX)} Y:${Math.round(curY)}]`;
      }
    });

    // Smooth follower lerp
    function animateCursor() {
      if (cursorActivated) {
        followerX += (curX - followerX) * 0.18;
        followerY += (curY - followerY) * 0.18;

        cursorFollower.style.left = `${followerX}px`;
        cursorFollower.style.top = `${followerY}px`;
      }
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state expansion on interactive elements
    const interactiveSelectors = 'a, button, .specimen-index-card, .filter-pill-btn, .skill-evidence-card, .preset-btn, input, canvas';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* --------------------------------------------------------------------------
     3. SPOTLIGHT CARD CURSOR TRACKING (Non-standard luxury hover)
     -------------------------------------------------------------------------- */
  function setupSpotlightCards() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
  setupSpotlightCards();

  /* --------------------------------------------------------------------------
     4. SCROLL REVEAL OBSERVER & TELEMETRY COUNTER ANIMATION
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // If this contains telemetry counters, trigger them
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach(counter => runCounter(counter));
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  function runCounter(counterEl) {
    if (counterEl.dataset.started) return;
    counterEl.dataset.started = 'true';

    const target = parseFloat(counterEl.dataset.target);
    const decimals = parseInt(counterEl.dataset.decimals || '0', 10);
    const suffix = counterEl.dataset.suffix || '';
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * eased;

      counterEl.textContent = currentVal.toFixed(decimals) + (progress === 1 ? suffix : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counterEl.textContent = target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  /* --------------------------------------------------------------------------
     5. EXPERIENCE TIMELINE LASER FILL PROGRESS LINE (Handled above in scroll)
     -------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     6. ACTIVE NAVIGATION SPY
     -------------------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const navSections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    navSections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  /* --------------------------------------------------------------------------
     7. KINETIC TEXT SCRAMBLE / GLYPH DECODER ENGINE
     -------------------------------------------------------------------------- */
  const glyphs = '01αβλ∇ΨΣΩ#@%&§¥';
  function scrambleText(element) {
    const originalText = element.getAttribute('data-original-text') || element.innerText.trim();
    if (!element.getAttribute('data-original-text')) {
      element.setAttribute('data-original-text', originalText);
    }

    let iteration = 0;
    const maxIterations = originalText.length * 2.2;
    const interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration / 2.2) return originalText[index];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join('');

      if (iteration >= maxIterations) {
        clearInterval(interval);
        element.innerText = originalText;
      }
      iteration += 1;
    }, 25);
  }

  document.querySelectorAll('[data-scramble]').forEach((el) => {
    el.addEventListener('mouseenter', () => scrambleText(el));
  });

  /* --------------------------------------------------------------------------
     8. THE ARCHITECTURAL SPECIMEN DECK (PROJECTS DATA & ENGINE)
     -------------------------------------------------------------------------- */
  const projectsData = [
    {
      id: 'SYS-01',
      title: 'NutriAgent',
      category: 'agentic',
      categoryLabel: 'Multi-Agent AI & Vision',
      status: '100% Deterministic · ₹0 API Cost',
      thesis: 'Autonomous multi-agent nutritional intelligence engine combining LangGraph, Gemini Vision, and deterministic energy guardrails.',
      description: 'Engineered an end-to-end multi-agent pipeline routing dish image decomposition, nutritional RAG retrieval across 570+ ICMR-NIN/USDA records, and AST-validated read-only SQL queries. Slashed calorie estimation error from 32.3% MAPE to 0.0% on a 28-dish benchmark.',
      metrics: [
        { label: 'Calorie MAPE Error', val: '32.3% → 0.0%' },
        { label: 'Pytest Test Suite', val: '254 / 254 Passing' },
        { label: 'Safety Guardrails', val: 'Deterministic AST SQL' },
        { label: 'Vector Index', val: 'pgvector / Supabase' }
      ],
      stack: ['LangGraph', 'Gemini Vision', 'FastAPI', 'Supabase pgvector', 'Docker', 'Streamlit'],
      github: 'https://github.com/agrimsri/nutri_agent',
      live: null,
      image: null,
      blueprint: [
        { num: '01', name: 'Vision Decomposition', detail: 'Gemini Multimodal extracts portion weights & ingredients' },
        { num: '02', name: 'Atwater Energy Guard', detail: 'Deterministic mathematical bounds on macronutrients' },
        { num: '03', name: 'Semantic RAG Lookup', detail: 'MiniLM embeddings matched over 570+ ICMR records' },
        { num: '04', name: 'AST SQL Validation', detail: 'Enforces read-only query permissions before execution' }
      ]
    },
    {
      id: 'SYS-02',
      title: 'TutorSolve',
      category: 'distributed',
      categoryLabel: 'Marketplace & WebSockets',
      status: 'Full Production Deployed',
      thesis: 'High-concurrency 4-role assignment marketplace with isolated Socket.IO rooms, Maker-Checker escrow, and preview locking.',
      description: 'Architected a multi-tier transaction platform (student, expert, admin, super-admin). Engineered multi-phase order lifecycles including expert bidding, Stripe advance/completion escrow split, and file delivery with an automatic 25% preview lock enforced until settlement.',
      metrics: [
        { label: 'Role Architecture', val: '4-Tier Granular RBAC' },
        { label: 'Chat Engine', val: 'Flask-SocketIO / Eventlet' },
        { label: 'Escrow Engine', val: 'Maker-Checker Stripe' },
        { label: 'Preview Security', val: '25% File Lock Gate' }
      ],
      stack: ['Flask REST APIs', 'MongoDB Atlas', 'Flask-SocketIO', 'Stripe Escrow', 'Eventlet', 'JWT RBAC'],
      github: 'https://github.com/agrimsri/tutorsolve-website',
      live: null,
      image: null,
      blueprint: [
        { num: '01', name: 'Assignment Ingestion', detail: 'Geo-fenced request creation & subject-domain tagging' },
        { num: '02', name: 'Maker-Checker Gate', detail: 'Admin pricing audit before order publication' },
        { num: '03', name: 'Isolated Channel', detail: 'Zero-latency dual-room Socket.IO chat synchronization' },
        { num: '04', name: 'Preview Lock Relay', detail: 'Cryptographic 25% preview reveal until final settlement' }
      ]
    },
    {
      id: 'SYS-03',
      title: 'TDS Dynamic Exam Infra',
      category: 'agentic',
      categoryLabel: 'Serverless Edge & Forensics',
      status: 'IIT Madras Production (19+ Exams)',
      thesis: 'Adversarial high-stakes exam platform defending against automated LLM heuristic solvers via Cloudflare Workers & Durable Objects.',
      description: 'Co-administrated and engineered under S. Anand for thousands of IIT Madras undergraduate students. Built seed-randomized question generators, server-side validation logic (a-*.js), and terminal recording forensics (termlog_review.py) to audit live student workflows and eliminate heuristic exploits.',
      metrics: [
        { label: 'Scale Administered', val: '19+ Term Exams' },
        { label: 'Edge Infrastructure', val: 'Cloudflare Workers / DO' },
        { label: 'Adversarial Defense', val: 'Cryptographic Check Tokens' },
        { label: 'Audit Telemetry', val: 'Terminal Replay Forensics' }
      ],
      stack: ['Cloudflare Workers', 'Durable Objects', 'SQLite Archives', 'Cloudflare Tunnels', 'FastAPI', 'OAuth'],
      github: 'https://github.com/sanand0/exam',
      live: 'https://tds.s-anand.net/',
      image: null,
      blueprint: [
        { num: '01', name: 'Seed Randomization', detail: 'Dynamic question variation per student session' },
        { num: '02', name: 'Client Sandbox', detail: 'Restricted headless CLI execution environment' },
        { num: '03', name: 'Telemetry Capture', detail: 'Real-time keystroke and command log recording' },
        { num: '04', name: 'Server-Side Proof', detail: 'Dynamic javascript validation module verification' }
      ]
    },
    {
      id: 'SYS-04',
      title: 'Expectation-Maximization Visualizer',
      category: 'visualizer',
      categoryLabel: 'Mathematical Simulation',
      status: 'Live Interactive Deployment',
      thesis: 'Interactive 2D simulation of Gaussian Mixture Models (GMM) and Expectation-Maximization step iterations.',
      description: 'High-performance mathematical tool built on HTML5 Canvas. Allows researchers and students to seed 2D distributions, observe dynamic Gaussian probability density contours, and track log-likelihood convergence step-by-step.',
      metrics: [
        { label: 'Algorithm', val: 'Gaussian Mixture Models' },
        { label: 'Rendering', val: '60 FPS HTML5 Canvas' },
        { label: 'Convergence Metric', val: 'Log-Likelihood Tracking' },
        { label: 'Deployment', val: 'Vercel Edge' }
      ],
      stack: ['JavaScript Canvas', 'GMM Probability', 'Statistical Inference', 'Vercel'],
      github: 'https://github.com/agrimsri/EM-Algorithm-Visualizer',
      live: 'https://em-algorithm-visualizer.vercel.app',
      image: null,
      blueprint: [
        { num: '01', name: '2D Point Ingestion', detail: 'Inject sample coordinates from multimodal distributions' },
        { num: '02', name: 'E-Step Responsibilities', detail: 'Compute soft posterior probability weights for each cluster' },
        { num: '03', name: 'M-Step Update', detail: 'Re-estimate cluster means and positive-definite covariance matrices' },
        { num: '04', name: 'Convergence Boundary', detail: 'Iterate until Frobenius norm difference ||Δμ|| drops below threshold' }
      ]
    },
    {
      id: 'SYS-05',
      title: 'Course TA RAG Implementation',
      category: 'agentic',
      categoryLabel: 'NLP & Multimodal RAG',
      status: 'Academic Verified',
      thesis: 'Automated multimodal course forum question-answering assistant trained on IIT Madras academic discourse.',
      description: 'End-to-end RAG architecture with local Ollama embeddings, Gemini multimodal synthesis, and forum discussion scraping pipelines. Reduced response latency using cosine similarity indexing with compressed disk caching.',
      metrics: [
        { label: 'Model Pipeline', val: 'Gemini + Local Ollama' },
        { label: 'Index Optimization', val: 'Cosine Vector Cache' },
        { label: 'Data Ingestion', val: 'IITM Discourse Web Scraper' },
        { label: 'Backend Serving', val: 'FastAPI Microservice' }
      ],
      stack: ['FastAPI', 'Gemini Multimodal', 'Ollama', 'Python', 'Discourse API'],
      github: 'https://github.com/agrimsri/Teaching-Assistant-RAG-Implementation',
      live: null,
      image: null,
      blueprint: [
        { num: '01', name: 'Discourse Scraper', detail: 'Cleans conversational forum threads into semantic docs' },
        { num: '02', name: 'Local Ollama Embed', detail: 'Low-latency vector generation without external API roundtrips' },
        { num: '03', name: 'Compressed Cache', detail: 'Accelerated cosine similarity index for fast lookup' },
        { num: '04', name: 'Multimodal Synthesis', detail: 'Gemini resolves image-based and code-snippet questions' }
      ]
    },
    {
      id: 'SYS-06',
      title: 'Havenly',
      category: 'distributed',
      categoryLabel: 'Distributed Workers & RBAC',
      status: 'Grade S Capstone (10/10)',
      thesis: 'Full-stack service management platform with asynchronous Redis/Celery worker task queues and normalized SQLite schema.',
      description: 'Role-based application supporting service professionals, customers, and administrators. Engineered offloaded background workers for automated billing exports, scheduled reminders, and transactional reports without blocking API throughput.',
      metrics: [
        { label: 'Academic Grade', val: 'Grade S (10.0 / 10.0)' },
        { label: 'Task Architecture', val: 'Celery Beat + Redis' },
        { label: 'State Management', val: 'Vue.js + Pinia' },
        { label: 'API Gateway', val: 'Flask RESTful' }
      ],
      stack: ['Flask REST', 'Vue.js 3', 'Pinia', 'Redis', 'Celery Workers', 'SQLite'],
      github: 'https://github.com/agrimsri/Household-Application',
      live: null,
      image: './assets/havenly-preview.jpg',
      blueprint: [
        { num: '01', name: 'REST Gateway', detail: 'Fast non-blocking API endpoint routing with JWT token auth' },
        { num: '02', name: 'Redis Broker', detail: 'Task queue buffering heavy analytical export jobs' },
        { num: '03', name: 'Celery Beat', detail: 'Scheduled periodic report generation and email dispatch' },
        { num: '04', name: 'Reactive UI', detail: 'Pinia state stores driving instant interface reactions' }
      ]
    },
    {
      id: 'SYS-07',
      title: 'code-crawler',
      category: 'systems',
      categoryLabel: 'Compilers & Code Intelligence',
      status: 'Research Engine',
      thesis: 'Automated codebase parser, symbol crawler, and dependency graph indexer for large-scale software repositories.',
      description: 'Crawls polyglot repositories, extracts AST symbol definitions, maps import cross-references, and constructs actionable code graphs for agentic navigation and architectural analysis.',
      metrics: [
        { label: 'Analysis Domain', val: 'AST & Symbol Graphs' },
        { label: 'Parser Strategy', val: 'Polyglot Tree Traversal' },
        { label: 'Execution', val: 'Low-Memory Python CLI' }
      ],
      stack: ['Python', 'AST', 'Tree-Sitter Concepts', 'CLI Automation'],
      github: 'https://github.com/agrimsri/code-crawler',
      live: null,
      image: null,
      blueprint: [
        { num: '01', name: 'Directory Walk', detail: 'High-speed ignore-aware recursive file discovery' },
        { num: '02', name: 'AST Extraction', detail: 'Parses functions, classes, and exported symbols' },
        { num: '03', name: 'Graph Mapping', detail: 'Links callers to callee definitions across modules' }
      ]
    }
  ];

  const indexColumn = document.getElementById('specimen-index-column');
  const stageChamber = document.getElementById('specimen-stage-chamber');
  const filterPills = document.querySelectorAll('.filter-pill-btn');
  const viewModeBtns = document.querySelectorAll('.view-mode-btn');
  const mosaicGrid = document.getElementById('projects-mosaic-grid');
  const specimenDeckContainer = document.getElementById('specimen-deck-container');

  let activeProjectId = 'SYS-01';
  let currentFilter = 'all';

  function renderProjectIndex() {
    if (!indexColumn) return;
    indexColumn.innerHTML = '';

    const filtered = currentFilter === 'all' 
      ? projectsData 
      : projectsData.filter(p => p.category === currentFilter);

    // Ensure activeProjectId is valid for the current filtered list
    const hasActive = filtered.some(p => p.id === activeProjectId);
    if (!hasActive && filtered.length > 0) {
      activeProjectId = filtered[0].id;
    }

    filtered.forEach((p) => {
      const card = document.createElement('article');
      card.className = `specimen-index-card spotlight-card ${p.id === activeProjectId ? 'active' : ''}`;
      card.setAttribute('data-id', p.id);

      card.innerHTML = `
        <div class="card-index-top">
          <span class="card-sys-id">${p.id}</span>
          <span class="card-status-badge">${p.categoryLabel}</span>
        </div>
        <h4 class="card-title" data-scramble>${p.title}</h4>
        <p class="card-thesis">${p.thesis}</p>
      `;

      card.addEventListener('click', () => {
        activeProjectId = p.id;
        document.querySelectorAll('.specimen-index-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        renderActiveStage(p);
      });

      indexColumn.appendChild(card);
    });

    setupSpotlightCards();

    // Render active stage
    const currentActive = filtered.find(p => p.id === activeProjectId) || filtered[0];
    if (currentActive) {
      renderActiveStage(currentActive);
    }
  }

  function renderActiveStage(project) {
    if (!stageChamber) return;

    let blueprintHTML = '';
    if (project.blueprint) {
      const nodes = project.blueprint.map((node, i) => `
        <div class="flow-node-step spotlight-card" title="Phase ${node.num}: ${node.name}">
          <div class="step-number">PHASE ${node.num}</div>
          <div class="step-name">${node.name}</div>
          <div class="step-detail">${node.detail}</div>
        </div>
        ${i < project.blueprint.length - 1 ? '<div class="flow-arrow-separator">→</div>' : ''}
      `).join('');

      blueprintHTML = `
        <div class="stage-blueprint-box">
          <div class="blueprint-header-bar">
            <span>[ SYSTEM ARCHITECTURE TOPOLOGY ]</span>
            <span>VERIFIED EXECUTION TRACE</span>
          </div>
          <div class="flow-diagram-container">
            ${nodes}
          </div>
        </div>
      `;
    }

    let imageHTML = '';
    if (project.image) {
      imageHTML = `
        <div class="stage-preview-image-box">
          <img src="${project.image}" alt="${project.title} Interface Preview" class="stage-preview-img" loading="lazy" />
        </div>
      `;
    }

    const metricsHTML = project.metrics.map(m => `
      <div class="stage-metric-card">
        <div class="metric-val">${m.val}</div>
        <div class="metric-desc">${m.label}</div>
      </div>
    `).join('');

    const techHTML = project.stack.map(t => `<span class="tech-tag-pill">${t}</span>`).join('');

    const liveBtn = project.live 
      ? `<a href="${project.live}" target="_blank" rel="noopener noreferrer" class="stage-link-btn">
           <span>Live Deployment</span> ↗
         </a>`
      : '';

    const githubBtn = project.github
      ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="stage-link-btn">
           <span>Repository</span> ↗
         </a>`
      : '';

    stageChamber.innerHTML = `
      <div class="stage-top-meta">
        <div class="stage-badge-group">
          <span class="stage-category-pill">${project.categoryLabel}</span>
          <span class="card-status-badge">${project.status}</span>
        </div>
        <div class="stage-action-links">
          ${liveBtn}
          ${githubBtn}
        </div>
      </div>

      <h3 class="stage-project-headline" data-scramble>${project.title}</h3>
      <p class="stage-project-description">${project.description}</p>

      ${imageHTML}
      ${blueprintHTML}

      <div class="stage-metrics-grid">
        ${metricsHTML}
      </div>

      <div class="stage-tech-stack-row">
        ${techHTML}
      </div>
    `;

    setupSpotlightCards();

    // Re-bind hover scramble
    stageChamber.querySelectorAll('[data-scramble]').forEach(el => {
      el.addEventListener('mouseenter', () => scrambleText(el));
    });
  }

  // Filter pill handlers
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      renderProjectIndex();
      renderMosaicGrid();
    });
  });

  // View mode switcher (Specimen Stage vs Mosaic Grid)
  viewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');

      if (mode === 'mosaic') {
        specimenDeckContainer.style.display = 'none';
        mosaicGrid.classList.add('active');
        renderMosaicGrid();
      } else {
        specimenDeckContainer.style.display = 'grid';
        mosaicGrid.classList.remove('active');
      }
    });
  });

  function renderMosaicGrid() {
    if (!mosaicGrid) return;
    mosaicGrid.innerHTML = '';

    const filtered = currentFilter === 'all' 
      ? projectsData 
      : projectsData.filter(p => p.category === currentFilter);

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'mosaic-project-card spotlight-card';
      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span class="card-sys-id">${p.id}</span>
            <span class="card-status-badge">${p.categoryLabel}</span>
          </div>
          <h4 class="card-title" style="font-size:20px; margin-bottom:8px;">${p.title}</h4>
          <p style="font-size:13px; color:#B0B0C4; line-height:1.55; margin-bottom:16px;">${p.description}</p>
        </div>
        <div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
            ${p.stack.slice(0, 4).map(s => `<span class="tech-tag-pill">${s}</span>`).join('')}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px;">
            <span style="font-family:var(--font-mono); font-size:10.5px; color:var(--accent-gold);">${p.status}</span>
            <a href="${p.github || '#'}" target="_blank" rel="noopener noreferrer" style="font-family:var(--font-mono); font-size:11px; color:var(--text-primary); text-decoration:none;">View Repo ↗</a>
          </div>
        </div>
      `;
      mosaicGrid.appendChild(card);
    });
    setupSpotlightCards();
  }

  // Initial render
  renderProjectIndex();

  /* --------------------------------------------------------------------------
     9. DEDICATED EXPECTATION-MAXIMIZATION (EM) INTERACTIVE SANDBOX
     -------------------------------------------------------------------------- */
  function initDedicatedEM() {
    const canvas = document.getElementById('dedicated-em-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      draw();
    });

    let points = [];
    let K = 2;
    let means = [];
    let covariances = [];
    let weights = [];
    let iteration = 0;
    let autoRunning = false;
    let autoAnimId = null;

    function loadPreset(presetName) {
      points = [];
      const w = width || 800;
      const h = height || 420;

      if (presetName === 'bimodal') {
        K = 2;
        const c1 = { cx: w * 0.32, cy: h * 0.42, r: 42, count: 28 };
        const c2 = { cx: w * 0.68, cy: h * 0.62, r: 46, count: 32 };
        [c1, c2].forEach(c => {
          for (let i = 0; i < c.count; i++) {
            const u = Math.random() + Math.random();
            const rad = u > 1 ? 2 - u : u;
            const theta = Math.random() * Math.PI * 2;
            points.push({
              x: c.cx + Math.cos(theta) * rad * c.r,
              y: c.cy + Math.sin(theta) * rad * c.r,
              resp: [0.5, 0.5]
            });
          }
        });
      } else if (presetName === 'triangular') {
        K = 2;
        const centers = [
          { cx: w * 0.28, cy: h * 0.65, count: 22 },
          { cx: w * 0.50, cy: h * 0.28, count: 24 },
          { cx: w * 0.74, cy: h * 0.62, count: 26 }
        ];
        centers.forEach(c => {
          for (let i = 0; i < c.count; i++) {
            const rad = Math.random() * 38;
            const theta = Math.random() * Math.PI * 2;
            points.push({
              x: c.cx + Math.cos(theta) * rad,
              y: c.cy + Math.sin(theta) * rad,
              resp: [0.5, 0.5]
            });
          }
        });
      } else if (presetName === 'ring') {
        K = 2;
        // Central dense cluster + surrounding arc
        for (let i = 0; i < 25; i++) {
          const rad = Math.random() * 26;
          const theta = Math.random() * Math.PI * 2;
          points.push({ x: w * 0.4 + Math.cos(theta) * rad, y: h * 0.5 + Math.sin(theta) * rad, resp: [0.5, 0.5] });
        }
        for (let i = 0; i < 35; i++) {
          const rad = 70 + Math.random() * 25;
          const theta = Math.random() * Math.PI * 2;
          points.push({ x: w * 0.6 + Math.cos(theta) * rad, y: h * 0.5 + Math.sin(theta) * rad, resp: [0.5, 0.5] });
        }
      }

      resetPriors();
    }

    function resetPriors() {
      const w = width || 800;
      const h = height || 420;
      means = [
        { x: w * (0.2 + Math.random() * 0.2), y: h * (0.25 + Math.random() * 0.3) },
        { x: w * (0.6 + Math.random() * 0.2), y: h * (0.45 + Math.random() * 0.3) }
      ];
      covariances = [
        { sxx: 2400, syy: 2400 },
        { sxx: 2400, syy: 2400 }
      ];
      weights = [0.5, 0.5];
      iteration = 0;
      updateTelemetry();
      draw();
    }

    function gaussian2D(x, y, m, cov) {
      const dx = x - m.x;
      const dy = y - m.y;
      const det = Math.max(cov.sxx * cov.syy, 1e-4);
      const exponent = -0.5 * ((dx * dx) / Math.max(cov.sxx, 100) + (dy * dy) / Math.max(cov.syy, 100));
      return (1 / (2 * Math.PI * Math.sqrt(det))) * Math.exp(Math.max(exponent, -50));
    }

    function stepEM() {
      if (points.length === 0) return 0;

      // E-Step
      points.forEach(p => {
        let denom = 0;
        let pdfs = [];
        for (let k = 0; k < K; k++) {
          const pdf = weights[k] * gaussian2D(p.x, p.y, means[k], covariances[k]);
          pdfs.push(pdf);
          denom += pdf;
        }
        for (let k = 0; k < K; k++) {
          p.resp[k] = denom > 1e-12 ? pdfs[k] / denom : 1 / K;
        }
      });

      // M-Step
      let maxMeanShift = 0;
      for (let k = 0; k < K; k++) {
        let Nk = 0;
        let sumX = 0, sumY = 0;
        points.forEach(p => {
          Nk += p.resp[k];
          sumX += p.resp[k] * p.x;
          sumY += p.resp[k] * p.y;
        });

        if (Nk > 1e-4) {
          weights[k] = Math.max(Nk / points.length, 0.05);
          const newX = sumX / Nk;
          const newY = sumY / Nk;

          const shift = Math.sqrt(Math.pow(newX - means[k].x, 2) + Math.pow(newY - means[k].y, 2));
          if (shift > maxMeanShift) maxMeanShift = shift;

          means[k].x = newX;
          means[k].y = newY;

          let sumVarX = 0, sumVarY = 0;
          points.forEach(p => {
            sumVarX += p.resp[k] * Math.pow(p.x - means[k].x, 2);
            sumVarY += p.resp[k] * Math.pow(p.y - means[k].y, 2);
          });
          covariances[k].sxx = Math.max(sumVarX / Nk, 400);
          covariances[k].syy = Math.max(sumVarY / Nk, 400);
        }
      }

      iteration++;
      updateTelemetry();
      draw();
      return maxMeanShift;
    }

    function calculateLogLikelihood() {
      if (points.length === 0) return '-';
      let totalLogL = 0;
      points.forEach(p => {
        let density = 0;
        for (let k = 0; k < K; k++) {
          density += weights[k] * gaussian2D(p.x, p.y, means[k], covariances[k]);
        }
        if (density > 1e-12) {
          totalLogL += Math.log(density);
        }
      });
      return totalLogL.toFixed(1);
    }

    function draw() {
      const w = width;
      const h = height;
      ctx.clearRect(0, 0, w, h);

      // Background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw Gaussian Covariance Ellipses
      const colors = ['rgba(229, 184, 105, ', 'rgba(114, 197, 214, '];
      for (let k = 0; k < K; k++) {
        const m = means[k];
        const rx = Math.sqrt(covariances[k].sxx) * 1.8;
        const ry = Math.sqrt(covariances[k].syy) * 1.8;

        // Outer radial glow
        const maxR = Math.max(rx, ry, 1);
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, maxR);
        grad.addColorStop(0, colors[k] + '0.24)');
        grad.addColorStop(1, colors[k] + '0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stroke boundary
        ctx.strokeStyle = colors[k] + '0.75)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center crosshair
        ctx.strokeStyle = colors[k] + '0.95)';
        ctx.beginPath();
        ctx.moveTo(m.x - 7, m.y); ctx.lineTo(m.x + 7, m.y);
        ctx.moveTo(m.x, m.y - 7); ctx.lineTo(m.x, m.y + 7);
        ctx.stroke();
      }

      // Draw data points with responsibility color blending
      points.forEach(p => {
        const r = Math.round(p.resp[0] * 229 + p.resp[1] * 114);
        const g = Math.round(p.resp[0] * 184 + p.resp[1] * 197);
        const b = Math.round(p.resp[0] * 105 + p.resp[1] * 214);

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();
      });
    }

    function updateTelemetry() {
      const readout = document.getElementById('em-telemetry-readout');
      if (readout) {
        const logL = calculateLogLikelihood();
        readout.innerHTML = `Iteration: ${iteration} &bull; Points: ${points.length} &bull; K = 2 Components &bull; Log-L: ${logL}`;
      }
    }

    function addPointCluster(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      const clickX = clientX - r.left;
      const clickY = clientY - r.top;
      for (let i = 0; i < 4; i++) {
        points.push({
          x: clickX + (Math.random() - 0.5) * 22,
          y: clickY + (Math.random() - 0.5) * 22,
          resp: [0.5, 0.5]
        });
      }
      updateTelemetry();
      draw();
    }

    // Canvas click & drag to add points
    let isDrawing = false;
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      addPointCluster(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', (e) => {
      if (isDrawing) {
        addPointCluster(e.clientX, e.clientY);
      }
    });

    // Touch support for mobile canvas
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addPointCluster(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    // Step button
    const runBtn = document.getElementById('em-btn-step');
    if (runBtn) {
      runBtn.onclick = () => stepEM();
    }

    // Auto converge play/pause
    const autoBtn = document.getElementById('em-btn-auto');
    function stopAuto() {
      autoRunning = false;
      if (autoAnimId) cancelAnimationFrame(autoAnimId);
      if (autoBtn) autoBtn.textContent = 'Auto Converge ▶';
    }

    function startAuto() {
      autoRunning = true;
      if (autoBtn) autoBtn.textContent = 'Pause ❚❚';

      function loop() {
        if (!autoRunning) return;
        const shift = stepEM();
        if (shift < 0.2 || iteration > 100) {
          stopAuto();
          return;
        }
        autoAnimId = requestAnimationFrame(loop);
      }
      autoAnimId = requestAnimationFrame(loop);
    }

    if (autoBtn) {
      autoBtn.onclick = () => {
        if (autoRunning) stopAuto();
        else startAuto();
      };
    }

    // Reset button
    const resetBtn = document.getElementById('em-btn-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        stopAuto();
        resetPriors();
      };
    }

    // Preset buttons
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        stopAuto();
        const preset = btn.getAttribute('data-preset');
        loadPreset(preset);
      });
    });

    // Initial preset load
    loadPreset('bimodal');
  }

  initDedicatedEM();

  /* --------------------------------------------------------------------------
     10. SKILL MATRIX FILTERING
     -------------------------------------------------------------------------- */
  const skillFilters = document.querySelectorAll('.skill-tag-filter');
  const skillCards = document.querySelectorAll('.skill-evidence-card');

  skillFilters.forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      skillFilters.forEach(b => b.classList.remove('active'));
      filterBtn.classList.add('active');
      const domain = filterBtn.getAttribute('data-domain');

      skillCards.forEach(card => {
        if (domain === 'all' || card.getAttribute('data-domain') === domain) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     11. INTERACTIVE SYSTEMS TERMINAL CLI
     -------------------------------------------------------------------------- */
  const terminalDrawer = document.getElementById('system-terminal-drawer');
  const terminalToggleBtn = document.getElementById('btn-terminal-toggle');
  const terminalCloseBtn = document.getElementById('btn-terminal-close');
  const terminalInput = document.getElementById('terminal-cli-input');
  const terminalLogs = document.getElementById('terminal-logs-view');
  const terminalChips = document.querySelectorAll('.terminal-chip');

  function openTerminal() {
    if (!terminalDrawer) return;
    terminalDrawer.classList.add('active');
    if (terminalInput) setTimeout(() => terminalInput.focus(), 150);
  }

  function closeTerminal() {
    if (!terminalDrawer) return;
    terminalDrawer.classList.remove('active');
  }

  function toggleTerminal() {
    if (!terminalDrawer) return;
    if (terminalDrawer.classList.contains('active')) closeTerminal();
    else openTerminal();
  }

  if (terminalToggleBtn) {
    terminalToggleBtn.addEventListener('click', toggleTerminal);
  }

  if (terminalCloseBtn) {
    terminalCloseBtn.addEventListener('click', closeTerminal);
  }

  // Quick chip execution
  terminalChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      executeTerminalCommand(cmd);
    });
  });

  // Backtick keyboard shortcut
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggleTerminal();
    }
  });

  if (terminalInput && terminalLogs) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = terminalInput.value.trim().toLowerCase();
        terminalInput.value = '';
        executeTerminalCommand(cmd);
      }
    });
  }

  function appendTerminalLine(text, className = 'output') {
    if (!terminalLogs) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    terminalLogs.appendChild(line);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  function executeTerminalCommand(cmd) {
    appendTerminalLine(`agrim@node:~$ ${cmd}`, 'command');

    switch (cmd) {
      case 'help':
        appendTerminalLine('Available terminal commands:', 'system');
        appendTerminalLine('  whoami     - Identity, education, CGPA & active commitments');
        appendTerminalLine('  skills     - Verified competency matrix from skill register');
        appendTerminalLine('  projects   - Engineered architecture dossiers & repos');
        appendTerminalLine('  experience - Missions: TDS TA with S. Anand, annam.ai, IITM');
        appendTerminalLine('  anand      - TDS course co-teaching context & adversarial evals');
        appendTerminalLine('  contact    - Direct email & verified profiles');
        appendTerminalLine('  secret     - Launch the interactive 3D face reconstruction lab');
        appendTerminalLine('  clear      - Clear console logs');
        appendTerminalLine('  exit       - Close terminal drawer');
        break;

      case 'whoami':
        appendTerminalLine('NAME: Agrim Srivastava', 'system');
        appendTerminalLine('EDUCATION: BS in Data Science & Applications @ IIT Madras');
        appendTerminalLine('CGPA: 8.88 / 10.0 Academic | 8.5 / 10.0 Project (Verified)');
        appendTerminalLine('ACTIVE COMMITMENT: Teaching Assistant & Exam Admin alongside S. Anand (TDS)');
        appendTerminalLine('LOCATION: Lucknow, India');
        break;

      case 'skills':
        appendTerminalLine('[ VERIFIED CAPABILITIES MATRIX ]', 'system');
        appendTerminalLine('• AI / Agents: Model Context Protocol (WebMCP), local vLLM/Ollama, prompt caching');
        appendTerminalLine('• Adversarial Evals: Seed randomization, server validation (a-*.js), termlog forensics');
        appendTerminalLine('• Systems & Edge: Cloudflare Workers, Durable Objects, Linux Shell (Grade S)');
        appendTerminalLine('• Full-Stack: Python (uv/uvx), FastAPI, Flask (Grade S), Vue 3 Pinia (Grade S)');
        appendTerminalLine('• Math & Data: Probability & Statistics (Grade S), Relational DBMS (Grade A)');
        break;

      case 'projects':
        appendTerminalLine('[ CORE SYSTEM REPOSITORIES ]', 'system');
        appendTerminalLine('1. NutriAgent        - LangGraph multi-agent RAG (32.3% → 0.0% MAPE error)');
        appendTerminalLine('2. TutorSolve        - 4-role assignment marketplace with Socket.IO chat');
        appendTerminalLine('3. TDS Exam Platform - sanand0/exam Cloudflare Workers & Durable Objects');
        appendTerminalLine('4. EM Visualizer     - Interactive Gaussian Mixture mathematical simulator');
        appendTerminalLine('5. Havenly           - Flask/Vue/Redis/Celery home services (Grade S)');
        appendTerminalLine('6. code-crawler      - Polyglot repository parser & AST graph indexer');
        break;

      case 'experience':
        appendTerminalLine('[ VERIFIED MISSIONS ]', 'system');
        appendTerminalLine('1. TDS Teaching Assistant & Exam Admin (May 2026 – Present, S. Anand)');
        appendTerminalLine('2. SDE Intern @ annam.ai (Jan – Apr 2026): Transcript Q&A engine, RBAC hardening');
        appendTerminalLine('3. Tech Intern @ IIT Madras: study-iitm official portal microsites');
        appendTerminalLine('4. Teaching Assistant @ IIT Madras: Probability & Statistics labs (Grade S)');
        break;

      case 'anand':
      case 'tds':
        appendTerminalLine('[ TDS CO-TEACHING CONTEXT ]', 'system');
        appendTerminalLine('Instructor: S. Anand (LLM Psychologist at Straive, Founder of Gramener)');
        appendTerminalLine('Course: Tools in Data Science (TDS), IIT Madras BS Degree');
        appendTerminalLine('Focus: LLMs as execution engines, WebMCP protocols, prompt caching');
        appendTerminalLine('Execution: 19+ term exams administered, adversarial question defense');
        break;

      case 'contact':
        appendTerminalLine('EMAIL: agrimsri26@gmail.com', 'system');
        appendTerminalLine('GITHUB: github.com/agrimsri (45 repos)');
        appendTerminalLine('LINKEDIN: linkedin.com/in/agrim-srivastava-26l');
        appendTerminalLine('LOCATION: Lucknow, India');
        break;

      case 'secret':
        appendTerminalLine('Revealing 3D Reconstruction Lab:', 'system');
        appendTerminalLine('Opening face.html (Gal Gadot GLTF 3D Viewer)...');
        setTimeout(() => { window.location.href = './face.html'; }, 600);
        break;

      case 'clear':
        terminalLogs.innerHTML = '';
        break;

      case 'exit':
      case 'quit':
        closeTerminal();
        break;

      case '':
        break;

      default:
        appendTerminalLine(`Unknown command: '${cmd}'. Type 'help' for available directives.`, 'system');
    }
  }

  /* --------------------------------------------------------------------------
     12. CLIPBOARD COPY TOAST HELPER (With Bulletproof Fallback)
     -------------------------------------------------------------------------- */
  function copyEmailToClipboard() {
    const email = 'agrimsri26@gmail.com';

    function onSuccess() {
      showToast('Copied to clipboard: agrimsri26@gmail.com');
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email)
        .then(onSuccess)
        .catch(() => fallbackCopy(email, onSuccess));
    } else {
      fallbackCopy(email, onSuccess);
    }
  }

  function fallbackCopy(text, cb) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (cb) cb();
    } catch (err) {
      showToast('Email: agrimsri26@gmail.com');
    }
    document.body.removeChild(textArea);
  }

  function showToast(msg) {
    const toast = document.getElementById('system-toast');
    const toastMsg = document.getElementById('toast-text');
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  const heroCopyBtn = document.getElementById('hero-btn-copy-email');
  if (heroCopyBtn) heroCopyBtn.addEventListener('click', copyEmailToClipboard);

  const contactCopyBtn = document.getElementById('contact-btn-copy');
  if (contactCopyBtn) contactCopyBtn.addEventListener('click', copyEmailToClipboard);

  /* --------------------------------------------------------------------------
     13. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('btn-hamburger');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
