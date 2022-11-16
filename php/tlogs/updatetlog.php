<?php


// post
$type = $_POST["type"];

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

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

    $query = "UPDATE treasurylog SET title='{$tlog["title"]}', date='{$tlog["date"]}', value='{$tlog["value"]}', cat='{$tlog["cat"]}', subcat='{$tlog["subcat"]}', type='{$tlog["type"]}', obs='{$tlog["obs"]}', nif='{$tlog["nif"]}', efat='{$tlog["efat"]}' WHERE id='{$tlog["id"]}'";

    mysqli_query($con, $query);
    if (mysqli_affected_rows($con) === 0) {
      echo json_encode(["MHQERROR", "Error while updating tlog"]);
      return;
    }

    echo json_encode(["O movimento <b>" . $tlog["title"] . "</b> foi atualizado com sucesso."]);

    break;


  case "budget":

    break;
}
