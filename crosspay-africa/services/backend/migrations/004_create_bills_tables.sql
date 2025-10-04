-- Migration: Création des tables de paiement de factures
-- Date: 2025-10-04
-- Description: Tables pour paiement d'électricité, eau, internet, TV

-- Table des fournisseurs de factures
CREATE TABLE IF NOT EXISTS bill_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_type VARCHAR(50) NOT NULL CHECK (bill_type IN ('ELECTRICITY', 'WATER', 'INTERNET', 'TV')),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  logo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  min_amount DECIMAL(10, 2),
  max_amount DECIMAL(10, 2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_providers_type ON bill_providers(bill_type);
CREATE INDEX idx_bill_providers_country ON bill_providers(country);
CREATE INDEX idx_bill_providers_active ON bill_providers(is_active) WHERE is_active = TRUE;

-- Table des transactions de paiement de factures
CREATE TABLE IF NOT EXISTS bill_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  bill_type VARCHAR(50) NOT NULL,
  provider_id UUID NOT NULL REFERENCES bill_providers(id),
  provider_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) DEFAULT 'XOF',
  fee DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
  external_transaction_id VARCHAR(255),
  metadata JSONB,
  failure_reason TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_transactions_user_id ON bill_transactions(user_id);
CREATE INDEX idx_bill_transactions_status ON bill_transactions(status);
CREATE INDEX idx_bill_transactions_provider ON bill_transactions(provider_id);
CREATE INDEX idx_bill_transactions_created_at ON bill_transactions(created_at DESC);
CREATE INDEX idx_bill_transactions_type ON bill_transactions(bill_type);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bill_providers_updated_at 
BEFORE UPDATE ON bill_providers
FOR EACH ROW EXECUTE FUNCTION update_bills_updated_at();

CREATE TRIGGER update_bill_transactions_updated_at 
BEFORE UPDATE ON bill_transactions
FOR EACH ROW EXECUTE FUNCTION update_bills_updated_at();

-- Insertion des fournisseurs par défaut
INSERT INTO bill_providers (bill_type, code, name, country, min_amount, max_amount) VALUES
-- Cameroun
('ELECTRICITY', 'ENEO_CM', 'ENEO Cameroun', 'Cameroun', 1000, 500000),
('WATER', 'CAMWATER_CM', 'CAMWATER', 'Cameroun', 500, 200000),
('INTERNET', 'MTN_FIBER_CM', 'MTN Fiber', 'Cameroun', 10000, 100000),
('INTERNET', 'ORANGE_FIBER_CM', 'Orange Fiber', 'Cameroun', 10000, 100000),
('TV', 'CANAL_PLUS_CM', 'Canal+', 'Cameroun', 5000, 50000),

-- Côte d'Ivoire
('ELECTRICITY', 'CIE_CI', 'CIE Côte d''Ivoire', 'Côte d''Ivoire', 1000, 500000),
('WATER', 'SODECI_CI', 'SODECI', 'Côte d''Ivoire', 500, 200000),

-- Sénégal
('ELECTRICITY', 'SENELEC_SN', 'SENELEC', 'Sénégal', 1000, 500000),
('WATER', 'SDE_SN', 'SDE Sénégal', 'Sénégal', 500, 200000),

-- Nigeria
('ELECTRICITY', 'EKEDC_NG', 'Eko Electricity', 'Nigeria', 1000, 500000),
('ELECTRICITY', 'IKEDC_NG', 'Ikeja Electric', 'Nigeria', 1000, 500000),

-- Kenya
('ELECTRICITY', 'KPLC_KE', 'Kenya Power', 'Kenya', 1000, 500000),
('WATER', 'NCWSC_KE', 'Nairobi Water', 'Kenya', 500, 200000),

-- Ghana
('ELECTRICITY', 'ECG_GH', 'ECG Ghana', 'Ghana', 1000, 500000),
('WATER', 'GWCL_GH', 'Ghana Water', 'Ghana', 500, 200000),

-- TV (multi-pays)
('TV', 'DSTV_AFRICA', 'DStv', 'Multi-pays', 5000, 50000),
('TV', 'STARTIMES_AFRICA', 'StarTimes', 'Multi-pays', 3000, 30000);

-- Vue pour les statistiques par utilisateur
CREATE OR REPLACE VIEW bill_stats_by_user AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'SUCCESS') as successful_transactions,
  SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN status = 'SUCCESS' THEN fee ELSE 0 END) as total_fees,
  MAX(CASE WHEN status = 'SUCCESS' THEN created_at END) as last_payment_date,
  COUNT(DISTINCT bill_type) as bill_types_used
FROM bill_transactions
GROUP BY user_id;

-- Vue pour les statistiques par fournisseur
CREATE OR REPLACE VIEW bill_stats_by_provider AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.bill_type,
  p.country,
  COUNT(t.*) as total_transactions,
  COUNT(*) FILTER (WHERE t.status = 'SUCCESS') as successful_transactions,
  COUNT(*) FILTER (WHERE t.status = 'FAILED') as failed_transactions,
  ROUND(
    COUNT(*) FILTER (WHERE t.status = 'SUCCESS')::DECIMAL / 
    NULLIF(COUNT(t.*), 0) * 100,
    2
  ) as success_rate,
  SUM(CASE WHEN t.status = 'SUCCESS' THEN t.amount ELSE 0 END) as total_volume,
  AVG(CASE WHEN t.status = 'SUCCESS' THEN t.amount END) as avg_transaction_amount
FROM bill_providers p
LEFT JOIN bill_transactions t ON t.provider_id = p.id
GROUP BY p.id, p.code, p.name, p.bill_type, p.country;

-- Vue pour les factures récurrentes
CREATE OR REPLACE VIEW recurring_bills_analysis AS
SELECT 
  user_id,
  provider_id,
  provider_name,
  bill_type,
  account_number,
  COUNT(*) as payment_count,
  AVG(amount) as avg_amount,
  MAX(created_at) as last_payment,
  MIN(created_at) as first_payment,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 86400 / COUNT(*) as avg_days_between
FROM bill_transactions
WHERE status = 'SUCCESS'
GROUP BY user_id, provider_id, provider_name, bill_type, account_number
HAVING COUNT(*) >= 2;

-- Commentaires
COMMENT ON TABLE bill_providers IS 'Fournisseurs de factures (électricité, eau, internet, TV)';
COMMENT ON TABLE bill_transactions IS 'Transactions de paiement de factures';
COMMENT ON COLUMN bill_transactions.external_transaction_id IS 'ID de transaction retourné par le fournisseur';
COMMENT ON COLUMN bill_providers.code IS 'Code unique du fournisseur (ex: ENEO_CM)';
