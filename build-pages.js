/* سازنده‌ی صفحه‌های داخلی — همه از یه قالب، تا هیچ‌وقت از هم جدا نیفتن.
   اجرا:  node build-pages.js
   همه‌ی متن‌ها ثابت و دست‌نوشته‌ان؛ هیچ ورودی کاربری وارد این HTML نمی‌شه. */
const fs = require("fs");

/* ───────── سربرگ مشترک ───────── */
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; require-trusted-types-for 'script'; trusted-types 'none'; upgrade-insecure-requests";

/* نسخه‌ی فایل‌ها: هر بار CSS یا JS عوض شد، این عدد رو عوض کن تا گوشی‌ها نسخه‌ی تازه رو بگیرن. */
const V = "20261025";
const SITE = "https://omidkhavari1708-pixel.github.io/itsomid/";
const DM = "https://ig.me/m/itsomid1.ai";
const TG = "https://t.me/itsomidai";
const md = (file) => (file === "" || file === "index.html" ? "index.md" : file.replace(/.html$/, ".md"));

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
<link rel="alternate" type="text/markdown" href="${md(file)}" title="نسخه‌ی متنی برای AI">
<meta name="theme-color" content="#CCC8B9">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/nimkat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css?v=${V}">
<script src="theme.js?v=${V}"></script>`;

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  vs: '<rect x="3" y="6" width="7.5" height="12" rx="1.6"/><rect x="13.5" y="6" width="7.5" height="12" rx="1.6"/>',
  method: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>',
  lab: '<path d="M9 3h6"/><path d="M10 3v6l-5.5 9.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3"/><path d="M7.4 15h9.2"/>',
  about: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.7 3.3-5.6 6.5-5.6s5.9 1.9 6.5 5.6"/>',
  contact: '<path d="M4 5h16v14H4z"/><path d="m4 6 8 6 8-6"/>',
  whatif: '<path d="M9.2 9a2.9 2.9 0 1 1 4.3 2.5c-.9.5-1.5 1.2-1.5 2.2v.6"/><path d="M12 17.6v.4"/><circle cx="12" cy="12" r="9"/>',
  resume: '<rect x="6" y="2.5" width="12" height="19" rx="2.4"/><circle cx="12" cy="8.6" r="2.2"/><path d="M9 13.4h6M9.8 16.4h4.4"/>',
  tools: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  dm: '<path d="M12 3.5c-4.9 0-8.5 3.4-8.5 7.9 0 2.4 1 4.4 2.8 5.9l-.5 3.2 3.1-1.6c1 .3 2 .4 3.1.4 4.9 0 8.5-3.4 8.5-7.9S16.9 3.5 12 3.5Z"/><path d="m7.6 13.3 3-3.1 2.2 2 3.6-2.9"/>',
};

const DOCK = (cur) => {
  const it = [
    ["index.html", "خانه", ICONS.home],
    ["whatif.html", "ببین چی می‌شه اگه…", ICONS.whatif],
    ["resume.html", "سایت رزومه", ICONS.resume],
    ["tools.html", "ابزارها", ICONS.tools],
    ["lab.html", "آزمایشگاه", ICONS.lab],
    ["about.html", "امید کیه", ICONS.about],
  ].map(([h, l, p]) =>
    `  <a href="${h}"${h === cur ? ' aria-current="page"' : ""} data-lbl="${l}" aria-label="${l}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></a>`
  ).join("\n");
  return `<nav class="dock" aria-label="ناوبری">
${it}
  <span class="sep"></span>
  <a class="dock-dm" href="${DM}" target="_blank" rel="noopener noreferrer" data-lbl="دایرکت: بنویس «رزومه»" aria-label="پیام تو اینستاگرام؛ بنویس رزومه"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.dm}</svg></a>
  <button id="theme" type="button" data-lbl="روشن / تاریک" aria-label="تغییر روشنایی"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none"/></svg></button>
</nav>`;
};

const FOOT = `<footer class="foot">
  <div class="foot-in">
    <p class="foot-brand en">OMID <span>AI × HUMAN CREATIVITY</span></p>
    <p class="foot-rule">AI ابزار منه. خلاقیت مزیت منه.</p>
    <p class="foot-links en"><a href="https://instagram.com/itsomid1.ai" target="_blank" rel="noopener noreferrer">Instagram</a><a href="${TG}" target="_blank" rel="noopener noreferrer">Telegram</a></p>
    <p class="foot-copy en">© 2026 OMID</p>
  </div>
  <nav class="foot-map" aria-label="همه‌ی صفحه‌ها"><a href="tools.html">ابزارها</a><a href="resume.html">سایت رزومه</a><a href="7-days.html">۷ روز ساخت</a><a href="whatif.html">ببین چی می‌شه اگه…</a><a href="log.html">دفترچه‌ی ساخت</a><a href="method.html">فکر، ساخت، اجرا</a><a href="why-ai.html">چرا خلاقیت</a><a href="contact.html">تماس</a></nav>
</footer>`;

/* ───────── اعلان «تازه‌ها» ─────────
   هر چیز تازه‌ای که به سایت اضافه می‌شه، فقط با تأیید امید اینجا میاد.
   بالاترین ورودی همونیه که به بازدیدکننده نشون داده می‌شه؛ هر کی یه بار ببندتش، تا ورودی بعدی دیگه نمی‌بینه. */
const NEWS = [
  { id: "1405-08-03", items: [
    ["tools.html", "ابزارها: دو PDF رایگان و ۷ پرامپت"],
    ["resume.html", "سایت خودت رو تو ۱۰ ثانیه ببین"],
    ["7-days.html", "سایتت رو تو ۷ روز بساز"],
  ] },
];
const TOAST = () => {
  const n = NEWS[0];
  return `<aside class="toast" data-news="${n.id}" hidden aria-label="تازه‌های سایت">
  <p class="toast-k"><i aria-hidden="true"></i>تازه اضافه شد</p>
  <ul>${n.items.map(([h, t]) => `<li><a href="${h}">${t}<span class="ar" aria-hidden="true">←</span></a></li>`).join("")}</ul>
  <button type="button" class="toast-x" data-news-x aria-label="بستن">×</button>
</aside>`;
};

