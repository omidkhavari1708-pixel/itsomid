/* سازنده‌ی صفحه‌های داخلی — همه از یه قالب، تا هیچ‌وقت از هم جدا نیفتن.
   اجرا:  node build-pages.js
   همه‌ی متن‌ها ثابت و دست‌نوشته‌ان؛ هیچ ورودی کاربری وارد این HTML نمی‌شه. */
const fs = require("fs");

/* ───────── سربرگ مشترک ───────── */
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; require-trusted-types-for 'script'; trusted-types 'none'; upgrade-insecure-requests";

const HEAD = (title, desc, file) => `<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="OMID">
<meta property="og:locale" content="fa_IR">
<meta property="og:url" content="https://omidkhavari1708-pixel.github.io/itsomid/${file}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://omidkhavari1708-pixel.github.io/itsomid/assets/og-omid-2026.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="امید، با امضای دست‌نویس اسمش">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="https://omidkhavari1708-pixel.github.io/itsomid/assets/og-omid-2026.jpg">
<link rel="canonical" href="https://omidkhavari1708-pixel.github.io/itsomid/${file}">
<meta name="theme-color" content="#CCC8B9">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/nimkat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css?v=20261008b">
<script src="theme.js?v=20261008b"></script>`;

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  vs: '<rect x="3" y="6" width="7.5" height="12" rx="1.6"/><rect x="13.5" y="6" width="7.5" height="12" rx="1.6"/>',
  method: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>',
  lab: '<path d="M9 3h6"/><path d="M10 3v6l-5.5 9.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3"/><path d="M7.4 15h9.2"/>',
  about: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.7 3.3-5.6 6.5-5.6s5.9 1.9 6.5 5.6"/>',
  contact: '<path d="M4 5h16v14H4z"/><path d="m4 6 8 6 8-6"/>',
};

const DOCK = (cur) => {
  const it = [
    ["index.html", "خانه", ICONS.home],
    ["vs.html", "معمولی و خلاق", ICONS.vs],
    ["method.html", "فکر، ساخت، اجرا", ICONS.method],
    ["lab.html", "آزمایشگاه", ICONS.lab],
    ["about.html", "امید کیه", ICONS.about],
  ].map(([h, l, p]) =>
    `  <a href="${h}"${h === cur ? ' aria-current="page"' : ""} data-lbl="${l}" aria-label="${l}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></a>`
  ).join("\n");
  return `<nav class="dock" aria-label="ناوبری">
${it}
  <span class="sep"></span>
  <a href="contact.html"${cur === "contact.html" ? ' aria-current="page"' : ""} data-lbl="تماس" aria-label="تماس"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.contact}</svg></a>
  <button id="theme" type="button" data-lbl="روشن / تاریک" aria-label="تغییر روشنایی"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none"/></svg></button>
</nav>`;
};

const FOOT = `<footer class="foot">
  <div class="foot-in">
    <p class="foot-brand en">OMID <span>AI × HUMAN CREATIVITY</span></p>
    <p class="foot-rule">AI ابزار منه. خلاقیت مزیت منه.</p>
    <p class="foot-links en"><a href="https://instagram.com/itsomid1.ai" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://t.me/itsomid_ai" target="_blank" rel="noopener noreferrer">Telegram</a></p>
    <p class="foot-copy en">© 2026 OMID</p>
  </div>
</footer>`;

/* ───────── تیکه‌های تصویری ───────── */
const ARROW = '<svg class="ink ink-arrow" viewBox="0 0 120 40" aria-hidden="true"><path pathLength="1" d="M112 22C84 30 50 30 14 18m12-12L12 18l14 10"/></svg>';
const CIRCLE = '<svg class="ink ink-circle" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M160 16C118 2 40 6 16 34 2 54 30 90 100 90c60 0 90-20 86-48-3-22-44-34-92-30-24 2-44 8-54 16"/></svg>';
const STRIKE = (d) => `<svg class="ink ink-strike" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${d}"/></svg>`;
const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.6 4.8 2.4 7.4 10 10-7.6 2.6-9.4 5.2-10 10-.6-4.8-2.4-7.4-10-10 7.6-2.6 9.4-5.2 10-10Z"/></svg>';
const HANDLES = '<i class="h h-tl"></i><i class="h h-tr"></i><i class="h h-bl"></i><i class="h h-br"></i>';

const cmp = ({ plain, plainCap, bold, boldCap, diff }) => `<div class="viz cmp">
  <div class="cmp-plain"><span class="pane-lbl">معمولی</span>${plain}<p class="pane-cap">${plainCap}</p></div>
  <p class="cmp-pivot"><span>ولی یه لحظه.</span>${ARROW}</p>
  <div class="cmp-bold"><span class="pane-lbl on">خلاق</span>${bold}<p class="pane-cap">${boldCap}</p></div>
  <p class="cmp-diff"><b>فرقش:</b> ${diff}</p>
</div>`;

