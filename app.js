/* itsomid — تم و انتخابگر موضوع */

/* ── تم ── */
(() => {
  const root = document.documentElement, KEY = "omid-theme";
  try { const s = localStorage.getItem(KEY); if (s) root.dataset.theme = s; } catch {}
  document.getElementById("theme")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch {}
  });
})();

/* ── انتخابگر موضوع ──
   اسکرول واقعی مرورگر با قفل‌شدن. چرخ موس، تاچ‌پد، انگشت و کیبورد همه کار می‌کنن. */
(() => {
  const sec  = document.getElementById("picker");
  const reel = document.getElementById("reel");
  const list = document.getElementById("reelList");
  const dots = document.getElementById("dots");
  const go   = document.getElementById("go");
  if (!sec || !reel || !list) return;

  const ITEMS = [
    { href: "brand.html",      cls: "c1" },
    { href: "web.html",        cls: "c2" },
    { href: "automation.html", cls: "c3" },
    { href: "about.html",      cls: "c4" },
    { href: "why-ai.html",     cls: "c5" },
  ];
  const li = [...list.children];
  /* متن هر گزینه داخل یه لایه می‌ره تا انیمیشن، هدفِ قفل رو جابه‌جا نکنه */
  li.forEach(el => { if (!el.querySelector("i")) el.innerHTML = "<i>" + el.textContent.trim() + "</i>"; });
  let idx = -1;

  dots.innerHTML = li.map((el, i) =>
    `<button role="tab" aria-current="${i === 0}" aria-label="${el.textContent.trim()}"></button>`
  ).join("");
  const dotBtns = [...dots.children];

  function paint(n) {
    if (n === idx) return;
    idx = n;
    li.forEach((el, i) => el.classList.toggle("on", i === idx));
    dotBtns.forEach((b, i) => b.setAttribute("aria-current", String(i === idx)));
    sec.className = "picker " + ITEMS[idx].cls;
    go.setAttribute("href", ITEMS[idx].href);
  }

  /* کدوم گزینه وسط کادره؟ */
  function current() {
    const mid = reel.getBoundingClientRect().top + reel.clientHeight / 2;
    let best = 0, near = Infinity;
    li.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < near) { near = d; best = i; }
    });
    return best;
  }

  /* چرخ موس و تاچ‌پد: هر حرکت دقیقاً یه قدم، هرچقدر هم تند باشه.
     کروم برای چرخ موس از scroll-snap-stop رد می‌شه، پس خودمون کنترلش می‌کنیم. */
  let cool = false;
  reel.addEventListener("wheel", e => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (!d) return;
    const dir = d > 0 ? 1 : -1;
    const next = idx + dir;
    /* روی لبه‌ها: صفحه رو خودمون حرکت می‌دیم.
       چون ریل هنوز فضای اسکرول داره و مرورگر خودش به صفحه واگذار نمی‌کنه. */
    if (next < 0) {                       /* بالای اولین گزینه → برگرد به صفحه‌ی اول */
      e.preventDefault();
      if (cool) return;
      cool = true;
      document.querySelector(".hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { cool = false; }, 700);
      return;
    }
    if (next > li.length - 1) {            /* پایین آخرین گزینه → ادامه‌ی صفحه */
      e.preventDefault();
      if (cool) return;
      cool = true;
      scrollTo({ top: sec.offsetTop + sec.offsetHeight, behavior: "smooth" });
      setTimeout(() => { cool = false; }, 700);
      return;
    }
    e.preventDefault();
    if (cool) return;
    cool = true;
    jump(next);
    paint(next);
    setTimeout(() => { cool = false; }, 460);
  }, { passive: false });

  let tick;
  reel.addEventListener("scroll", () => {
    cancelAnimationFrame(tick);
    tick = requestAnimationFrame(() => paint(current()));
  }, { passive: true });
  reel.addEventListener("scrollend", () => paint(current()), { passive: true });

  /* فقط داخل ریل اسکرول کن — نه کل صفحه */
  const jump = (i, smooth = true) => {
    const top = li[i].offsetTop - (reel.clientHeight - li[i].offsetHeight) / 2;
    reel.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  };
  dotBtns.forEach((b, i) => b.addEventListener("click", () => jump(i)));
  li.forEach((el, i) => el.addEventListener("click", () => jump(i)));

  addEventListener("keydown", e => {
    if (e.key === "ArrowDown" && idx < li.length - 1) { e.preventDefault(); jump(idx + 1); }
    if (e.key === "ArrowUp"   && idx > 0)             { e.preventDefault(); jump(idx - 1); }
  });

  paint(0);
  jump(0, false);
  addEventListener("resize", () => jump(idx, false), { passive: true });
  document.fonts?.ready.then(() => jump(idx < 0 ? 0 : idx, false));
})();