const DMBTN = (label = "تو دایرکت بنویس «رزومه»") =>
  `<a class="go" href="${DM}" target="_blank" rel="noopener noreferrer"><span>${label}</span><span class="ar">↗</span></a>`;
const CTA_DEFAULT = `<div class="cta-row">${DMBTN()}<a class="go ghost" href="resume.html"><span>اول پیش‌نمایشش رو ببین</span><span class="ar">←</span></a></div>`;

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
    <li><a class="social" href="https://t.me/itsomidai" target="_blank" rel="noopener noreferrer"><span class="s-name en">TELEGRAM</span><span class="s-handle en">@itsomidai</span><svg class="s-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7 7 17M8 7h9v9"/></svg></a></li>
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
      <li class="node" data-x="50" data-y="13"><a class="node-a" href="#s6"><span class="n-cat en">WHAT IF</span><span class="n-title">ببین چی می‌شه اگه…</span><span class="n-viz qmark" aria-hidden="true">اگه…؟</span><span class="status always">همیشه روشن</span></a></li>
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

/* ───────── تیکه‌های صفحه‌های تازه (۱۴۰۵/۰۸/۰۳) ─────────
   همه‌ی ابزارها تو خود مرورگر کار می‌کنن (tools.js)؛ هیچی جایی فرستاده نمی‌شه. */
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/* «ببین چی می‌شه اگه…»: چهار قدم امضای برند */
const LOOP = `<ol class="viz loop">
  <li><span class="loop-n en">01</span><b>«ببین چی می‌شه اگه…»</b><span>یه سؤال کنجکاو، قبل از هر ابزاری.</span></li>
  <li><span class="loop-n en">02</span><b>ساختن</b><span>واقعاً می‌سازمش؛ نه حرف، نه تئوری.</span></li>
  <li><span class="loop-n en">03</span><b>WOW</b><span>اول نتیجه رو می‌بینی، بعد توضیحش رو.</span></li>
  <li><span class="loop-n en">04</span><b>«حالا تو چی می‌سازی؟»</b><span>نوبت توئه. ابزار رو داری؛ ایده با خودته.</span></li>
</ol>`;
const EP = ({ built, wow, href, link, ext }) => `<div class="viz ep">
  <div class="ep-step"><span class="ep-k">ساختم</span><p>${built}</p></div>
  <div class="ep-step wow"><span class="ep-k en">WOW</span><p>${wow}</p></div>
  <div class="ep-end"><p>حالا تو چی می‌سازی؟</p><a class="go sm ghost" href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}><span>${link}</span><span class="ar">${ext ? "↗" : "←"}</span></a></div>
</div>`;

/* ایده‌ساز «ببین چی می‌شه اگه…» — بانک ایده‌ها تو tools.js */
const WHATIF_GEN = `<div class="viz wi" data-whatif>
  <p class="wi-k">ببین چی می‌شه اگه…</p>
  <p class="wi-t" data-wi-t aria-live="polite">سایتت رو مثل یه نامه بنویسی، نه مثل یه آگهی؟</p>
  <p class="wi-end">حالا تو چی می‌سازی؟</p>
  <div class="exp-row"><button class="go sm" type="button" data-wi-next><span>یه «اگه»ی دیگه</span></button><span class="wi-n en" data-wi-n></span></div>
</div>`;

/* پیش‌نمایش ده‌ثانیه‌ای سایت رزومه */
const PV_FIELD = (k, label, ph, max) =>
  `<label class="pv-f"><span>${label}</span><input type="text" data-pv-in="${k}" maxlength="${max}" placeholder="${ph}" autocomplete="off" spellcheck="false"></label>`;
const PREVIEW = `<div class="viz pv" data-pv>
  <div class="pv-form">
    ${PV_FIELD("name", "اسمت", "مثلاً: دکتر سارا رضایی", 32)}
    ${PV_FIELD("job", "کارت", "مثلاً: دندان‌پزشک", 40)}
    ${PV_FIELD("line", "یه جمله درباره‌ت", "مثلاً: لبخند طبیعی، بدون عجله.", 80)}
    ${PV_FIELD("city", "شهرت", "مثلاً: تهران", 20)}
    <div class="pv-row"><span class="pv-k">حال‌وهوا</span><div class="pv-chips" role="radiogroup" aria-label="حال‌وهوا">
      <button type="button" class="chip" role="radio" aria-checked="true" data-pv-style="creme">کرمی</button>
      <button type="button" class="chip" role="radio" aria-checked="false" data-pv-style="night">شب</button>
      <button type="button" class="chip" role="radio" aria-checked="false" data-pv-style="scarlet">قرمز</button>
    </div></div>
    <div class="pv-row"><span class="pv-k">یه نمونه بزن</span><div class="pv-chips">
      <button type="button" class="chip" data-pv-preset="0">دکتر</button>
      <button type="button" class="chip" data-pv-preset="1">وکیل</button>
      <button type="button" class="chip" data-pv-preset="2">مهندس</button>
      <button type="button" class="chip" data-pv-preset="3">عکاس</button>
    </div></div>
  </div>
  <figure class="pv-phone">
    <div class="pv-screen" data-pv-screen data-style="creme">
      <p class="pv-bar"><i aria-hidden="true"></i><span class="en" data-pv-url>yourname.github.io</span></p>
      <div class="pv-site">
        <span class="pv-mono" data-pv-mono aria-hidden="true">؟</span>
        <p class="pv-name" data-pv-out="name">اسم تو</p>
        <p class="pv-job" data-pv-out="job">کار تو</p>
        <p class="pv-line" data-pv-out="line">یه جمله که بگه چرا تو.</p>
        <p class="pv-city" data-pv-out="city"></p>
        <p class="pv-btns" aria-hidden="true"><span>نوبت بگیر</span><span>نمونه‌کارها</span></p>
        <p class="pv-cards" aria-hidden="true"><i></i><i></i><i></i></p>
      </div>
    </div>
    <figcaption>هیچی از اینجا جایی فرستاده نمی‌شه؛ فقط تو مرورگر خودته.</figcaption>
  </figure>
</div>`;

