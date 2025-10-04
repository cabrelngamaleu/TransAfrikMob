-- Migration: Création des tables de gamification
-- Date: 2025-10-04
-- Description: Tables pour le système de points, badges, et parrainage

-- Table des points utilisateurs
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  points BIGINT DEFAULT 0,
  level VARCHAR(20) DEFAULT 'BRONZE' CHECK (level IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND')),
  total_points_earned BIGINT DEFAULT 0,
  total_points_redeemed BIGINT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_level ON user_points(level);
CREATE INDEX idx_user_points_points ON user_points(points DESC);

-- Table des transactions de points
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  points INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  metadata JSONB,
  balance_after BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_action ON point_transactions(action);

-- Table des badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  rarity VARCHAR(20) DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  point_value INT DEFAULT 0,
  requirements JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badges_code ON badges(code);
CREATE INDEX idx_badges_rarity ON badges(rarity);

-- Table des badges utilisateurs
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  badge_id UUID NOT NULL,
  earned_at TIMESTAMP NOT NULL,
  displayed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Table des parrainages
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id VARCHAR(255) NOT NULL,
  referred_user_id VARCHAR(255) NOT NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'REWARDED')),
  reward_points INT DEFAULT 5000,
  completed_at TIMESTAMP,
  rewarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Insertion de badges par défaut
INSERT INTO badges (code, name, description, icon_url, rarity, point_value, requirements) VALUES
('FIRST_TRANSACTION', 'Première transaction', 'Effectuez votre première transaction', '/badges/first-transaction.svg', 'COMMON', 1000, '{"transactions": 1}'),
('VERIFIED_USER', 'Utilisateur vérifié', 'Complétez votre vérification KYC', '/badges/verified.svg', 'COMMON', 2000, '{"kyc": true}'),
('FREQUENT_SENDER', 'Envoyeur fréquent', 'Effectuez 10 transactions', '/badges/frequent-sender.svg', 'RARE', 5000, '{"transactions": 10}'),
('COMMUNITY_BUILDER', 'Bâtisseur de communauté', 'Parrainez 5 amis', '/badges/community-builder.svg', 'RARE', 10000, '{"referrals": 5}'),
('BIG_SPENDER', 'Gros dépensier', 'Envoyez plus de 1M XOF', '/badges/big-spender.svg', 'EPIC', 20000, '{"totalAmount": 1000000}'),
('LOYALTY_DIAMOND', 'Fidélité Diamant', 'Atteignez le niveau Diamond', '/badges/diamond.svg', 'LEGENDARY', 50000, '{"level": "DIAMOND"}');

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables
COMMENT ON TABLE user_points IS 'Stocke les points et niveaux de fidélité des utilisateurs';
COMMENT ON TABLE point_transactions IS 'Historique de toutes les transactions de points';
COMMENT ON TABLE badges IS 'Définition des badges disponibles';
COMMENT ON TABLE user_badges IS 'Association des badges aux utilisateurs';
COMMENT ON TABLE referrals IS 'Gestion du système de parrainage';
