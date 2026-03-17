-- =============================================================================
-- Trigger: auto-create passport_members row on new auth user signup
-- =============================================================================
-- This runs server-side so RLS never blocks it.
-- first_name, phone, and member_id are passed via auth metadata at signup.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_passport_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id TEXT;
BEGIN
  -- Use the member_id from metadata if provided, otherwise generate one.
  v_member_id := COALESCE(
    NEW.raw_user_meta_data->>'member_id',
    'ISB-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 5))
  );

  INSERT INTO public.passport_members (id, first_name, email, phone, member_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Member'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    v_member_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop first in case it already exists from a previous run.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_passport_user();
