<?php

// post
$cat = json_decode($_POST["cat"], true);

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

$db_errors = [];

$query = "DELETE FROM categories WHERE id={$cat["id"]}";
$result = mysqli_query($con, $query);

if (mysqli_affected_rows($con) === 0) {
  echo json_encode(["Error while deleting category"]);
  return;
}

$query = "DELETE FROM subcategories WHERE maincatid={$cat["id"]}";
$result = mysqli_query($con, $query);

echo json_encode(['A categoria <b>' . $cat["title"] . '</b> foi eliminada com sucesso.']);