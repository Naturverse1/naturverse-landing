CREATE TABLE IF NOT EXISTS test_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text,
  created_at timestamp DEFAULT now()
);
