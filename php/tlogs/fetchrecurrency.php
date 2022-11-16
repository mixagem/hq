<?php

// post
$type = $_POST["type"];

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

$db_errors = [];

switch ($type) {

  case "tlog":
    $tlog_id = $_POST["tlogID"];
    $recurr_id = $_POST["recurID"];

    $query = "SELECT * FROM treasurylog WHERE recurrencyid='{$recurr_id}' AND NOT id='{$tlog_id}' ORDER BY date DESC";
    $result = mysqli_query($con, $query);

    if (mysqli_num_rows($result) !== 0) {


      while ($row = mysqli_fetch_assoc($result)) {

        // conversões
        if (str_replace('"', '', json_encode($row["nif"])) === "true") {
          $row["nif"] = true;
        } else {
          $row["nif"] = false;
        }

        if (str_replace('"', '', json_encode($row["efatcheck"])) === "true") {
          $row["efatcheck"] = true;
        } else {
          $row["efatcheck"] = false;
        }

        $row["id"] = intval($row["id"]);
        $row["date"] = intval($row["date"]);
        $row["value"] = floatval($row["value"]);
        $row["cat"] = intval($row["cat"]);
        $row["subcat"] = intval($row["subcat"]);
        $row["recurrencyid"] = intval($row["recurrencyid"]);


        // push to array
        $tlogs[] = $row;
      }

      echo json_encode($tlogs);
    } else {
      echo json_encode(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      }
    break;

  case "budget":

    break;
}


