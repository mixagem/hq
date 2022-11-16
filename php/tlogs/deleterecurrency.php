<?php

// post
$type = $_POST["type"];

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

$db_errors = [];

switch ($type) {

  case "tlog":
    $recurr_id = $_POST["recurrencyID"];

    $query = "DELETE from treasurylog WHERE recurrencyid='{$recurr_id}'";
    $result = mysqli_query($con, $query);

    if (mysqli_affected_rows($con) === 0) {
      echo json_encode(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      return;
    }

    echo json_encode(["Foram eliminados com sucesso <b>todos os movimentos</b> da mesma recorrência."]);
    break;

  case "budget":

    break;
}
