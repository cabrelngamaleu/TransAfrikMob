-- Migration: Création des tables de micro-prêts
-- Date: 2025-10-04

CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  duration_days INT NOT NULL,
  total_repayment DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISBURSED', 'REPAYING', 'PAID', 'DEFAULTED')),
  credit_score INT DEFAULT 0,
  due_date DATE NOT NULL,
  scoring_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(due_date);
