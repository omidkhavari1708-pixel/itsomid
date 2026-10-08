/* itsomid — تم، انتخابگر موضوع، و حرکت‌های مشترک همه‌ی صفحه‌ها.
   هیچ HTML از رشته ساخته نمی‌شه؛ فقط کلاس و textContent. */

const ROOT = document.documentElement;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => REDUCED.matches;

/* ── تم: دایره‌ای که از خود دکمه باز می‌شه ── */
(() => {
  const KEY = "omid-theme";
  const btn = document.getElementById("theme");
  if (!btn) return;
  const meta = document.querySelector('meta[name="theme-color"]');
  const apply = (t) => {
    ROOT.dataset.theme = t;
    meta?.setAttribute("content", t === "dark" ? "#000000" : "#CCC8B9");
    try { localStorage.setItem(KEY, t); } catch {}
  };
  meta?.setAttribute("content", ROOT.dataset.theme === "dark" ? "#000000" : "#CCC8B9");
  btn.addEventListener("click", () => {
    const next = ROOT.dataset.theme === "dark" ? "light" : "dark";
    if (!document.startViewTransition || reduced()) { apply(next); return; }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    ROOT.classList.add("theming");
    const vt = document.startViewTransition(() => apply(next));
    vt.ready.then(() => {
      ROOT.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.77,0,.18,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {});
    vt.finished.finally(() => ROOT.classList.remove("theming"));
  });
})();

/* ── تیترها کلمه‌به‌کلمه ظاهر می‌شن ── */
const splitWords = (el) => {
  const parts = [];
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (/^\s+$/.test(t)) { parts.push(document.createTextNode(t)); return; }
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = t;
        parts.push(s);
      });
    } else if (n.nodeType === 1 && n.tagName !== "BR") {
      const s = document.createElement("span");
      s.className = "w";
      s.append(n);
      parts.push(s);
    } else parts.push(n);
  });
  el.replaceChildren(...parts);
  el.querySelectorAll(":scope > .w").forEach((w, i) => w.style.setProperty("--i", i));
  el.classList.add("split");
  el.setAttribute("data-reveal", "");
};
document.querySelectorAll(".manifest .ln, .band h1, .sec > h2, .cta > h2, .f-line, .nowcard .head").forEach(splitWords);

/* ── ورود بخش‌ها (یه بار، حداکثر ۸ تا پشت هم) ── */
(() => {
  const items = [...document.querySelectorAll("[data-reveal], .labx")];
  if (reduced() || !("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      e.target.style.setProperty("--d", `${Math.min(i, 7) * 90}ms`);
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
})();

/* ── خط‌خطی‌های دستی: وقتی دیده شدن، کشیده می‌شن ── */
(() => {
  const marks = document.querySelectorAll(".ink-word, .cmp-pivot, [data-ink]");
  if (reduced()) { marks.forEach((m) => m.classList.add("drawn")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add("drawn"), 650);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -25% 0px" });
  marks.forEach((m) => io.observe(m));
})();

/* ── هیرو: عکس باز می‌شه، OMID بالا میاد، امضا نوشته می‌شه ── */
(() => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const frame = hero.querySelector(".photo-frame");
  const sel = hero.querySelector("[data-sel]");

  // OMID → حرف‌به‌حرف
  const text = [...sel.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  if (text) {
    const wrap = document.createElement("span");
    wrap.className = "letters";
    [...text.textContent.trim()].forEach((ch, i) => {
      const l = document.createElement("span");
      l.className = "l";
      l.textContent = ch;
      l.style.setProperty("--i", i);
      wrap.append(l);
    });
    text.replaceWith(wrap);
  }

  const go = () => {
    ROOT.classList.add("intro-go");
    setTimeout(() => sel.classList.add("on"), reduced() ? 0 : 1500);
  };
  const img = frame?.querySelector("picture img");
  const ready = img && !img.complete
    ? new Promise((r) => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); })
    : Promise.resolve();
  Promise.race([Promise.all([ready, document.fonts?.ready]), new Promise((r) => setTimeout(r, 1800))])
    .then(() => setTimeout(go, 40));

  if (!frame || reduced()) return;
  const par = frame.querySelector(".p-par");
  const sig = frame.querySelector(".p-sigpar");
  const glow = frame.querySelector(".p-glow");

  // نور و عمق با حرکت موس (فقط موس، نه لمس)
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let sy = 0, raf = 0;
  const loop = () => {
    raf = 0;
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    par.style.transform = `translate3d(${(cur.x * -10).toFixed(2)}px, ${(cur.y * -8 + sy * 0.16).toFixed(2)}px, 0)`;
    sig.style.transform = `translate3d(${(cur.x * 16).toFixed(2)}px, ${(cur.y * 10 + sy * 0.05).toFixed(2)}px, 0)`;
    glow.style.setProperty("--mx", `${(76 + cur.x * 14).toFixed(2)}%`);
    glow.style.setProperty("--my", `${(36 + cur.y * 16).toFixed(2)}%`);
    if (Math.abs(target.x - cur.x) > 0.002 || Math.abs(target.y - cur.y) > 0.002) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    frame.addEventListener("pointermove", (e) => {
      const r = frame.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    frame.addEventListener("pointerleave", () => { target.x = 0; target.y = 0; kick(); });
  }
  // اسکرول: عکس آروم‌تر از صفحه حرکت می‌کنه
  addEventListener("scroll", () => {
    sy = Math.min(scrollY, frame.offsetHeight * 1.4);
    kick();
  }, { passive: true });
})();

/* ── نوار متحرک: با اسکرول تندتر می‌شه ── */
(() => {
  const track = document.querySelector(".marquee .track");
  if (!track || reduced() || !track.getAnimations) return;
  let last = scrollY, v = 0, raf = 0;
  const tick = () => {
    raf = 0;
    const anim = track.getAnimations()[0];
    if (!anim) return;
    v *= 0.92;
    anim.playbackRate = 1 + v;
    if (v > 0.02) raf = requestAnimationFrame(tick); else anim.playbackRate = 1;
  };
  addEventListener("scroll", () => {
    const d = Math.abs(scrollY - last);
    last = scrollY;
    v = Math.min(6, v + d / 45);
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
})();

/* ── دکمه‌ها: یه کشش آهنربایی ملایم زیر موس ── */
(() => {
  if (reduced() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".go").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
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
