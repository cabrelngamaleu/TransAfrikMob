-- Migration: Création des tables de cartes virtuelles
-- Date: 2025-10-04

CREATE TABLE IF NOT EXISTS virtual_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  stripe_card_id VARCHAR(255) NOT NULL UNIQUE,
  cardholder_name VARCHAR(255) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  exp_month INT NOT NULL,
  exp_year INT NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'CANCELLED')),
  spending_limit DECIMAL(10, 2) DEFAULT 0,
  current_spending DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'XOF',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  stripe_authorization_id VARCHAR(255) NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  merchant_category VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'XOF',
  status VARCHAR(20) DEFAULT 'APPROVED',
  cashback DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_virtual_cards_user ON virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_status ON virtual_cards(status);
CREATE INDEX idx_card_transactions_card ON card_transactions(card_id);
CREATE INDEX idx_card_transactions_user ON card_transactions(user_id);
