
<?php

// post
$cats = json_decode($_POST["newcatorder"], true);

$con = mysqli_connect('localhost', 'root', '', 'hq');
// $con = mysqli_connect('localhost', 'mambosin_hqroot', 'ViSZs[FcJNGF', 'mambosin_hq');
mysqli_set_charset($con, 'utf8');


$cats_length = count($cats);

for ($i = 0; $i < $cats_length ; $i++) {
  $query = "UPDATE categories SET catorder ='{$i}' WHERE id='{$cats[$i]}'";
  mysqli_query($con, $query);
}

echo json_encode(['Categorias <b>re-ordenadas</b> com sucesso.']);
