let view = "day";
let today = new Date();
let events = [];

const HOUR_HEIGHT = 45;

const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

const jalaliMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

const dayMap = {
    "شنبه": 0,
    "یکشنبه": 1,
    "دوشنبه": 2,
    "سه شنبه": 3,
    "چهار شنبه": 4,
    "پنج‌شنبه": 5,
    "جمعه": 6
};

function formatDateTime(date) {

    const y = date.getFullYear();

    const m = String(date.getMonth() + 1).padStart(2, "0");

    const d = String(date.getDate()).padStart(2, "0");

    const h = String(date.getHours()).padStart(2, "0");

    const i = String(date.getMinutes()).padStart(2, "0");

    const s = String(date.getSeconds()).padStart(2, "0");

    return `${y}-${m}-${d} ${h}:${i}:${s}`;
}

function getRangeStart() {

    let start = new Date(today);

    switch (view) {

        case "day":

            start.setHours(0, 0, 0, 0);
            break;

        case "week":

            start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
            start.setHours(0, 0, 0, 0);
            break;

        case "month":

            start = new persianDate(today)
                .startOf("month")
                .toDate();

            start.setHours(0, 0, 0, 0);
            break;

        case "year":

            let pStart = new persianDate(today);

            start = new persianDate([pStart.year(), 1, 1]).toDate();

            start.setHours(0, 0, 0, 0);
            break;
    }

    return formatDateTime(start);
}

function getRangeEnd() {

    let end = new Date(today);

    switch (view) {

        case "day":

            end.setHours(23, 59, 59, 999);
            break;

        case "week":

            end.setDate(end.getDate() + (6 - ((end.getDay() + 1) % 7)));
            end.setHours(23, 59, 59, 999);
            break;

        case "month":

            end = new persianDate(today)
                .endOf("month")
                .toDate();

            end.setHours(23, 59, 59, 999);
            break;

        case "year":

            let pEnd = new persianDate(today);

            end = new persianDate([pEnd.year(), 12, 29])
                .endOf("month")
                .toDate();

            end.setHours(23, 59, 59, 999);
            break;
    }

    return formatDateTime(end);
}

function goToday() {
    today = new Date();
    render();
}

function prev() {

    switch (view) {

        case "day":
            today.setDate(today.getDate() - 1);
            break;

        case "week":
            today.setDate(today.getDate() - 7);
            break;

        case "month":
            today = new persianDate(today)
                .subtract('months', 1)
                .toDate();
            break;

        case "year":
            today = new persianDate(today)
                .subtract('years', 1)
                .toDate();
            break;
    }

    render();
}

function next() {

    switch (view) {

        case "day":
            today.setDate(today.getDate() + 1);
            break;

        case "week":
            today.setDate(today.getDate() + 7);
            break;

        case "month":
            today = new persianDate(today)
                .add('months', 1)
                .toDate();
            break;

        case "year":
            today = new persianDate(today)
                .add('years', 1)
                .toDate();
            break;
    }

    render();
}

async function loadHolidays() {
    holidays = await res.json();
}


function getIranHoliday(date) {

    let p = new persianDate(date);

    let m = String(p.month()).padStart(2, "0");
    let d = String(p.date()).padStart(2, "0");

    const holidays = {
        "01-01": "نوروز",
        "01-02": "نوروز",
        "01-03": "نوروز",
        "01-04": "نوروز",
        "01-12": "روز جمهوری اسلامی",
        "01-13": "جشن سیزده‌بدر",
        "03-14": "رحلت امام",
        "03-15": "قیام 15 خرداد",
        "11-22": "22 بهمن"
    };

    return holidays[`${m}-${d}`] || null;
}

function isToday(date) {
    let now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
}


function getFirstDayOfJalaliMonth(date) {

    let pd = new persianDate(date);

    let first = pd.startOf('month');

    return first.day();
}

function getJalaliMonthDays(date) {

    let pd = new persianDate(date);

    return pd.daysInMonth();
}

function toJalali(date) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function getJalaliMonth(date) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        month: 'long'
    }).format(date);
}

function sameDay(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}

function renderDayEvents(cell, date) {

    let dayEvents = events.filter(ev =>
        sameDay(ev.start, date)
    );

    dayEvents.forEach(ev => {

        let div = document.createElement("div");

        div.className = "event";
        div.innerText = ev.title;
        div.style.background = ev.color;

        cell.appendChild(div);
    });
}

