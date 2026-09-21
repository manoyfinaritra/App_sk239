<?php

try {

    // Connexion à la base de données
    $connexion = new PDO(
        "mysql:host=localhost;dbname=sk239;charset=utf8mb4",
        "root",
        ""
    );

    // Afficher les erreurs PDO
    $connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Données de l'utilisateur
    $email = "manoyfinaritra@gmail.com";
    $motdepasse = "CTMMDS";

    // Hachage du mot de passe
    $motdepasseHash = password_hash($motdepasse, PASSWORD_DEFAULT);

    // Insertion
    $sql = "INSERT INTO users (email, motdepasse) VALUES (?, ?)";

    $prepare = $connexion->prepare($sql);

    $prepare->execute([
        $email,
        $motdepasseHash
    ]);

    echo "Utilisateur enregistré avec succès.";

} catch (PDOException $e) {

    echo "Erreur : " . $e->getMessage();

}