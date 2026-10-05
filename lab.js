/* OMID LAB — همه‌ی آزمایش‌ها کامل تو مرورگر اجرا می‌شن: بدون شبکه، بدون ذخیره،
   و هیچ HTML از رشته ساخته نمی‌شه. متن کاربر فقط از راه textContent یا canvas به صفحه می‌رسه. */
(() => {
'use strict';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || canvas.width;
  const h = Math.round(w * (canvas.height / canvas.width));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

/* =========================================================================
   AI × MUSIC — a loop written by rules, new every time
   ========================================================================= */
function initMusic(root) {
  const canvas = root.querySelector('canvas');
  const toggle = root.querySelector('[data-music="toggle"]');
  const label = root.querySelector('[data-music-label]');
  const again = root.querySelector('[data-music="new"]');
  const seedOut = root.querySelector('[data-music-seed]');
  const { ctx: g, w, h } = fitCanvas(canvas);
  const INK = css(root, '--ink') || '#08080a';
  const BLUE = css(root, '--accent') || '#1f3cff';
  const LINE = css(root, '--line') || '#cdd0d9';

  const SCALES = [
    { name: 'minor pentatonic', steps: [0, 3, 5, 7, 10] },
    { name: 'dorian', steps: [0, 2, 3, 5, 7, 9, 10] },
    { name: 'major pentatonic', steps: [0, 2, 4, 7, 9] },
    { name: 'phrygian', steps: [0, 1, 3, 5, 7, 8, 10] },
  ];
  const NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

  let ac = null, master = null, analyser = null, delay = null;
  let playing = false, timer = 0, raf = 0;
  let song = null, nextTime = 0, step = 0;

  function compose(seed) {
    const r = rng(seed);
    const scale = SCALES[Math.floor(r() * SCALES.length)];
    const rootIdx = Math.floor(r() * 12);
    const rootHz = 110 * Math.pow(2, rootIdx / 12);
    const bpm = 82 + Math.floor(r() * 26);
    const deg = (d, oct = 0) => {
      const n = scale.steps.length;
      const o = Math.floor(d / n) + oct;
      const s = scale.steps[((d % n) + n) % n];
      return rootHz * Math.pow(2, o + s / 12);
    };
    const kick = Array.from({ length: 16 }, (_, i) => i % 8 === 0 || (i % 4 === 2 && r() < 0.18) || (i === 11 && r() < 0.5));
    const hat = Array.from({ length: 16 }, (_, i) => (i % 2 === 1 && r() < 0.85) || (i % 4 === 2 && r() < 0.3));
    const bassLine = Array.from({ length: 16 }, (_, i) => (i % 4 === 0 || r() < 0.12 ? [0, 0, 4, 3][Math.floor(r() * 4)] : null));
    const lead = Array.from({ length: 64 }, () => (r() < 0.42 ? Math.floor(r() * scale.steps.length * 2) : null));
    const prog = [0, 5, 3, 4].map((d) => (d + Math.floor(r() * 2)) % scale.steps.length);
    return { seed, scale, rootName: NOTE_NAMES[rootIdx], bpm, deg, kick, hat, bassLine, lead, prog };
  }

  function setup() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.2;
    const comp = ac.createDynamicsCompressor();
    analyser = ac.createAnalyser();
    analyser.fftSize = 1024;
    delay = ac.createDelay(1);
    const fb = ac.createGain();
    fb.gain.value = 0.32;
    const wet = ac.createGain();
    wet.gain.value = 0.28;
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(master);
    master.connect(comp).connect(analyser).connect(ac.destination);
  }

  function env(gainNode, t, a, d, peak) {
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(peak, t + a);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(type, hz, t, dur, peak, { send = false, cutoff = 4000 } = {}) {
    const o = ac.createOscillator();
    const f = ac.createBiquadFilter();
    const gn = ac.createGain();
    o.type = type; o.frequency.value = hz;
    f.type = 'lowpass'; f.frequency.value = cutoff;
    o.connect(f).connect(gn).connect(master);
    if (send) gn.connect(delay);
    env(gn, t, 0.01, dur, peak);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function kickAt(t) {
    const o = ac.createOscillator();
    const gn = ac.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    o.connect(gn).connect(master);
    env(gn, t, 0.004, 0.32, 0.9);
    o.start(t); o.stop(t + 0.4);
  }
  let noiseBuf = null;
  function hatAt(t, peak) {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ac.createBufferSource();
    const f = ac.createBiquadFilter();
    const gn = ac.createGain();
    s.buffer = noiseBuf;
    f.type = 'highpass'; f.frequency.value = 7000;
    s.connect(f).connect(gn).connect(master);
    env(gn, t, 0.002, 0.05, peak);
    s.start(t); s.stop(t + 0.08);
  }

  function schedule() {
    const sixteenth = 60 / song.bpm / 4;
    while (nextTime < ac.currentTime + 0.12) {
      const i = step % 16;
      const bar = Math.floor(step / 16) % 4;
      if (song.kick[i]) kickAt(nextTime);
      if (song.hat[i]) hatAt(nextTime, i % 4 === 2 ? 0.12 : 0.07);
      const b = song.bassLine[i];
      if (b !== null) tone('triangle', song.deg(song.prog[bar] + b, -1), nextTime, sixteenth * 3, 0.32, { cutoff: 600 });
      if (i === 0) {
        const d = song.prog[bar];
        [0, 2, 4].forEach((k) => tone('sawtooth', song.deg(d + k, 0), nextTime, sixteenth * 15, 0.035, { cutoff: 900 }));
      }
      const l = song.lead[step % 64];
      if (l !== null) tone('sine', song.deg(l, 1), nextTime, sixteenth * 1.6, 0.13, { send: true });
      nextTime += sixteenth;
      step++;
    }
  }

  function describe() {
    seedOut.textContent = `seed ${song.seed} · ${song.bpm} BPM · ${song.rootName} ${song.scale.name}`;
  }

  function draw() {
    raf = 0;
    g.clearRect(0, 0, w, h);
    g.lineWidth = 1.5;
    if (playing && analyser) {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      g.strokeStyle = INK;
      g.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * w;
        const y = h / 2 + ((data[i] - 128) / 128) * (h * 0.42);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      // playhead
      const p = ((step % 64) / 64) * w;
      g.fillStyle = BLUE;
      g.fillRect(w - p - 1, 10, 2, h - 20);
      if (!reduced()) raf = window.requestAnimationFrame(draw);
    } else {
      g.strokeStyle = LINE;
      g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    }
  }

  function play() {
    if (!ac) setup();
    if (ac.state === 'suspended') ac.resume();
    playing = true;
    nextTime = ac.currentTime + 0.06;
    step = 0;
    schedule();
    timer = window.setInterval(schedule, 25);
    toggle.setAttribute('aria-pressed', 'true');
    label.textContent = 'توقف';
    draw();
  }
  function stop() {
    playing = false;
    window.clearInterval(timer);
    if (ac) ac.suspend();
    toggle.setAttribute('aria-pressed', 'false');
    label.textContent = 'پخش';
    window.cancelAnimationFrame(raf); raf = 0;
    draw();
  }

  const newSeed = () => Math.floor(Math.random() * 9000) + 1000;
  song = compose(newSeed());
  describe();
  draw();
  toggle.setAttribute('aria-pressed', 'false');

  toggle.addEventListener('click', () => (playing ? stop() : play()));
  again.addEventListener('click', () => {
    song = compose(newSeed());
    describe();
    if (playing) step = Math.ceil(step / 16) * 16; // switch on the next bar
  });
  const onHide = () => { if (document.hidden && playing) stop(); };
  document.addEventListener('visibilitychange', onHide);

  return () => {
    stop();
    document.removeEventListener('visibilitychange', onHide);
    if (ac) ac.close();
  };
}

/* =========================================================================
   AI × IMAGE — noise → word, step by step (a diffusion sketch)
   ========================================================================= */
function initNoise(root) {
  const canvas = root.querySelector('canvas');
  const form = root.querySelector('[data-noise-form]');
  const input = form.querySelector('input');
  const status = root.querySelector('[data-noise-status]');
  const { ctx: g, w, h } = fitCanvas(canvas);
  const INK = css(root, '--ink') || '#08080a';
  const BLUE = css(root, '--accent') || '#1f3cff';
  const STEPS = 40;
  let raf = 0;

  function targets(word) {
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const o = off.getContext('2d');
    let size = Math.min(h * 0.62, (w * 1.5) / Math.max(word.length, 2));
    o.font = `${size}px Nimkat, Tahoma, sans-serif`;
    while (o.measureText(word).width > w * 0.86 && size > 20) {
      size -= 4;
      o.font = `${size}px Nimkat, Tahoma, sans-serif`;
    }
    o.direction = 'rtl';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = '#000';
    o.fillText(word, w / 2, h / 2 + size * 0.06);
    const data = o.getImageData(0, 0, w, h).data;
    const pts = [];
    const gap = w > 500 ? 4 : 3;
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        if (data[(y * w + x) * 4 + 3] > 140) pts.push([x, y]);
      }
    }
    // keep the dot count bounded
    const max = 2600;
    if (pts.length > max) {
      const keep = [];
      const stride = pts.length / max;
      for (let i = 0; i < max; i++) keep.push(pts[Math.floor(i * stride)]);
      return keep;
    }
    return pts;
  }

  function render(word) {
    window.cancelAnimationFrame(raf);
    const pts = targets(word);
    const r = rng(word.length * 7919 + 17);
    const particles = pts.map(([x, y]) => ({ tx: x, ty: y, sx: r() * w, sy: r() * h, jx: r() * 2 - 1, jy: r() * 2 - 1, blue: r() < 0.06 }));
    const noiseDots = Array.from({ length: 900 }, () => ({ x: r() * w, y: r() * h }));
    const total = reduced() ? 1 : 2400;
    const t0 = performance.now();

    const frame = (now) => {
      const t = Math.min(1, (now - t0) / total);
      const k = Math.min(STEPS, Math.floor(t * STEPS) + 1);
      const s = reduced() ? 1 : k / STEPS;            // stepped, like denoising steps
      const e = 1 - Math.pow(1 - s, 2.4);
      const sigma = (1 - e) * 26;
      g.clearRect(0, 0, w, h);
      g.fillStyle = INK;
      g.globalAlpha = (1 - e) * 0.35;
      for (const d of noiseDots) g.fillRect(d.x, d.y, 1.6, 1.6);
      g.globalAlpha = 1;
      for (const p of particles) {
        const x = p.sx + (p.tx - p.sx) * e + p.jx * sigma;
        const y = p.sy + (p.ty - p.sy) * e + p.jy * sigma;
        g.fillStyle = p.blue && s === 1 ? BLUE : INK;
        g.fillRect(x, y, 2, 2);
      }
      g.fillStyle = BLUE;
      g.font = '12px Nimkat, sans-serif';
      g.direction = 'ltr';
      g.textAlign = 'left';
      g.fillText(`step ${k}/${STEPS}`, 12, h - 12);
      if (t < 1) raf = window.requestAnimationFrame(frame);
      else status.textContent = `${fa(STEPS)} قدم. «${word}» از نویز دراومد.`;
    };
    status.textContent = '';
    raf = window.requestAnimationFrame(frame);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const word = input.value.replace(/\s+/g, ' ').trim().slice(0, 12);
    if (!word) {
      status.textContent = 'یه کلمه لازمه؛ هرچی دوست داری.';
      input.focus();
      return;
    }
    render(word);
  });

  const fontReady = document.fonts?.load ? document.fonts.load('40px Nimkat') : Promise.resolve();
  fontReady.finally(() => render(input.value.trim() || 'ایده'));
  return () => window.cancelAnimationFrame(raf);
}

