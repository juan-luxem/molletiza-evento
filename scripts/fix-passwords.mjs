// Resetea contraseñas usando public.profiles (evita listUsers que falla)
// node --env-file=.env scripts/fix-passwords.mjs

import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Leer IDs desde public.profiles (service role bypasea RLS)
const { data: profiles, error } = await admin
  .from('profiles')
  .select('id, full_name')
  .order('full_name');

if (error) {
  console.error('Error leyendo profiles:', error.message);
  process.exit(1);
}

console.log(`\nActualizando ${profiles.length} usuarios...\n`);

let ok = 0;
for (const p of profiles) {
  const { error: err } = await admin.auth.admin.updateUserById(p.id, {
    password: 'molletes2025',
    email_confirm: true,
  });

  if (err) {
    console.error(`✗  ${p.full_name.padEnd(20)}  ${err.message}`);
  } else {
    console.log(`✓  ${p.full_name}`);
    ok++;
  }
}

console.log(`\n${ok}/${profiles.length} contraseñas actualizadas.`);
process.exit(ok === profiles.length ? 0 : 1);
