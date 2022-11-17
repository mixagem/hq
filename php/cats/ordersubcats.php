
<?php

// post
$subcats = json_decode($_POST["newsubcatorder"], true);

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');

$cats_length = count($subcats);


for ($i = 0; $i < $cats_length ; $i++) {
  $query = "UPDATE subcategories SET subcatorder ='{$i}' WHERE id='{$subcats[$i]}'";
  mysqli_query($con, $query);
}

echo json_encode(['Sub-categorias <b>re-ordenadas</b> com sucesso.']);