const VIS = {
  drop: cmp({
    plain: `<div class="plain-art" aria-hidden="true"><span class="glow"></span><span class="p-phone"></span><span class="p-spark">${SPARK}</span><span class="p-line">محافظت کامل</span></div>`,
    plainCap: "گوشی براق روی پس‌زمینه‌ی گرادیانی، با جمله‌ای که همه‌ی قاب‌ها می‌گن.",
    bold: `<div class="art drop" data-drop>
      <svg class="drop-svg" viewBox="0 0 320 300" aria-hidden="true">
        <g class="drop-measure"><path d="M46 40v220"/><path d="M38 40h16M38 260h16"/><text x="58" y="154" class="drop-cm">120 cm</text></g>
        <g class="drop-phone"><rect x="150" y="34" width="62" height="118" rx="12"/><rect x="158" y="44" width="46" height="88" rx="4" class="drop-screen"/><path class="drop-lines" d="M162 18v-10M181 22V4M200 18v-10"/></g>
        <path class="drop-floor" d="M20 262h290"/>
        <text x="296" y="292" class="drop-copy">۱۲۰ سانت. هیچی نشد.</text>
      </svg>
      <button class="chip" type="button" data-drop-btn>دوباره ول کن</button>
    </div>`,
    boldCap: "گوشی از ارتفاع ۱۲۰ سانتی ول می‌شه. فریم آخر: سالم روی زمین. کل متن تبلیغ همینه: «۱۲۰ سانت. هیچی نشد.»",
    diff: "اولی می‌گه محکمه. دومی نشونش می‌ده.",
  }),
  menu: cmp({
    plain: `<div class="plain-art" aria-hidden="true"><span class="glow"></span><span class="p-flags"><i></i><i></i><i></i></span><span class="p-bubble en">Hello!</span><span class="p-line">زبان رو سریع یاد بگیر</span></div>`,
    plainCap: "چندتا پرچم، یه حباب «Hello!» و یه وعده‌ی کلی.",
    bold: `<div class="art menu-card" data-ink>
      <p class="mc-name en" lang="it">Trattoria da Lucia</p>
      <ul class="mc-list en" lang="it">
        <li><span>Cacio e pepe</span><i></i><b>14</b></li>
        <li class="mc-pick"><span>Carciofi alla giudia</span><i></i><b>12</b>${CIRCLE}</li>
        <li><span>Saltimbocca alla romana</span><i></i><b>22</b></li>
        <li><span>Supplì al telefono</span><i></i><b>6</b></li>
      </ul>
      <p class="mc-note">این چیه؟</p>
      <p class="mc-copy">دفعه‌ی بعد، خودت سفارش بده.</p>
    </div>`,
    boldCap: "منوی یه رستوران تو رم که هیچی‌ش رو نمی‌فهمی جز قیمت‌ها. متن تبلیغ: «دفعه‌ی بعد، خودت سفارش بده.»",
    diff: "اولی درباره‌ی زبانه. دومی درباره‌ی لحظه‌ایه که لازمش داری.",
  }),
  lens: cmp({
    plain: `<div class="plain-art" aria-hidden="true"><span class="glow"></span><span class="p-shades"><i></i><i></i></span><span class="p-line">جدیدترین مدل‌های امسال</span></div>`,
    plainCap: "عینک آفتابی وسط کادر، یه نور ملایم و تیتر «جدیدترین مدل‌ها».",
    bold: `<div class="art lens" data-lens tabindex="0" role="group" aria-label="بنر عینک‌فروشی. با موس، انگشت یا کلیدهای جهت، عینک رو روی متن جابه‌جا کن.">
      <p class="lens-text blur" aria-hidden="true">اگه این جمله رو تار می‌بینی، وقتشه یه سر بهمون بزنی. معاینه‌ی چشم، همون روز.</p>
      <p class="lens-text sharp">اگه این جمله رو تار می‌بینی، وقتشه یه سر بهمون بزنی. معاینه‌ی چشم، همون روز.</p>
      <svg class="lens-glasses" viewBox="0 0 220 80" aria-hidden="true"><circle cx="52" cy="40" r="34"/><circle cx="168" cy="40" r="34"/><path d="M86 36c8-8 40-8 48 0M18 34 2 26M202 34l16-8"/></svg>
      <span class="lens-hint" aria-hidden="true">عینک رو جابه‌جا کن</span>
    </div>`,
    boldCap: "کل بنر تاره، جز جایی که عینک روشه. خود متن، تست بیناییه.",
    diff: "اولی عینک رو نشون می‌ده. دومی کاری می‌کنه مشکل رو خودت حس کنی.",
  }),

  think: `<div class="viz card think" data-think>
    <p class="think-head"><span>سؤال‌هایی که قبل از ساختن می‌پرسم</span><span class="think-count en">4</span></p>
    <ul class="think-list">
      <li data-q="no"><span>با کدوم ابزار بسازم؟${STRIKE("M3 11c46-4 92 3 140-1 52-4 100-3 154 2")}</span></li>
      <li data-q="no"><span>الان چی ترنده؟${STRIKE("M4 9c60 4 110-2 160 1 46 3 90 1 132-2")}</span></li>
      <li data-q="no"><span>بقیه چی ساختن؟${STRIKE("M3 12c40-6 98-4 150-2 50 2 96-4 144-1")}</span></li>
      <li data-q="yes" class="yes"><span>چی رو هنوز کسی این‌جوری نساخته؟</span></li>
    </ul>
    <div class="mini-frame" aria-hidden="true">${HANDLES}<b>این.</b></div>
  </div>`,
  create: `<div class="viz card create" data-create>
    <div class="prompt"><span class="prompt-spark">${SPARK}</span><p><span class="prompt-k">ایده</span> <span class="prompt-v">صدای شهر، ساعت سه صبح</span></p><span class="caret" aria-hidden="true"></span></div>
    <svg class="wires" viewBox="0 0 500 120" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M250 0C250 60 50 50 50 120"/><path pathLength="1" d="M250 0C250 60 150 50 150 120"/><path pathLength="1" d="M250 0V120"/><path pathLength="1" d="M250 0C250 60 350 50 350 120"/><path pathLength="1" d="M250 0C250 60 450 50 450 120"/></svg>
    <ul class="outs">
      <li class="out o-image"><span class="oi" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span>تصویر</span></li>
      <li class="out o-video"><span class="oi" aria-hidden="true"><i></i><i></i><i></i></span><span>ویدیو</span></li>
      <li class="out o-sound"><span class="oi" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span>صدا</span></li>
      <li class="out o-design"><span class="oi" aria-hidden="true"><i></i></span><span>طراحی</span></li>
      <li class="out o-xp"><span class="oi" aria-hidden="true"><i></i></span><span>تجربه</span></li>
    </ul>
  </div>`,
  build: `<div class="viz card build" data-build>
    <div class="b-guides" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="b-page" aria-hidden="true">
      <span class="blk b-nav"></span><span class="blk b-title"></span><span class="blk b-title short"></span>
      <span class="blk b-media"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M0 0 100 60M100 0 0 60"/></svg></span>
      <span class="blk b-text"></span><span class="blk b-text short"></span><span class="blk b-btn"></span>
    </div>
    <p class="b-status"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>منتشر شد</p>
  </div>`,

  inspector: `<div class="viz inspector">
    <p class="ins-bar"><span class="ins-dot" aria-hidden="true"></span><span class="en">Layer</span><b>امید</b></p>
    <dl class="ins-props">
      <div><dt>نقش</dt><dd>سازنده</dd></div>
      <div><dt>ابزار</dt><dd class="en">AI</dd></div>
      <div><dt>مزیت</dt><dd>خلاقیت</dd></div>
      <div><dt>روش</dt><dd class="en">THINK → CREATE → BUILD</dd></div>
      <div><dt>قانون</dt><dd class="en">Talk less. Test more.</dd></div>
      <div><dt class="en">Blend</dt><dd class="en">Human × AI</dd></div>
      <div><dt>وضعیت</dt><dd><span class="live-dot" aria-hidden="true"></span>در حال ساختن</dd></div>
    </dl>
  </div>`,

  socials: `<ul class="viz socials">
    <li><a class="social" href="https://instagram.com/itsomid1.ai" target="_blank" rel="noopener noreferrer"><span class="s-name en">INSTAGRAM</span><span class="s-handle en">@itsomid1.ai</span><svg class="s-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7 7 17M8 7h9v9"/></svg></a></li>
    <li><a class="social" href="https://t.me/itsomid_ai" target="_blank" rel="noopener noreferrer"><span class="s-name en">TELEGRAM</span><span class="s-handle en">@itsomid_ai</span><svg class="s-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7 7 17M8 7h9v9"/></svg></a></li>
  </ul>`,

  board: `<div class="viz board" data-board>
    <svg class="board-wires" aria-hidden="true"></svg>
    <div class="board-hub" aria-hidden="true">${SPARK}<span class="en">LAB</span></div>
    <ul class="board-nodes">
      <li class="node" data-x="17" data-y="20"><a class="node-a" href="#s1"><span class="n-cat en">AI × MUSIC</span><span class="n-title">آهنگی که هر بار عوض می‌شه</span><span class="n-viz bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="status testing">در حال تست</span></a></li>
      <li class="node" data-x="80" data-y="18"><a class="node-a" href="#s2"><span class="n-cat en">AI × IMAGE</span><span class="n-title">از نویز تا تصویر</span><span class="n-viz noise" aria-hidden="true"></span><span class="status done">جواب داد</span></a></li>
      <li class="node" data-x="14" data-y="78"><a class="node-a" href="#s3"><span class="n-cat en">IDEAS</span><span class="n-title">ماشین ترکیب</span><span class="n-viz combo" aria-hidden="true"><i>نونوایی</i><b>×</b><i>بدون کلمه</i></span><span class="status always">همیشه روشن</span></a></li>
      <li class="node" data-x="52" data-y="84"><a class="node-a" href="#s4"><span class="n-cat en">CREATIVE TESTS</span><span class="n-title">ردیاب کلیشه</span><span class="n-viz strike" aria-hidden="true"><s>بی‌نظیر</s> <s>شگفت‌انگیز</s></span><span class="status testing">در حال تست</span></a></li>
      <li class="node" data-x="85" data-y="74"><a class="node-a" href="#s5"><span class="n-cat en">AI × WEB</span><span class="n-title">اسکلت همین سایت</span><span class="n-viz cols" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="status done">جواب داد</span></a></li>
    </ul>
  </div>`,

  music: `<div class="viz exp" data-exp="music">
    <canvas class="exp-canvas" width="640" height="160" aria-hidden="true"></canvas>
    <div class="exp-row">
      <button class="go sm" type="button" data-music="toggle" aria-pressed="false"><span data-music-label>پخش</span></button>
      <button class="go sm ghost" type="button" data-music="new">یه آهنگ تازه</button>
      <span class="exp-meta en" data-music-seed>seed —</span>
    </div>
    <p class="exp-fine">صدا فقط با زدن «پخش» شروع می‌شه.</p>
  </div>`,
  noise: `<div class="viz exp" data-exp="noise">
    <canvas class="exp-canvas" width="640" height="300" aria-hidden="true"></canvas>
    <form class="exp-row" data-noise-form>
      <label class="field"><span class="field-lbl">یه کلمه بنویس</span><input class="field-in" type="text" name="word" maxlength="12" autocomplete="off" spellcheck="false" value="ایده" required></label>
      <button class="go sm" type="submit">از نویز بسازش</button>
    </form>
    <p class="exp-fine" aria-live="polite" data-noise-status></p>
  </div>`,
  combine: `<div class="viz exp" data-exp="combine">
    <p class="combo" aria-live="polite"><span data-combo="a">نونوایی</span><span class="combo-x en">×</span><span class="combo-b" data-combo="b">بدون هیچ کلمه‌ای</span></p>
    <div class="exp-row">
      <button class="go sm" type="button" data-combo-btn="shuffle">یه ترکیب دیگه</button>
      <button class="go sm ghost" type="button" data-combo-btn="keep">اینو نگه دار</button>
    </div>
    <ol class="kept" data-combo-kept aria-label="ترکیب‌های نگه‌داشته"></ol>
  </div>`,
  cliche: `<div class="viz exp" data-exp="cliche">
    <label class="field"><span class="field-lbl">متن تبلیغت رو اینجا بنویس</span>
      <textarea class="field-in area" rows="4" maxlength="600" spellcheck="false" data-cliche-input>در دنیای امروز، ما با کیفیت برتر و طراحی منحصربه‌فرد، تجربه‌ای متفاوت و شگفت‌انگیز برای شما می‌سازیم. همین حالا سفارش بده!</textarea></label>
    <p class="cliche-out" data-cliche-out aria-live="polite"></p>
    <p class="exp-meta" data-cliche-count></p>
  </div>`,
  blueprint: `<div class="viz exp" data-exp="blueprint">
    <div class="switch-row"><span id="bp-lbl">حالت نقشه</span><button class="switch" type="button" role="switch" aria-checked="false" aria-labelledby="bp-lbl" data-blueprint><i aria-hidden="true"></i></button></div>
    <p class="exp-fine">روشنش کن و تا پایین صفحه اسکرول کن. هر بخش اسم و جای خودش رو روی شبکه نشون می‌ده.</p>
  </div>`,
};