function renderDayEventsLayer(layer) {

    const HOUR_HEIGHT = 45;

    let dayEvents = events.filter(ev =>
        sameDay(ev.start, today)
    );

    dayEvents.forEach(ev => {

        let div = document.createElement("div");

        let startMinutes =
            ev.start.getHours() * 60 +
            ev.start.getMinutes();

        let endMinutes =
            ev.end.getHours() * 60 +
            ev.end.getMinutes();

        div.className = "event";

        div.style.pointerEvents = "auto";
        div.style.cursor = "pointer";

        div.innerText = ev.title;

        const startTime =
            `${String(ev.start.getHours()).padStart(2, '0')}:${String(ev.start.getMinutes()).padStart(2, '0')}`;

        const endTime =
            `${String(ev.end.getHours()).padStart(2, '0')}:${String(ev.end.getMinutes()).padStart(2, '0')}`;

        div.setAttribute("data-toggle", "tooltip");
        div.setAttribute("data-placement", "top");
        div.setAttribute("data-html", "true");

        div.setAttribute(
            "title",
            `<b>${ev.title}</b><br>${startTime} - ${endTime}`
        );

        div.style.position = "absolute";

        div.style.left = "0";
        div.style.right = "5px";

        div.style.top =
            `${startMinutes * HOUR_HEIGHT / 60 - 2}px`;

        div.style.height =
            `${(endMinutes - startMinutes) * HOUR_HEIGHT / 60}px`;

        div.style.background = ev.color;

        div.style.color = "#fff";

        div.style.padding = "4px";

        div.style.borderRadius = "6px";

        layer.appendChild(div);

    });
}
function renderWeekEvents(cell, date, hour) {

    let hourEvents = events.filter(ev => {

        return sameDay(ev.start, date) &&
            ev.start.getHours() === hour;

    });

    hourEvents.forEach(ev => {

        let div = document.createElement("div");

        div.className = "event";

        div.style.zIndex = "1000";
        div.style.pointerEvents = "auto";

        div.style.position = "absolute";

        div.style.left = "1px";
        div.style.right = "1px";

        div.style.top = `${ev.start.getMinutes() * HOUR_HEIGHT / 60 - 3}px`;

        const duration =
            (ev.end.getTime() - ev.start.getTime()) / 60000;

        div.style.height =
            `${duration * HOUR_HEIGHT / 60}px`;

        div.style.background = ev.color;

        div.style.color = "#fff";

        div.style.fontSize = "11px";

        div.style.padding = "2px 4px";

        div.style.borderRadius = "4px";

        div.style.boxSizing = "border-box";

        div.style.overflow = "hidden";

        div.innerHTML = `<b>${ev.title}</b>`;

        div.setAttribute("data-toggle", "tooltip");
        div.setAttribute("data-placement", "top");

        div.setAttribute(
            "title",
            `<b>${ev.title}</b><br>
     ${String(ev.start.getHours()).padStart(2, '0')}:${String(ev.start.getMinutes()).padStart(2, '0')}
     -
     ${String(ev.end.getHours()).padStart(2, '0')}:${String(ev.end.getMinutes()).padStart(2, '0')}`
        );

        div.setAttribute("data-html", "true");

        cell.appendChild(div);

    });

}

function randomColor() {

    const colors = [
        "#1a73e8", // Google blue
        "#ea4335", // red
        "#34a853", // green
        "#fbbc05", // yellow
        "#673ab7", // purple
        "#00acc1"
    ];

    return colors[Math.floor(Math.random() * colors.length)];
}

setView('week');

function setView(v) {
    view = v;

    $(".view-btn").removeClass("active");
    $("#" + view + "-btn").addClass('active');
    render();
}


function isHoliday(date) {

    if (date.getDay() === 5) return true;

    let iso = date.toISOString().split("T")[0];

    return holidays.some(h => h.date === iso);
}

function getHolidayTitle(date) {

    let iso = date.toISOString().split("T")[0];

    let h = holidays.find(h => h.date === iso);

    return h ? h.title : null;
}

async function render() {

    const start = getRangeStart();

    const end = getRangeEnd();

    await loadEvents(start, end);

    let el = document.getElementById("calendar");

    el.innerHTML = "";

    if (view === "day") renderDay(el);

    if (view === "week") renderWeek(el);

    if (view === "month") renderMonth(el);

    if (view === "year") renderYear(el);
}