/* =========================================================================
   IDEAS — the combining machine
   ========================================================================= */
const BUSINESSES = ['نونوایی', 'عینک‌فروشی', 'باشگاه', 'کتاب‌فروشی', 'گل‌فروشی', 'تعمیرگاه موبایل', 'کافه', 'آموزشگاه رانندگی', 'خشک‌شویی', 'کفش‌فروشی', 'قنادی', 'آژانس مسافرتی', 'دندون‌پزشکی', 'پت‌شاپ', 'لوازم‌التحریر', 'آرایشگاه'];
const ANGLES = ['بدون هیچ کلمه‌ای', 'از نگاه خود محصول', 'فقط با صدا', 'از آخر داستان شروع کن', 'از نگاه کسی که دیر بیدار شده', 'مثل یه خبر فوری', 'با یه عدد عجیب', 'بدون نشون دادن محصول', 'مثل یه اشتباه تایپی', 'با یه سؤال که جواب نداره', 'تو سه ثانیه', 'از نگاه یه مشتری پشیمون', 'مثل یه دستور آشپزی', 'از نگاه یه بچه‌ی پنج‌ساله', 'با کسی که هیچ‌وقت دیده نمی‌شه'];

function initCombine(root) {
  const box = root.querySelector('.combo');
  const a = root.querySelector('[data-combo="a"]');
  const b = root.querySelector('[data-combo="b"]');
  const kept = root.querySelector('[data-combo-kept]');
  const pick = (list, not) => {
    let v;
    do { v = list[Math.floor(Math.random() * list.length)]; } while (v === not && list.length > 1);
    return v;
  };
  const shuffle = () => {
    a.textContent = pick(BUSINESSES, a.textContent);
    b.textContent = pick(ANGLES, b.textContent);
    box.classList.remove('is-shuffling');
    void box.offsetWidth;
    box.classList.add('is-shuffling');
  };
  root.querySelector('[data-combo-btn="shuffle"]').addEventListener('click', shuffle);
  root.querySelector('[data-combo-btn="keep"]').addEventListener('click', () => {
    const text = `${a.textContent} × ${b.textContent}`;
    if ([...kept.children].some((li) => li.textContent === text)) return;
    const li = document.createElement('li');
    li.textContent = text;
    kept.prepend(li);
    while (kept.children.length > 6) kept.lastElementChild.remove();
  });
  shuffle();
  return null;
}

