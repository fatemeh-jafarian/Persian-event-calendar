<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/sample_events.php';

$start = isset($_GET['start']) ? strtotime($_GET['start']) : false;
$end = isset($_GET['end']) ? strtotime($_GET['end']) : false;
$events = sampleCalendarEvents();

if ($start !== false && $end !== false) {
    $events = array_values(array_filter($events, static function (array $event) use ($start, $end): bool {
        $eventStart = strtotime($event['start']);
        $eventEnd = strtotime($event['end']);

        return $eventStart <= $end && $eventEnd >= $start;
    }));
}

echo json_encode($events, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