function renderDay(el) {

    el.innerHTML = "";

    let holiday = getIranHoliday(today);
    let todayFlag = isToday(today);

    let header = document.createElement("div");
    header.style.padding = "10px";

    header.innerHTML = `
        ${todayFlag ? "⭐ امروز - " : ""}
        ${new persianDate(today).format("dddd D MMMM")}
        ${holiday ? " | " + holiday : ""}
    `;

    el.appendChild(header);

    let grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateRows = `repeat(24,${HOUR_HEIGHT}px)`;
    grid.style.position = "relative";

    for (let h = 0; h < 24; h++) {

        let cell = document.createElement("div");
        cell.className = "cell";
        cell.style.position = "relative";
        cell.style.height = `${HOUR_HEIGHT}px`;
        cell.style.overflow = "visible";

        let d = new Date(today);
        d.setHours(h);

        cell.dataset.date = d.toISOString();

        cell.innerHTML = `
            <div style="
                position:absolute;
                left:2px;
                top:30%;
                width:50px;
                color:#666;
                font-size:12px;
            ">
                ${h}:00
            </div>
        `;

        let eventsLayer = document.createElement("div");

        eventsLayer.style.position = "absolute";
        eventsLayer.style.left = "60px";
        eventsLayer.style.top = "0";
        eventsLayer.style.right = "0";
        eventsLayer.style.height = `${24 * HOUR_HEIGHT}px`;
        eventsLayer.style.pointerEvents = "auto";

        renderDayEventsLayer(eventsLayer);

        grid.appendChild(eventsLayer);

        grid.appendChild(cell);
    }

    el.appendChild(grid);
    $('[data-toggle="tooltip"]').tooltip();
}

function renderWeek(el) {

    el.innerHTML = "";

    let start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 1) % 7));

    const HEADER_HEIGHT = 70;

    let grid = document.createElement("div");

    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `60px repeat(7,1fr)`;
    grid.style.gridTemplateRows = `${HEADER_HEIGHT}px repeat(24,${HOUR_HEIGHT}px)`;
    grid.style.position = "relative";
    grid.style.border = "1px solid #e0e0e0";

    let empty = document.createElement("div");
    empty.className = "cell";
    grid.appendChild(empty);

    for (let i = 0; i < 7; i++) {

        let d = new Date(start);
        d.setDate(start.getDate() + i);

        let header = document.createElement("div");

        header.className = "cell";

        if (d.getDay() === 5) {
            header.classList.add("holiday");
        }

        if (isToday(d))
            header.classList.add("today");

        header.innerHTML = `
            <div style="text-align:center">
                <div style="font-size:12px">
                    ${new persianDate(d).format("dddd")}
                </div>

                <div style="font-size:18px;margin-top:3px">
                    ${new persianDate(d).date()}
                </div>
            </div>
        `;

        grid.appendChild(header);

    }

    for (let h = 0; h < 24; h++) {

        let hour = document.createElement("div");

        hour.className = "cell";

        hour.style.height = `${HOUR_HEIGHT}px`;

        hour.style.display = "flex";
        hour.style.alignItems = "center";
        hour.style.justifyContent = "center";

        hour.style.fontSize = "12px";
        hour.style.color = "#666";

        hour.innerHTML = `${String(h).padStart(2, '0')}:00`;

        grid.appendChild(hour);

        for (let day = 0; day < 7; day++) {

            let cell = document.createElement("div");

            cell.className = "cell";

            let currentDate = new Date(start);
            currentDate.setDate(start.getDate() + day);

            if (currentDate.getDay() === 5) {
                cell.classList.add("holiday");
            }

            cell.style.height = `${HOUR_HEIGHT}px`;

            cell.style.position = "relative";

            cell.style.overflow = "visible";

            let date = new Date(start);

            date.setDate(start.getDate() + day);

            date.setHours(h, 0, 0, 0);

            cell.dataset.date = date.toISOString();

            renderWeekEvents(cell, date, h);

            grid.appendChild(cell);

        }

    }

    el.appendChild(grid);
    $('[data-toggle="tooltip"]').tooltip();
}

