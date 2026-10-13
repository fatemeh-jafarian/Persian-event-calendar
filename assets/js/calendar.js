'use strict';

const faNumber = new Intl.NumberFormat('fa-IR');
const faYear = new Intl.NumberFormat('fa-IR', { useGrouping: false });
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
const eventStorageKey = 'persian-calendar-events-v1';
let editingEventId = null;

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
function isoDate(date) { return `${String(date.getUTCFullYear()).padStart(4,'0')}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`; }
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
function readSavedEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(eventStorageKey) || '[]');
    return Array.isArray(saved) ? saved.filter(event => event && typeof event.id === 'string' && typeof event.title === 'string' && typeof event.date === 'string' && /^\d{4,6}-\d{2}-\d{2}$/.test(event.date) && /^#[0-9a-f]{6}$/i.test(event.color)) : [];
  } catch {
    return [];
  }
}
function eventsForYear(year) {
  const events = new Map();
  for (const event of readSavedEvents()) {
    const date = new Date(`${event.date}T12:00:00Z`);
    if (jalaliParts(date).year !== year) continue;
    if (!events.has(event.date)) events.set(event.date, []);
    events.get(event.date).push(event);
  }
  for (const dayEvents of events.values()) dayEvents.sort((a, b) => (a.allDay ? '' : a.startTime || '').localeCompare(b.allDay ? '' : b.startTime || ''));
  return events;
}
function eventTimeLabel(event) { return event.allDay ? 'تمام‌روز' : `${event.startTime} تا ${event.endTime}`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function labelDate(date) { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year:'numeric',month:'long',day:'numeric',timeZone:'UTC' }).format(date); }
function currentJalaliKey(date) { const p = jalaliParts(date); return `${p.year}-${p.month}-${p.day}`; }
function renderMonth(year, month, holidays, events, mini=false) {
  const start = monthStart(year, month);
  const count = monthDays(year, month);
  if (!start || !count) return '<p class="empty-state">این سال در محدودهٔ قابل نمایش تاریخ قرار ندارد.</p>';
  const leading = iranWeekday(start);
  let html = `<section class="month-card ${mini?'mini-month':''}"><div class="month-card-title"><h3>${monthNames[month-1]}</h3>${mini?'':`<span>${faYear.format(year)}</span>`}</div><div class="weekday-row">${weekdays.map(x=>`<span>${x}</span>`).join('')}</div><div class="days-grid">`;
  for (let i=0;i<leading;i++) html += '<div class="day empty"></div>';
  for (let day=1;day<=count;day++) {
    const date = new Date(start.getTime() + (day-1)*86400000);
    const iso = isoDate(date);
    const holiday = holidays.get(iso);
    const isFriday = date.getUTCDay() === 5;
    const dayEvents = events.get(iso)||[];
    const isToday = currentJalaliKey(currentDate) === `${year}-${month}-${day}`;
    const classes = ['day', isToday?'is-today':'', holiday?'is-holiday':'', isFriday?'is-friday':''].filter(Boolean).join(' ');
    html += `<button class="${classes}" data-date="${iso}" title="${escapeHtml([holiday,...dayEvents.map(e=>e.title)].filter(Boolean).join(' · ') || labelDate(date))}"><span class="day-number">${faNumber.format(day)}</span>${holiday?'<i class="holiday-dot"></i>':''}${dayEvents.length?`<i class="event-dot"></i>`:''}${!mini&&holiday?`<span class="day-holiday-label">${escapeHtml(holiday)}</span>`:''}${!mini?dayEvents.map(e=>`<span class="event-pill" style="--event-color:${escapeHtml(e.color)}" data-event-id="${escapeHtml(e.id)}" role="button" tabindex="0" aria-label="ویرایش ${escapeHtml(e.title)}">${escapeHtml(eventTimeLabel(e))} ${escapeHtml(e.title)}</span>`).join(''):''}</button>`;
  }
  return html+'</div></section>';
}
function render() {
  const holidays = holidayMap(selectedYear);
  const events = eventsForYear(selectedYear);
  const host=document.getElementById('calendar');
  const title=document.getElementById('period-title');
  const subtitle=document.getElementById('period-subtitle');
  document.getElementById('year-input').value=selectedYear;
  if (selectedView==='year') {
    title.textContent=`تقویم سال ${faYear.format(selectedYear)}`;
    subtitle.textContent='همهٔ ماه‌ها در یک نگاه';
    host.className='year-view';
    host.innerHTML=Array.from({length:12},(_,i)=>renderMonth(selectedYear,i+1,holidays,events,true)).join('');
    host.querySelectorAll('.mini-month .day:not(.empty)').forEach(cell=>cell.addEventListener('click',()=>{ const dp=cell.dataset.date.split('-').map(Number); currentDate=new Date(Date.UTC(dp[0],dp[1]-1,dp[2],12)); selectedView='month'; updateButtons(); render(); }));
    return;
  }
  host.className='';
  if (selectedView==='month') {
    const p=jalaliParts(currentDate); const month=p.year===selectedYear?p.month:1;
    title.textContent=`${monthNames[month-1]} ${faYear.format(selectedYear)}`;
    subtitle.textContent=`${faNumber.format(monthDays(selectedYear,month))} روز`;
    host.innerHTML=renderMonth(selectedYear,month,holidays,events);
  } else if (selectedView==='day') {
    const dayDate=new Date(Date.UTC(currentDate.getUTCFullYear(),currentDate.getUTCMonth(),currentDate.getUTCDate()));
    const key=isoDate(dayDate);
    title.textContent=labelDate(dayDate); subtitle.textContent=weekdays[iranWeekday(dayDate)];
    const officialHoliday=holidays.get(key);
    const friday=dayDate.getUTCDay()===5;
    host.innerHTML=`<div class="agenda">${officialHoliday?`<div class="agenda-holiday">تعطیل رسمی · ${escapeHtml(officialHoliday)}</div>`:''}${friday?'<div class="agenda-friday">تعطیلی هفتگی جمعه</div>':''}${(events.get(key)||[]).map(e=>`<div class="agenda-event" style="--event-color:${escapeHtml(e.color)}" data-event-id="${escapeHtml(e.id)}" role="button" tabindex="0"><time>${escapeHtml(eventTimeLabel(e))}</time><span><strong>${escapeHtml(e.title)}</strong>${e.description?`<small>${escapeHtml(e.description)}</small>`:''}</span></div>`).join('')||(!officialHoliday&&!friday?'<div class="empty-state">برای این روز رویدادی ثبت نشده است.</div>':'')}</div>`;
  } else {
    const p=jalaliParts(currentDate); const month=p.year===selectedYear?p.month:1; const start=new Date(Date.UTC(currentDate.getUTCFullYear(),currentDate.getUTCMonth(),currentDate.getUTCDate())); const shift=iranWeekday(start); const weekStart=new Date(start.getTime()-shift*86400000); const days=Array.from({length:7},(_,i)=>new Date(weekStart.getTime()+i*86400000));
    title.textContent=`هفتهٔ ${monthNames[month-1]} ${faYear.format(selectedYear)}`; subtitle.textContent='نمای هفتگی';
    host.innerHTML=`<div class="week-view"><div class="weekday-row"><span class="week-time-spacer" aria-hidden="true"></span>${weekdays.map((w,i)=>`<span>${w}<b>${faNumber.format(jalaliParts(days[i]).day)}</b></span>`).join('')}</div><div class="week-row all-day-row"><time>تمام‌روز</time>${days.map(d=>`<div class="week-slot">${(events.get(isoDate(d))||[]).filter(e=>e.allDay).map(e=>`<div class="event-pill" style="--event-color:${escapeHtml(e.color)}" data-event-id="${escapeHtml(e.id)}" role="button" tabindex="0">${escapeHtml(e.title)}</div>`).join('')}</div>`).join('')}</div>${Array.from({length:24},(_,h)=>`<div class="week-row"><time>${faNumber.format(h)}:۰۰</time>${days.map(d=>{const iso=isoDate(d);const officialHoliday=holidays.get(iso);const friday=d.getUTCDay()===5;return `<div class="week-slot">${(events.get(iso)||[]).filter(e=>!e.allDay&&Number((e.startTime||'').slice(0,2))===h).map(e=>`<div class="event-pill" style="--event-color:${escapeHtml(e.color)}" data-event-id="${escapeHtml(e.id)}" role="button" tabindex="0">${escapeHtml(e.startTime)}–${escapeHtml(e.endTime)} ${escapeHtml(e.title)}</div>`).join('')}${officialHoliday&&h===0?`<small class="week-holiday">${escapeHtml(officialHoliday)}</small>`:''}${friday&&h===0?'<small class="week-friday">تعطیلی جمعه</small>':''}</div>`}).join('')}</div>`).join('')}</div>`;
  }
  host.querySelectorAll('[data-event-id]').forEach(item=>{
    const edit = event => { event.preventDefault(); event.stopPropagation(); const record=readSavedEvents().find(saved=>saved.id===item.dataset.eventId); if(record) openEventDialog(record); };
    item.addEventListener('click',edit);
    item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){edit(event);}});
  });
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

