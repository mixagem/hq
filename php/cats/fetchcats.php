<?php

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

//categorias
$query = "SELECT * FROM categories ORDER BY catorder";
$result = mysqli_query($con, $query);

if (mysqli_num_rows($result) !== 0) {

  // foreach categorias
  while ($row = mysqli_fetch_assoc($result)) {

    // conversões
    if ($row["active"]) {
      $row["active"] = true;
    } else {
      $row["active"] = false;
    }

    $row["id"] = intval($row["id"]);
    $row["catorder"] = intval($row["catorder"]);
    // subcategorias array
    $row["subcats"] = [];

    // push to array
    $cats[] = $row;
  }

  // sub-categorias
  $query = "SELECT * FROM subcategories ORDER BY subcatorder";
  $result = mysqli_query($con, $query);

  if (mysqli_num_rows($result) !== 0) {

    // foreach sub-categorias
    while ($row = mysqli_fetch_assoc($result)) {


      $cats_length = count($cats);
      $cat_index = 0;

      // obter index da categoria à qual a sub-categoria pertence
      for ($i = 0; $i < $cats_length; $i++) {
        if (intval($cats[$i]["id"]) === intval($row["maincatid"])) {
          $cat_index = $i;
          break;
        }
      }

      // conversões
      if (str_replace('"', '', json_encode($row["active"])) === "true") {
        $row["active"] = true;
      } else {
        $row["active"] = false;
      }

      $row["budget"] = intval($row["budget"]);
      $row["id"] = intval($row["id"]);
      $row["maincatid"] = intval($row["maincatid"]);
      $row["subcatorder"] = intval($row["subcatorder"]);

      // anexa subcategoria à categoria
      if ($cats_length !== 0) {
        array_push($cats[$cat_index]["subcats"], $row);
      }
    }
  }
  echo json_encode($cats);
} else {
  echo json_encode(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
}

mysqli_close($con);