/* کوییز «سایت لازم داری؟» — جواب صادقانه، حتی اگه «نه» باشه */
const QUIZ_Q = [
  "کسی قبل از همکاری یا خرید، ازت «نمونه‌کار» یا «رزومه» می‌خواد؟",
  "آدم‌ها بیرون از اینستاگرام هم دنبالت می‌گردن؟ (گوگل، معرفی، لینکدین)",
  "کارها و خدماتت تو ۱۵۰ کاراکترِ بایو جا نمی‌شن؟",
  "اگه فردا پیجت بسته بشه، مشتری‌هات دیگه پیدات نمی‌کنن؟",
];
const QUIZ = `<div class="viz quiz" data-quiz>
  <ol class="qz-list">${QUIZ_Q.map((q, i) => `
    <li class="qz"><span class="qz-n en">0${i + 1}</span><p class="qz-q">${q}</p><p class="qz-a">
      <button type="button" class="chip" data-qz="${i}" data-v="1" aria-pressed="false">آره</button>
      <button type="button" class="chip" data-qz="${i}" data-v="0" aria-pressed="false">نه</button></p></li>`).join("")}
  </ol>
  <div class="qz-res" data-qz-res hidden aria-live="polite">
    <p class="qz-score" data-qz-score></p>
    <h3 data-qz-h></h3>
    <p data-qz-p></p>
    <p class="cta-row">
      <a class="go sm" data-qz-dm hidden href="${DM}" target="_blank" rel="noopener noreferrer"><span>تو دایرکت بنویس «رزومه»</span><span class="ar">↗</span></a>
      <a class="go sm ghost" data-qz-self hidden href="7-days.html"><span>خودت بسازش: ۷ روز</span><span class="ar">←</span></a>
    </p>
  </div>
</div>`;

/* ابزارها: PDFها (دانلود مستقیم) و پرامپت‌ها (کپی) */
const PDFS = [
  { file: "files/omid-amniat-site.pdf", title: "امنیت سایت · قدم ۳", pages: 11, size: "۴۸۰KB", tag: "SECURITY",
    what: "دو پرامپت آماده، شش اسکیل و ابزار امنیتی، و چک‌لیست ۱۵ دقیقه‌ای برای قفل کردن سایتی که با AI ساختی." },
  { file: "files/omid-motion-claude.pdf", title: "موشن‌گرافیک با Claude", pages: 23, size: "۱MB", tag: "MOTION",
    what: "همون سیستمی که موشن‌های ریلزهام باهاش ساخته می‌شن؛ از متن و ثانیه‌بندی تا رندر، صدا و ترفندهای کیفیت." },
];
const PDFCARDS = `<ul class="viz pdfs">${PDFS.map((p) => `
  <li class="pdf"><span class="pdf-tag en">${p.tag}</span><h3>${p.title}</h3><p>${p.what}</p>
    <p class="pdf-meta">${fa(p.pages)} صفحه · ${p.size} · رایگان</p>
    <a class="go sm" href="${p.file}" download><span>دانلود PDF</span><span class="ar">↓</span></a></li>`).join("")}
</ul>`;

