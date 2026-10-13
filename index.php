<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f7fc">
  <title>تقویم فارسی</title>
  <link rel="stylesheet" href="assets/css/calendar-theme.css">
  <script defer src="assets/js/calendar.js"></script>
</head>
<body>
  <main class="show-calendar">
    <header class="topbar">
      <div class="brand"><div class="brand-mark" aria-hidden="true">▦</div><div><h1>تقویم فارسی</h1><p>برنامه‌ها و مناسبت‌های سال شما</p></div></div>
      <div class="date-seperate" role="group" aria-label="نمای تقویم">
        <button class="view-btn" data-view="day">روز</button><button class="view-btn" data-view="week">هفته</button><button class="view-btn" data-view="month">ماه</button><button class="view-btn" data-view="year">سال</button>
      </div>
      <div class="controll-btn">
        <button class="icon-btn" id="prev" aria-label="قبلی">›</button>
        <button class="today-btn" id="today">امروز</button>
        <button class="icon-btn" id="next" aria-label="بعدی">‹</button>
      </div>
    </header>
    <section class="calendar-heading">
      <div><h2 id="period-title"></h2><p id="period-subtitle"></p></div>
      <label class="year-picker">رفتن به سال <input id="year-input" type="number" min="1" max="275137" inputmode="numeric" aria-label="سال شمسی"><button id="go-year">برو</button></label>
    </section>
    <div class="legend"><span><i class="legend-dot holiday-key"></i>تعطیل رسمی</span><span><i class="legend-dot friday-key"></i>تعطیلی هفتگی جمعه</span><span><i class="legend-dot event-key"></i>رویداد نمونه</span><span><i class="legend-dot today-key"></i>امروز</span></div>
    <section id="calendar" aria-live="polite"></section>
    <footer class="calendar-footer"><span>رویدادها نمونه هستند و بدون دیتابیس تولید می‌شوند.</span><span id="holiday-note">تعطیلات قمری برآورد محاسباتی هستند و ممکن است با تقویم رسمی ایران یک روز اختلاف داشته باشند.</span></footer>
  </main>
</body>
</html>
