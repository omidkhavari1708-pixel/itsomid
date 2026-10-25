/* ابزارهای صفحه‌های تازه: پیش‌نمایش سایت رزومه، کوییز، چک‌لیست ۷ روزه، کپی پرامپت، «ببین چی می‌شه اگه…».
   همه‌چیز تو همین مرورگر می‌مونه؛ هیچ درخواستی جایی نمی‌ره (CSP: connect-src 'none').
   هیچ HTML از رشته ساخته نمی‌شه؛ فقط textContent و کلاس. */
(() => {
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const onEnter = (el, cb) => {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
    }, { threshold: 0.35 });
    io.observe(el);
  };

  /* ── پیش‌نمایش ده‌ثانیه‌ای سایت رزومه ── */
  const pv = document.querySelector("[data-pv]");
  if (pv) {
    const PRESETS = [
      { name: "دکتر سارا رضایی", job: "دندان‌پزشک", line: "لبخند طبیعی، بدون عجله.", city: "تهران", btn: "نوبت بگیر" },
      { name: "علی محمدی", job: "وکیل پایه‌یک دادگستری", line: "قرارداد رو قبل از امضا با هم می‌خونیم.", city: "اصفهان", btn: "مشاوره بگیر" },
      { name: "مهندس نیما کریمی", job: "طراح سازه", line: "ساختمونی که سی سال بعد هم سرپاست.", city: "شیراز", btn: "پروژه‌ها" },
      { name: "مریم احمدی", job: "عکاس پرتره", line: "عکسی که شبیه خودت باشه، نه فیلتر.", city: "مشهد", btn: "رزرو عکاسی" },
    ];
    const TITLES = ["دکتر", "مهندس", "استاد", "سرکار", "خانم", "آقای"];
    const DEF = { name: "اسم تو", job: "کار تو", line: "یه جمله که بگه چرا تو.", city: "" };
    const inputs = {}, outs = {};
    pv.querySelectorAll("[data-pv-in]").forEach((el) => { inputs[el.dataset.pvIn] = el; });
    pv.querySelectorAll("[data-pv-out]").forEach((el) => { outs[el.dataset.pvOut] = el; });
    const screen = pv.querySelector("[data-pv-screen]");
    const mono = pv.querySelector("[data-pv-mono]");
    const url = pv.querySelector("[data-pv-url]");
    const btn1 = pv.querySelector(".pv-btns span");
    let touched = false;

    const render = () => {
      for (const k of Object.keys(outs)) {
        const v = inputs[k].value.trim();
        outs[k].textContent = v || DEF[k];
        outs[k].classList.toggle("ph", !v);
      }
      const words = inputs.name.value.trim().split(/\s+/).filter((w) => w && !TITLES.includes(w));
      mono.textContent = words.length ? words[0].charAt(0) : "؟";
      const latin = inputs.name.value.toLowerCase().replace(/[^a-z0-9]+/g, "");
      url.textContent = (latin || "yourname") + ".github.io";
      screen.classList.remove("pop");
      void screen.offsetWidth;
      screen.classList.add("pop");
    };
    const fill = async (p, typing) => {
      for (const k of ["name", "job", "line", "city"]) {
        if (!typing || reduced()) { inputs[k].value = p[k]; continue; }
        inputs[k].value = "";
        for (const ch of p[k]) {
          if (touched) return;
          inputs[k].value += ch; render(); await wait(26 + Math.random() * 30);
        }
      }
      btn1.textContent = p.btn;
      render();
    };
    Object.values(inputs).forEach((el) => el.addEventListener("input", () => { touched = true; render(); }));
    pv.querySelectorAll("[data-pv-style]").forEach((b) => b.addEventListener("click", () => {
      pv.querySelectorAll("[data-pv-style]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      screen.dataset.style = b.dataset.pvStyle;
      render();
    }));
    pv.querySelectorAll("[data-pv-preset]").forEach((b) => b.addEventListener("click", () => {
      touched = true;
      fill(PRESETS[+b.dataset.pvPreset], false);
    }));
    render();
    /* اولین بار که دیده می‌شه، یه نمونه خودش تایپ می‌شه تا آدم ببینه چی می‌شه */
    onEnter(pv, () => { if (!touched) fill(PRESETS[0], true); });
  }

  /* ── کوییز «سایت لازم داری؟» ── */
  const quiz = document.querySelector("[data-quiz]");
  if (quiz) {
    const res = quiz.querySelector("[data-qz-res]");
    const total = quiz.querySelectorAll(".qz").length;
    const ans = new Map();
    const R = [
      { h: "فعلاً اینستاگرامت کافیه.", p: "راستش رو بخوای، الان سایت لازم نداری. انرژیت رو بذار روی محتوا؛ هر وقت آدم‌ها ازت «نمونه‌کار» خواستن، برگرد اینجا.", dm: false },
      { h: "به‌زودی لازمش داری.", p: "هنوز اورژانسی نیست، ولی داری بهش می‌رسی. یه سایت تک‌صفحه‌ای ساده همون چیزیه که بعداً می‌گی کاش زودتر ساخته بودم.", dm: true },
      { h: "سایت لازم داری.", p: "آدم‌ها دنبال یه جای مطمئن می‌گردن که ببینن کی هستی و چیکار می‌کنی. بایوی اینستاگرام براش جا نداره.", dm: true },
    ];
    quiz.querySelectorAll("[data-qz]").forEach((b) => b.addEventListener("click", () => {
      const q = b.dataset.qz;
      ans.set(q, +b.dataset.v);
      quiz.querySelectorAll(`[data-qz="${q}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      b.closest(".qz").classList.add("done");
      if (ans.size < total) return;
      const score = [...ans.values()].reduce((a, v) => a + v, 0);
      const r = score <= 1 ? R[0] : score === 2 ? R[1] : R[2];
      res.querySelector("[data-qz-score]").textContent = `${fa(score)} از ${fa(total)} آره`;
      res.querySelector("[data-qz-h]").textContent = r.h;
      res.querySelector("[data-qz-p]").textContent = r.p;
      res.querySelector("[data-qz-dm]").hidden = !r.dm;
      res.querySelector("[data-qz-self]").hidden = false;
      const first = res.hidden;
      res.hidden = false;
      if (first) res.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
    }));
  }

  /* ── چک‌لیست ۷ روزه: تیک‌ها فقط تو همین مرورگر ── */
  const boxes = [...document.querySelectorAll("[data-d7]")];
  if (boxes.length) {
    const KEY = "omid-7days";
    const saved = store.get(KEY) || {};
    const count = document.querySelector("[data-d7-count]");
    const bar = document.querySelector("[data-d7-bar]");
    const msg = document.querySelector("[data-d7-msg]");
    const MSG = [
      [0, "از روز ۱ شروع کن. تیک‌هات همین‌جا می‌مونن."],
      [1, "شروع کردی؛ سخت‌ترین قسمت همین بود."],
      [9, "از نصفه‌ی راه داری رد می‌شی."],
      [15, "سایتت داره واقعی می‌شه."],
      [21, "تموم شد. حالا تو چی ساختی؟ لینکش رو برام بفرست."],
    ];
    const update = () => {
      const done = boxes.filter((b) => b.checked).length;
      count.textContent = fa(done);
      bar.style.transform = `scaleX(${done / boxes.length})`;
      msg.textContent = MSG.filter(([n]) => done >= n).pop()[1];
      boxes.forEach((b) => b.closest("li").classList.toggle("on", b.checked));
    };
    boxes.forEach((b) => {
      b.checked = !!saved[b.dataset.d7];
      b.addEventListener("change", () => {
        saved[b.dataset.d7] = b.checked;
        store.set(KEY, saved);
        update();
      });
    });
    document.querySelector("[data-d7-reset]").addEventListener("click", () => {
      boxes.forEach((b) => { b.checked = false; delete saved[b.dataset.d7]; });
      store.del(KEY);
      update();
    });
    update();
  }

  /* ── کپی پرامپت ── */
  document.querySelectorAll("[data-copy]").forEach((b) => {
    const label = b.querySelector("span");
    const orig = label.textContent;
    b.addEventListener("click", async () => {
      const src = document.getElementById(b.dataset.copy);
      let ok = false;
      try { await navigator.clipboard.writeText(src.textContent); ok = true; } catch (e) {
        const r = document.createRange();
        r.selectNodeContents(src);
        const sel = getSelection();
        sel.removeAllRanges(); sel.addRange(r);
        try { ok = document.execCommand("copy"); } catch (e2) {}
      }
      label.textContent = ok ? "کپی شد ✓" : "انتخاب شد؛ کپیش کن";
      b.classList.toggle("ok", ok);
      setTimeout(() => { label.textContent = orig; b.classList.remove("ok"); }, 1800);
    });
  });

  /* ── «ببین چی می‌شه اگه…» ── */
  const IDEAS = [
    "سایتت رو مثل یه نامه بنویسی، نه مثل یه آگهی؟",
    "رزومه‌ت به‌جای یه لیست، یه داستان سه‌خطی باشه؟",
    "یه هفته فقط با گوشیت یه چیزی بسازی؟",
    "تبلیغت اصلاً شبیه تبلیغ نباشه؟",
    "به AI به‌جای دستور، یه صحنه بدی؟",
    "اولین نسخه‌ت عمداً زشت باشه؟",
    "صفحه‌ی اول سایتت فقط یه سؤال باشه؟",
    "منوی یه رستوران با صدای آشپزخونه شروع بشه؟",
    "کارت ویزیتت یه آهنگ باشه که هر بار عوض می‌شه؟",
    "بعد از هر شکست، فقط یه قدم کوچیک‌تر برداری؟",
    "یه ابزار رو برای کاری استفاده کنی که براش ساخته نشده؟",
    "نمونه‌کارت رو با «قبل» شروع کنی، نه «بعد»؟",
    "هر روز یه چیز ده‌دقیقه‌ای بسازی، حتی اگه بد باشه؟",
    "سایت یه دکتر، اول به ترس بیمار جواب بده، نه به مدرک دکتر؟",
    "پیجت رو مثل یه سریال ببینی، نه یه ویترین؟",
    "از AI بخوای اول اون ازت سؤال بپرسه؟",
    "یه ایده‌ی نصفه رو همین امروز منتشر کنی؟",
    "سایتت از ایران، بدون فیلترشکن و بدون هزینه‌ی سرور باز بشه؟",
    "قبل از ساختن، ده دقیقه فقط روی کاغذ فکر کنی؟",
    "به‌جای «۱۰ نکته»، فقط یه چیز رو واقعاً نشون بدی؟",
    "سایتت یه آزمایش داشته باشه که آدم باهاش بازی کنه؟",
    "چیزی که خراب شد رو دوباره بسازی، ولی برعکس؟",
    "کارت رو جوری توضیح بدی که یه بچه‌ی ده‌ساله بفهمه؟",
    "اسم کسب‌وکارت رو از یه خاطره بذاری، نه از یه کلمه‌ی انگلیسی؟",
  ];
  document.querySelectorAll("[data-whatif]").forEach((w) => {
    const t = w.querySelector("[data-wi-t]");
    const n = w.querySelector("[data-wi-n]");
    let bag = [], cur = 0;
    const pick = () => {
      if (!bag.length) bag = IDEAS.map((_, i) => i).filter((i) => i !== cur).sort(() => Math.random() - 0.5);
      return bag.pop();
    };
    const show = (i) => {
      cur = i;
      t.classList.remove("in");
      void t.offsetWidth;
      t.textContent = IDEAS[i];
      t.classList.add("in");
      n.textContent = `${String(i + 1).padStart(2, "0")} / ${IDEAS.length}`;
    };
    w.querySelector("[data-wi-next]").addEventListener("click", () => show(pick()));
    show(0);
  });
})();