const PROMPTS = [
  { k: "scene", lbl: "Prompt 01", nav: "صحنه، نه دستور", h2: "صحنه، نه دستور",
    body: "نقطه‌ی شروع. Claude عجوله؛ اگه فقط بگی «یه سایت بساز»، یه سایت معمولی می‌گیری. صحنه رو بگو و بگو صبر کنه.",
    text: `می‌خوام یه سایت شخصی تک‌صفحه‌ای بسازم. قبل از هر کدی، این صحنه رو بخون:

یکی از اینستاگرام روی لینک بایوی من می‌زنه. تو ۱۰ ثانیه‌ی اول باید بفهمه من کی‌ام، چیکار می‌کنم و برای کی. بعد فقط یه کار بکنه: [مثلاً بهم دایرکت بده].

من: [اسم] · کارم: [کار] · برای: [مخاطب] · حسی که باید بگیره: [مثلاً گرم و مطمئن]

قانون‌ها:
- فارسی و راست‌به‌چپ.
- اول برای گوشی بساز، بعد دسکتاپ.
- بدون فریم‌ورک؛ فقط HTML و CSS و کمی JavaScript، که روی GitHub Pages بره.

تا نگفتم «شروع کن»، کد ننویس. اول سه تا سؤال ازم بپرس که صحنه برات واضح‌تر بشه.` },
  { k: "mobile", lbl: "Prompt 02", nav: "اول گوشی", h2: "اول گوشی",
    body: "رو همین سایت، نشانِ روی عکس صفحه‌ی اول، رو گوشی افتاده بود روی صورتم. با همین بررسی رفت کنار.",
    text: `سایتم رو با عرض ۳۷۵ پیکسل (اندازه‌ی گوشی) بررسی کن:
۱. هر چیزی که از صفحه بیرون می‌زنه یا اسکرول افقی می‌سازه.
۲. متنی که روی عکس یا روی یه متن دیگه افتاده.
۳. دکمه‌هایی که از ۴۴ پیکسل کوچیک‌ترن و با انگشت سخت زده می‌شن.
۴. نوشته‌هایی که رو گوشی از ۱۴ پیکسل ریزتر می‌شن.
اول لیست مشکل‌ها رو بده. بعد یکی‌یکی درستشون کن و هر بار بگو چی رو عوض کردی.` },
  { k: "rtl", lbl: "Prompt 03", nav: "فارسی و راست‌به‌چپ", h2: "فارسی و راست‌به‌چپ",
    body: "فونت نیمکتِ همین سایت تو خود سایته؛ هیچ فونتی از جای دیگه لود نمی‌شه.",
    text: `سایتم فارسیه. این‌ها رو چک و درست کن:
۱. همه‌ی صفحه‌ها lang="fa" و dir="rtl" داشته باشن.
۲. عدد، اسم انگلیسی، ایمیل و شماره تلفن وسط متن فارسی جابه‌جا نشن؛ هر کدوم رو با <bdi> یا dir="ltr" جدا کن.
۳. فونت فارسی رو بیار تو خود سایت (woff2) که به سرور بیرونی وابسته نباشه.
۴. نیم‌فاصله‌ها درست باشن («می‌شه»، نه «می شه»).
بعد صفحه‌ها رو تو اندازه‌ی گوشی چک کن و بگو کجا هنوز به هم ریخته.` },
  { k: "cache", lbl: "Prompt 04", nav: "نسخه‌ی قدیمی رو گوشی", h2: "وقتی گوشی‌ها نسخه‌ی قدیمی رو نشون می‌دن",
    body: "رو همین سایت، تغییرها رو گوشی دیده نمی‌شدن تا وقتی به فایل‌ها نسخه زدم.",
    text: `بعد از هر تغییر، گوشی‌ها هنوز نسخه‌ی قدیمی سایتم رو نشون می‌دن.
به همه‌ی لینک‌های CSS و JS یه شماره‌ی نسخه اضافه کن (مثلاً style.css?v=20261025) و هر بار که فایلی عوض شد، اون شماره رو همه‌جا با هم عوض کن.
یه اسکریپت کوچیک هم بنویس که این کار رو خودکار انجام بده.` },
  { k: "og", lbl: "Prompt 05", nav: "پیش‌نمایش لینک", h2: "پیش‌نمایش لینک تو تلگرام و واتساپ",
    body: "لینک همین سایت رو هر جا بفرستی، با عکس و امضام باز می‌شه.",
    text: `وقتی لینک سایتم رو تو تلگرام یا واتساپ می‌فرستم، باید یه کارت با عکس و عنوان نشون بده.
تگ‌های og:title، og:description، og:image (با آدرس کامل https)، og:url و twitter:card رو به همه‌ی صفحه‌ها اضافه کن.
عکسش ۱۲۰۰ در ۶۳۰ پیکسل باشه. بعد بگو چطوری تستش کنم.` },
  { k: "explain", lbl: "Prompt 06", nav: "ساده توضیح بده", h2: "هر چیزی رو ساده توضیح بده",
    body: "هر آزمایش تو آزمایشگاهِ همین سایت، همین سه تا جعبه رو داره.",
    text: `زیر هر بخش سایتم، سه تا جعبه‌ی کوچیک بذار:
«یعنی چی؟»: با زبون ساده، بدون اصطلاح فنی.
«یه مثال ساده»: یه مثال از زندگی روزمره.
«به چه دردت می‌خوره؟»: یه جمله که بگه خواننده باهاش چیکار می‌تونه بکنه.
لحن خودمونی باشه، مثل رفیقی که یه کم جلوتره. کلمه‌های تبلیغاتی مثل «بی‌نظیر» و «کیفیت برتر» ممنوع.` },
  { k: "theme", lbl: "Prompt 07", nav: "پالت و حالت تاریک", h2: "پالت رنگ و حالت تاریک",
    body: "کرمی، مشکی، قرمز. دکمه‌ی روشن/تاریکِ پایین همین صفحه، همین کار رو می‌کنه.",
    text: `همه‌ی رنگ‌های سایتم رو ببر تو متغیرهای CSS روی :root (مثلاً --ink، --paper، --accent).
بعد یه حالت تاریک بساز که فقط همین متغیرها رو عوض کنه، با یه دکمه که انتخاب آدم رو یادش بمونه.
کنتراست متن رو تو هر دو حالت چک کن.` },
];
const PCARD = (p) => `<div class="viz pc">
  <pre class="pc-text" id="pr-${p.k}" dir="rtl">${esc(p.text)}</pre>
  <div class="exp-row"><button class="go sm" type="button" data-copy="pr-${p.k}"><span>کپی پرامپت</span></button><span class="pc-hint">جاهای [ ] رو با مال خودت پر کن.</span></div>
</div>`;

