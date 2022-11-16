<?php

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

//categorias
$query = "SELECT MAX(id) as max FROM subcategories";
$result = mysqli_query($con, $query);

if (mysqli_num_rows($result) !== 0) {
  while ($row = mysqli_fetch_assoc($result)) {
    echo json_encode([strval($row["max"])]);
  }
} else {
  echo json_encode(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
}

mysqli_close($con);
