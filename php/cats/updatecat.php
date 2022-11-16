<?php

// post
$cat = json_decode($_POST["category"], true);

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

$db_errors = [];

//name-check categorias
$query = "SELECT * FROM categories WHERE lower(title) = '" . strtolower($cat["title"]) . "'";

$result = mysqli_query($con, $query);

if (mysqli_num_rows($result) !== 0) {
  while ($row = mysqli_fetch_assoc($result)) {
    if (intval($row["id"]) !== intval($cat["id"])) {
      array_push($db_errors, "O título <b>" . $cat["title"] . "</b> já se encontra em uso por uma outra categoria.");
    }
  }
}

// name-check subcategorias
$subcats_length = count($cat["subcats"]);
if ($subcats_length > 0) {

  // verificação nomes em duplicado
  $temp_subcat_titles = [];
  for ($i = 0; $i < $subcats_length; $i++) {
    if (in_array(strtolower($cat["subcats"][$i]["title"]), $temp_subcat_titles)) {
      array_push($db_errors, "O título <b>" . $cat["subcats"][$i]["title"] . "</b> foi definido para diferentes subcategorias.");
      break;
    } else {
      array_push($temp_subcat_titles, strtolower($cat["subcats"][$i]["title"]));
    }
  }

  // verificar existencia dos títulos em bd - query builder
  $query = "SELECT * FROM subcategories WHERE lower(title) IN (";
  $query_extra = "";

  if ($subcats_length !== 0) {
    foreach ($cat["subcats"] as &$value) {
      $query_extra .= "'" . (strtolower($value["title"]) . "', ");
    }
    $query_extra = substr($query_extra, 0, -2);
    $query_extra .= ")";
    $full_query = $query . $query_extra;
  }


  $result = mysqli_query($con, $full_query);

  //  verificar existencia dos títulos em bd  - query runner
  if (mysqli_num_rows($result) !== 0) {

    // foreach sub-categorias já existentes em bd
    while ($row = mysqli_fetch_assoc($result)) {
      $existing_subcats[] = $row;
    }
    $result_length = count($existing_subcats);


    for ($i = 0; $i < $result_length; $i++) {
      // excepção para quando estamos a editar o registo a qual as subcategorias pertencem
      if (intval($existing_subcats[$i]["maincatid"]) !== intval($cat["id"])) {
        array_push($db_errors, "O título da subcategoria <b>" . $existing_subcats[$i]["title"] . "</b> já se encontra em uso.");
        break;
      }
    }
  }
}


// fim verificação nomes duplicados
if ($db_errors) {
  echo json_encode(['MHQERROR', ...$db_errors]);
  return;
}

//atualização da cat
$query = "UPDATE categories SET title='{$cat["title"]}', type='{$cat["type"]}', icon='{$cat["icon"]}', bgcolor='{$cat["bgcolor"]}', textcolor='{$cat["textcolor"]}', active='" . json_encode($cat["active"]) . "', catorder='{$cat["catorder"]}' WHERE id={$cat["id"]}'";

mysqli_query($con, $query);
if (mysqli_affected_rows($con) === 0) {
  echo json_encode(["Error while updating category"]);
  return;
}

// atualização das subcats
if ($subcats_length !== 0) {

  $query = "DELETE FROM subcategories WHERE maincatid='{$cat["id"]}'";
  mysqli_query($con, $query);

  if (mysqli_affected_rows($con) === 0) {
    echo json_encode(["Error while deleting subcategories"]);
    return;
  }

  $i = 0;
  foreach ($cat["subcats"] as &$subcat) {
    $query = "INSERT INTO subcategories (maincatid, title, budget, active, subcatorder) VALUES ('{$cat["id"]}', '{$subcat["title"]}', '{$subcat["budget"]}', '{$subcat["active"]}', '{$i}' )";

    mysqli_query($con, $query);
    if (mysqli_affected_rows($con) === 0) {
      echo json_encode(["Error while inserting subcategories"]);
      return;
    }
    $i++;
  }
}

echo json_encode(['A categoria <b>' . $cat["title"] . '</b> e respetivas subcategorias foram atualizadas com sucesso.']);
