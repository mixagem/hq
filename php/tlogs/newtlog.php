<?php

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

if ($tlog["nif"]) {
  $tlog["nif"] = "true";
} else {
  $tlog["nif"] = "false";
}

$recurr = json_decode($_POST["recurrency"], true);

// echo $tlog["date"];
$r_day = date('j', intval($tlog["date"] / 1000));
$r_month = date('n', intval($tlog["date"] / 1000));
$r_year = date('Y', intval($tlog["date"]) / 1000);



//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');
$db_errors = [];



if ($recurr["active"] === true) {

  $recurr_seq = 9999;
  $query = "SELECT MAX(recurrencyid) as max from treasurylog";
  $result = mysqli_query($con, $query);

  while ($row = mysqli_fetch_assoc($result)) {
    $recurr_seq = intval($row["max"]) + 1;
  }


  $date = new DateTime();

  switch ($recurr["type"]) {

    case "m":

      for ($i = 0; $i < intval($recurr["freq"]); $i++) {
        $date->setDate($r_year, $r_month, $r_day);
        if (intval($r_month) === 12) {
          $r_month = 1;
          $r_year = intval($r_year) + 1;
        } else {
          $r_month = intval($r_month) + 1;
        }
        $date_ms = intval($date->getTimestamp()) * 1000;



        $query = "INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('{$tlog["title"]}', '" . $date_ms . "', '{$tlog["value"]}', '{$tlog["cat"]}', '{$tlog["subcat"]}', '{$tlog["type"]}', '{$tlog["obs"]}', '{$recurr_seq}', '{$tlog["nif"]}', '{$tlog["efat"]}')";

        mysqli_query($con, $query);
      }
      $query = "SELECT MAX(id) as max from treasurylog";
      $result = mysqli_query($con, $query);

      while ($row = mysqli_fetch_assoc($result)) {
        $tlog_seq = intval($row["max"]);
      }
      echo json_encode([$tlog_seq, "O movimento <b>" . $tlog["title"] . "</b> foi criado com sucesso."]);



      break;


    case "a":

      for ($i = 0; $i < intval($recurr["freq"]); $i++) {
        $date->setDate(intval($r_year) + $i, $r_month, $r_day);
        $date_ms = intval($date->getTimestamp()) * 1000;

        $query = "INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('{$tlog["title"]}', '" . $date_ms . "', '{$tlog["value"]}', '{$tlog["cat"]}', '{$tlog["subcat"]}', '{$tlog["type"]}', '{$tlog["obs"]}', '{$recurr_seq}', '{$tlog["nif"]}', '{$tlog["efat"]}')";

        mysqli_query($con, $query);
      }
      $query = "SELECT MAX(id) as max from treasurylog";
      $result = mysqli_query($con, $query);

      while ($row = mysqli_fetch_assoc($result)) {
        $tlog_seq = intval($row["max"]);
      }
      echo json_encode([$tlog_seq, "O movimento <b>" . $tlog["title"] . "</b> foi criado com sucesso."]);



      break;
  }
}
if ($recurr["active"] === false) {


  $query = "INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('{$tlog["title"]}', '{$tlog["date"]}', '{$tlog["value"]}', '{$tlog["cat"]}', '{$tlog["subcat"]}', '{$tlog["type"]}', '{$tlog["obs"]}', '0', '{$tlog["nif"]}', '{$tlog["efat"]}')";

  mysqli_query($con, $query);



  $query = "SELECT MAX(id) as max from treasurylog";
  $result = mysqli_query($con, $query);

  while ($row = mysqli_fetch_assoc($result)) {
    $tlog_seq = $row["max"];
  }
  echo json_encode([$tlog_seq, "O movimento <b>" . $tlog["title"] . "</b> foi criado com sucesso."]);
}