/* =========================================================================
   CREATIVE TESTS — the cliché detector
   ========================================================================= */
const CLICHES = [
  'در دنیای امروز', 'دنیای پرشتاب', 'کیفیت برتر', 'بی‌نظیر', 'بی‌رقیب', 'منحصربه‌فرد', 'شگفت‌انگیز',
  'فوق‌العاده', 'باورنکردنی', 'انقلابی', 'متحول', 'تحول', 'تجربه‌ای متفاوت', 'تجربه‌ای بی‌نظیر', 'سطح بعدی',
  'یک قدم جلوتر', 'همین حالا', 'همین امروز', 'فرصت طلایی', 'فرصت رو از دست نده', 'فرصت را از دست ندهید',
  'رویایی', 'بهترین انتخاب', 'بهترین', 'نسل جدید', 'هوشمندانه', 'حرفه‌ای‌ترین', 'با ما همراه باشید',
  'قیمت استثنایی', 'استثنایی', 'آینده‌ای روشن', 'ما اینجاییم تا', 'رضایت مشتری', 'کیفیت و قیمت مناسب',
  'سفارش بده', 'سفارش دهید', 'ارتقا دهید', 'لذت ببرید',
];
const normalize = (s) => s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ـ/g, '');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CLICHE_RE = new RegExp(
  `(?<![\\p{L}\\p{M}])(?:${CLICHES
    .map(normalize)
    .sort((x, y) => y.length - x.length)
    .map((p) => p.split(/[\s‌]+/).map(escapeRe).join('[\\s\\u200c]*'))
    .join('|')})(?![\\p{L}\\p{M}])`,
  'gu',
);

