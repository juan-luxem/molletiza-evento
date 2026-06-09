-- ============================================================
-- Molletiza — Seed de usuarios
-- Contraseña para TODOS: molletes2025
--
-- Cómo usarlo:
--   Supabase Dashboard → SQL Editor → pega esto → Run
--
-- Lista de accesos:
--   marcela@molletes.com       → Marcela
--   ivan@molletes.com          → Iván
--   juantorrentera@molletes.com→ Juan Torrentera
--   joss@molletes.com          → Joss
--   yazmin@molletes.com        → Yazmin
--   pamela@molletes.com        → Pamela
--   edgar@molletes.com         → Edgar
--   mauricio@molletes.com      → Mauricio
--   luissoliz@molletes.com     → Luis Soliz
--   luisa@molletes.com         → Luis A
--   monse@molletes.com         → Monse
--   tona@molletes.com          → Tona
--   daniel@molletes.com        → Daniel
--   samuel@molletes.com        → Samuel
--   fanny@molletes.com         → Fanny
--   saul@molletes.com          → Saul
--   ruy@molletes.com           → Ruy
--   lili@molletes.com          → Lili
--   jessica@molletes.com       → Jessica
--   lauralimon@molletes.com    → Laura Limon
--   laurabaron@molletes.com    → Laura Baron
--   xochi@molletes.com         → Xochi
--   ximena@molletes.com        → Ximena
--   dulce@molletes.com         → Dulce
--   milka@molletes.com         → Milka
--   juan@molletes.com          → Juan (Yo)
-- ============================================================

DO $$
DECLARE
  usuarios text[][] := ARRAY[
    ARRAY['marcela@molletes.com',        'Marcela'],
    ARRAY['ivan@molletes.com',           'Iván'],
    ARRAY['juantorrentera@molletes.com', 'Juan Torrentera'],
    ARRAY['joss@molletes.com',           'Joss'],
    ARRAY['yazmin@molletes.com',         'Yazmin'],
    ARRAY['pamela@molletes.com',         'Pamela'],
    ARRAY['edgar@molletes.com',          'Edgar'],
    ARRAY['mauricio@molletes.com',       'Mauricio'],
    ARRAY['luissoliz@molletes.com',      'Luis Soliz'],
    ARRAY['luisa@molletes.com',          'Luis A'],
    ARRAY['monse@molletes.com',          'Monse'],
    ARRAY['tona@molletes.com',           'Tona'],
    ARRAY['daniel@molletes.com',         'Daniel'],
    ARRAY['samuel@molletes.com',         'Samuel'],
    ARRAY['fanny@molletes.com',          'Fanny'],
    ARRAY['saul@molletes.com',           'Saul'],
    ARRAY['ruy@molletes.com',            'Ruy'],
    ARRAY['lili@molletes.com',           'Lili'],
    ARRAY['jessica@molletes.com',        'Jessica'],
    ARRAY['lauralimon@molletes.com',     'Laura Limon'],
    ARRAY['laurabaron@molletes.com',     'Laura Baron'],
    ARRAY['xochi@molletes.com',          'Xochi'],
    ARRAY['ximena@molletes.com',         'Ximena'],
    ARRAY['dulce@molletes.com',          'Dulce'],
    ARRAY['milka@molletes.com',          'Milka'],
    ARRAY['juan@molletes.com',           'Juan']
  ];
  u   text[];
  uid uuid;
BEGIN
  FOREACH u SLICE 1 IN ARRAY usuarios
  LOOP
    -- Saltar si ya existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = u[1]) THEN
      RAISE NOTICE 'Ya existe: %', u[1];
      CONTINUE;
    END IF;

    uid := gen_random_uuid();

    -- Crear usuario en auth
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      u[1],
      crypt('molletes2025', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('full_name', u[2]),
      now(),
      now()
    );

    -- Vincular identidad email (necesario para poder iniciar sesión)
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
      uid,
      uid::text,
      json_build_object(
        'sub',            uid::text,
        'email',          u[1],
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Creado ✓  %  (%)', u[1], u[2];
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- Verificación: confirma que todo quedó bien
-- ─────────────────────────────────────────────
SELECT
  u.email,
  p.full_name,
  u.email_confirmed_at IS NOT NULL AS confirmado
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@molletes.com'
ORDER BY p.full_name;
