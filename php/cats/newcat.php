<?php

// post
$cat = json_decode($_POST["category"], true);

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$db_errors = [];

//name-check categorias
$query = "SELECT * FROM categories WHERE lower(title) = '" . strtolower($cat["title"]) . "'";

$result = mysqli_query($con, $query);

if (mysqli_num_rows($result) !== 0) {
  array_push($db_errors, "O título <b>" . $cat["title"] . "</b> já se encontra em uso por uma outra categoria.");
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
      if (in_array(strtolower($existing_subcats[$i]["title"]), $temp_subcat_titles) && $existing_subcats[$i]["maincatid"] !== $cat["id"]) {
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

// obter sequencia ordem
$order_sequence = 9999;
$query = "SELECT MAX(catorder) as max from categories";
$result = mysqli_query($con, $query);

  while ($row = mysqli_fetch_assoc($result)) {
    $order_sequence = intval($row["max"]) + 1;
  }


//introdução nova cat
$query = "INSERT INTO categories (title, icon, type, bgcolor, textcolor, active, catorder) VALUES ('{$cat["title"]}','{$cat["icon"]}','{$cat["type"]}','{$cat["bgcolor"]}','{$cat["textcolor"]}','" . json_encode($cat["active"]) . "', '{$order_sequence}')";

mysqli_query($con, $query);


// obter sequencia categoria
$query = "SELECT MAX(id) as max from categories";
$result = mysqli_query($con, $query);

while ($row = mysqli_fetch_assoc($result)) {
  $cat_seq = intval($row["max"]);
}


// atualização das subcats
if ($subcats_length !== 0) {
  $i = 0;
  foreach ($cat["subcats"] as &$subcat) {
    $query = "INSERT INTO subcategories (maincatid, title, budget, active, subcatorder) VALUES ('{$cat_seq}', '{$subcat["title"]}', '{$subcat["budget"]}', '{$subcat["active"]}', '{$i}' )";
    mysqli_query($con, $query);
    $i++;
  }
}

echo json_encode([strval($cat_seq)]);

?>
