<?php
// Array of file paths
$songPaths = [
    "greedy" => "/storage/emulated/0/My website/Alan Walker/Cristale.mp3",
    "11 ilomilo" => "/storage/emulated/0/Venter/HopWeb/Projects/Practice/11 ilomilo.mp3",
    "yet_another_song" => "/storage/emulated/0/Venter/HopWeb/Projects/Practice/yet_another_song.mp3"
];

// Default song if not specified
$defaultSong = "greedy";

// Check if the song parameter is provided in the URL
if(isset($_GET['song']) && array_key_exists($_GET['song'], $songPaths)) {
    $selectedSong = $_GET['song'];
} else {
    $selectedSong = $defaultSong;
}

// Set the selected song path
$songPath = $songPaths[$selectedSong];

// Check if the file exists
if (file_exists($songPath)) {
    // Output appropriate content type header
    header('Content-Type: audio/mpeg');
    
    // Output the file
    readfile($songPath);
    exit;
} else {
    // File not found, output an error message
    echo "File not found.";
}
?>
