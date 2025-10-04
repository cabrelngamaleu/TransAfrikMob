-- Migration: Création des tables crypto/Web3
-- Date: 2025-10-04

CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  encrypted_private_key TEXT NOT NULL,
  btc_balance DECIMAL(18, 8) DEFAULT 0,
  eth_balance DECIMAL(18, 8) DEFAULT 0,
  usdt_balance DECIMAL(18, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crypto_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('BUY', 'SELL', 'SEND', 'RECEIVE', 'SWAP')),
  crypto_currency VARCHAR(10) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  fiat_amount DECIMAL(10, 2),
  fiat_currency VARCHAR(10) DEFAULT 'XOF',
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  tx_hash VARCHAR(255),
  to_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crypto_wallets_user ON crypto_wallets(user_id);
CREATE INDEX idx_crypto_transactions_user ON crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_type ON crypto_transactions(type);
