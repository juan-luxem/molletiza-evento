import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const admin = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Verificar si ya tiene ingrediente asignado
  const { data: existing } = await admin
    .from('items')
    .select('id, name, status, assigned_to')
    .eq('assigned_to', user.id)
    .maybeSingle();

  if (existing) {
    return Response.json(
      { error: 'Ya tienes un ingrediente asignado', item: existing },
      { status: 400 }
    );
  }

  // Intentar asignar con optimistic locking (hasta 3 reintentos)
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: available } = await admin
      .from('items')
      .select('id, name')
      .eq('status', 'available');

    if (!available || available.length === 0) {
      return Response.json({ error: 'No hay ingredientes disponibles' }, { status: 400 });
    }

    const winner = available[Math.floor(Math.random() * available.length)];

    const { data: assigned } = await admin
      .from('items')
      .update({ status: 'assigned', assigned_to: user.id })
      .eq('id', winner.id)
      .eq('status', 'available') // lock optimista
      .select('id, name, status, assigned_to')
      .maybeSingle();

    if (assigned) {
      return Response.json({ item: assigned });
    }
    // Si assigned es null alguien más se adelantó, reintentamos
  }

  return Response.json({ error: 'Error al asignar ingrediente, intenta de nuevo' }, { status: 500 });
};
