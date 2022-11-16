
<?php

// post
$subcats = json_decode($_POST["newsubcatorder"], true);

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');


$cats_length = count($subcats);


for ($i = 0; $i < $cats_length ; $i++) {
  $query = "UPDATE subcategories SET subcatorder ='{$i}' WHERE id='{$subcats[$i]}'";
  mysqli_query($con, $query);
}

echo json_encode(['Sub-categorias <b>re-ordenadas</b> com sucesso.']);
