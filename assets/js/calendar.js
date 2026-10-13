'use strict';

const faNumber = new Intl.NumberFormat('fa-IR');
const jalaliFormatter = new Intl.DateTimeFormat('en-u-ca-persian', {
  year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC'
});
const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
  year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC'
});
const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const weekdays = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const solarHolidays = {
  '1-1':'نوروز', '1-2':'نوروز', '1-3':'نوروز', '1-4':'نوروز',
  '1-12':'روز جمهوری اسلامی ایران', '1-13':'روز طبیعت',
  '3-14':'رحلت امام خمینی', '3-15':'قیام ۱۵ خرداد',
  '11-22':'پیروزی انقلاب اسلامی', '12-29':'روز ملی شدن صنعت نفت'
};
// Tabular Hijri dates; actual Iranian lunar dates can differ by a day after moon-sighting announcements.
const lunarHolidays = {
  '1-9':'تاسوعای حسینی', '1-10':'عاشورای حسینی', '2-20':'اربعین حسینی',
  '2-28':'رحلت پیامبر (ص) و شهادت امام حسن (ع)', '3-8':'شهادت امام حسن عسکری (ع)',
  '3-17':'میلاد پیامبر (ص) و امام جعفر صادق (ع)', '6-3':'شهادت حضرت فاطمه (س)',
  '7-13':'ولادت امام علی (ع) و روز پدر', '7-27':'مبعث پیامبر (ص)',
  '8-15':'ولادت امام زمان (عج)', '9-21':'شهادت امام علی (ع)',
  '10-1':'عید سعید فطر', '10-2':'تعطیل عید سعید فطر', '10-25':'شهادت امام جعفر صادق (ع)',
  '12-10':'عید سعید قربان', '12-18':'عید سعید غدیر خم'
};
function calendarToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}
let currentDate = calendarToday();
let selectedYear = Number(jalaliParts(currentDate).year);
let selectedView = 'month';
let holidaysForYear = new Map();

