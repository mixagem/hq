
<?php

// post
$cats = json_decode($_POST["newcatorder"], true);

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');



$cats_length = count($cats);

for ($i = 0; $i < $cats_length ; $i++) {
  $query = "UPDATE categories SET catorder ='{$i}' WHERE id='{$cats[$i]}'";
  mysqli_query($con, $query);
}

echo json_encode(['Categorias <b>re-ordenadas</b> com sucesso.']);