/* چک‌لیست ۷ روزه — تیک‌ها فقط تو مرورگر خود آدم ذخیره می‌شن */
const DAYS = [
  { nav: "یه جمله", h2: "یه جمله: کی هستی و برای کی؟", t: [
    "یه جمله بنویس: «من [کار]م و به [کی] کمک می‌کنم که [چی].»",
    "سه تا سایت شخصی که دوستشون داری پیدا کن و بنویس چرا.",
    "تصمیم بگیر بازدیدکننده بعد از دیدن سایتت فقط چه یه کاری بکنه.",
  ] },
  { nav: "محتوا", h2: "محتوا، قبل از طراحی", t: [
    "یه معرفی کوتاه سه‌خطی بنویس.",
    "سه تا نمونه‌کار یا خدمت انتخاب کن.",
    "یه عکس خوب از خودت بگیر، با نور طبیعی.",
  ] },
  { nav: "اولین نسخه", h2: "اولین نسخه با Claude", t: [
    "پرامپت «صحنه، نه دستور» رو کپی کن و جاهای خالیش رو پر کن. <a href=\"tools.html#s1\">پرامپت ←</a>",
    "به سؤال‌های Claude جواب بده؛ بعد بگو «شروع کن».",
    "تیکه‌تیکه بساز: اول بالای صفحه، بعد بقیه.",
  ] },
  { nav: "گوشی و فارسی", h2: "رو گوشی خودت بازش کن", t: [
    "سایت رو رو گوشی خودت باز کن و هرچی اذیتت کرد بنویس.",
    "پرامپت «اول گوشی» رو بده به Claude. <a href=\"tools.html#s2\">پرامپت ←</a>",
    "پرامپت «فارسی و راست‌به‌چپ» رو بده به Claude. <a href=\"tools.html#s3\">پرامپت ←</a>",
  ] },
  { nav: "انتشار", h2: "رو GitHub Pages منتشرش کن", t: [
    "یه اکانت GitHub بساز.",
    "یه مخزن بساز، فایل‌ها رو بذار و از Settings ← Pages روشنش کن.",
    "لینک رو با اینترنت معمولی، بدون فیلترشکن، باز کن.",
  ] },
  { nav: "امنیت", h2: "قبل از اینکه نشونش بدی، قفلش کن", t: [
    "تأیید دومرحله‌ای (2FA) اکانت GitHub رو روشن کن.",
    "PDF امنیت سایت رو بگیر و دو تا پرامپتش رو اجرا کن. <a href=\"tools.html#s0\">PDF ←</a>",
    "مطمئن شو هیچ رمز یا کلیدی تو فایل‌های سایت نیست.",
  ] },
  { nav: "دنیا ببینه", h2: "بذارش جلوی چشم", t: [
    "لینک رو بذار تو بایوی اینستاگرامت.",
    "برای سه نفر بفرست و فقط بپرس: «اولین چیزی که فهمیدی چی بود؟»",
    "لینکش رو برام دایرکت کن؛ می‌خوام ببینم چی ساختی.",
  ] },
];
const D7_TOTAL = DAYS.reduce((a, d) => a + d.t.length, 0);
const D7_PROGRESS = `<div class="viz d7p" data-d7p>
  <p class="d7p-n"><b data-d7-count>۰</b> از ${fa(D7_TOTAL)} کار</p>
  <p class="d7p-bar" aria-hidden="true"><i data-d7-bar></i></p>
  <p class="d7p-msg" data-d7-msg>از روز ۱ شروع کن. تیک‌هات همین‌جا می‌مونن.</p>
  <button type="button" class="chip" data-d7-reset>از اول</button>
</div>`;
const D7_DAY = (d, i) => `<ul class="viz d7">${d.t.map((t, j) =>
  `<li><label class="d7-t"><input type="checkbox" data-d7="d${i + 1}-${j + 1}"><span>${t}</span></label></li>`).join("")}</ul>`;

/* دفترچه‌ی ساخت — از تاریخچه‌ی واقعی گیت همین سایت */
const LOG = [
  { d: "۱۴۰۵/۰۸/۰۳", h2: "سایت با برند تازه هم‌قدم شد", items: [
    ["ساخت", "«ببین چی می‌شه اگه…» جای «معمولی در برابر خلاق» نشست."],
    ["ساخت", "سایت رزومه، با پیش‌نمایش ده‌ثانیه‌ای و کوییز «لازمش داری؟»."],
    ["ساخت", "ابزارها: دو PDF رایگان و ۷ پرامپت؛ چک‌لیست ۷ روزه؛ همین دفترچه؛ آزمایش ششم."],
    ["ساخت", "llms.txt و نسخه‌ی متنی هر صفحه، که AIها هم سایت رو درست بخونن."],
    ["رفع", "لینک تلگرام درست شد: @itsomidai."],
  ] },
  { d: "۱۴۰۵/۰۷/۲۵", h2: "تست: از ایران، بدون فیلترشکن", body: "سایت رو از ایران، با اینترنت معمولی و بدون فیلترشکن باز کردیم. باز شد." },
  { d: "۱۴۰۵/۰۷/۱۶", h2: "عکس تازه، رنگ‌های تازه", items: [
    ["ساخت", "عکس تازه برای صفحه‌ی اول، با امضای دست‌نویس."],
    ["ساخت", "پالت کرمی، مشکی، قرمز."],
    ["ساخت", "هر آزمایش یه توضیح ساده گرفت: یعنی چی، یه مثال، به چه دردت می‌خوره."],
    ["رفع", "پیش‌نمایش لینک تو تلگرام و واتساپ درست شد."],
    ["رفع", "آیدی اینستاگرام شد @itsomid1.ai."],
  ] },
  { d: "۱۴۰۵/۰۷/۱۴", h2: "اولین باگ‌های گوشی", items: [
    ["ساخت", "صفحه‌ی اول متحرک شد و صدای آهنگ آزمایشگاه بلندتر."],
    ["رفع", "نشانِ روی عکس، رو گوشی افتاده بود روی صورتم؛ رفت کنار."],
    ["رفع", "گوشی‌ها نسخه‌ی قدیمی رو نشون می‌دادن؛ به فایل‌ها نسخه زدم."],
    ["یاد گرفتم", "مرورگر گوشی فایل‌ها رو نگه می‌داره؛ تا اسمشون عوض نشه، تازه‌شون نمی‌کنه."],
  ] },
  { d: "۱۴۰۵/۰۷/۱۳", h2: "AI × Human Creativity", body: "متن همه‌ی صفحه‌ها از نو نوشته شد، با یه حرف اصلی: AI ابزار منه، خلاقیت مزیت منه." },
  { d: "۱۴۰۵/۰۶/۲۸", h2: "اولین نسخه", body: "سایت شخصی OMID برای اولین بار بالا اومد. کامل نبود؛ ولی شروع شد." },
];

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
  ${p.cta || CTA_DEFAULT}
</section>

