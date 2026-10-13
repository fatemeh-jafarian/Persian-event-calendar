function toJalali(date) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}


function renderWeek(el) {

    let start = new Date(today);
    start.setDate(start.getDate() - start.getDay());

    let grid = document.createElement("div");

    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "60px repeat(7, 1fr)";
    grid.style.gridTemplateRows = "repeat(24, 60px)";

    // ساعت‌ها
    for (let h = 0; h < 24; h++) {

        // ستون ساعت
        let hour = document.createElement("div");
        hour.innerHTML = `${h}:00`;
        grid.appendChild(hour);

        // 7 روز
        for (let d = 0; d < 7; d++) {

            let cell = document.createElement("div");

            let date = new Date(start);
            date.setDate(start.getDate() + d);
            date.setHours(h);

            cell.className = "cell";
            cell.dataset.time = date.toISOString();

            cell.innerHTML = `
                <small>${toJalali(date).split(" ")[0]}</small>
            `;

            grid.appendChild(cell);
        }
    }

    el.appendChild(grid);

    enableCalendarInteractions();
}


function renderWeek(el) {

    let start = new Date(today);
    start.setDate(start.getDate() - start.getDay());

    let grid = document.createElement("div");

    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "60px repeat(7, 1fr)";
    grid.style.gridTemplateRows = "repeat(24, 60px)";

    // ساعت‌ها
    for (let h = 0; h < 24; h++) {

        // ستون ساعت
        let hour = document.createElement("div");
        hour.innerHTML = `${h}:00`;
        grid.appendChild(hour);

        // 7 روز
        for (let d = 0; d < 7; d++) {

            let cell = document.createElement("div");

            let date = new Date(start);
            date.setDate(start.getDate() + d);
            date.setHours(h);

            cell.className = "cell";
            cell.dataset.time = date.toISOString();

            cell.innerHTML = `
                <small>${toJalali(date).split(" ")[0]}</small>
            `;

            grid.appendChild(cell);
        }
    }

    el.appendChild(grid);

    enableCalendarInteractions();
}
