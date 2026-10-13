<?php
if (isset($_GET['start']) || isset($_GET['end'])) {
    require __DIR__ . '/api/calendar_query.php';
    exit;
}

require __DIR__ . '/calendar.php';
