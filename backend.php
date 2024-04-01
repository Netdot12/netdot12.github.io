<?php

$songs = [
    [
        'id' => 1,
        'title' => 'Song 1',
        'file_path' => 'dax.mp3'
    ],
    [
        'id' => 2,
        'title' => 'Song 2',
        'file_path' => 'god.mp3' // Assuming the file is in the same directory as index.html
    ],
    [
        'id' => 3,
        'title' => 'Song 3',
        'file_path' => 'greedy.mp3' // Adjust the path as needed
    ]
];

// Get the ID of the song to be played (you can change this dynamically)
$songId = isset($_GET['song_id']) ? $_GET['song_id'] : null;

// Find the song in the $songs array based on the ID
$song = null;
foreach ($songs as $s) {
    if ($s['id'] == $songId) {
        $song = $s;
        break;
    }
}

// Output the selected song as JSON
header('Content-Type: application/json');
echo json_encode($song);

?>