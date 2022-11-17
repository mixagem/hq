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

    $query = "UPDATE treasurylog SET recurrencyid='0' WHERE id='{$tlog["id"]}'";
    $result = mysqli_query($con, $query);

    if (mysqli_affected_rows($con) === 0) {
      echo json_encode(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.', "Error while deleting category"]);
      return;
    }

    echo json_encode(['O movimento <b>' . $tlog["title"] . '</b> foi desancorado da recorrência com sucesso.']);
    break;

  case "budget":

    break;
}