${FOOT}
${DOCK(p.file)}
${TOAST()}
<div class="blueprint" aria-hidden="true"><div class="bp-cols"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
<script src="app.js?v=${V}" defer></script>
${(p.scripts || []).map((s) => `<script src="${s}?v=${V}" defer></script>`).join("\n")}
</body>
</html>
`;

/* ───────── صفحه‌ها ───────── */
const PAGES = [
  {
    file: "whatif.html", no: "01", cls: "c1", title: "ببین چی می‌شه اگه…", kicker: "What if…",
    desc: "هر کاری اینجا با یه «اگه» شروع می‌شه؛ بعد می‌سازمش تا ببینم واقعاً چی می‌شه. آخرش هم یه سؤال برای تو.",
    h1: "ببین چی می‌شه اگه…",
    sub: "هر کاری اینجا با یه «اگه» شروع می‌شه؛ بعد می‌سازمش تا ببینم واقعاً چی می‌شه. آخرش هم یه سؤال برای تو.",
    scripts: ["tools.js"],
    sections: [
      { lbl: "The loop", nav: "چهار قدم", h2: "همیشه همین چهار قدم", visual: LOOP },
      { lbl: "Episode · Music", nav: "آهنگ", h2: "ببین چی می‌شه اگه یه آهنگ هر بار عوض بشه؟", visual: EP({
        built: "به‌جای یه آهنگ آماده، چند تا قانون ساده دادم به کامپیوتر.",
        wow: "هر بار که دکمه رو بزنی، آهنگی می‌شنوی که هیچ‌کس قبلاً نشنیده.",
        href: "lab.html#s1", link: "خودت امتحانش کن" }) },
      { lbl: "Episode · Web", nav: "سایت بدون سرور", h2: "ببین چی می‌شه اگه سایتم رو بدون هزینه‌ی سرور بسازم؟", visual: EP({
        built: "همین سایت رو با Claude ساختم و گذاشتم رو GitHub Pages.",
        wow: "هزینه‌ی سرور: صفر. هزینه‌ی دامنه: صفر. از ایران هم بدون فیلترشکن باز می‌شه.",
        href: "log.html", link: "دفترچه‌ی ساختش" }) },
      { lbl: "Episode · Instagram", nav: "پیج اینستاگرام", h2: "ببین چی می‌شه اگه Claude پیجم رو بخونه؟", visual: EP({
        built: "یه بسته‌ی فارسی و اوپن‌سورس ساختم: ۱۳ تا مهارت که پیج اینستاگرام رو بررسی می‌کنن.",
        wow: "نمره‌ی پروفایلم از ۵۳ رسید به ۷۱.",
        href: "https://github.com/omidkhavari1708-pixel/instagram-agent-fa", link: "رو گیت‌هاب ببینش", ext: true }) },
      { lbl: "Your turn", nav: "نوبت تو", h2: "حالا نوبت توئه.", body: "دکمه رو بزن، یه «اگه» بگیر، و فقط یه چیز کوچیک ازش بساز.", visual: WHATIF_GEN },
    ],
    faq: [
      ["چرا همیشه با «اگه» شروع می‌کنی؟", "چون «اگه» آدم رو از جواب تکراری بیرون می‌کشه. قبل از اینکه بدونی «چطوری»، می‌پرسی «چی می‌شه»."],
      ["اگه نتیجه WOW نشد چی؟", "اونم یه نتیجه‌ست. می‌نویسمش و یه «اگه»ی دیگه می‌پرسم. خراب شدن جزو کاره، نه آخرش."],
    ],
    ctaH: "حالا تو چی می‌سازی؟",
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
    scripts: ["lab.js", "tools.js"],
    sections: [
      { lbl: "Map", nav: "نقشه‌ی آزمایش‌ها", h2: "شش تا آزمایش کوچیک", body: "<span class=\"lab-hello\">هرکدوم یه تیکه از AI رو ساده نشون می‌ده. اول باهاش بازی کن، بعد توضیح ساده‌ش رو بخون. روی هر کارت بزنی، می‌ری سراغش.</span>", visual: VIS.board },
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
      { lbl: "What if", h2: "ببین چی می‌شه اگه…", visual: LABX({
        no: "06", status: "always", widget: WHATIF_GEN,
        what: "یه بانک از «اگه»ها؛ هر بار دکمه رو بزنی، یکی‌ش رو تصادفی بهت می‌ده. هر ریلز و هر آزمایش من هم با همین جمله شروع می‌شه.",
        example: "«ببین چی می‌شه اگه اولین نسخه‌ت عمداً زشت باشه؟» یعنی دیگه منتظر کامل شدن نمی‌مونی؛ امروز می‌سازی، فردا قشنگش می‌کنی.",
        use: "وقتی گیر کردی و نمی‌دونی چی بسازی. یه «اگه» بگیر، فقط ده دقیقه روش کار کن، و ببین کجا می‌رسی.",
      }) },
    ],
    faq: [
      ["این آزمایش‌ها واقعی‌ان؟", "آره. همه‌شون همین‌جا، تو همین صفحه کار می‌کنن. چیزی رو نشون نمی‌دم که نشه امتحانش کرد."],
      ["چیزی از من ذخیره یا فرستاده می‌شه؟", "نه. هرچی اینجا می‌نویسی یا می‌سازی، فقط تو مرورگر خودت می‌مونه و جایی فرستاده نمی‌شه."],
      ["چرا بعضی‌هاش «در حال تست»ه؟", "چون هنوز نمی‌دونم جواب می‌ده یا نه. وقتی فهمیدم، همین‌جا می‌نویسم."],
    ],
    ctaH: "یه ایده برای آزمایش بعدی داری؟",
    cta: `<div class="cta-row">${DMBTN("تو دایرکت بگو")}</div>`,
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
        ["اول یه «اگه» می‌پرسم", "قبل از هر کاری می‌پرسم «ببین چی می‌شه اگه…»؛ بعد می‌سازمش تا ببینم واقعاً چی می‌شه."],
        ["ابزار عوض می‌شه، روش نه", "ابزارها هر ماه عوض می‌شن. فکر کردن قبل از ساختن، نه."],
      ] },
      { lbl: "What I believe", h2: "چیزی که بهش باور دارم", body: "همه می‌تونن با AI محتوا و سایت بسازن، ولی همه نمی‌دونن چی بسازن. <b>AI ابزار منه. خلاقیت مزیت منه.</b>" },
    ],
    faq: [
      ["چرا اسم ابزارها رو نمی‌گی؟", "چون هر ماه عوض می‌شن. چیزی که عوض نمی‌شه، اینه که قبل از ساختن چی تو ذهنته."],
      ["کجا بیشتر می‌بینمت؟", "اینستاگرام. هرچی امتحان می‌کنم، اول اونجا میاد."],
      ["می‌شه برام سایت بسازی؟", "آره. تو دایرکت اینستاگرام بنویس «رزومه»؛ اول می‌پرسم کارت چیه و برای کیه."],
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
    cta: `<div class="cta-row">${DMBTN("پیام تو اینستاگرام")}</div>`,
  },
  {
    file: "resume.html", no: "07", cls: "c2", title: "سایت رزومه", kicker: "One-page resume site",
    desc: "سایت تک‌صفحه‌ای برای بایوی اینستاگرامت؛ بدون هزینه‌ی سرور و بدون هزینه‌ی دامنه. اول همین‌جا پیش‌نمایشش رو ببین.",
    h1: "سایت خودت رو تو ۱۰ ثانیه ببین.",
    sub: "اسم و کارت رو بنویس؛ پیش‌نمایشش همین‌جا ساخته می‌شه. سایت واقعیش تک‌صفحه‌ایه، می‌ره تو بایوی اینستاگرامت، و نه هزینه‌ی سرور داره نه هزینه‌ی دامنه.",
    scripts: ["tools.js"],
    sections: [
      { lbl: "Preview", nav: "پیش‌نمایش", h2: "بنویس، ببین.", visual: PREVIEW },
      { lbl: "Do you need it", nav: "لازمش داری؟", h2: "سایت لازم داری یا اینستاگرامت کافیه؟", body: "چهار تا سؤال. جوابش ممکنه «نه» باشه؛ اونم جواب درستیه.", visual: QUIZ },
      { lbl: "How it works", nav: "از دایرکت تا بایو", h2: "از دایرکت تا لینک بایو", items: [
        ["تو دایرکت بنویس «رزومه»", "می‌پرسم کارت چیه، برای کیه، و آدم‌ها بعد از دیدن سایتت باید چیکار کنن."],
        ["طرح", "جمله‌ی اصلی، چیدمان و رنگ‌ها رو با هم مشخص می‌کنیم؛ قبل از اینکه چیزی ساخته بشه."],
        ["ساخت", "سایت رو با Claude می‌سازم و رو گوشی تستش می‌کنیم."],
        ["لینک بایو", "سایت رو GitHub منتشر می‌شه؛ بدون هزینه‌ی سرور و دامنه. لینکش رو می‌ذاری تو بایو."],
      ] },
    ],
    ctaH: "اینو واقعی می‌خوای؟",
    cta: `<div class="cta-row">${DMBTN()}</div>`,
    md: "تو این صفحه یه ابزار هست که با نوشتن اسم و کار، پیش‌نمایش سایت رو همون‌جا تو مرورگر می‌سازه.\n\nکوییز «سایت لازم داری؟»:\n" + QUIZ_Q.map((q) => `- ${q}`).join("\n"),
  },
  {
    file: "tools.html", no: "08", cls: "c3", title: "ابزارها", kicker: "Tools",
    desc: "PDFها و پرامپت‌هایی که خودم باهاشون کار می‌کنم. رایگانن؛ دانلود کن، کپی کن، بساز.",
    h1: "ابزارها.",
    sub: "PDFها و پرامپت‌هایی که خودم باهاشون کار می‌کنم. رایگانن؛ دانلود کن، کپی کن، بساز. هر چیز تازه‌ای که بسازم، اینجا اضافه می‌شه.",
    scripts: ["tools.js"],
    sections: [
      { lbl: "PDF", nav: "PDFها", h2: "راهنماها", visual: PDFCARDS },
      ...PROMPTS.map((p) => ({ lbl: p.lbl, nav: p.nav, h2: p.h2, body: p.body, visual: PCARD(p) })),
    ],
    ctaH: "با کدومش شروع می‌کنی؟",
    md: PDFS.map((p) => `- ${p.title} (${p.pages} صفحه، PDF): ${SITE}${p.file}`).join("\n") + "\n\n" +
      PROMPTS.map((p) => `### ${p.h2}\n\n${p.text}`).join("\n\n"),
  },
  {
    file: "7-days.html", no: "09", cls: "c4", title: "سایتت رو تو ۷ روز بساز", kicker: "7-day build",
    desc: "هر روز سه تا کار کوچیک، تا یه سایت شخصی واقعی تو بایوت. تیک‌هات همین‌جا تو مرورگر خودت می‌مونن.",
    h1: "سایتت رو تو ۷ روز بساز.",
    sub: "هر روز سه تا کار کوچیک. تیک‌هات همین‌جا، تو مرورگر خودت می‌مونن؛ فردا که برگردی، از همون‌جا ادامه می‌دی.",
    scripts: ["tools.js"],
    sections: [
      { lbl: "Progress", nav: "پیشرفتت", h2: "تا کجا اومدی؟", visual: D7_PROGRESS },
      ...DAYS.map((d, i) => ({ lbl: `Day 0${i + 1}`, nav: `روز ${fa(i + 1)} · ${d.nav}`, h2: d.h2, visual: D7_DAY(d, i) })),
    ],
    ctaH: "حالا تو چی می‌سازی؟",
    cta: `<div class="cta-row">${DMBTN("لینک سایتت رو برام بفرست")}<a class="go ghost" href="resume.html"><span>یا بده من بسازم</span><span class="ar">←</span></a></div>`,
    md: DAYS.map((d, i) => `### روز ${i + 1}: ${d.h2}\n\n` + d.t.map((t) => `- [ ] ${t.replace(/ <a[^>]*>.*?<\/a>/g, "")}`).join("\n")).join("\n\n"),
  },
  {
    file: "log.html", no: "10", cls: "c5", title: "دفترچه‌ی ساخت", kicker: "Build log",
    desc: "هر تغییر این سایت، با تاریخ؛ اونایی که جواب دادن، و اونایی که خراب شدن.",
    h1: "دفترچه‌ی ساخت.",
    sub: "هر تغییر این سایت، با تاریخ؛ اونایی که جواب دادن، و اونایی که خراب شدن. کامل نیست، ولی متوقف هم نمی‌شه.",
    sections: LOG.map((e) => ({ lbl: e.d, nav: e.d, h2: e.h2, body: e.body, items: e.items })),
    ctaH: "تو چی می‌سازی؟",
  },
];

