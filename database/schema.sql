CREATE TABLE IF NOT EXISTS soil_tests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NULL,
  nitrogen DOUBLE PRECISION NOT NULL,
  phosphorus DOUBLE PRECISION NOT NULL,
  potassium DOUBLE PRECISION NOT NULL,
  ph DOUBLE PRECISION NOT NULL,
  soil_type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NULL,
  rainfall_mm DOUBLE PRECISION NULL,
  temperature_c DOUBLE PRECISION NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_soil_tests_user_id
  ON soil_tests (user_id);

CREATE TABLE IF NOT EXISTS crop_recommendations (
  id SERIAL PRIMARY KEY,
  soil_test_id INTEGER NULL,
  nitrogen DOUBLE PRECISION NULL,
  phosphorus DOUBLE PRECISION NULL,
  potassium DOUBLE PRECISION NULL,
  ph DOUBLE PRECISION NULL,
  soil_type VARCHAR(50) NULL,
  rainfall_mm DOUBLE PRECISION NULL,
  temperature_c DOUBLE PRECISION NULL,
  crop_name VARCHAR(100) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_crop_recommendations_soil_test_id
  ON crop_recommendations (soil_test_id);