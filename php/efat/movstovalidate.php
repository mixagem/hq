<?php

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$movs = [];

$query = "SELECT * FROM treasurylog WHERE nif='true' AND efatcheck='false'";
$result = mysqli_query($con, $query);


if (mysqli_num_rows($result) !== 0) {

    while ($row = mysqli_fetch_assoc($result)) {
        array_push($movs, $row);
    }

} else {
    echo json_encode([]);
    return;
}

echo json_encode($movs);
