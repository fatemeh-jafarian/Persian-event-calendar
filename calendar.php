<?php

$guides = [
        [
                'name' => 'جلسات',
                'color' => '#3498db'
        ],
        [
                'name' => 'تعطیلات',
                'color' => '#e74c3c'
        ],
        [
                'name' => 'یادآوری‌ها',
                'color' => '#2ecc71'
        ],
        [
                'name' => 'رویدادها',
                'color' => '#f39c12'
        ],
        [
                'name' => 'کارهای شخصی',
                'color' => '#9b59b6'
        ]
];

?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>تقویم فارسی</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="assets/js/jalali.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
<div class="show-calendar">

    <div class="topbar">

        <div class="date-seperate">
            <button class="view-btn" id="day-btn" onclick="setView('day')">روز</button>
            <button class="view-btn" id="week-btn" onclick="setView('week')">هفته</button>
            <button class="view-btn" id="month-btn" onclick="setView('month')">ماه</button>
            <button class="view-btn" id="year-btn" onclick="setView('year')">سال</button>
        </div>

        <div class="guide">
            <?php foreach ($guides as $guide) { ?>
                <div class="guide-item" style="display:flex; align-items:center; gap:5px; margin-left:15px;">
                    <div class="guide-color"
                        style="width:15px;
                        height:15px;
                        border-radius:50%;
                        background-color:<?= htmlspecialchars($guide['color']) ?>;">
                    </div>

                    <div class="guide-text">
                        <?= htmlspecialchars($guide['name']) ?>
                    </div>
                </div>
            <?php } ?>
        </div>

        <div class="controll-btn">
            <button onclick="prev()" data-popup='tooltip' title="قبل">→</button>
            <button onclick="next()" data-popup='tooltip' title="بعد">←</button>
            <button onclick="goToday()">امروز</button>
        </div>
    </div>

    <div id="calendar"></div>
</div>
<!-- <input type="text" id="datePicker" placeholder="انتخاب تاریخ"> -->
<script src="assets/js/calendar.js?v=<?= filemtime('assets/js/calendar.js') ?>"></script>
</body>
</html>