function initCliche(root) {
  const input = root.querySelector('[data-cliche-input]');
  const out = root.querySelector('[data-cliche-out]');
  const count = root.querySelector('[data-cliche-count]');
  let timer = 0;

  function run() {
    const text = normalize(input.value.slice(0, 600));
    const frag = document.createDocumentFragment();
    let last = 0, hits = 0;
    for (const m of text.matchAll(CLICHE_RE)) {
      if (m.index > last) frag.append(document.createTextNode(text.slice(last, m.index)));
      const s = document.createElement('span');
      s.className = 'cliche__hit';
      s.textContent = m[0];
      frag.append(s);
      last = m.index + m[0].length;
      hits++;
    }
    if (last < text.length) frag.append(document.createTextNode(text.slice(last)));
    out.replaceChildren(frag);
    count.textContent = !text.trim()
      ? 'یه چیزی بنویس تا ببینیم.'
      : hits
        ? `${fa(hits)} تا کلیشه خط خورد. حالا ببین بدون اینا چی می‌مونه.`
        : 'کلیشه‌ای پیدا نکردم. حالا فقط مونده خود ایده.';
  }
  input.addEventListener('input', () => { window.clearTimeout(timer); timer = window.setTimeout(run, 120); });
  run();
  return () => window.clearTimeout(timer);
}


/* =========================================================================
   AI × WEB — حالت نقشه برای کل صفحه
   ========================================================================= */
function initBlueprint(root) {
  const sw = root.querySelector('[data-blueprint]');
  const html = document.documentElement;
  const sync = () => sw.setAttribute('aria-checked', String(html.classList.contains('is-blueprint')));
  sw.addEventListener('click', () => { html.classList.toggle('is-blueprint'); sync(); });
  sync();
}

/* =========================================================================
   نقشه‌ی آزمایش‌ها — کارت‌های قابل جابه‌جایی که با سیم به مرکز وصلن
   ========================================================================= */
