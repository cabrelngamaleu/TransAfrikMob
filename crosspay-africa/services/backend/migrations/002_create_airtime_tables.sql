-- Migration: Création des tables Airtime
-- Date: 2025-10-04
-- Description: Tables pour le système d'achat de crédit téléphonique

-- Extension UUID si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des transactions d'airtime
CREATE TABLE IF NOT EXISTS airtime_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  operator_id VARCHAR(50) NOT NULL,
  operator_name VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  external_transaction_id VARCHAR(255),
  points_earned INT DEFAULT 0,
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_airtime_transactions_user_id ON airtime_transactions(user_id);
CREATE INDEX idx_airtime_transactions_phone_number ON airtime_transactions(phone_number);
CREATE INDEX idx_airtime_transactions_status ON airtime_transactions(status);
CREATE INDEX idx_airtime_transactions_created_at ON airtime_transactions(created_at DESC);
CREATE INDEX idx_airtime_transactions_external_id ON airtime_transactions(external_transaction_id);

-- Table des opérateurs (optionnel, pour cache)
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(255) NOT NULL,
  denominations JSONB,
  commission DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  logo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operators_country_code ON operators(country_code);
CREATE INDEX idx_operators_external_id ON operators(external_id);
CREATE INDEX idx_operators_active ON operators(is_active) WHERE is_active = TRUE;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_airtime_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_airtime_transactions_updated_at 
BEFORE UPDATE ON airtime_transactions
FOR EACH ROW EXECUTE FUNCTION update_airtime_updated_at();

-- Insertion d'opérateurs de test (optionnel)
INSERT INTO operators (external_id, name, country_code, country_name, logo_url, is_active) VALUES
('341', 'MTN Cameroon', 'CM', 'Cameroun', 'https://logo.reloadly.com/mtn-cameroon.png', TRUE),
('340', 'Orange Cameroon', 'CM', 'Cameroun', 'https://logo.reloadly.com/orange-cameroon.png', TRUE),
('621', 'MTN Nigeria', 'NG', 'Nigeria', 'https://logo.reloadly.com/mtn-nigeria.png', TRUE),
('623', 'Airtel Nigeria', 'NG', 'Nigeria', 'https://logo.reloadly.com/airtel-nigeria.png', TRUE),
('129', 'MTN Ghana', 'GH', 'Ghana', 'https://logo.reloadly.com/mtn-ghana.png', TRUE),
('128', 'Vodafone Ghana', 'GH', 'Ghana', 'https://logo.reloadly.com/vodafone-ghana.png', TRUE)
ON CONFLICT (external_id) DO NOTHING;

-- Vue pour les statistiques d'airtime
CREATE OR REPLACE VIEW airtime_stats_by_user AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'SUCCESS') as successful_transactions,
  COUNT(*) FILTER (WHERE status = 'FAILED') as failed_transactions,
  SUM(amount) FILTER (WHERE status = 'SUCCESS') as total_amount_spent,
  SUM(points_earned) FILTER (WHERE status = 'SUCCESS') as total_points_earned,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'SUCCESS')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate,
  MAX(created_at) as last_purchase_date
FROM airtime_transactions
GROUP BY user_id;

-- Vue pour les statistiques par opérateur
CREATE OR REPLACE VIEW airtime_stats_by_operator AS
SELECT 
  operator_id,
  operator_name,
  country_code,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'SUCCESS') as successful_transactions,
  SUM(amount) FILTER (WHERE status = 'SUCCESS') as total_amount,
  ROUND(AVG(amount) FILTER (WHERE status = 'SUCCESS'), 2) as avg_amount,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'SUCCESS')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate
FROM airtime_transactions
GROUP BY operator_id, operator_name, country_code
ORDER BY total_transactions DESC;

-- Commentaires sur les tables
COMMENT ON TABLE airtime_transactions IS 'Historique des achats de crédit téléphonique';
COMMENT ON TABLE operators IS 'Liste des opérateurs mobiles disponibles';
COMMENT ON COLUMN airtime_transactions.external_transaction_id IS 'ID de transaction Reloadly';
COMMENT ON COLUMN airtime_transactions.points_earned IS 'Points gagnés (0.2% du montant)';

-- Permissions (ajuster selon votre configuration)
-- GRANT SELECT, INSERT, UPDATE ON airtime_transactions TO app_user;
-- GRANT SELECT ON operators TO app_user;
-- GRANT SELECT ON airtime_stats_by_user TO app_user;
-- GRANT SELECT ON airtime_stats_by_operator TO app_admin;
