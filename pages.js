/* حرکت‌های صفحه‌های «معمولی و خلاق» و «فکر، ساخت، اجرا». */
(() => {
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const onEnter = (el, cb, opts = {}) => {
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
    }, { rootMargin: opts.margin || "0px 0px -20% 0px", threshold: opts.threshold || 0 });
    io.observe(el);
  };

  /* ── گوشی‌ای که می‌افته ── */
  const drop = document.querySelector("[data-drop]");
  if (drop) {
    const run = () => {
      drop.classList.remove("dropped");
      void drop.getBoundingClientRect();
      drop.classList.add("dropped");
    };
    onEnter(drop, () => setTimeout(run, reduced() ? 0 : 350), { threshold: 0.5, margin: "0px" });
    drop.querySelector("[data-drop-btn]").addEventListener("click", run);
  }

  /* ── عینک روی متن تار ── */
  const lens = document.querySelector("[data-lens]");
  if (lens) {
    let box = lens.getBoundingClientRect();
    let gw = 220, touched = false, visible = false, raf = 0, t0 = performance.now();
    const pos = { x: 0, y: 0 }, target = { x: 0, y: 0 };
    const apply = () => {
      const s = gw / 220;
      lens.style.setProperty("--lx", `${pos.x}px`);
      lens.style.setProperty("--ly", `${pos.y}px`);
      lens.style.setProperty("--lx1", `${pos.x - 58 * s}px`);
      lens.style.setProperty("--lx2", `${pos.x + 58 * s}px`);
    };
    const measure = () => {
      box = lens.getBoundingClientRect();
      gw = clamp(box.width * 0.42, 150, 260);
      lens.style.setProperty("--gw", `${gw}px`);
      lens.style.setProperty("--lr", `${(34 / 220) * gw}px`);
      if (!touched) { target.x = pos.x = box.width * 0.5; target.y = pos.y = box.height * 0.42; apply(); }
    };
    const tick = (now) => {
      raf = 0;
      if (!touched && !reduced()) {
        const t = (now - t0) / 1000;
        target.x = box.width * (0.5 + 0.3 * Math.sin(t * 0.55));
        target.y = box.height * (0.42 + 0.16 * Math.sin(t * 0.9));
      }
      const k = reduced() ? 1 : 0.16;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      apply();
      const settled = Math.abs(pos.x - target.x) < 0.3 && Math.abs(pos.y - target.y) < 0.3;
      if (visible && !document.hidden && (!touched || !settled)) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
    const touch = () => { if (!touched) { touched = true; lens.classList.add("touched"); } };
    const fromEvent = (e) => {
      const r = lens.getBoundingClientRect();
      target.x = clamp(e.clientX - r.left, 0, r.width);
      target.y = clamp(e.clientY - r.top, 0, r.height);
      touch(); kick();
    };
    lens.addEventListener("pointermove", (e) => { if (e.pointerType !== "touch" || e.buttons) fromEvent(e); });
    lens.addEventListener("pointerdown", fromEvent);
    lens.addEventListener("keydown", (e) => {
      const st = e.shiftKey ? 48 : 20;
      const m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (!m) return;
      e.preventDefault(); touch();
      target.x = clamp(target.x + m[0], 0, box.width);
      target.y = clamp(target.y + m[1], 0, box.height);
      kick();
    });
    new ResizeObserver(measure).observe(lens);
    measure();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(lens);
    document.addEventListener("visibilitychange", kick);
  }

  /* ── THINK: سؤال‌های غلط خط می‌خورن، قاب روی سؤال درست می‌شینه ── */
  const think = document.querySelector("[data-think]");
  if (think) {
    const frame = think.querySelector(".mini-frame");
    const tag = frame.querySelector("b");
    const rows = [...think.querySelectorAll("li")];
    const yes = think.querySelector(".yes");
    let armed = false;
    const frameTo = (row) => {
      const r = row.querySelector("span").getBoundingClientRect();
      const c = think.getBoundingClientRect();
      frame.style.transform = `translate(${r.left - c.left - 8}px, ${r.top - c.top - 4}px)`;
      frame.style.width = `${r.width + 16}px`;
      frame.style.height = `${r.height + 8}px`;
      tag.textContent = row.dataset.q === "yes" ? "این." : "این نه.";
      frame.classList.add("on");
    };
    onEnter(think, async () => {
      const strikes = think.querySelectorAll(".ink-strike");
      for (const s of strikes) { s.classList.add("drawn"); if (!reduced()) await wait(380); }
      think.classList.add("drawn");
      if (!reduced()) await wait(250);
      armed = true;
      frameTo(yes);
    }, { margin: "0px 0px -25% 0px" });
    new ResizeObserver(() => armed && frameTo(yes)).observe(think);
    if (fine) {
      rows.forEach((row) => row.addEventListener("pointerenter", () => armed && frameTo(row)));
      think.addEventListener("pointerleave", () => armed && frameTo(yes));
    }
  }

  /* ── CREATE: ایده تایپ می‌شه، پنج خروجی ازش درمیاد ── */
  const create = document.querySelector("[data-create]");
  if (create) {
    create.querySelectorAll(".out").forEach((o, i) => o.style.setProperty("--i", i));
    const v = create.querySelector(".prompt-v");
    const full = v.textContent;
    onEnter(create, async () => {
      create.classList.add("in");
      if (reduced()) return;
      v.textContent = "";
      for (let i = 1; i <= full.length; i++) { v.textContent = full.slice(0, i); await wait(38 + Math.random() * 40); }
    });
  }

  /* ── BUILD: تیکه‌ها روی شبکه جا می‌افتن ── */
  const build = document.querySelector("[data-build]");
  if (build) onEnter(build, () => setTimeout(() => build.classList.add("built"), reduced() ? 0 : 250), { threshold: 0.35, margin: "0px" });
})();