function initBoard(board) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const nodes = [...board.querySelectorAll('.node')];
  const wires = board.querySelector('.board-wires');
  const hub = board.querySelector('.board-hub');
  const desktop = window.matchMedia('(min-width: 900px)');

  nodes.forEach((n, i) => {
    n.style.setProperty('--x', n.dataset.x);
    n.style.setProperty('--y', n.dataset.y);
    n.querySelectorAll('.bars i').forEach((b, k) => b.style.setProperty('--i', k));
    n._drag = { dx: 0, dy: 0 };
    n._phase = i * 1.7;
  });
  const paths = nodes.map(() => wires.appendChild(document.createElementNS(SVG_NS, 'path')));

  function drawWires() {
    if (!desktop.matches) return;
    const b = board.getBoundingClientRect();
    wires.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
    const h = hub.getBoundingClientRect();
    const hx = h.left - b.left + h.width / 2, hy = h.top - b.top + h.height / 2;
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const nx = r.left - b.left + r.width / 2, ny = r.top - b.top + r.height / 2;
      const mx = (hx + nx) / 2;
      paths[i].setAttribute('d', `M${hx.toFixed(1)} ${hy.toFixed(1)}C${mx.toFixed(1)} ${hy.toFixed(1)} ${mx.toFixed(1)} ${ny.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`);
    });
  }

  // حرکت آرام، فقط وقتی دیده می‌شه
  let visible = false, raf = 0;
  function loop(now) {
    raf = 0;
    if (!visible || document.hidden || !desktop.matches) return;
    if (!reduced()) {
      nodes.forEach((n) => {
        if (n.classList.contains('dragging')) return;
        n.style.setProperty('--fx', `${(Math.sin(now / 2300 + n._phase) * 4).toFixed(2)}px`);
        n.style.setProperty('--fy', `${(Math.cos(now / 2900 + n._phase) * 4).toFixed(2)}px`);
      });
    }
    drawWires();
    if (!reduced()) raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    board.style.setProperty('--play', visible && !reduced() ? 'running' : 'paused');
    if (visible) start();
  }).observe(board);
  document.addEventListener('visibilitychange', start);
  new ResizeObserver(() => { drawWires(); start(); }).observe(board);

  nodes.forEach((n, i) => {
    const on = () => paths[i].classList.add('hot');
    const off = () => paths[i].classList.remove('hot');
    n.addEventListener('pointerenter', on); n.addEventListener('pointerleave', off);
    n.addEventListener('focusin', on); n.addEventListener('focusout', off);

    const a = n.querySelector('.node-a');
    let sx = 0, sy = 0, bx = 0, by = 0, moved = false, pressing = false, suppress = false;
    a.addEventListener('dragstart', (e) => e.preventDefault());
    a.addEventListener('pointerdown', (e) => {
      if (!desktop.matches || e.button !== 0 || e.pointerType === 'touch') return;
      pressing = true; moved = false;
      sx = e.clientX; sy = e.clientY; bx = n._drag.dx; by = n._drag.dy;
    });
    a.addEventListener('pointermove', (e) => {
      if (!pressing) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) { moved = true; a.setPointerCapture(e.pointerId); n.classList.add('dragging'); }
      const b = board.getBoundingClientRect();
      const cx = (parseFloat(n.dataset.x) / 100) * b.width, cy = (parseFloat(n.dataset.y) / 100) * b.height;
      const hw = n.offsetWidth / 2, hh = n.offsetHeight / 2;
      n._drag.dx = Math.min(b.width - cx - hw - 8, Math.max(hw - cx + 8, bx + dx));
      n._drag.dy = Math.min(b.height - cy - hh - 8, Math.max(hh - cy + 8, by + dy));
      n.style.setProperty('--dx', `${n._drag.dx}px`);
      n.style.setProperty('--dy', `${n._drag.dy}px`);
      drawWires();
    });
    const end = (e) => {
      if (!pressing) return;
      pressing = false;
      if (moved) {
        n.classList.remove('dragging');
        if (a.hasPointerCapture(e.pointerId)) a.releasePointerCapture(e.pointerId);
        suppress = true;
      }
    };
    a.addEventListener('pointerup', end);
    a.addEventListener('pointercancel', end);
    a.addEventListener('click', (e) => { if (suppress) { e.preventDefault(); suppress = false; } });
  });
}

/* ───────── راه‌اندازی ───────── */
const INIT = { music: initMusic, noise: initNoise, combine: initCombine, cliche: initCliche, blueprint: initBlueprint };
document.querySelectorAll('[data-exp]').forEach((el) => {
  const fn = INIT[el.dataset.exp];
  if (!fn) return;
  // آزمایش‌های سنگین فقط وقتی نزدیک صفحه‌ان راه می‌افتن
  const io = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    try { fn(el); } catch (err) { console.error(err); }
  }, { rootMargin: '300px 0px' });
  io.observe(el);
});
const board = document.querySelector('[data-board]');
if (board) initBoard(board);
})();