function parts(formatter, date) {
  const result = {};
  for (const part of formatter.formatToParts(date)) if (part.type !== 'literal') result[part.type] = Number(part.value.replace(/[^0-9]/g, ''));
  return result;
}
function jalaliParts(date) { return parts(jalaliFormatter, date); }
function monthStart(year, month) {
  const start = new Date(Date.UTC(year + 621, 2, 1));
  for (let i = 0; i < 390; i++) {
    const date = new Date(start.getTime() + i * 86400000);
    const p = jalaliParts(date);
    if (p.year === year && p.month === month && p.day === 1) return date;
  }
  return null;
}
function monthDays(year, month) {
  const first = monthStart(year, month);
  const next = month === 12 ? monthStart(year + 1, 1) : monthStart(year, month + 1);
  return first && next ? Math.round((next - first) / 86400000) : 0;
}
function iranWeekday(date) { return (date.getUTCDay() + 1) % 7; }
function isoDate(date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`; }
function holidayMap(year) {
  if (holidaysForYear.has(year)) return holidaysForYear.get(year);
  const holidays = new Map();
  const first = monthStart(year, 1);
  const next = monthStart(year + 1, 1);
  if (!first || !next) return holidays;
  for (let date = new Date(first); date < next; date = new Date(date.getTime() + 86400000)) {
    const jp = jalaliParts(date);
    const fixed = solarHolidays[`${jp.month}-${jp.day}`];
    if (fixed) holidays.set(isoDate(date), fixed);
    const hp = parts(hijriFormatter, date);
    const lunar = lunarHolidays[`${hp.month}-${hp.day}`];
    if (lunar) holidays.set(isoDate(date), holidays.has(isoDate(date)) ? `${holidays.get(isoDate(date))}، ${lunar}` : lunar);
  }
  holidaysForYear.set(year, holidays);
  return holidays;
}
function seededEvents(year) {
  const start = monthStart(year, 1);
  const end = monthStart(year + 1, 1);
  if (!start || !end) return new Map();
  const titles = ['جلسه برنامه‌ریزی','پیگیری کارها','جلسه تیم','یادآوری پرداخت','مرور هفتگی','تحویل پروژه','جلسه با مشتری','برنامه‌ریزی ماهانه'];
  const events = new Map();
  let seed = (year * 9301 + 49297) % 233280;
  const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const span = Math.round((end - start) / 86400000);
  for (let i = 0; i < Math.min(48, Math.floor(span / 7)); i++) {
    const offset = Math.floor(random() * span);
    const date = new Date(start.getTime() + offset * 86400000);
    const key = isoDate(date);
    if (!events.has(key)) events.set(key, []);
    events.get(key).push({ title: titles[Math.floor(random() * titles.length)], color: ['#6574f7','#22a58b','#e7a844'][Math.floor(random()*3)], time: `${String(9+Math.floor(random()*9)).padStart(2,'0')}:${random() < .5 ? '00':'30'}` });
  }
  return events;
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function labelDate(date) { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year:'numeric',month:'long',day:'numeric',timeZone:'UTC' }).format(date); }
function currentJalaliKey(date) { const p = jalaliParts(date); return `${p.year}-${p.month}-${p.day}`; }
function renderMonth(year, month, holidays, events, mini=false) {
  const start = monthStart(year, month);
  const count = monthDays(year, month);
  if (!start || !count) return '<p class="empty-state">این سال در محدودهٔ قابل نمایش تاریخ قرار ندارد.</p>';
  const leading = iranWeekday(start);
  let html = `<section class="month-card ${mini?'mini-month':''}"><div class="month-card-title"><h3>${monthNames[month-1]}</h3>${mini?'':`<span>${faNumber.format(year)}</span>`}</div><div class="weekday-row">${weekdays.map(x=>`<span>${x}</span>`).join('')}</div><div class="days-grid">`;
  for (let i=0;i<leading;i++) html += '<div class="day empty"></div>';
  for (let day=1;day<=count;day++) {
    const date = new Date(start.getTime() + (day-1)*86400000);
    const iso = isoDate(date);
    const holiday = holidays.get(iso);
    const isFriday = date.getUTCDay() === 5;
    const dayEvents = events.get(iso)||[];
    const isToday = currentJalaliKey(currentDate) === `${year}-${month}-${day}`;
    const classes = ['day', isToday?'is-today':'', holiday?'is-holiday':'', isFriday?'is-friday':''].filter(Boolean).join(' ');
    html += `<button class="${classes}" data-date="${iso}" title="${escapeHtml([holiday,...dayEvents.map(e=>e.title)].filter(Boolean).join(' · ') || labelDate(date))}"><span class="day-number">${faNumber.format(day)}</span>${holiday?'<i class="holiday-dot"></i>':''}${dayEvents.length?`<i class="event-dot"></i>`:''}${!mini&&holiday?`<span class="day-holiday-label">${escapeHtml(holiday)}</span>`:''}${!mini&&dayEvents.map(e=>`<span class="event-pill" style="--event-color:${e.color}">${escapeHtml(e.time)} ${escapeHtml(e.title)}</span>`).join('')}</button>`;
  }
  return html+'</div></section>';
}
function render() {
  const holidays = holidayMap(selectedYear);
  const events = seededEvents(selectedYear);
  const host=document.getElementById('calendar');
  const title=document.getElementById('period-title');
  const subtitle=document.getElementById('period-subtitle');
  document.getElementById('year-input').value=selectedYear;
  if (selectedView==='year') {
    title.textContent=`تقویم سال ${faNumber.format(selectedYear)}`;
    subtitle.textContent='همهٔ ماه‌ها در یک نگاه';
    host.className='year-view';
    host.innerHTML=Array.from({length:12},(_,i)=>renderMonth(selectedYear,i+1,holidays,events,true)).join('');
    host.querySelectorAll('.mini-month .day:not(.empty)').forEach(cell=>cell.addEventListener('click',()=>{ const dp=cell.dataset.date.split('-').map(Number); currentDate=new Date(Date.UTC(dp[0],dp[1]-1,dp[2],12)); selectedView='month'; updateButtons(); render(); }));
    return;
  }
  host.className='';
  if (selectedView==='month') {
    const p=jalaliParts(currentDate); const month=p.year===selectedYear?p.month:1;
    title.textContent=`${monthNames[month-1]} ${faNumber.format(selectedYear)}`;
    subtitle.textContent=`${faNumber.format(monthDays(selectedYear,month))} روز`;
    host.innerHTML=renderMonth(selectedYear,month,holidays,events);
  } else if (selectedView==='day') {
    const dayDate=new Date(Date.UTC(currentDate.getUTCFullYear(),currentDate.getUTCMonth(),currentDate.getUTCDate()));
    const key=isoDate(dayDate);
    title.textContent=labelDate(dayDate); subtitle.textContent=weekdays[iranWeekday(dayDate)];
    const officialHoliday=holidays.get(key);
    const friday=dayDate.getUTCDay()===5;
    host.innerHTML=`<div class="agenda">${officialHoliday?`<div class="agenda-holiday">تعطیل رسمی · ${escapeHtml(officialHoliday)}</div>`:''}${friday?'<div class="agenda-friday">تعطیلی هفتگی جمعه</div>':''}${(events.get(key)||[]).map(e=>`<div class="agenda-event" style="--event-color:${e.color}"><time>${e.time}</time><span>${escapeHtml(e.title)}</span></div>`).join('')||(!officialHoliday&&!friday?'<div class="empty-state">برای این روز رویدادی ثبت نشده است.</div>':'')}</div>`;
  } else {
    const p=jalaliParts(currentDate); const month=p.year===selectedYear?p.month:1; const start=new Date(Date.UTC(currentDate.getUTCFullYear(),currentDate.getUTCMonth(),currentDate.getUTCDate())); const shift=iranWeekday(start); const weekStart=new Date(start.getTime()-shift*86400000); const days=Array.from({length:7},(_,i)=>new Date(weekStart.getTime()+i*86400000));
    title.textContent=`هفتهٔ ${monthNames[month-1]} ${faNumber.format(selectedYear)}`; subtitle.textContent='نمای هفتگی';
    host.innerHTML=`<div class="week-view"><div class="weekday-row">${weekdays.map((w,i)=>`<span>${w}<b>${faNumber.format(jalaliParts(days[i]).day)}</b></span>`).join('')}</div>${Array.from({length:12},(_,h)=>`<div class="week-row"><time>${faNumber.format(h+8)}:۰۰</time>${days.map(d=>{const iso=isoDate(d);const officialHoliday=holidays.get(iso);const friday=d.getUTCDay()===5;return `<div class="week-slot">${(events.get(iso)||[]).filter(e=>Number(e.time.slice(0,2))===h+8).map(e=>`<span class="event-pill" style="--event-color:${e.color}">${escapeHtml(e.title)}</span>`).join('')}${officialHoliday?`<small class="week-holiday">${escapeHtml(officialHoliday)}</small>`:''}${friday?'<small class="week-friday">تعطیلی جمعه</small>':''}</div>`}).join('')}</div>`).join('')}</div>`;
  }
  host.querySelectorAll('.day:not(.empty)').forEach(cell=>cell.addEventListener('click',()=>{
    const [gy,gm,gd]=cell.dataset.date.split('-').map(Number); currentDate=new Date(Date.UTC(gy,gm-1,gd,12)); selectedView='day'; updateButtons(); render();
  }));
}
function updateButtons(){document.querySelectorAll('.view-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===selectedView));}
function shiftPeriod(amount){
  if(selectedView==='day') currentDate.setUTCDate(currentDate.getUTCDate()+amount);
  else if(selectedView==='week') currentDate.setUTCDate(currentDate.getUTCDate()+7*amount);
  else if(selectedView==='year') selectedYear=Math.max(1,Math.min(275137,selectedYear+amount));
  else { const p=jalaliParts(currentDate); const targetMonth=p.year===selectedYear?p.month:1; let y=selectedYear,m=targetMonth+amount; while(m<1){m+=12;y--;} while(m>12){m-=12;y++;} if(y<1||y>275137)return; const start=monthStart(y,m); if(!start)return; selectedYear=y; currentDate=new Date(start.getTime()+12*3600000); }
  if (selectedView !== 'year') selectedYear = jalaliParts(currentDate).year;
  render();
}
document.querySelectorAll('.view-btn').forEach(btn=>btn.addEventListener('click',()=>{const cameFromYear=selectedView==='year';selectedView=btn.dataset.view;if(cameFromYear&&selectedView!=='year'){const first=monthStart(selectedYear,1);if(first)currentDate=new Date(first.getTime()+12*3600000);}else{selectedYear=jalaliParts(currentDate).year;}updateButtons();render();}));
document.getElementById('prev').addEventListener('click',()=>shiftPeriod(-1));
document.getElementById('next').addEventListener('click',()=>shiftPeriod(1));
document.getElementById('today').addEventListener('click',()=>{currentDate=calendarToday();selectedYear=jalaliParts(currentDate).year;render();});
document.getElementById('go-year').addEventListener('click',()=>{const value=Number(document.getElementById('year-input').value);if(Number.isInteger(value)&&value>0&&value<=275137){const p=jalaliParts(currentDate);const month=p.year===value?p.month:1;const first=monthStart(value,month);if(!first)return;selectedYear=value;currentDate=new Date(first.getTime()+12*3600000);render();}});
document.getElementById('year-input').addEventListener('keydown',event=>{if(event.key==='Enter')document.getElementById('go-year').click();});
updateButtons();render();