/* صفحه‌ی قدیمی «معمولی در برابر خلاق» حالا می‌ره سراغ «ببین چی می‌شه اگه…»؛ لینک‌های قبلی خراب نمی‌شن. */
const REDIRECT = (to) => `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta http-equiv="refresh" content="0; url=${to}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE}${to}">
<title>OMID</title>
</head>
<body><p><a href="${to}">ببین چی می‌شه اگه…</a></p></body>
</html>
`;

/* نسخه‌ی متنی هر صفحه برای AIها (llms.txt و .md) — از همون داده‌ها، تا هیچ‌وقت از HTML جدا نیفتن */
const txt = (h) => (h || "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").replace(/\s+\n/g, "\n").trim();
const pageMd = (p) => [
  `# ${txt(p.h1)}`, txt(p.sub),
  ...p.sections.map((s) => [`## ${txt(s.h2)}`, txt(s.body),
    (s.items || []).map((it) => `- **${txt(it[0])}**: ${txt(it[1])}`).join("\n")].filter(Boolean).join("\n\n")),
  p.md || "",
  ...(p.faq ? ["## سؤال‌های همیشگی", p.faq.map((f) => `**${txt(f[0])}**\n${txt(f[1])}`).join("\n\n")] : []),
  `---\nنسخه‌ی کامل: ${SITE}${p.file}\nسایت رزومه می‌خوای؟ تو دایرکت اینستاگرام بنویس «رزومه»: ${DM}`,
].filter(Boolean).join("\n\n") + "\n";

