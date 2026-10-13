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
        <button class="icon-btn" id="prev" aria-label="قبلی">‹</button>
        <button class="today-btn" id="today">امروز</button>
        <button class="icon-btn" id="next" aria-label="بعدی">›</button>
        <button class="create-event-btn" id="create-event">+ رویداد جدید</button>
      </div>
    </header>
    <section class="calendar-heading">
      <div class="calendar-heading-copy"><h2 id="period-title"></h2><p id="period-subtitle"></p><div class="date-equivalents" id="date-equivalents" aria-label="تاریخ امروز در سه گاه‌شماری"></div></div>
      <label class="year-picker">رفتن به سال <input id="year-input" type="number" min="1" max="275137" inputmode="numeric" aria-label="سال شمسی"><button id="go-year">برو</button></label>
    </section>
    <div class="legend-help" id="legend-help">
      <button type="button" class="legend-info-button" id="legend-info" aria-label="راهنمای رنگ‌ها" aria-expanded="false" aria-controls="legend-popover">ⓘ</button>
      <div class="legend-popover" id="legend-popover" role="dialog" aria-label="راهنمای رنگ‌های تقویم" hidden>
        <strong>راهنمای رنگ‌ها</strong>
        <span><i class="legend-dot holiday-key"></i>تعطیل رسمی</span><span><i class="legend-dot friday-key"></i>جمعه</span><span><i class="legend-dot event-key"></i>رویداد شما</span><span><i class="legend-dot today-key"></i>امروز</span>
      </div>
    </div>
    <p class="calendar-status" id="calendar-status" role="status" hidden></p>
    <section id="calendar" aria-live="polite"></section>
    <div class="dialog-backdrop" id="event-dialog" hidden>
      <form class="event-form" id="event-form" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
        <div class="dialog-heading"><h2 id="event-dialog-title">رویداد جدید</h2><button type="button" class="dialog-close" id="close-event-dialog" aria-label="بستن">×</button></div>
        <label class="form-field">عنوان رویداد<input id="event-title" name="title" type="text" maxlength="100" required autocomplete="off" placeholder="مثلاً جلسه با تیم"></label>
        <div class="date-fields" role="group" aria-label="تاریخ شمسی">
          <label class="form-field">سال<input id="event-year" type="number" min="1" max="275137" required></label>
          <label class="form-field">ماه<input id="event-month" type="number" min="1" max="12" required></label>
          <label class="form-field">روز<input id="event-day" type="number" min="1" max="31" required></label>
        </div>
        <label class="all-day-field"><input id="event-all-day" type="checkbox"> تمام‌روز</label>
        <div class="time-fields">
          <label class="form-field">شروع<input id="event-start" type="time" value="09:00" required></label>
          <label class="form-field">پایان<input id="event-end" type="time" value="10:00" required></label>
        </div>
        <label class="form-field">توضیحات<textarea id="event-description" name="description" rows="3" maxlength="1000" placeholder="جزئیات رویداد"></textarea></label>
        <label class="form-field">یادآوری
          <select id="event-reminder" name="reminderMinutes">
            <option value="0">همان لحظهٔ شروع</option><option value="5">۵ دقیقه قبل</option><option value="10">۱۰ دقیقه قبل</option><option value="30">۳۰ دقیقه قبل</option><option value="60">۱ ساعت قبل</option><option value="1440">۱ روز قبل</option>
          </select>
        </label>
        <label class="form-field">ایمیل یادآوری (اختیاری)<input id="event-email" name="reminderEmail" type="email" autocomplete="email" placeholder="name@example.com"></label>
        <label class="form-field color-field">رنگ رویداد<input id="event-color" type="color" value="#5668e8"></label>
        <p class="form-error" id="event-error" role="alert" hidden></p>
        <div class="dialog-actions"><button type="button" class="delete-event-btn" id="delete-event" hidden>حذف رویداد</button><span></span><button type="button" class="cancel-btn" id="cancel-event">انصراف</button><button type="submit" class="save-event-btn">ذخیره</button></div>
      </form>
    </div>
  </main>
</body>
</html>
