<?php

// post
$efat = json_decode($_POST["efatura"], true);

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$query = "INSERT INTO efatura (tlogid, efatcat, value, year) VALUES ('{$efat["tlogid"]}', '{$efat["efat"]}', '{$efat["value"]}', '{$efat["year"]}')";
mysqli_query($con, $query);
if (mysqli_affected_rows($con) === 0) {
    echo json_encode(["MHQERROR","Error while inserting efat"]);
    return;
}

$query="UPDATE treasurylog SET efatcheck = 'true' WHERE id = '{$efat["tlogid"]}'";
mysqli_query($con, $query);
if (mysqli_affected_rows($con) === 0) {
    echo json_encode(["MHQERROR","Error while updating treasury log"]);
    return;
}

echo json_encode(["O movimento <b>{$efat["tlogtitle"]}</b> foi validado com sucesso."]);