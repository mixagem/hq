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

    $query = "UPDATE treasurylog SET title='{$tlog["title"]}', date='{$tlog["date"]}', value='{$tlog["value"]}', cat='{$tlog["cat"]}', subcat='{$tlog["subcat"]}', type='{$tlog["type"]}', obs='{$tlog["obs"]}', nif='{$tlog["nif"]}', efat='{$tlog["efat"]}' WHERE id='{$tlog["id"]}'";

    mysqli_query($con, $query);

    echo json_encode(["O movimento <b>" . $tlog["title"] . "</b> foi atualizado com sucesso."]);

    break;


  case "budget":

    break;
}
