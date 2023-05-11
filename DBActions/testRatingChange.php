<?php
function getRatingChangeTest($whiteRating, $blackRating, $matchResult, $color) {
    $kFactor = 30;

    $expectedScoreWhite = 1 / (1 + pow(10, ($blackRating - $whiteRating) / 400));

    if ($color === "black" && $matchResult === 1) {
        $matchResult = 0;
    } else if ($color === "black" && $matchResult === 0) {
        $matchResult = 1;
    }

    $ratingChange = round($kFactor * ($matchResult - $expectedScoreWhite));

    if ($color === "white") {
        return $ratingChange;
    } else {
        return -$ratingChange;
    }
}

function testGetRatingChange() {
    $testCases = [
        ['whiteRating' => 1500, 'blackRating' => 1500, 'result' => 1, 'color' => 'white'],
        ['whiteRating' => 1500, 'blackRating' => 1500, 'result' => 0, 'color' => 'white'],
        ['whiteRating' => 1500, 'blackRating' => 1500, 'result' => 0.5, 'color' => 'white'],
        ['whiteRating' => 1500, 'blackRating' => 1500, 'result' => 1, 'color' => 'black'],
        ['whiteRating' => 1500, 'blackRating' => 1500, 'result' => 0, 'color' => 'black'],
        ['whiteRating' => 1500, 'blackRating' => 1500, 'result' => 0.5, 'color' => 'black'],
        ['whiteRating' => 1500, 'blackRating' => 1700, 'result' => 1, 'color' => 'white'],
        ['whiteRating' => 1500, 'blackRating' => 1700, 'result' => 0, 'color' => 'white'],
        ['whiteRating' => 1500, 'blackRating' => 1700, 'result' => 0.5, 'color' => 'white'],
        ['whiteRating' => 1500, 'blackRating' => 1700, 'result' => 1, 'color' => 'black'],
        ['whiteRating' => 1500, 'blackRating' => 1700, 'result' => 0, 'color' => 'black'],
        ['whiteRating' => 1500, 'blackRating' => 1700, 'result' => 0.5, 'color' => 'black'],
        ['whiteRating' => 1700, 'blackRating' => 1500, 'result' => 1, 'color' => 'white'],
        ['whiteRating' => 1700, 'blackRating' => 1500, 'result' => 0, 'color' => 'white'],
        ['whiteRating' => 1700, 'blackRating' => 1500, 'result' => 0.5, 'color' => 'white'],
        ['whiteRating' => 1700, 'blackRating' => 1500, 'result' => 1, 'color' => 'black'],
        ['whiteRating' => 1700, 'blackRating' => 1500, 'result' => 0, 'color' => 'black'],
        ['whiteRating' => 1700, 'blackRating' => 1500, 'result' => 0.5, 'color' => 'black'],
    ];

    foreach ($testCases as $testCase) {
        $ratingChange = getRatingChangeTest($testCase['whiteRating'], $testCase['blackRating'], $testCase['result'], $testCase['color']);
        echo "White Rating: {$testCase['whiteRating']}, Black Rating: {$testCase['blackRating']}, Result: {$testCase['result']}, Color: {$testCase['color']}, Rating Change: {$ratingChange}<br>";
    }
}

testGetRatingChange();

