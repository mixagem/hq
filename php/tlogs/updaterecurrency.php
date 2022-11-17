<?php


// post
$type = $_POST["type"];

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$db_errors = [];


switch ($type) {
  case "tlog":

    $tlog = json_decode($_POST["tlog"], true);

    // conversões
    if ($tlog["nif"]) {
      $tlog["nif"] = "true";
    } else {
      $tlog["nif"] = "false";
    }
    $fields = json_decode($_POST["fields"], true);

    $query = "UPDATE treasurylog SET";
    $query_extra = "";
    foreach ($fields as &$field) {
      $query_extra .= " {$field}='{$tlog[$field]}',";
    }
    $query_extra = substr($query_extra, 0, -1);
    $query_extra .= " WHERE recurrencyid='{$tlog["recurrencyid"]}'";
    $full_query = $query . $query_extra;


    mysqli_query($con, $full_query);


    echo json_encode(['Foram atualizados <b>todos</b> os movimentos da recorrência.']);

    break;


  case "budget":

    break;
}
