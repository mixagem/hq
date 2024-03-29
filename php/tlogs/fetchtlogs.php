<?php

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

//tlogs
$query = "SELECT * FROM treasurylog ORDER BY date DESC";
$result = mysqli_query($con, $query);

if (mysqli_num_rows($result) !== 0) {

  // foreach tlogs
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

mysqli_close($con);
