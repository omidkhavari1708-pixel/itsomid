/* قبل از اولین نقاشی صفحه اجرا می‌شه: تم ذخیره‌شده رو می‌ذاره (بدون چشمک سفید)
   و علامت js رو می‌زنه که انیمیشن‌های ورود فعال بشن. اگه app.js بالا نیومد،
   علامت برداشته می‌شه تا هیچ متنی پنهان نمونه. */
(function () {
  var root = document.documentElement;
  try {
    var t = localStorage.getItem("omid-theme");
    if (t === "dark" || t === "light") root.setAttribute("data-theme", t);
  } catch (e) {}
  root.classList.add("js");
  window.addEventListener("load", function () {
    window.setTimeout(function () {
      if (!root.classList.contains("is-ready")) root.classList.remove("js");
    }, 1000);
  });
})();
