-- ============================================================
-- Fix: reconstruir las identidades de auth para todos los
-- usuarios de molletes. Seguro de re-ejecutar (idempotente).
-- ============================================================

DO $$
DECLARE
  u auth.users%ROWTYPE;
BEGIN
  FOR u IN
    SELECT * FROM auth.users WHERE email LIKE '%@molletes.com'
  LOOP
    -- Borrar identidades existentes (pueden estar en formato incorrecto)
    DELETE FROM auth.identities WHERE user_id = u.id;

    -- Recrear con el formato correcto de GoTrue
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      u.id,
      u.id::text,                              -- GoTrue usa el UUID como provider_id
      jsonb_build_object(
        'sub',            u.id::text,
        'email',          u.email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(), now(), now()
    );

    -- Asegurar que el email esté marcado como confirmado
    UPDATE auth.users
    SET
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now()
    WHERE id = u.id;

    RAISE NOTICE 'Identity reconstruida para: %', u.email;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- Verificación final
-- ─────────────────────────────────────────────
SELECT
  u.email,
  p.full_name,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  i.provider_id = u.id::text        AS identity_ok
FROM auth.users     u
JOIN public.profiles p ON p.id = u.id
JOIN auth.identities i ON i.user_id = u.id AND i.provider = 'email'
WHERE u.email LIKE '%@molletes.com'
ORDER BY p.full_name;
