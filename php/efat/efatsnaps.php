<?php

//bd
$con = mysqli_connect('localhost', 'root', '', 'hq');

$efaturas = [];
for ($i = 1; $i <= 6; $i++) {
    $query = "SELECT SUM(value) AS sum FROM efatura WHERE efatcat='{$i}'";
    $result = mysqli_query($con, $query);
    if (mysqli_num_rows($result) !== 0) {

        while ($row = mysqli_fetch_assoc($result)) {

            if ($row['sum'] === null) {
                array_push($efaturas, 0);
            } else {
                array_push($efaturas, intval($row['sum']));
            }
        }

    } else {
        echo json_encode(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
        return;
    }

}

echo json_encode($efaturas);