function renderMonth(el) {

    let p = new persianDate(today);

    let year = p.year();
    let month = p.month();

    let monthStart = new persianDate([year, month, 1]);
    let daysInMonth = monthStart.daysInMonth();

    let firstDay = dayMap[
        new persianDate([year, month, 1]).format("dddd")
    ];

    const weekDaysFa = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

    let grid = document.createElement("div");
    grid.className = "grid";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, 1fr)";
    grid.style.gap = "1px";
    grid.style.background = "#e0e0e0";

    let header = document.createElement("div");
    header.style.gridColumn = "span 7";
    header.style.padding = "10px";
    header.style.fontWeight = "bold";
    header.style.background = "#fff";
    header.style.borderBottom = "1px solid #e0e0e0";

    header.innerText = `${monthStart.format("MMMM")} ${year}`;
    grid.appendChild(header);

    for (let i = 0; i < 7; i++) {
        let wd = document.createElement("div");
        wd.style.background = "#fff";
        wd.style.textAlign = "center";
        wd.style.fontSize = "12px";
        wd.style.color = "#5f6368";
        wd.style.padding = "6px";
        wd.innerText = weekDaysFa[i];
        grid.appendChild(wd);
    }

    for (let i = 0; i < firstDay; i++) {
        let empty = document.createElement("div");
        empty.style.background = "#fff";
        empty.style.minHeight = "90px";
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {

        let pDate = new persianDate([year, month, d]);
        let dateObj = pDate.toDate();
        let dayName = pDate.format("dddd");
        let dayIndex = dayMap[dayName];
        let holiday = getIranHoliday(dateObj);

        let isTodayCell = isToday(dateObj);

        let cell = document.createElement("div");
        cell.className = "cell";

        cell.style.background = "#fff";
        cell.style.minHeight = "90px";
        cell.style.padding = "6px";
        cell.style.cursor = "pointer";
        cell.style.position = "relative";

        if (isTodayCell) {
            cell.classList.add("today");
        }

        cell.innerHTML = `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                font-size:13px;
                font-weight:500;
            ">
                <span class="${isTodayCell ? 'today-badge' : ''}">
                    ${d}
                </span>
            </div>
        `;

        if (holiday || dayIndex === 6) {
            let dot = document.createElement("div");
            dot.className = "holiday-dot";
            cell.appendChild(dot);

            let label = document.createElement("div");
            label.style.fontSize = "10px";
            label.style.color = "#d93025";
            label.innerText = holiday;
            cell.appendChild(label);

            cell.classList.add("holiday");
        }

        cell.dataset.date = dateObj.toISOString();

        renderDayEvents(cell, dateObj);

        cell.onclick = () => {
            today = dateObj;
            setView("day");
        };

        grid.appendChild(cell);
    }

    el.appendChild(grid);
}


function renderYear(el) {

    let p = new persianDate(today);
    let year = p.year();

    let wrapper = document.createElement("div");

    let header = document.createElement("div");
    header.style.padding = "10px";
    header.style.fontWeight = "bold";
    header.style.fontSize = "18px";
    header.innerText = `سال ${year}`;

    wrapper.appendChild(header);

    let grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(3,1fr)";
    grid.style.gap = "10px";


    header.innerText = `سال ${year}`;

    for (let m = 1; m <= 12; m++) {

        let monthStart = new persianDate([year, m, 1]);
        let daysInMonth = monthStart.daysInMonth();
        let startWeekDay = dayMap[
            monthStart.format("dddd")
        ];

        let cell = document.createElement("div");
        cell.className = "cell";

        cell.style.padding = "10px";
        cell.style.border = "1px solid #eee";
        cell.style.minHeight = "120px";
        cell.style.cursor = "pointer";

        let html = `
            <div style="font-weight:bold;margin-bottom:6px">
                ${monthStart.format("MMMM")}
            </div>

            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:10px;color:#555">
        `;

        const weekShort = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

        for (let i = 0; i < 7; i++) {
            html += `<div style="text-align:center;color:#999">${weekShort[i]}</div>`;
        }

        for (let i = 0; i < startWeekDay; i++) {
            html += `<div></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {

            let date = new persianDate([year, m, d]);
            let now = new persianDate();
            let isTodayCell =
                date.year() === now.year() &&
                date.month() === now.month() &&
                date.date() === now.date();

            html += `
                <div style="
                    text-align:center;
                    padding:2px;
                    border-radius:3px;
                    ${isTodayCell ? 'background:#1a73e8;color:white' : ''}
                ">
                    ${d}
                </div>
            `;
        }

        html += `</div>`;

        cell.innerHTML = html;

        cell.onclick = () => {
            today = monthStart.toDate();
            setView("month");
        };

        grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    el.appendChild(wrapper);
}


async function loadEvents(start, end) {
    const endpoint = new URL('index.php', window.location.href);
    endpoint.searchParams.set('start', start);
    endpoint.searchParams.set('end', end);
    const res = await fetch(endpoint);

    if (!res.ok) {
        throw new Error(`بارگذاری رویدادها ناموفق بود (${res.status})`);
    }

    const data = await res.json();

    events = data.map(item => ({
        id: item.id,
        title: item.title,
        start: new Date(item.start.replace(" ", "T")),
        end: new Date(item.end.replace(" ", "T")),
        color: item.color
    }));
}

