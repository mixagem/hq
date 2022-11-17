<?php

// post
$type = $_POST["type"];

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$db_errors = [];

switch ($type) {

  case "tlog":
    $tlog_id = $_POST["tlogID"];

    $query = "DELETE FROM treasurylog WHERE id={$tlog_id}";
    $result = mysqli_query($con, $query);

    echo json_encode(["O movimento <b># " . $tlog_id . "</b> foi eliminado com sucesso."]);
    break;

  case "budget":

    break;
}
