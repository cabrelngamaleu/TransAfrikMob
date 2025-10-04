-- Migration: Création des tables IA
-- Date: 2025-10-04
-- Description: Tables pour les prédictions et insights IA

-- Table des prédictions
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISMISSED', 'EXECUTED')),
  predicted_date TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_status ON predictions(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_predictions_confidence ON predictions(confidence DESC);
CREATE INDEX idx_predictions_predicted_date ON predictions(predicted_date);
CREATE INDEX idx_predictions_type ON predictions(type);

-- Table des insights utilisateurs
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'INFO' CHECK (priority IN ('INFO', 'WARNING', 'URGENT')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_insights_user_id ON user_insights(user_id);
CREATE INDEX idx_user_insights_category ON user_insights(category);
CREATE INDEX idx_user_insights_read ON user_insights(read) WHERE read = FALSE;
CREATE INDEX idx_user_insights_priority ON user_insights(priority);
CREATE INDEX idx_user_insights_created_at ON user_insights(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_predictions_updated_at 
BEFORE UPDATE ON predictions
FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_user_insights_updated_at 
BEFORE UPDATE ON user_insights
FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

-- Vue pour les prédictions actives par utilisateur
CREATE OR REPLACE VIEW active_predictions_summary AS
SELECT 
  user_id,
  COUNT(*) as total_predictions,
  COUNT(*) FILTER (WHERE confidence >= 80) as high_confidence,
  COUNT(*) FILTER (WHERE confidence >= 60 AND confidence < 80) as medium_confidence,
  AVG(confidence) as avg_confidence,
  MIN(predicted_date) as next_predicted_date
FROM predictions
WHERE status = 'ACTIVE'
AND predicted_date >= CURRENT_DATE
GROUP BY user_id;

-- Vue pour les insights non lus
CREATE OR REPLACE VIEW unread_insights_summary AS
SELECT 
  user_id,
  COUNT(*) as unread_count,
  COUNT(*) FILTER (WHERE priority = 'URGENT') as urgent_count,
  COUNT(*) FILTER (WHERE priority = 'WARNING') as warning_count,
  MAX(created_at) as latest_insight_date
FROM user_insights
WHERE read = FALSE
GROUP BY user_id;

-- Vue pour l'analyse des patterns de prédiction
CREATE OR REPLACE VIEW prediction_accuracy AS
SELECT 
  user_id,
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'EXECUTED') as executed,
  COUNT(*) FILTER (WHERE status = 'DISMISSED') as dismissed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'EXECUTED')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('EXECUTED', 'DISMISSED')), 0) * 100,
    2
  ) as accuracy_rate,
  AVG(confidence) as avg_confidence
FROM predictions
WHERE status IN ('EXECUTED', 'DISMISSED')
GROUP BY user_id, type;

-- Fonction pour nettoyer les anciennes prédictions
CREATE OR REPLACE FUNCTION cleanup_old_predictions()
RETURNS void AS $$
BEGIN
  -- Archiver les prédictions de plus de 30 jours
  UPDATE predictions
  SET status = 'DISMISSED'
  WHERE status = 'ACTIVE'
  AND predicted_date < CURRENT_DATE - INTERVAL '30 days';
  
  -- Supprimer les prédictions de plus de 6 mois
  DELETE FROM predictions
  WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciens insights
CREATE OR REPLACE FUNCTION cleanup_old_insights()
RETURNS void AS $$
BEGIN
  -- Supprimer les insights lus de plus de 90 jours
  DELETE FROM user_insights
  WHERE read = TRUE
  AND created_at < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Job de maintenance (à planifier avec pg_cron ou via l'application)
-- SELECT cleanup_old_predictions();
-- SELECT cleanup_old_insights();

-- Commentaires
COMMENT ON TABLE predictions IS 'Prédictions IA pour les transactions récurrentes';
COMMENT ON TABLE user_insights IS 'Insights et recommandations personnalisés pour les utilisateurs';
COMMENT ON COLUMN predictions.confidence IS 'Niveau de confiance de la prédiction (0-100)';
COMMENT ON COLUMN predictions.data IS 'Données complètes de la prédiction au format JSON';
COMMENT ON COLUMN user_insights.priority IS 'Priorité de l''insight (INFO, WARNING, URGENT)';

-- Insertion de données de test (optionnel)
-- Ces données seront générées automatiquement par l'IA en production