function jalaliDateToIso(year, month, day) {
  if (!Number.isInteger(year)||year<1||year>275137||!Number.isInteger(month)||month<1||month>12||!Number.isInteger(day)||day<1) return null;
  const first=monthStart(year,month);
  if(!first) return null;
  const date=new Date(first.getTime()+(day-1)*86400000);
  const partsForDate=jalaliParts(date);
  return partsForDate.year===year&&partsForDate.month===month&&partsForDate.day===day?isoDate(date):null;
}
function populateEventDate(iso) {
  const [gy,gm,gd]=iso.split('-').map(Number);
  const date=new Date(Date.UTC(gy,gm-1,gd,12));
  const p=jalaliParts(date);
  document.getElementById('event-year').value=p.year;
  document.getElementById('event-month').value=p.month;
  document.getElementById('event-day').value=p.day;
}
function updateAllDayFields() {
  const allDay=document.getElementById('event-all-day').checked;
  for(const field of [document.getElementById('event-start'),document.getElementById('event-end')]) { field.disabled=allDay; field.required=!allDay; }
}
function openEventDialog(event=null, date=isoDate(currentDate)) {
  const form=document.getElementById('event-form');
  form.reset();
  editingEventId=event?.id||null;
  document.getElementById('event-dialog-title').textContent=event?'ویرایش رویداد':'رویداد جدید';
  document.getElementById('event-title').value=event?.title||'';
  populateEventDate(event?.date||date);
  document.getElementById('event-all-day').checked=Boolean(event?.allDay);
  document.getElementById('event-start').value=event?.startTime||'09:00';
  document.getElementById('event-end').value=event?.endTime||'10:00';
  document.getElementById('event-description').value=event?.description||'';
  document.getElementById('event-color').value=/^#[0-9a-f]{6}$/i.test(event?.color||'')?event.color:'#5668e8';
  document.getElementById('delete-event').hidden=!event;
  document.getElementById('event-error').hidden=true;
  updateAllDayFields();
  document.getElementById('event-dialog').hidden=false;
  document.getElementById('event-title').focus();
}
function closeEventDialog() {
  document.getElementById('event-dialog').hidden=true;
  editingEventId=null;
}
function showEventError(message) {
  const error=document.getElementById('event-error');
  error.textContent=message;
  error.hidden=false;
}
document.getElementById('create-event').addEventListener('click',()=>openEventDialog());
document.getElementById('close-event-dialog').addEventListener('click',closeEventDialog);
document.getElementById('cancel-event').addEventListener('click',closeEventDialog);
document.getElementById('event-dialog').addEventListener('click',event=>{if(event.target.id==='event-dialog')closeEventDialog();});
document.getElementById('event-all-day').addEventListener('change',updateAllDayFields);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('event-dialog').hidden)closeEventDialog();});
document.getElementById('event-form').addEventListener('submit',event=>{
  event.preventDefault();
  const title=document.getElementById('event-title').value.trim();
  const iso=jalaliDateToIso(Number(document.getElementById('event-year').value),Number(document.getElementById('event-month').value),Number(document.getElementById('event-day').value));
  const allDay=document.getElementById('event-all-day').checked;
  const startTime=document.getElementById('event-start').value;
  const endTime=document.getElementById('event-end').value;
  if(!title) return showEventError('عنوان رویداد را وارد کنید.');
  if(!iso) return showEventError('تاریخ شمسی واردشده معتبر نیست.');
  if(!allDay&&(!startTime||!endTime||endTime<=startTime)) return showEventError('ساعت پایان باید بعد از ساعت شروع باشد.');
  const records=readSavedEvents();
  const record={id:editingEventId||`${Date.now()}-${Math.random().toString(36).slice(2)}`,title,date:iso,allDay,startTime:allDay?'':startTime,endTime:allDay?'':endTime,description:document.getElementById('event-description').value.trim(),color:document.getElementById('event-color').value};
  const index=records.findIndex(saved=>saved.id===editingEventId);
  if(index>=0) records[index]=record; else records.push(record);
  try { localStorage.setItem(eventStorageKey,JSON.stringify(records)); }
  catch { return showEventError('ذخیره‌سازی در این مرورگر در دسترس نیست.'); }
  const [gy,gm,gd]=iso.split('-').map(Number);
  currentDate=new Date(Date.UTC(gy,gm-1,gd,12));
  selectedYear=jalaliParts(currentDate).year;
  render();
  closeEventDialog();
});
document.getElementById('delete-event').addEventListener('click',()=>{
  if(!editingEventId||!window.confirm('این رویداد حذف شود؟')) return;
  try { localStorage.setItem(eventStorageKey,JSON.stringify(readSavedEvents().filter(event=>event.id!==editingEventId))); }
  catch { return showEventError('حذف رویداد در این مرورگر انجام نشد.'); }
  closeEventDialog();
  render();
});
updateButtons();render();
