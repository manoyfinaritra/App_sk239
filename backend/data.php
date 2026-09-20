<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


$connexion = new PDO("mysql:host=localhost;dbname=sk239", "root", "");

$data = json_decode(file_get_contents("php://input"), true);

if($data["action"] === "savedata"){
    $Acct = $data["Acct"];
    $CallNO = $data["CallNO"];
    $Detector = $data["Detector"];
    $AlarmInfo = $data["AlarmInfo"];
    $AlarmTime = $data["AlarmTime"];
    $HandleRemark = $data["HandleRemark"];
   $sql = 'INSERT INTO rapports (`Acct`, `CallNO`, `Detector`, `AlarmInfo`, `AlarmTime`, `HandleRemark`)
        VALUES (?, ?, ?, ?, ?, ?)';
    $prepare = $connexion->prepare($sql);
   $isTrue = $prepare->execute([$Acct,$CallNO, $Detector, $AlarmInfo, $AlarmTime,$HandleRemark]);
   if($isTrue){
    echo json_encode("Enregistrement reussi");
   }
}

if ($data['action'] === "connexion") {

    $email = trim($data['email']);
    $motdepasse = $data['motdepasse'];

    // Rechercher l'utilisateur avec son email
    $sql = "SELECT * FROM users WHERE email = ?";
    $prepare = $connexion->prepare($sql);
    $prepare->execute([$email]);

    $user = $prepare->fetch(PDO::FETCH_ASSOC);

    // Vérifier si l'utilisateur existe
    if (!$user) {

        echo json_encode([
            "success" => false,
            "message" => "Email ou mot de passe incorrect",
            "user" => $user
        ]);
        exit;
    }

    // Vérifier le mot de passe
    if (password_verify($motdepasse, $user['motdepasse'])) {

        echo json_encode([
            "success" => true,
            "message" => "Connexion réussie",
            "user" => [
                "id" => $user["id"],
                "email" => $user["email"]
            ]
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Email ou mot de passe incorrect"
        ]);
    }
}

?>