/* کارت هر آزمایش: خودِ آزمایش، بعد توضیح ساده، مثال و کاربرد */
const STATUS = { testing: "در حال تست", done: "جواب داد", always: "همیشه روشن" };
const LABX = ({ no, status, widget, what, example, use }) => `<div class="viz labx">
  <div class="labx-head"><span class="labx-no" aria-hidden="true">${no}</span><span class="status ${status}">${STATUS[status]}</span></div>
  ${widget}
  <div class="labx-explain">
    <div class="labx-box"><h3>یعنی چی؟</h3><p>${what}</p></div>
    <div class="labx-box ex"><h3>یه مثال ساده</h3><p>${example}</p></div>
  </div>
  <p class="labx-use"><b>به چه دردت می‌خوره؟</b> ${use}</p>
</div>`;

/* ───────── قالب صفحه ───────── */
const page = (p) => `<!doctype html>
<html lang="fa" dir="rtl" data-theme="light">
<head>
${HEAD(`${p.title} — OMID`, p.desc, p.file)}
</head>
<body class="page ${p.cls}">

<header class="band" data-name="header">
  <div class="top">
    <p class="kicker">${p.kicker}</p>
    <a class="back" href="index.html">← back</a>
  </div>
  <div class="row">
    <span class="no" aria-hidden="true">${p.no || ""}</span>
    <div>
      <h1>${p.h1}</h1>
      <p class="sub">${p.sub}</p>
    </div>
  </div>
</header>

<main class="body">
  <nav class="index" aria-label="فهرست"><ol>
${p.sections.map((s, i) => `    <li><a href="#s${i}"${i === 0 ? ' class="on"' : ""}>${s.nav || s.h2}</a></li>`).join("\n")}
    ${p.faq ? '<li><a href="#faq">سؤال‌های همیشگی</a></li>' : ""}
  </ol></nav>
  <div>
${p.sections.map((s, i) => `<section class="sec" id="s${i}" data-name="${s.lbl}">
  <p class="lbl">${s.lbl}</p>
  <h2>${s.h2}</h2>
  ${s.body ? `<p>${s.body}</p>` : ""}
  ${s.items ? `<ul class="list">${s.items.map((it, n) =>
    `<li><span class="n">${String(n + 1).padStart(2, "0")}</span><h3>${it[0]}</h3><p>${it[1]}</p></li>`).join("")}</ul>` : ""}
  ${s.visual || ""}
