/* itsomid — تم، انتخابگر موضوع، و حرکت‌های مشترک همه‌ی صفحه‌ها.
   هیچ HTML از رشته ساخته نمی‌شه؛ فقط کلاس و textContent. */

const ROOT = document.documentElement;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => REDUCED.matches;

/* ── تم ── */
(() => {
  const KEY = "omid-theme";
  document.getElementById("theme")?.addEventListener("click", () => {
    const next = ROOT.dataset.theme === "dark" ? "light" : "dark";
    ROOT.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch {}
  });
})();

/* ── ورود آرام بخش‌ها (یه بار، حداکثر ۸ تا پشت هم) ── */
(() => {
  const items = [...document.querySelectorAll("[data-reveal]")];
  if (reduced() || !("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      e.target.style.setProperty("--d", `${Math.min(i, 7) * 80}ms`);
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  items.forEach((el) => io.observe(el));
})();

/* ── خط‌خطی‌های دستی: وقتی دیده شدن، کشیده می‌شن ── */
(() => {
  const marks = document.querySelectorAll(".ink-word, .cmp-pivot, [data-ink]");
  if (reduced()) { marks.forEach((m) => m.classList.add("drawn")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add("drawn"), 450);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -25% 0px" });
  marks.forEach((m) => io.observe(m));
})();

/* ── قاب انتخاب دور OMID، بعد از لود ── */
(() => {
  const w = document.querySelector("[data-sel]");
  if (!w) return;
  const on = () => w.classList.add("on");
  (document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(on, reduced() ? 0 : 700));
})();

/* ── هیرو: لامپ می‌ره تو دستگاه، محتوا از اون طرف بیرون میاد ── */
(() => {
  const m = document.querySelector("[data-machine]");
  if (!m || reduced()) return;
  const bits = [...m.querySelectorAll(".m-bits i")];
  const place = () => {
    const w = m.clientWidth, h = m.clientHeight;
    bits.forEach((b, i) => {
      const a = i / (bits.length - 1);
      b.style.setProperty("--x", `${((0.04 + a * 0.42) * w).toFixed(1)}px`);
      b.style.setProperty("--y", `${(-(0.05 + (((i * 37) % 10) / 10) * 0.3) * h).toFixed(1)}px`);
      b.style.setProperty("--d", `${(i % 5) * 0.07}s`);
    });
  };
  place();
  new ResizeObserver(place).observe(m);
  const img = m.querySelector("picture img");
  const loaded = img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener("load", r, { once: true }));
  loaded.then(() => setTimeout(() => m.classList.add("run"), 900));
  new IntersectionObserver(([e]) => m.classList.toggle("paused", !e.isIntersecting)).observe(m);
  document.addEventListener("visibilitychange", () => m.classList.toggle("paused", document.hidden));
})();

/* ── «هنوز با توئه»: خط‌ها با اسکرول روشن می‌شن ── */
(() => {
  const track = document.querySelector(".idea-track");
  if (!track) return;
  const lines = [...track.querySelectorAll("[data-line]")];
  const under = track.querySelector(".ink-under");
  if (reduced()) { lines.forEach((l) => l.style.setProperty("--p", "1")); under?.classList.add("drawn"); return; }
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let queued = false;
  const update = () => {
    queued = false;
    const r = track.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    lines.forEach((l, i) => {
      const local = Math.min(1, Math.max(0, (p - (0.04 + i * 0.19)) / 0.24));
      l.style.setProperty("--p", ease(local).toFixed(3));
    });
    if (p > 0.84) under?.classList.add("drawn");
  };
  const q = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", q, { passive: true });
  addEventListener("resize", q, { passive: true });
  update();
})();

/* ── فهرست چسبان صفحه‌های داخلی: بخش فعلی رو نشون بده ── */
(() => {
  const links = [...document.querySelectorAll(".index a")];
  if (!links.length) return;
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("on"));
      byId.get(e.target.id)?.classList.add("on");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
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
    { href: "vs.html",     cls: "c1" },
    { href: "method.html", cls: "c2" },
    { href: "lab.html",    cls: "c3" },
    { href: "about.html",  cls: "c4" },
    { href: "why-ai.html", cls: "c5" },
  ];
  const li = [...list.children];
  const dotBtns = [...dots.children];
  let idx = -1;

  function paint(n) {
    if (n === idx) return;
    idx = n;
    li.forEach((el, i) => el.classList.toggle("on", i === idx));
    dotBtns.forEach((b, i) => b.setAttribute("aria-current", String(i === idx)));
    sec.className = "picker " + ITEMS[idx].cls;
    go.setAttribute("href", ITEMS[idx].href);
  }

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

  /* چرخ موس و تاچ‌پد: هر حرکت دقیقاً یه قدم.
     کروم برای چرخ موس از scroll-snap-stop رد می‌شه، پس خودمون کنترلش می‌کنیم. */
  let cool = false;
  reel.addEventListener("wheel", (e) => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (!d) return;
    const next = idx + (d > 0 ? 1 : -1);
    e.preventDefault();
    if (cool) return;
    cool = true;
    if (next < 0) {
      scrollTo({ top: Math.max(0, sec.offsetTop - innerHeight), behavior: "smooth" });
      setTimeout(() => { cool = false; }, 700);
      return;
    }
    if (next > li.length - 1) {
      scrollTo({ top: sec.offsetTop + sec.offsetHeight, behavior: "smooth" });
      setTimeout(() => { cool = false; }, 700);
      return;
    }
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

  const jump = (i, smooth = true) => {
    const top = li[i].offsetTop - (reel.clientHeight - li[i].offsetHeight) / 2;
    reel.scrollTo({ top, behavior: smooth && !reduced() ? "smooth" : "auto" });
  };
  dotBtns.forEach((b, i) => b.addEventListener("click", () => jump(i)));
  li.forEach((el, i) => el.addEventListener("click", () => jump(i)));

  sec.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && idx < li.length - 1) { e.preventDefault(); jump(idx + 1); }
    if (e.key === "ArrowUp" && idx > 0) { e.preventDefault(); jump(idx - 1); }
  });

  paint(0);
  jump(0, false);
  addEventListener("resize", () => jump(idx, false), { passive: true });
  document.fonts?.ready.then(() => jump(idx < 0 ? 0 : idx, false));
})();

ROOT.classList.add("is-ready");
