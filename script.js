// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Pause marquee on hover
const track = document.querySelector('.rolling-bar-track');
if (track) {
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

// ===== Scroll-scrubbed word reveal (claim / reframe / resolution) =====
(function() {
  const section = document.getElementById('claim-statement');
  const textEl = document.getElementById('claim-reveal-text');
  if (!section || !textEl) return;

  const words = textEl.textContent.trim().split(/\s+/);
  textEl.innerHTML = words.map(w => '<span class="reveal-word">' + w + '</span>').join(' ');
  const wordEls = textEl.querySelectorAll('.reveal-word');
  const total = wordEls.length;
  const overlap = 1.6; // how many word-slots each word takes to reach full opacity
  const denom = (total - 1) + overlap; // ensures word 0 starts at progress 0 and the last word ends at progress 1

  let ticking = false;

  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    let progress = scrollable > 0 ? (-rect.top) / scrollable : 0;
    progress = Math.max(0, Math.min(1, progress));

    wordEls.forEach((el, i) => {
      const start = i / denom;
      const end = (i + overlap) / denom;
      let t = (progress - start) / (end - start);
      t = Math.max(0, Math.min(1, t));
      el.style.opacity = String(0.25 + 0.75 * t);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// ===== Count-Up Animation (integers) =====
(function() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const duration = 1800;

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ===== Decimal Counter (e.g. conversations per year) =====
(function() {
  const el = document.getElementById('hstat-counter');
  if (!el) return;
  let animated = false;
  const duration = 1800;
  const target = parseFloat(el.dataset.target);

  function animate() {
    if (animated) return;
    animated = true;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = (ease * target).toFixed(1);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) animate(); });
  }, { threshold: 0.3 });

  observer.observe(el);
})();

// ===== CX Maturity Assessment =====
(function() {
  const wrap = document.querySelector('.assessment-wrap');
  if (!wrap) return;

  const questions = [
    {
      dimension: 'Operational resilience and scalability',
      text: 'How does your CX operation handle demand surges and seasonal peaks?',
      options: [
        { text: 'We routinely miss SLAs during peaks', score: 1 },
        { text: 'We hit SLAs but at significant overtime cost', score: 2 },
        { text: 'Surge plans exist but require manual orchestration', score: 3 },
        { text: 'Surge handling is mostly automated with documented playbooks', score: 4 },
        { text: 'Capacity flexes within hours, with predictive forecasting and cross\u2011skilled teams', score: 5 }
      ]
    },
    {
      dimension: 'Cost to serve and commercial outcomes',
      text: 'How clearly can you tie your CX operations spend to cost to serve, retention, or revenue outcomes?',
      options: [
        { text: 'We can\u2019t \u2014 it\u2019s tracked as pure cost', score: 1 },
        { text: 'We see departmental costs, no link to commercial outcomes', score: 2 },
        { text: 'We can model some links anecdotally', score: 3 },
        { text: 'Most CX spend ties to a named commercial outcome', score: 4 },
        { text: 'Every CX investment maps to cost to serve, retention, or revenue in our P&L', score: 5 }
      ]
    },
    {
      dimension: 'Workflow and system integration',
      text: 'How well are your CX workflows integrated with the rest of your tech stack?',
      options: [
        { text: 'Manual handoffs and re\u2011keying between systems', score: 1 },
        { text: 'Partial integrations; agents copy and paste regularly', score: 2 },
        { text: 'Core systems integrated; reporting still partly manual', score: 3 },
        { text: 'End to end flows; agents work in one pane of glass', score: 4 },
        { text: 'Real time, bi\u2011directional integration with full data lineage', score: 5 }
      ]
    },
    {
      dimension: 'Human and AI collaboration',
      text: 'Where are you on AI adoption inside your contact centre?',
      options: [
        { text: 'Not deployed in production yet', score: 1 },
        { text: 'Pilots only (transcription, sentiment) without scale', score: 2 },
        { text: 'AI handles defined deflection (bots, triage) for narrow use cases', score: 3 },
        { text: 'AI augments agents in real time across most journeys', score: 4 },
        { text: 'AI embedded across the operation with documented governance and outcome tracking', score: 5 }
      ]
    },
    {
      dimension: 'Service consistency and workforce resilience',
      text: 'How consistent is your service quality and agent retention across peaks and demand swings?',
      options: [
        { text: 'Attrition spikes and quality drops during peaks', score: 1 },
        { text: 'We hold steady day to day, but peaks strain quality', score: 2 },
        { text: 'Flex staffing plans exist but ramp slowly', score: 3 },
        { text: 'Cross trained teams and forecasting keep quality steady most of the year', score: 4 },
        { text: 'Service and quality stay consistent through every peak, with predictive workforce planning', score: 5 }
      ]
    }
  ];

  const stages = [
    {
      name: 'Reactive',
      range: [1.0, 1.8],
      desc: 'Your operation is in firefight mode. Peaks strain your team, costs are hard to explain, and AI is more conversation than deployment.',
      next: 'Stabilising. Close the basics first \u2014 surge plans, integrated systems, and a clear line from CX spend to outcomes \u2014 before reaching for AI.'
    },
    {
      name: 'Stabilising',
      range: [1.81, 2.6],
      desc: 'The worst gaps are patched. Operations run, but cost to serve creeps and you can\u2019t yet tie CX spend to commercial outcomes.',
      next: 'Scaling. Make the operation defensible: integrated workflows, a named commercial outcome per pound spent, and consistent service through peaks.'
    },
    {
      name: 'Scaling',
      range: [2.61, 3.4],
      desc: 'Foundations are in place. CX runs to plan, integrations are real, and AI pilots are starting to land. The challenge: pilot to portfolio.',
      next: 'AI Assisted. Embed AI across the operation, tie spend to your P&L, and turn service consistency into a repeatable playbook.'
    },
    {
      name: 'AI Assisted',
      range: [3.41, 4.2],
      desc: 'Augmented by AI in the right places. Integrations are bi\u2011directional and service holds steady through peaks. You\u2019re ahead of most enterprises.',
      next: 'Resilient. Treat operational consistency as a commercial asset, scale predictive forecasting, and make AI governance a competitive moat.'
    },
    {
      name: 'Resilient',
      range: [4.21, 5.0],
      desc: 'You\u2019re operating at the front edge. AI is embedded, the operation flexes within hours, and service consistency is a commercial asset, not a cost.',
      next: 'Stay there. The challenge is preserving the edge as scale and demand shifts test the model. We\u2019d benchmark you against peer enterprises and stress test the AI governance layer.'
    }
  ];

  // Per-question state: index of selected option (or null)
  const state = { current: 0, selections: questions.map(() => null) };

  const screens = {
    intro: wrap.querySelector('#screen-intro'),
    question: wrap.querySelector('#screen-question'),
    results: wrap.querySelector('#screen-results')
  };

  const els = {
    progressFill: wrap.querySelector('.assess-progress-fill'),
    progressBar: wrap.querySelector('.assess-progress'),
    qCurrent: wrap.querySelector('.assess-q-current'),
    qTotal: wrap.querySelector('.assess-q-total'),
    dimension: wrap.querySelector('.assess-dimension'),
    questionText: wrap.querySelector('.assess-question'),
    options: wrap.querySelector('.assess-options'),
    nextBtn: wrap.querySelector('[data-action="next"]'),
    backBtn: wrap.querySelector('[data-action="back"]'),
    stageName: wrap.querySelector('.assess-stage-name'),
    stageDesc: wrap.querySelector('.assess-stage-desc'),
    stageNext: wrap.querySelector('.assess-stage-next'),
    spectrumMarker: wrap.querySelector('.assess-spectrum-marker'),
    emailForm: wrap.querySelector('.assess-email-form'),
    emailSubmit: wrap.querySelector('.assess-email-submit')
  };

  if (els.qTotal) els.qTotal.textContent = String(questions.length);

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      if (key === name) el.setAttribute('data-active', 'true');
      else el.removeAttribute('data-active');
    });
  }

  function setProgress(pct) {
    els.progressFill.style.width = pct + '%';
    els.progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function renderQuestion() {
    const q = questions[state.current];
    els.qCurrent.textContent = String(state.current + 1);
    els.dimension.textContent = q.dimension;
    els.questionText.textContent = q.text;

    els.options.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'assess-option';
      btn.textContent = opt.text;
      btn.setAttribute('aria-pressed', state.selections[state.current] === idx ? 'true' : 'false');
      btn.dataset.idx = String(idx);
      btn.addEventListener('click', () => selectOption(idx));
      els.options.appendChild(btn);
    });

    setProgress((state.current / questions.length) * 100);
    els.backBtn.disabled = state.current === 0;
    els.nextBtn.disabled = state.selections[state.current] === null;
    els.nextBtn.querySelector('.assess-next-label').textContent =
      state.current === questions.length - 1 ? 'See your stage' : 'Next';
  }

  function selectOption(idx) {
    state.selections[state.current] = idx;
    Array.from(els.options.children).forEach(c => {
      c.setAttribute('aria-pressed', c.dataset.idx === String(idx) ? 'true' : 'false');
    });
    els.nextBtn.disabled = false;
  }

  function next() {
    if (state.selections[state.current] === null) return;
    if (state.current < questions.length - 1) {
      state.current += 1;
      renderQuestion();
    } else {
      showResults();
    }
  }

  function back() {
    if (state.current === 0) return;
    state.current -= 1;
    renderQuestion();
  }

  function start() {
    state.current = 0;
    state.selections = questions.map(() => null);
    if (els.emailSubmit) {
      els.emailSubmit.classList.remove('success');
      els.emailSubmit.querySelector('.assess-submit-label').textContent = 'Send';
    }
    if (els.emailForm) els.emailForm.reset();
    renderQuestion();
    showScreen('question');
  }

  function retake() { start(); }

  function calculateAvg() {
    const scores = state.selections.map((sel, qi) => questions[qi].options[sel].score);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  function stageFromAvg(avg) {
    return stages.find(s => avg >= s.range[0] && avg <= s.range[1]) || stages[0];
  }

  function showResults() {
    const avg = calculateAvg();
    const stage = stageFromAvg(avg);
    els.stageName.textContent = stage.name;
    els.stageDesc.textContent = stage.desc;
    els.stageNext.textContent = stage.next;

    // Position marker: avg 1 -> 0%, avg 5 -> 100%
    const pct = Math.max(0, Math.min(100, ((avg - 1) / 4) * 100));
    setProgress(100);
    showScreen('results');
    // Animate marker after the fade-up so the move is visible
    requestAnimationFrame(() => {
      setTimeout(() => { els.spectrumMarker.style.left = pct + '%'; }, 50);
    });
  }

  // Email capture: client-side only; on submit, mark as sent
  if (els.emailForm) {
    els.emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submit = els.emailSubmit;
      submit.classList.add('success');
      submit.querySelector('.assess-submit-label').textContent = 'Sent';
      const arrow = submit.querySelector('.arrow');
      if (arrow) arrow.textContent = '\u2713';
    });
  }

  // Delegated actions
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'start') start();
    else if (action === 'next') next();
    else if (action === 'back') back();
    else if (action === 'retake') retake();
  });
})();
