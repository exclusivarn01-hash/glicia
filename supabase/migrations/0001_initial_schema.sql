-- ============================================================
-- GlicIA — Schema inicial
-- ============================================================

-- Enums
CREATE TYPE glucose_range AS ENUM ('hypoglycemia', 'normal', 'slightly_high', 'high');
CREATE TYPE meal_context AS ENUM ('fasting', 'pre_meal', 'post_meal');
CREATE TYPE insulin_status AS ENUM ('on_insulin', 'not_on_insulin', 'unknown');

-- Tabela de perfis (criado automaticamente no signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: usuário acessa apenas o próprio perfil"
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- Tabela de medições de glicemia
CREATE TABLE public.glucose_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value BETWEEN 20 AND 600),
  unit TEXT NOT NULL DEFAULT 'mg/dL',
  meal_context meal_context NOT NULL,
  insulin_status insulin_status NOT NULL DEFAULT 'unknown',
  glucose_range glucose_range NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "readings: usuário acessa apenas os próprios dados"
  ON public.glucose_readings FOR ALL USING (auth.uid() = user_id);

-- Índices de performance
CREATE INDEX idx_glucose_readings_user_date ON public.glucose_readings (user_id, recorded_at DESC);
CREATE INDEX idx_glucose_readings_range ON public.glucose_readings (user_id, glucose_range) WHERE deleted_at IS NULL;
CREATE INDEX idx_glucose_readings_active ON public.glucose_readings (user_id, recorded_at DESC) WHERE deleted_at IS NULL;

-- Tabela de alertas de hipoglicemia diária
CREATE TABLE public.daily_hypoglycemia_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_date DATE NOT NULL,
  episode_count INTEGER NOT NULL DEFAULT 0,
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, alert_date)
);

ALTER TABLE public.daily_hypoglycemia_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts: usuário acessa apenas os próprios alertas"
  ON public.daily_hypoglycemia_alerts FOR ALL USING (auth.uid() = user_id);

-- Tabela de relatórios PDF
CREATE TABLE public.pdf_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_days INTEGER NOT NULL CHECK (period_days IN (7, 30, 90)),
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pdf_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports: usuário acessa apenas os próprios relatórios"
  ON public.pdf_reports FOR ALL USING (auth.uid() = user_id);

-- Tabela de consentimentos LGPD
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consents: usuário acessa apenas os próprios consentimentos"
  ON public.user_consents FOR ALL USING (auth.uid() = user_id);

-- Função: auto-criar perfil no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_readings_updated_at BEFORE UPDATE ON public.glucose_readings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.daily_hypoglycemia_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Função: auto-classificar e atualizar alertas de hipoglicemia
CREATE OR REPLACE FUNCTION public.fn_on_glucose_reading_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_range glucose_range;
  v_date DATE;
  v_count INTEGER;
BEGIN
  -- Classifica a faixa glicêmica
  IF NEW.value <= 69 THEN v_range := 'hypoglycemia';
  ELSIF NEW.value <= 140 THEN v_range := 'normal';
  ELSIF NEW.value <= 180 THEN v_range := 'slightly_high';
  ELSE v_range := 'high';
  END IF;

  NEW.glucose_range := v_range;

  -- Atualiza alertas de hipoglicemia se aplicável
  IF v_range = 'hypoglycemia' THEN
    v_date := DATE(NEW.recorded_at AT TIME ZONE 'America/Sao_Paulo');

    SELECT COUNT(*) INTO v_count
    FROM public.glucose_readings
    WHERE user_id = NEW.user_id
      AND DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo') = v_date
      AND glucose_range = 'hypoglycemia'
      AND deleted_at IS NULL;

    v_count := v_count + 1; -- inclui o registro atual

    INSERT INTO public.daily_hypoglycemia_alerts (user_id, alert_date, episode_count, is_critical)
    VALUES (NEW.user_id, v_date, v_count, v_count >= 2)
    ON CONFLICT (user_id, alert_date)
    DO UPDATE SET episode_count = v_count, is_critical = v_count >= 2, updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_glucose_reading_insert
  BEFORE INSERT ON public.glucose_readings
  FOR EACH ROW EXECUTE FUNCTION public.fn_on_glucose_reading_insert();

-- Views úteis
CREATE VIEW public.daily_glucose_summary AS
SELECT
  user_id,
  DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo') AS reading_date,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total_readings,
  ROUND(AVG(value) FILTER (WHERE deleted_at IS NULL)) AS avg_glucose,
  MIN(value) FILTER (WHERE deleted_at IS NULL) AS min_glucose,
  MAX(value) FILTER (WHERE deleted_at IS NULL) AS max_glucose,
  COUNT(*) FILTER (WHERE glucose_range = 'hypoglycemia' AND deleted_at IS NULL) AS hypoglycemia_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE value BETWEEN 70 AND 180 AND deleted_at IS NULL) / NULLIF(COUNT(*) FILTER (WHERE deleted_at IS NULL), 0)) AS time_in_range_pct
FROM public.glucose_readings
GROUP BY user_id, DATE(recorded_at AT TIME ZONE 'America/Sao_Paulo');