const LLMS = `# OMID

> امید (OMID) سایت رزومه‌ی تک‌صفحه‌ای با AI می‌سازه؛ برای دکتر، وکیل، مهندس و هر کسی که یه لینک مطمئن برای بایوی اینستاگرامش می‌خواد. سایت‌ها روی GitHub Pages میزبانی می‌شن: بدون هزینه‌ی سرور، بدون هزینه‌ی دامنه، و از ایران بدون فیلترشکن باز می‌شن. سفارش فقط از دایرکت اینستاگرام، با کلمه‌ی «رزومه».
> OMID builds one-page personal resume websites with AI (Claude) for Persian-speaking professionals, hosted on GitHub Pages with no server or domain cost. Order via Instagram DM (@itsomid1.ai) with the word «رزومه».

امید تو اینستاگرام (@itsomid1.ai) سریال «ببین چی می‌شه اگه…» رو می‌سازه: آزمایش‌های واقعی با AI، و آموزش رایگان سایت‌سازی با Claude. حرف اصلیش: AI ابزاره، خلاقیت مزیته.

## صفحه‌ها
${PAGES.map((p) => `- [${txt(p.title)}](${SITE}${md(p.file)}): ${txt(p.desc)}`).join("\n")}

## فایل‌های رایگان
${PDFS.map((p) => `- [${p.title}](${SITE}${p.file}): ${p.what}`).join("\n")}

## تماس
- دایرکت اینستاگرام (سفارش سایت رزومه، بنویس «رزومه»): ${DM}
- تلگرام: ${TG}
`;

let n = 0;
for (const p of PAGES) {
  fs.writeFileSync(p.file, page(p));
  fs.writeFileSync(md(p.file), pageMd(p));
  n++; console.log("✓ " + p.file);
}
fs.writeFileSync("vs.html", REDIRECT("whatif.html"));
fs.writeFileSync("llms.txt", LLMS);
fs.writeFileSync("index.md", LLMS);

/* صفحه‌ی اول دست‌نوشته‌ست؛ فقط داک، فوتر، اعلان و نسخه‌ی فایل‌هاش از اینجا به‌روز می‌شن */
const block = (html, name, body) => {
  const re = new RegExp(`<!-- build:${name} -->[\\s\\S]*?<!-- /build:${name} -->`);
  if (!re.test(html)) throw new Error("index.html: نشانه‌ی build:" + name + " پیدا نشد");
  return html.replace(re, `<!-- build:${name} -->\n${body}\n<!-- /build:${name} -->`);
};
let home = fs.readFileSync("index.html", "utf8");
home = block(home, "foot", FOOT);
home = block(home, "dock", DOCK("index.html"));
home = block(home, "news", TOAST());
home = home.replace(/\?v=\d{8}[a-z]?/g, `?v=${V}`);
fs.writeFileSync("index.html", home);
console.log(n + " صفحه + index.html + vs.html + llms.txt + نسخه‌ی متنی ساخته شد");
module.exports = { HEAD, DOCK, FOOT };