</section>`).join("\n\n")}
${p.faq ? `
<section class="sec" id="faq" data-name="FAQ">
  <p class="lbl">FAQ</p>
  <h2>سؤال‌های همیشگی</h2>
  <div class="qa-list">
${p.faq.map((f) => `    <details class="qa"><summary>${f[0]}<span class="mk" aria-hidden="true">+</span></summary><div class="bd">${f[1]}</div></details>`).join("\n")}
  </div>
</section>` : ""}
  </div>
</main>

<section class="sec cta" data-name="CTA">
  <h2>${p.ctaH}</h2>
  ${p.cta || '<a class="go" href="contact.html"><span>بیا با هم بسازیم</span><span class="ar">←</span></a>'}
</section>

${FOOT}
${DOCK(p.file)}
<div class="blueprint" aria-hidden="true"><div class="bp-cols"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
<script src="app.js?v=20261008b" defer></script>
${(p.scripts || []).map((s) => `<script src="${s}?v=20261008b" defer></script>`).join("\n")}
</body>
</html>
`;

/* ───────── صفحه‌ها ───────── */
const PAGES = [
  {
    file: "vs.html", no: "01", cls: "c1", title: "معمولی در برابر خلاق", kicker: "Ordinary vs Creative",
    desc: "یه بریف، دو تا نسخه. اولی رو همه با AI می‌سازن. دومی همونیه که آدم‌ها یادشون می‌مونه.",
    h1: "معمولی در برابر خلاق.",
    sub: "یه بریف، دو تا نسخه. اولی رو همه با AI می‌سازن. دومی همونیه که آدم‌ها یادشون می‌مونه.",
    scripts: ["pages.js"],
    sections: [
      { lbl: "Brief 01", nav: "قاب گوشی", h2: "برای یه فروشگاه قاب گوشی، تبلیغ بساز.", visual: VIS.drop },
      { lbl: "Brief 02", nav: "آموزشگاه زبان", h2: "برای یه آموزشگاه زبان، پست اینستاگرام بساز.", visual: VIS.menu },
      { lbl: "Brief 03", nav: "عینک‌فروشی", h2: "برای یه عینک‌فروشی، بنر بساز.", visual: VIS.lens },
    ],
    faq: [
      ["یعنی AI بده؟", "نه. هر دو نسخه رو می‌شه با AI ساخت. فرق از جایی شروع می‌شه که قبل از باز کردنش، چی تو ذهنته."],
      ["از کجا بفهمم ایده‌م معمولیه؟", "اگه اولین چیزیه که به ذهن همه می‌رسه، احتمالاً معمولیه. از خودت بپرس: اینو قبلاً صد بار دیدم؟"],
      ["خلاق بودن یعنی عجیب بودن؟", "نه. یعنی یه زاویه‌ی درست. نسخه‌ی خلاق معمولاً ساده‌تره، نه پیچیده‌تر."],
    ],
    ctaH: "تو کدوم نسخه رو می‌سازی؟",
  },
  {
    file: "method.html", no: "02", cls: "c2", title: "فکر، ساخت، اجرا", kicker: "Think → Create → Build",
    desc: "AI ساختن رو آسون‌تر کرده. اما اینکه چی بسازی، هنوز با توئه.",
    h1: "فکر کن، بساز، اجرا کن.",
    sub: "AI ساختن رو آسون‌تر کرده. اما اینکه چی بسازی، هنوز با توئه. این سه قدم، همون ترتیبیه که هر کاری رو باهاش جلو می‌برم.",
    scripts: ["pages.js"],
    sections: [
      { lbl: "Think", h2: "متفاوت فکر کن.", body: "قبل از ساختن، مسئله رو ببین. سؤال درست بپرس. ایده‌ای پیدا کن که واقعاً ارزش اجرا داشته باشه.", visual: VIS.think },
      { lbl: "Create", h2: "ایده رو بساز.", body: "از AI برای تبدیل فکر به تصویر، ویدیو، صدا، طراحی و تجربه استفاده کن.", visual: VIS.create },
      { lbl: "Build", h2: "چیزی واقعی بساز.", body: "ایده زمانی ارزش داره که از ذهن بیرون بیاد و تبدیل به یه پروژه‌ی واقعی بشه.", visual: VIS.build },
    ],
    faq: [
      ["چرا اول فکر؟ AI که خودش ایده می‌ده.", "می‌ده، ولی همون ایده‌ای که به بقیه هم داده. ایده‌ای که از سؤال خودت دربیاد، مال خودته."],
      ["با چه ابزارهایی کار می‌کنی؟", "ابزارها هر ماه عوض می‌شن، روش نه. برای همین اینجا اسم ابزار نمی‌بینی."],
      ["اگه وسط ساختن، ایده خراب شد؟", "برمی‌گردم به قدم اول. خراب شدن جزو کاره، نه آخرش."],
    ],
    ctaH: "از کدوم قدم شروع کنیم؟",
  },
  {
    file: "lab.html", no: "03", cls: "c3", title: "OMID LAB", kicker: "OMID Lab",
    desc: "اینجا چیزهایی رو امتحان می‌کنم که هنوز اسم مشخصی ندارن.",
    h1: "آزمایشگاه.",
    sub: "اینجا چیزهایی رو امتحان می‌کنم که هنوز اسم مشخصی ندارن. همه‌ی آزمایش‌ها همین‌جا، تو همین صفحه کار می‌کنن؛ لازم نیست چیزی نصب کنی.",
    scripts: ["lab.js"],
    sections: [
      { lbl: "Map", nav: "نقشه‌ی آزمایش‌ها", h2: "پنج تا آزمایش کوچیک", body: "<span class=\"lab-hello\">هرکدوم یه تیکه از AI رو ساده نشون می‌ده. اول باهاش بازی کن، بعد توضیح ساده‌ش رو بخون. روی هر کارت بزنی، می‌ری سراغش.</span>", visual: VIS.board },
      { lbl: "AI × Music", h2: "آهنگی که هر بار عوض می‌شه", visual: LABX({
        no: "01", status: "testing", widget: VIS.music,
        what: "به‌جای اینکه یه آهنگ آماده دانلود کنم، چندتا قانون ساده به کامپیوتر دادم؛ مثلاً «فقط از این پنج تا نت استفاده کن» یا «سر هر ضرب یه کیک بزن». هر بار «یه آهنگ تازه» رو بزنی، با همون قانون‌ها یه آهنگ جدید می‌سازه.",
        example: "مثل پلو پختن با یه دستور ثابت: برنج، آب، نمک. هر بار یه‌کم فرق می‌کنه، ولی همیشه پلو درمیاد. اینجا هم قانون‌ها ثابته، آهنگ هر بار فرق می‌کنه.",
        use: "برای ریلز یا ویدیوت موزیکی داری که مال خودته؛ نه کپی‌رایت داره، نه شبیه موزیک ترندیه که همه گذاشتن.",
      }) },
      { lbl: "AI × Image", h2: "از نویز تا تصویر", visual: LABX({
        no: "02", status: "done", widget: VIS.noise,
        what: "هوش مصنوعی‌های عکس‌ساز عکس رو یهو نمی‌کشن. از یه صفحه‌ی پر از نقطه‌های بی‌معنی شروع می‌کنن و توی چند ده قدم، نقطه‌ها رو آروم‌آروم جابه‌جا می‌کنن تا بشه همون چیزی که خواستی. اینجا همین کار رو با یه کلمه می‌بینی.",
        example: "مثل وقتی که یه نفر پشت شیشه‌ی بخارگرفته‌ی حموم وایساده: اول فقط یه لکه‌ست، بخار که کم می‌شه، کم‌کم صورتش واضح می‌شه.",
        use: "وقتی بفهمی AI چطوری عکس می‌سازه، می‌فهمی چرا پرامپت دقیق‌تر عکس بهتری می‌ده؛ هر کلمه‌ی پرامپت به اون قدم‌ها جهت می‌ده.",
      }) },
      { lbl: "Ideas", h2: "ماشین ترکیب", visual: LABX({
        no: "03", status: "always", widget: VIS.combine,
        what: "ماشین یه کسب‌وکار و یه زاویه‌ی عجیب رو تصادفی کنار هم می‌ذاره. بیشترشون بی‌معنی‌ان؛ کار تو اینه که از بینشون اونی رو پیدا کنی که یه جرقه می‌زنه.",
        example: "«نونوایی × بدون هیچ کلمه‌ای» می‌شه یه ویدیوی ده‌ثانیه‌ای از صدای ترک خوردن پوسته‌ی نون داغ، بدون هیچ متنی. همین کافیه که آدم گرسنه‌ش بشه.",
        use: "وقتی ایده نداری، ذهنت رو از مسیر تکراری بیرون می‌کشه. ماشین ترکیب می‌کنه، تو انتخاب می‌کنی.",
      }) },
      { lbl: "Creative Tests", h2: "ردیاب کلیشه", visual: LABX({
        no: "04", status: "testing", widget: VIS.cliche,
        what: "یه متن تبلیغ بنویس؛ کلمه‌هایی که همه‌جا تکرار شدن، مثل «بی‌نظیر» و «کیفیت برتر»، خط می‌خورن. چیزی که می‌مونه، حرف واقعی خودته.",
        example: "«بهترین کفش با کیفیت بی‌نظیر» دو تا کلیشه داره و هیچی نمی‌گه. به‌جاش بنویس: «سه ساله این کفش پامه، هنوز نبردمش کفاشی.» حالا آدم باورت می‌کنه.",
        use: "متن‌هایی که با AI نوشته می‌شن پر از همین کلمه‌هان. وقتی پاکشون کنی، متنت شبیه آدم می‌شه، نه شبیه ماشین.",
      }) },
      { lbl: "AI × Web", h2: "اسکلت همین سایت", visual: LABX({
        no: "05", status: "done", widget: VIS.blueprint,
        what: "هر سایت مرتب یه اسکلت نامرئی داره: دوازده تا ستون که همه‌چیز روی اون‌ها می‌شینه. این کلید، اون اسکلت رو روی همین صفحه نشونت می‌ده.",
        example: "مثل خط‌های کم‌رنگ دفتر خوش‌نویسی: آخر کار دیده نمی‌شن، ولی بدون اون‌ها نوشته کج و ناصاف می‌شد.",
        use: "وقتی خودت با AI سایت می‌سازی، می‌فهمی چرا بعضی صفحه‌ها مرتب به نظر میان و بعضی‌ها شلوغ؛ و می‌تونی ازش بخوای همه‌چی رو روی شبکه بچینه.",
      }) },
    ],
    faq: [
      ["این آزمایش‌ها واقعی‌ان؟", "آره. همه‌شون همین‌جا، تو همین صفحه کار می‌کنن. چیزی رو نشون نمی‌دم که نشه امتحانش کرد."],
      ["چیزی از من ذخیره یا فرستاده می‌شه؟", "نه. هرچی اینجا می‌نویسی یا می‌سازی، فقط تو مرورگر خودت می‌مونه و جایی فرستاده نمی‌شه."],
      ["چرا بعضی‌هاش «در حال تست»ه؟", "چون هنوز نمی‌دونم جواب می‌ده یا نه. وقتی فهمیدم، همین‌جا می‌نویسم."],
    ],
    ctaH: "یه ایده برای آزمایش بعدی داری؟",
  },
  {
    file: "about.html", no: "04", cls: "c4", title: "امید کیه", kicker: "About",
    desc: "من امیدم؛ درباره خلاقیت، AI و ساختن چیزهایی که قبلاً بهشون فکر نکردیم.",
    h1: "من امیدم.",
    sub: "چند ساله دارم با AI کار می‌کنم؛ اما چیزی که بیشتر از ابزارها برام جذابه، اینه که با هر ابزار جدید چه چیز متفاوتی می‌شه ساخت.",
    scripts: ["pages.js"],
    sections: [
      { lbl: "Who", h2: "یه کم جلوتر، همین.", body: "اینجا قرار نیست استاد باشم. یه کم جلوترم، همین. هرچی امتحان می‌کنم رو می‌ذارم وسط؛ اونایی که جواب دادن، و اونایی که نه.", visual: VIS.inspector },
      { lbl: "How I work", h2: "چطور کار می‌کنم", items: [
        ["اول ایده، بعد ابزار", "قبل از باز کردن هر ابزاری، می‌دونم دنبال چی‌ام."],
        ["کمتر حرف، بیشتر تست", "ابزار جدید که میاد، درباره‌ش حرف نمی‌زنم. باهاش یه چیزی می‌سازم؛ بعد اگه ارزش گفتن داشت، می‌گم."],
        ["معمولی رو کنار خلاق می‌ذارم", "هر کاری رو دو بار می‌بینم: نسخه‌ای که همه می‌سازن، و نسخه‌ای که ارزش ساختن داره."],
        ["ابزار عوض می‌شه، روش نه", "ابزارها هر ماه عوض می‌شن. فکر کردن قبل از ساختن، نه."],
      ] },
      { lbl: "What I believe", h2: "چیزی که بهش باور دارم", body: "همه می‌تونن با AI محتوا و سایت بسازن، ولی همه نمی‌دونن چی بسازن. <b>AI ابزار منه. خلاقیت مزیت منه.</b>" },
    ],
    faq: [
      ["چرا اسم ابزارها رو نمی‌گی؟", "چون هر ماه عوض می‌شن. چیزی که عوض نمی‌شه، اینه که قبل از ساختن چی تو ذهنته."],
      ["کجا بیشتر می‌بینمت؟", "اینستاگرام. هرچی امتحان می‌کنم، اول اونجا میاد."],
      ["می‌شه با هم چیزی بسازیم؟", "آره. از صفحه‌ی تماس یه پیام بده و بگو تو ذهنت چیه."],
    ],
    ctaH: "بیا یه چیزی بسازیم",
  },
  {
    file: "why-ai.html", no: "05", cls: "c5", title: "چرا خلاقیت", kicker: "Why Creativity",
    desc: "AI ابزار منه. خلاقیت مزیت منه.",
    h1: "AI ابزار منه. خلاقیت مزیت منه.",
    sub: "AI ساختن رو آسون‌تر کرده. اما اینکه چی بسازی، هنوز با توئه.",
    sections: [
      { lbl: "The shift", h2: "چی عوض شده", body: "ساختن دیگه سخت نیست. با چند جمله می‌شه تصویر، صدا، ویدیو و سایت ساخت. <b>وقتی ساختن برای همه آسون شد، ساختن به‌تنهایی دیگه مزیت نیست.</b>" },
      { lbl: "The trap", h2: "تله‌ی همه‌چیز شبیه هم", items: [
        ["همون سؤال، همون جواب", "وقتی همه یه‌جور از AI می‌پرسن، همه یه‌جور جواب می‌گیرن."],
        ["کیفیت بالا، حس صفر", "خروجی تمیزه، ولی کسی یادش نمی‌مونه."],
        ["اول ابزار، بعد فکر", "وقتی ابزار رو قبل از ایده باز کنی، ابزار به‌جات تصمیم می‌گیره."],
      ] },
      { lbl: "The point", h2: "حرف اصلی", body: "ابزار رو همه دارن، ایده رو نه. <b>ایده‌ی خوب، قبل از ساختن شروع می‌شه.</b>" },
    ],
    faq: [
      ["AI جای خلاقیت رو نمی‌گیره؟", "AI می‌تونه بی‌نهایت گزینه بسازه. اینکه کدومش ارزش داره، هنوز کار آدمه."],
      ["خلاقیت یاد گرفتنیه؟", "آره. بیشترش عادت دیدنه: قبل از ساختن، هر بار بپرسی «اینو قبلاً دیدم؟»"],
    ],
    ctaH: "چی می‌خوای بسازی؟",
  },
  {
    file: "contact.html", no: "06", cls: "c1", title: "تماس", kicker: "Contact",
    desc: "اگه می‌خوای با هم بسازیم، از اینجا شروع کن.",
    h1: "اگه می‌خوای با هم بسازیم، از اینجا شروع کن.",
    sub: "یه پیام بده و بگو تو ذهنت چیه. ایده‌ی نصفه هم قبوله.",
    sections: [
      { lbl: "Channels", h2: "از هر کدوم راحت‌تری", visual: VIS.socials },
      { lbl: "Before you write", h2: "اگه این سه تا رو بنویسی، سریع‌تر به نتیجه می‌رسیم", items: [
        ["چی تو ذهنته", "یه جمله درباره‌ی ایده؛ حتی اگه نصفه‌ست."],
        ["برای کیه", "برای خودت، پیجت یا کسب‌وکارت؟"],
        ["تا کی", "اگه عجله داری بگو، اگه نداری هم بگو."],
      ] },
    ],
    faq: [
      ["ایده‌م هنوز کامل نیست. پیام بدم؟", "آره. بیشتر کارهای خوب از یه ایده‌ی نصفه شروع شدن."],
    ],
    ctaH: "منتظرم",
    cta: '<a class="go" href="https://instagram.com/itsomid1.ai" target="_blank" rel="noopener noreferrer"><span>پیام تو اینستاگرام</span><span class="ar">↗</span></a>',
  },
];

let n = 0;
for (const p of PAGES) { fs.writeFileSync(p.file, page(p)); n++; console.log("✓ " + p.file); }
console.log(n + " صفحه ساخته شد");
module.exports = { HEAD, DOCK, FOOT };
