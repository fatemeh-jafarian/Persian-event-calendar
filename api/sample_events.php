<?php

/**
 * Sample calendar events for running the calendar without an application database.
 * Dates are generated relative to today so the current calendar views always have data.
 */
function sampleCalendarEvents(): array
{
    $items = [
        ['title' => 'جلسه برنامه‌ریزی', 'day' => -2, 'start' => '09:00', 'duration' => 60, 'color' => '#3498db', 'status' => 1],
        ['title' => 'پیگیری کارها', 'day' => -1, 'start' => '11:30', 'duration' => 45, 'color' => '#2ecc71', 'status' => 2],
        ['title' => 'جلسه تیم', 'day' => 0, 'start' => '10:00', 'duration' => 90, 'color' => '#3498db', 'status' => 1],
        ['title' => 'یادآوری پرداخت', 'day' => 0, 'start' => '14:00', 'duration' => 30, 'color' => '#2ecc71', 'status' => 1],
        ['title' => 'مرور هفتگی', 'day' => 1, 'start' => '13:00', 'duration' => 60, 'color' => '#f39c12', 'status' => 3],
        ['title' => 'تحویل پروژه', 'day' => 3, 'start' => '16:00', 'duration' => 60, 'color' => '#9b59b6', 'status' => 1],
        ['title' => 'جلسه با مشتری', 'day' => 6, 'start' => '09:30', 'duration' => 90, 'color' => '#3498db', 'status' => 2],
        ['title' => 'برنامه‌ریزی ماه آینده', 'day' => 12, 'start' => '10:30', 'duration' => 60, 'color' => '#f39c12', 'status' => 1],
        ['title' => 'یادآوری تمدید اشتراک', 'day' => 20, 'start' => '12:00', 'duration' => 30, 'color' => '#2ecc71', 'status' => 1],
        ['title' => 'ارائه نتیجه‌ها', 'day' => 35, 'start' => '15:00', 'duration' => 90, 'color' => '#9b59b6', 'status' => 3],
    ];

    $events = [];
    $today = new DateTimeImmutable('today');

    foreach ($items as $index => $item) {
        $start = $today->modify(sprintf('%+d days', $item['day']))
            ->setTime(...array_map('intval', explode(':', $item['start'])));
        $end = $start->modify('+' . $item['duration'] . ' minutes');

        $events[] = [
            'id' => $index + 1,
            'title' => $item['title'],
            'start' => $start->format('Y-m-d H:i:s'),
            'end' => $end->format('Y-m-d H:i:s'),
            'color' => $item['color'],
            'status' => $item['status'],
        ];
    }

    return $events;
}
