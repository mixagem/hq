<?php

// post
$type = $_POST["type"];

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$db_errors = [];

switch ($type) {

  case "tlog":
    $recurr_id = $_POST["recurrencyID"];

    $query = "DELETE from treasurylog WHERE recurrencyid='{$recurr_id}'";
    $result = mysqli_query($con, $query);

    echo json_encode(["Foram eliminados com sucesso <b>todos os movimentos</b> da mesma recorrência."]);
    break;

  case "budget":

    break;
}
