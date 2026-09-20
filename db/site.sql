-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 20 sep. 2026 à 14:50
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `sk239`
--

-- --------------------------------------------------------

--
-- Structure de la table `site`
--

CREATE TABLE `site` (
  `id` int(11) NOT NULL,
  `acct` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `numeros` varchar(30) DEFAULT NULL,
  `da` varchar(100) DEFAULT NULL,
  `sa` varchar(100) DEFAULT NULL,
  `ccl` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `site`
--

INSERT INTO `site` (`id`, `acct`, `nom`, `numeros`, `da`, `sa`, `ccl`) VALUES
(1, 311, 'BRED BANQUE ANDRAHARO', '+261321174395', 'Mme LINA', '', 'Mme ARISOA'),
(2, 318, 'BRED BANQUE BYPASS', '+261321174243', 'Mr LEO', 'Mr ROJO', ''),
(3, 329, 'BRED BANQUE ANTSIRABE', '+261320329862', 'Mr CHRISTIAN', 'Mr DINA', ''),
(4, 314, 'GAB BRED BANQUE TANA WATERFRONT', '+261321174418', '', '', ''),
(5, 315, 'GAB BRED BANQUE ANDRANOTAPAHANA', '+261321174246', '', '', ''),
(6, 313, 'BRED BANQUE LA CITY IVANDRY', '+261321174397', 'Mr LALAINA', 'Mr HERILANTO', 'Mr FINARITRA'),
(7, 316, 'BRED BANQUE ILAFY', '+261321174244', 'Mme MICHELLE', 'Mr NOELY', ''),
(8, 300, 'GAB BRED BANQUE MAHAZO', '+261321174141', '', '', ''),
(9, 305, 'BRED BANQUE AMBATONDRAZAKA', '+261321174220', 'Mr ANDRIANINA', 'Mr RIVO', 'Mr LALA'),
(10, 317, 'BRED BANQUE ANOSIALA', '+261321174245', 'Mme MBOLA', 'Mme VOAHANGY', ''),
(11, 333, 'BRED BANQUE MANJAKANDRIANA', '+261321174249', 'Mme FITIA', 'Mme FITIA', 'Mme FITIA'),
(12, 306, 'GAB BRED BANQUE ANTSAHAVOLA', '+261321174121', '', '', ''),
(13, 312, 'GAB BRED BANQUE DZAMANDZAR', '+261321174443', '', '', ''),
(14, 309, 'GAB BRED BANQUE MALAZA', '+261321174431', '', '', ''),
(15, 320, 'GAB BRED BANQUE SAINTE MARIE', '+261321174247', '', '', ''),
(16, 302, 'BRED BANQUE AMBANJA', '+261321174169', 'Mme JUDY', 'Mr ASSANY', '');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `site`
--
ALTER TABLE `site`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `site`
--
ALTER TABLE `site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
