<?php

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

$movs = [];

$query = "SELECT * FROM treasurylog WHERE nif='true' AND efatcheck='false'";
$result = mysqli_query($con, $query);


if (mysqli_num_rows($result) !== 0) {

    while ($row = mysqli_fetch_assoc($result)) {
        array_push($movs, $row);
    }

} else {
    echo json_encode(['MHQERROR', 'Não foram encontrados movimentos para validar.']);
    return;
}

echo json_encode($movs);
