-- ============================================================
-- Natirèl CBD — Caisse
-- Schéma de la base de données (MySQL / MariaDB, ex. Hostinger)
-- À importer une seule fois via phpMyAdmin avant le premier usage.
-- ============================================================

CREATE TABLE IF NOT EXISTS produits (
  id VARCHAR(40) PRIMARY KEY,
  nom VARCHAR(190) NOT NULL,
  categorie VARCHAR(120) NOT NULL DEFAULT 'Autres',
  prix_ttc DECIMAL(10,2) NOT NULL,
  taux_tva DECIMAL(4,2) NOT NULL,
  supprime TINYINT(1) NOT NULL DEFAULT 0,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employes (
  id VARCHAR(40) PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  pin CHAR(4) NOT NULL,
  supprime TINYINT(1) NOT NULL DEFAULT 0,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ventes (
  id VARCHAR(40) PRIMARY KEY,
  date_iso DATETIME NOT NULL,
  remise DECIMAL(10,2) NOT NULL DEFAULT 0,
  mode_paiement ENUM('especes','cb') NOT NULL,
  montant_recu DECIMAL(10,2) NULL,
  total DECIMAL(10,2) NOT NULL,
  annulee TINYINT(1) NOT NULL DEFAULT 0,
  employe_id VARCHAR(40) NULL,
  employe_nom VARCHAR(120) NULL,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date_iso),
  INDEX idx_employe (employe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vente_lignes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vente_id VARCHAR(40) NOT NULL,
  produit_id VARCHAR(40) NOT NULL,
  nom VARCHAR(190) NOT NULL,
  prix_ttc DECIMAL(10,2) NOT NULL,
  taux_tva DECIMAL(4,2) NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reglages (
  id TINYINT PRIMARY KEY,
  nom VARCHAR(190),
  adresse VARCHAR(190),
  ville VARCHAR(190),
  tva VARCHAR(40),
  siret VARCHAR(40),
  naf VARCHAR(20),
  fond_caisse_initial DECIMAL(10,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
